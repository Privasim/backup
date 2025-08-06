import { AnalysisResult } from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

export class BusinessSuggestionPrompts {
  static buildBusinessSuggestionPrompt(
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData
  ): string {
    const systemContext = this.getSystemContext();
    const profileContext = this.buildProfileContext(profileData);
    const analysisContext = this.buildAnalysisContext(analysisResult);
    const outputFormat = this.getOutputFormat();
    const guidelines = this.getGenerationGuidelines();

    return `${systemContext}

${profileContext}

${analysisContext}

${guidelines}

${outputFormat}`;
  }

  private static getSystemContext(): string {
    return `You are an expert business consultant AI specializing in personalized business opportunity identification. Your role is to analyze user profiles and generate viable, actionable business suggestions that align with their skills, experience, and market opportunities.`;
  }

  private static buildProfileContext(profileData?: ProfileFormData): string {
    if (!profileData) {
      return `PROFILE DATA: Limited profile information available.`;
    }

    return `PROFILE DATA:
- Skills: ${profileData.skills?.join(', ') || 'Not specified'}
- Experience Level: ${profileData.experience || 'Not specified'}
- Industry Background: ${profileData.industry || 'Not specified'}
- Career Goals: ${profileData.goals || 'Not specified'}
- Education: ${profileData.education || 'Not specified'}
- Location: ${profileData.location || 'Not specified'}`;
  }

  private static buildAnalysisContext(analysisResult: AnalysisResult): string {
    return `ANALYSIS RESULT:
${analysisResult.content}

Analysis Metadata:
- Model Used: ${analysisResult.model}
- Analysis Type: ${analysisResult.type}
- Generated: ${new Date(analysisResult.timestamp).toLocaleDateString()}`;
  }

  private static getGenerationGuidelines(): string {
    return `GENERATION GUIDELINES:
1. Focus on businesses that leverage the user's existing skills and experience
2. Consider current market trends and emerging opportunities
3. Provide realistic startup cost estimates based on business type
4. Include actionable next steps and key success factors
5. Ensure viability scores reflect genuine market potential
6. Consider scalability and growth potential
7. Account for user's risk tolerance and resource constraints
8. Include both traditional and digital business models
9. Focus on businesses that can be started within 6 months
10. Prioritize businesses with clear revenue models`;
  }

  private static getOutputFormat(): string {
    return `OUTPUT FORMAT:
Generate exactly 3 unique business suggestions in the following JSON format:

{
  "suggestions": [
    {
      "id": "unique-identifier",
      "title": "Business Name/Concept",
      "description": "Compelling 2-3 sentence description explaining the business opportunity and value proposition",
      "category": "Industry/Business Category",
      "viabilityScore": 75,
      "keyFeatures": [
        "Key advantage or feature 1",
        "Key advantage or feature 2", 
        "Key advantage or feature 3"
      ],
      "targetMarket": "Specific target customer description",
      "estimatedStartupCost": "$X,XXX - $XX,XXX",
      "metadata": {
        "timeToMarket": "X-X months",
        "skillsRequired": ["Primary skill", "Secondary skill"],
        "marketSize": "Small/Medium/Large/Very Large",
        "competitionLevel": "Low/Medium/High",
        "scalabilityPotential": "Low/Medium/High",
        "riskLevel": "Low/Medium/High"
      }
    }
  ]
}

REQUIREMENTS:
- Each suggestion must be unique and tailored to the user's profile
- Viability scores should range from 65-95 (realistic assessment)
- Startup costs should be market-accurate estimates
- Include 3-4 key features per suggestion
- Target markets should be specific, not generic
- All metadata fields are required
- Focus on actionable, achievable business ideas
- Consider both B2B and B2C opportunities where appropriate`;
  }

  static getIndustrySpecificPrompt(industry: string): string {
    const industryPrompts: Record<string, string> = {
      'technology': 'Focus on SaaS, mobile apps, AI/ML services, and tech consulting opportunities.',
      'healthcare': 'Consider telehealth, wellness services, medical consulting, and health tech solutions.',
      'education': 'Explore online courses, tutoring services, educational technology, and training programs.',
      'finance': 'Look into fintech solutions, financial consulting, investment services, and accounting.',
      'marketing': 'Consider digital marketing agencies, content creation, social media management, and marketing tools.',
      'retail': 'Explore e-commerce, dropshipping, subscription boxes, and retail consulting.',
      'consulting': 'Focus on specialized consulting services, coaching, and professional services.',
      'creative': 'Consider design services, content creation, creative agencies, and artistic ventures.'
    };

    return industryPrompts[industry.toLowerCase()] || 'Consider opportunities across various industries that match the user\'s skills.';
  }

  static getExperienceLevelGuidance(experience: string): string {
    const experienceGuidance: Record<string, string> = {
      'entry': 'Focus on low-risk, service-based businesses that require minimal upfront investment.',
      'mid': 'Consider businesses that leverage existing professional networks and moderate investment.',
      'senior': 'Explore consulting, coaching, and businesses that capitalize on deep expertise.',
      'executive': 'Focus on high-value consulting, investment opportunities, and scalable ventures.'
    };

    return experienceGuidance[experience.toLowerCase()] || 'Tailor suggestions to the user\'s experience level.';
  }
}

export default BusinessSuggestionPrompts;