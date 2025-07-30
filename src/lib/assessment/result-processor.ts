import { AssessmentResult, AssessmentError, ProcessedResponse } from './types';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
  }[];
}

export class ResultProcessor {
  /**
   * Process OpenRouter response handling both function calls and regular content
   * @param response - OpenRouter API response
   * @returns ProcessedResponse with structured data or error
   */
  static processResponse(response: OpenRouterResponse): ProcessedResponse {
    const message = response.choices[0]?.message;
    
    if (!message) {
      return {
        success: false,
        error: {
          type: 'parsing',
          message: 'No message in API response'
        }
      };
    }

    // Handle function call response
    if (message.function_call?.name === 'analyze_job_risk') {
      return this.processFunctionCallResponse(message.function_call.arguments);
    }

    // Fallback to regular content processing
    return this.processLLMResponse(message.content || '');
  }

  /**
   * Process function call arguments as JSON
   * @param functionArguments - JSON string from function call
   * @returns ProcessedResponse with validated data
   */
  static processFunctionCallResponse(functionArguments: string): ProcessedResponse {
    try {
      const parsedData = JSON.parse(functionArguments);
      
      // Validate the structure
      const validationResult = this.validateAssessmentResult(parsedData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            type: 'parsing',
            message: 'Invalid function call response structure',
            details: validationResult.errors
          },
          rawResponse: functionArguments
        };
      }
      
      // Normalize and sanitize the data
      const normalizedData = this.normalizeAssessmentResult(parsedData);
      
