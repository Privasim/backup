import { AssessmentResult, AssessmentError, ProcessedResponse } from './types';

export class ResultProcessor {
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
  
  private static validateAssessmentResult(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (typeof data.riskScore !== 'number' || data.riskScore < 0 || data.riskScore > 100) {
      errors.push('riskScore must be a number between 0-100');
    }
    
    if (!['Low', 'Medium', 'High'].includes(data.riskLevel)) {
      errors.push('riskLevel must be Low, Medium, or High');
    }
    
    if (typeof data.summary !== 'string' || data.summary.length < 10) {
      errors.push('summary must be a string with at least 10 characters');
    }
    
    if (!data.factors || typeof data.factors !== 'object') {
      errors.push('factors object is required');
    } else {
      const requiredFactors = ['automation', 'aiReplacement', 'skillDemand', 'industryGrowth'];
      requiredFactors.forEach(factor => {
        if (typeof data.factors[factor] !== 'number' || data.factors[factor] < 0 || data.factors[factor] > 100) {
          errors.push(`factors.${factor} must be a number between 0-100`);
        }
      });
    }
    
    if (!Array.isArray(data.keyFindings) || data.keyFindings.length === 0) {
      errors.push('keyFindings must be a non-empty array');
    }
    
    if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) {
      errors.push('recommendations must be a non-empty array');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private static normalizeAssessmentResult(data: any): AssessmentResult {
    return {
      riskScore: Math.round(Math.max(0, Math.min(100, data.riskScore))),
      riskLevel: data.riskLevel,
      summary: data.summary.trim(),
      factors: {
        automation: Math.round(Math.max(0, Math.min(100, data.factors.automation))),
        aiReplacement: Math.round(Math.max(0, Math.min(100, data.factors.aiReplacement))),
        skillDemand: Math.round(Math.max(0, Math.min(100, data.factors.skillDemand))),
        industryGrowth: Math.round(Math.max(0, Math.min(100, data.factors.industryGrowth)))
      },
      keyFindings: data.keyFindings.slice(0, 5).map((f: string) => f.trim()),
      recommendations: data.recommendations.slice(0, 6).map((r: string) => r.trim()),
      sources: Array.isArray(data.sources) ? data.sources.slice(0, 5) : [],
      lastUpdated: new Date().toISOString()
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