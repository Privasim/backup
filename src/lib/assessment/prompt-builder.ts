import { QuizData } from '@/lib/quiz/types';
import { formatJobTitle } from '@/lib/quiz/data';

export interface AssessmentPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export const buildJobRiskAssessmentPrompt = (data: QuizData): AssessmentPrompt => {
  const jobTitle = formatJobTitle(data.jobDescription);
  const skillsList = data.skillSet.join(', ');
  
  const systemPrompt = `You are an AI career analyst specializing in job market trends and AI impact assessment. Your task is to provide a comprehensive analysis of how AI and automation might affect specific job roles.

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

OUTPUT FORMAT:
Provide a structured JSON response with:
{
  "riskScore": number (0-100),
  "riskLevel": "Low" | "Medium" | "High",
  "summary": "Brief 2-3 sentence overview",
  "factors": {
    "automation": number (0-100),
    "aiReplacement": number (0-100), 
    "skillDemand": number (0-100),
    "industryGrowth": number (0-100)
  },
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"],
  "sources": ["url1", "url2", "url3"],
  "lastUpdated": "current date"
}

Be objective, data-driven, and provide actionable insights.`;

  const userPrompt = `Analyze the AI displacement risk for this professional profile:

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

Provide a comprehensive risk assessment with specific, actionable recommendations based on current market data.`;

  return {
    systemPrompt,
    userPrompt
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