      return {
        success: true,
        data: normalizedData,
        rawResponse: functionArguments
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'parsing',
          message: 'Failed to parse function call arguments as JSON',
          details: error
        },
        rawResponse: functionArguments
      };
    }
  }

  /**
   * Legacy method for processing regular LLM text responses
   * @param rawResponse - Raw text response from LLM
   * @returns ProcessedResponse with extracted data or error
   */
  static processLLMResponse(rawResponse: string): ProcessedResponse {
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = this.cleanResponse(rawResponse);
      
      // Try to parse as JSON
      const parsedData = JSON.parse(cleanedResponse);
      
      // Validate the structure
      const validationResult = this.validateAssessmentResult(parsedData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            type: 'parsing',
            message: 'Invalid response structure',
            details: validationResult.errors
          },
          rawResponse
        };
      }
      
      // Normalize and sanitize the data
      const normalizedData = this.normalizeAssessmentResult(parsedData);
      
      return {
        success: true,
        data: normalizedData,
        rawResponse
      };
      
    } catch (error) {
      // If JSON parsing fails, try to extract data from text
      const extractedData = this.extractDataFromText(rawResponse);
      
      if (extractedData) {
        return {
          success: true,
          data: extractedData,
          rawResponse
        };
      }
      
      return {
        success: false,
        error: {
          type: 'parsing',
          message: 'Failed to parse LLM response',
          details: error
        },
        rawResponse
      };
    }
  }
  
  private static cleanResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find JSON object boundaries
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleaned;
  }
  
  private static validateAssessmentResult(data: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { isValid: false, errors };
    }
    
    const obj = data as Record<string, unknown>;
    
    // Validate riskScore
    if (typeof obj.riskScore !== 'number' || obj.riskScore < 0 || obj.riskScore > 100) {
      errors.push('riskScore must be a number between 0-100');
    }
    
    // Validate riskLevel
    if (!['Low', 'Medium', 'High'].includes(obj.riskLevel as string)) {
      errors.push('riskLevel must be Low, Medium, or High');
    }
    
    // Validate summary
    if (typeof obj.summary !== 'string' || obj.summary.length < 10) {
      errors.push('summary must be a string with at least 10 characters');
    }
    
    // Validate factors object
    if (!obj.factors || typeof obj.factors !== 'object') {
      errors.push('factors object is required');
    } else {
      const factors = obj.factors as Record<string, unknown>;
      const requiredFactors = ['automation', 'aiReplacement', 'skillDemand', 'industryGrowth'];
      requiredFactors.forEach(factor => {
        if (typeof factors[factor] !== 'number' || (factors[factor] as number) < 0 || (factors[factor] as number) > 100) {
          errors.push(`factors.${factor} must be a number between 0-100`);
        }
      });
    }
    
    // Validate keyFindings array
    if (!Array.isArray(obj.keyFindings) || obj.keyFindings.length === 0) {
      errors.push('keyFindings must be a non-empty array');
    } else if (obj.keyFindings.length > 5) {
      errors.push('keyFindings must not exceed 5 items');
    } else {
      obj.keyFindings.forEach((finding: unknown, index: number) => {
        if (typeof finding !== 'string' || finding.length < 20 || finding.length > 200) {
          errors.push(`keyFindings[${index}] must be a string between 20-200 characters`);
        }
      });
    }
    
    // Validate recommendations array
    if (!Array.isArray(obj.recommendations) || obj.recommendations.length === 0) {
      errors.push('recommendations must be a non-empty array');
    } else if (obj.recommendations.length > 6) {
      errors.push('recommendations must not exceed 6 items');
    } else {
      obj.recommendations.forEach((rec: unknown, index: number) => {
        if (typeof rec !== 'string' || rec.length < 20 || rec.length > 200) {
          errors.push(`recommendations[${index}] must be a string between 20-200 characters`);
        }
      });
    }
    
    // Validate sources array (optional)
    if (obj.sources && Array.isArray(obj.sources)) {
      if (obj.sources.length > 5) {
        errors.push('sources must not exceed 5 items');
      }
      obj.sources.forEach((source: unknown, index: number) => {
        if (typeof source !== 'string' || !this.isValidUrl(source)) {
          errors.push(`sources[${index}] must be a valid URL`);
        }
      });
    }
    
    // Validate lastUpdated (optional)
    if (obj.lastUpdated && typeof obj.lastUpdated !== 'string') {
      errors.push('lastUpdated must be a string (ISO date format)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate if a string is a valid URL
   * @param str - String to validate
   * @returns boolean indicating if string is a valid URL
   */
  private static isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
  
  private static normalizeAssessmentResult(data: Record<string, unknown>): AssessmentResult {
    const factors = data.factors as Record<string, number>;
    
    return {
      riskScore: Math.round(Math.max(0, Math.min(100, data.riskScore as number))),
      riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
      summary: (data.summary as string).trim(),
      factors: {
        automation: Math.round(Math.max(0, Math.min(100, factors.automation))),
        aiReplacement: Math.round(Math.max(0, Math.min(100, factors.aiReplacement))),
        skillDemand: Math.round(Math.max(0, Math.min(100, factors.skillDemand))),
        industryGrowth: Math.round(Math.max(0, Math.min(100, factors.industryGrowth)))
      },
      keyFindings: (data.keyFindings as string[]).slice(0, 5).map((f: string) => f.trim()),
      recommendations: (data.recommendations as string[]).slice(0, 6).map((r: string) => r.trim()),
      sources: Array.isArray(data.sources) ? (data.sources as string[]).slice(0, 5) : [],
      lastUpdated: (data.lastUpdated as string) || new Date().toISOString()
    };
  }
  
  private static extractDataFromText(text: string): AssessmentResult | null {
    try {
      // Fallback: create a basic assessment from text analysis
      const riskScore = this.extractRiskScore(text);
      const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';
      
      return {
        riskScore,
        riskLevel,
        summary: this.extractSummary(text),
        factors: {
          automation: riskScore + Math.random() * 20 - 10,
          aiReplacement: riskScore,
          skillDemand: 100 - riskScore + Math.random() * 20 - 10,
          industryGrowth: 50 + Math.random() * 30 - 15
        },
        keyFindings: this.extractKeyFindings(text),
        recommendations: this.extractRecommendations(text),
        sources: [],
        lastUpdated: new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
  
  private static extractRiskScore(text: string): number {
    const riskPatterns = [
      /risk.*?(\d+)%/i,
      /(\d+)%.*?risk/i,
      /score.*?(\d+)/i
    ];
    
    for (const pattern of riskPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 0 && score <= 100) return score;
      }
    }
    
    // Default based on text sentiment
    if (text.toLowerCase().includes('high risk') || text.toLowerCase().includes('significant threat')) {
      return 75;
    } else if (text.toLowerCase().includes('medium risk') || text.toLowerCase().includes('moderate')) {
      return 50;
    } else {
      return 25;
    }
  }
  
  private static extractSummary(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }
  
  private static extractKeyFindings(text: string): string[] {
    const findings = text.match(/(?:finding|key|important|significant).*?[.!?]/gi) || [];
    return findings.slice(0, 3).map(f => f.trim());
  }
  
  private static extractRecommendations(text: string): string[] {
    const recommendations = text.match(/(?:recommend|suggest|should|consider).*?[.!?]/gi) || [];
    return recommendations.slice(0, 4).map(r => r.trim());
  }
}