// OpenRouter provider for LLM-powered cost analysis

import { OpenRouterClient } from '@/lib/openrouter/client';
import { OpenRouterCostRequest, OpenRouterCostResponse, CostAnalysisContext } from '../types';
import { debugLog } from '@/components/debug/DebugConsole';

export class OpenRouterProvider {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    this.client = new OpenRouterClient(apiKey);
  }

  // Generate comprehensive cost analysis using LLM
  async generateCostAnalysis(request: OpenRouterCostRequest): Promise<OpenRouterCostResponse | null> {
    try {
      debugLog.info('OpenRouterProvider', 'Generating LLM cost analysis', {
        occupation: request.occupation,
        industry: request.industry,
        humanSalary: request.humanSalary,
        aiTotalCost: request.aiCosts.totalAnnualCost
      });

      const prompt = this.buildAnalysisPrompt(request);
      const systemPrompt = this.getSystemPrompt();

      const response = await this.client.chat({
        model: 'qwen/qwen3-coder:free', // Use free model for cost analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      if (!response || !response.choices?.[0]?.message?.content) {
        debugLog.error('OpenRouterProvider', 'Invalid response from OpenRouter');
        return null;
      }

      const analysisResult = this.parseAnalysisResponse(response.choices[0].message.content);
      
      if (analysisResult) {
        debugLog.success('OpenRouterProvider', 'Successfully generated cost analysis', {
          insightCount: analysisResult.insights.length,
          recommendationCount: analysisResult.recommendations.length,
          confidence: analysisResult.confidence
        });
      }

      return analysisResult;
    } catch (error) {
      debugLog.error('OpenRouterProvider', 'Error generating cost analysis', error);
      return null;
    }
  }

  // Estimate task frequency and automation potential
  async estimateTaskFrequency(
    occupation: string,
    industry: string,
    tasks: string[]
  ): Promise<{
    dailyTasks: number;
    automationPotential: number;
    confidence: number;
  } | null> {
    try {
      const prompt = this.buildTaskFrequencyPrompt(occupation, industry, tasks);
      
      const response = await this.client.chat({
        model: 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: 'You are an expert in workplace productivity and task analysis. Provide accurate estimates based on industry standards.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      if (!response || !response.choices?.[0]?.message?.content) {
        return null;
      }

      return this.parseTaskFrequencyResponse(response.choices[0].message.content);
    } catch (error) {
      debugLog.error('OpenRouterProvider', 'Error estimating task frequency', error);
      return null;
    }
  }

  private buildAnalysisPrompt(request: OpenRouterCostRequest): string {
    const { occupation, industry, humanSalary, aiCosts, context } = request;
    
    return `
Analyze the cost comparison between human worker and AI automation for the following scenario:

**Position Details:**
- Occupation: ${occupation}
- Industry: ${industry}
- Experience Level: ${context.userProfile.experience}
- Location: ${context.userProfile.location}
- Key Skills: ${context.userProfile.skills.join(', ')}

**Cost Comparison:**
- Human Annual Cost: $${humanSalary.toLocaleString()}
- AI Annual Cost: $${aiCosts.totalAnnualCost.toLocaleString()}
- Potential Savings: $${(humanSalary - aiCosts.totalAnnualCost).toLocaleString()}

**AI Cost Breakdown:**
- Token Costs: $${aiCosts.tokenCosts.totalTokenCost.toLocaleString()}
- Infrastructure: $${aiCosts.infrastructureCosts.annual.toLocaleString()}

**Industry Context:**
- Average Salary: $${context.industryData.averageSalary.toLocaleString()}
- Automation Risk: ${(context.industryData.automationRisk * 100).toFixed(1)}%
- Market Demand: ${context.marketData.demandTrend}

Please provide:
1. A comprehensive analysis of the cost comparison
2. 3-5 key insights about the financial implications
3. 3-5 actionable recommendations
4. Risk factors to consider
5. Assumptions made in the analysis
6. Confidence level (0-1) in the analysis

Format your response as JSON with the following structure:
{
  "analysis": "detailed analysis text",
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "riskFactors": ["risk 1", "risk 2", ...],
  "assumptions": ["assumption 1", "assumption 2", ...],
  "confidence": 0.85,
  "sources": ["source 1", "source 2", ...]
}
`;
  }

  private buildTaskFrequencyPrompt(occupation: string, industry: string, tasks: string[]): string {
    return `
Estimate the daily task frequency and automation potential for a ${occupation} in the ${industry} industry.

Key tasks typically performed:
${tasks.map(task => `- ${task}`).join('\n')}

Please estimate:
1. Average number of automatable tasks per day
2. Automation potential (0-1, where 1 is fully automatable)
3. Confidence in your estimates (0-1)

Consider factors like:
- Task complexity and repetitiveness
- Current AI capabilities
- Industry-specific requirements
- Human oversight needs

Respond in JSON format:
{
  "dailyTasks": 15,
  "automationPotential": 0.7,
  "confidence": 0.8
}
`;
  }

  private getSystemPrompt(): string {
    return `
You are an expert financial analyst specializing in workforce automation and AI implementation costs. 

Your expertise includes:
- Labor economics and salary analysis
- AI implementation costs and ROI calculations
- Industry-specific automation trends
- Risk assessment for technology adoption
- Financial modeling for workforce transformation

Provide accurate, data-driven analysis while being transparent about limitations and assumptions. Focus on practical, actionable insights that help decision-makers understand the true costs and benefits of AI automation.

Always consider:
- Implementation complexity and timeline
- Hidden costs (training, integration, maintenance)
- Risk factors and mitigation strategies
- Industry-specific considerations
- Regulatory and compliance implications
`;
  }

  private parseAnalysisResponse(content: string): OpenRouterCostResponse | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, try to parse the entire content
        throw new Error('No JSON structure found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.analysis || !Array.isArray(parsed.insights) || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response structure');
      }

      return {
        analysis: parsed.analysis,
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1),
        sources: parsed.sources || [],
        taskFrequency: {
          dailyTasks: 10, // Default values
          weeklyTasks: 50,
          monthlyTasks: 200,
          automationPotential: 0.7,
        },
      };
    } catch (error) {
      debugLog.error('OpenRouterProvider', 'Error parsing analysis response', error);
      
      // Fallback: extract insights from unstructured text
      return this.extractInsightsFromText(content);
    }
  }

  private parseTaskFrequencyResponse(content: string): {
    dailyTasks: number;
    automationPotential: number;
    confidence: number;
  } | null {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        dailyTasks: Math.max(1, Math.min(50, parsed.dailyTasks || 10)),
        automationPotential: Math.max(0, Math.min(1, parsed.automationPotential || 0.7)),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.8)),
      };
    } catch (error) {
      debugLog.error('OpenRouterProvider', 'Error parsing task frequency response', error);
      return null;
    }
  }

  private extractInsightsFromText(content: string): OpenRouterCostResponse {
    // Fallback method to extract insights from unstructured text
    const lines = content.split('\n').filter(line => line.trim());
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[\d\-\*\•]/)) {
        if (trimmed.toLowerCase().includes('recommend') || trimmed.toLowerCase().includes('should')) {
          recommendations.push(trimmed.replace(/^[\d\-\*\•\s]+/, ''));
        } else {
          insights.push(trimmed.replace(/^[\d\-\*\•\s]+/, ''));
        }
      }
    }

    return {
      analysis: content.substring(0, 500) + '...',
      insights: insights.slice(0, 5),
      recommendations: recommendations.slice(0, 5),
      confidence: 0.6, // Lower confidence for fallback parsing
      sources: ['LLM Analysis'],
      taskFrequency: {
        dailyTasks: 10,
        weeklyTasks: 50,
        monthlyTasks: 200,
        automationPotential: 0.7,
      },
    };
  }
}