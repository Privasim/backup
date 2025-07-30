import { QuizData } from '@/lib/quiz/types';
import { formatJobTitle } from '@/lib/quiz/data';
import { type ModelInfo, type FunctionDefinition } from '@/lib/openrouter';

export interface AssessmentPrompt {
  systemPrompt: string;
  userPrompt: string;
  functions?: FunctionDefinition[];
}

/**
 * Builds the function schema for structured job risk assessment output
 * @returns FunctionDefinition for OpenRouter function calling
 */
export const buildFunctionSchema = (): FunctionDefinition => {
  return {
    name: 'analyze_job_risk',
    description: 'Analyze AI displacement risk for a specific job role with structured output',
    parameters: {
      type: 'object',
      properties: {
        riskScore: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Overall AI displacement risk score (0-100)'
        },
        riskLevel: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          description: 'Risk level classification'
        },
        summary: {
          type: 'string',
          minLength: 50,
          maxLength: 300,
          description: 'Brief 2-3 sentence overview of the risk assessment'
        },
        factors: {
          type: 'object',
          properties: {
            automation: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Risk from task automation (0-100)'
            },
            aiReplacement: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Risk from AI replacement (0-100)'
            },
            skillDemand: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Market demand for skills (0-100, higher is better)'
            },
            industryGrowth: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Industry growth prospects (0-100, higher is better)'
            }
          },
          required: ['automation', 'aiReplacement', 'skillDemand', 'industryGrowth']
        },
        keyFindings: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 20,
            maxLength: 200
          },
          minItems: 3,
          maxItems: 5,
          description: 'Key findings from the analysis'
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 20,
            maxLength: 200
          },
          minItems: 3,
          maxItems: 6,
          description: 'Actionable recommendations for the professional'
        },
        sources: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uri'
          },
          maxItems: 5,
          description: 'Source URLs used in the analysis'
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of the analysis'
        }
      },
      required: ['riskScore', 'riskLevel', 'summary', 'factors', 'keyFindings', 'recommendations', 'lastUpdated']
    }
  };
};

/**
 * Builds job risk assessment prompts with function calling support
 * @param data - User's quiz data
 * @param modelInfo - Optional model information
 * @returns AssessmentPrompt with system/user prompts and function schema
 */
export const buildJobRiskAssessmentPrompt = (data: QuizData, modelInfo?: ModelInfo): AssessmentPrompt => {
  const jobTitle = formatJobTitle(data.jobDescription);
  const skillsList = data.skillSet.join(', ');
  
  const systemPrompt = `You are an AI career analyst specializing in job market trends and AI impact assessment. Your task is to analyze how AI and automation might affect specific job roles using the analyze_job_risk function.

ANALYSIS FRAMEWORK:
1. Current AI/automation trends affecting the role
2. Risk factors and vulnerability assessment  
3. Skills that remain valuable vs. those at risk
4. Industry-specific considerations
5. Timeline predictions for changes
6. Actionable recommendations

SEARCH REQUIREMENTS:
- Use web search to find recent data (2023-2024) about AI impact on the specific job role
- Look for industry reports, job market studies, and expert predictions
- Focus on credible sources like McKinsey, Deloitte, World Economic Forum, industry publications
- Include salary trends and job demand forecasts

IMPORTANT: You MUST call the analyze_job_risk function with your analysis results. Do not provide a text response - only use the function call with structured data.

Be objective, data-driven, and provide actionable insights based on current market research.`;

  const userPrompt = `Analyze the AI displacement risk for this professional profile using the analyze_job_risk function:

**Job Role:** ${jobTitle}
**Experience Level:** ${data.experience}
**Industry:** ${data.industry}
**Location:** ${data.location}
**Salary Range:** ${data.salaryRange}
**Key Skills:** ${skillsList}

Please search the web for the latest information about:
1. How AI is currently impacting ${jobTitle} roles in ${data.industry}
2. Recent job market trends for ${jobTitle} positions in ${data.location}
3. Which skills from [${skillsList}] are most/least vulnerable to AI replacement
4. Salary trends and job demand forecasts for ${data.experience} level professionals
5. Industry-specific AI adoption rates in ${data.industry}

Call the analyze_job_risk function with your comprehensive assessment based on current market data.`;

  return {
    systemPrompt,
    userPrompt,
    functions: [buildFunctionSchema()]
  };
};

export const buildFollowUpPrompts = (data: QuizData) => {
  const jobTitle = formatJobTitle(data.jobDescription);
  
  return {
    skillsAnalysis: `Based on the previous analysis, provide a detailed breakdown of how each skill in [${data.skillSet.join(', ')}] is positioned against AI advancement. Which skills should be prioritized for development?`,
    
    careerPath: `What are the recommended career progression paths for a ${data.experience} ${jobTitle} in ${data.industry} to stay ahead of AI disruption?`,
    
    timelineAnalysis: `What is the realistic timeline for AI impact on ${jobTitle} roles? When should professionals start preparing for changes?`
  };
};

export const validatePromptData = (data: QuizData): string[] => {
  const errors: string[] = [];
  
  if (!data.jobDescription) errors.push('Job description is required');
  if (!data.experience) errors.push('Experience level is required');
  if (!data.industry) errors.push('Industry is required');
  if (!data.location) errors.push('Location is required');
  if (!data.skillSet || data.skillSet.length === 0) errors.push('At least one skill is required');
  
  return errors;
};