'use client';

import { AnalysisResult } from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

export class BusinessSuggestionPrompts {
  static buildBusinessSuggestionPrompt(
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData,
    customSystemPrompt?: string
  ): string {
    const systemContext = this.getSystemContext(customSystemPrompt);
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

  private static getSystemContext(customPrompt?: string): string {
    const baseContext = `You are an expert business consultant AI specializing in personalized business opportunity identification. Your role is to analyze user profiles and generate viable, actionable business suggestions that align with their skills, experience, and market opportunities.`;
    
    if (customPrompt) {
      return `${customPrompt}\n\n${baseContext}`;
    }
    
    return baseContext;
  }

  private static buildProfileContext(profileData?: ProfileFormData): string {
    if (!profileData) {
      return `PROFILE DATA: Limited profile information available.`;
    }

    // Extract skills from skillset
    const skills = profileData.skillset?.technical || [];
    
    // Get experience level from the first experience entry if available
    const experienceLevel = profileData.experience && profileData.experience.length > 0 
      ? profileData.experience[0].seniority 
      : 'Not specified';
    
    // Get industry from profile data
    const industry = profileData.profile?.industry || profileData.profile?.targetIndustry || 'Not specified';
    
    // Get career goals
    const goals = profileData.profile?.goal || 'Not specified';
    
    // Get education level if available
    const education = profileData.profile?.educationLevel || 'Not specified';
    
    // Get location if available
    const location = profileData.profile?.location || 'Not specified';

    return `PROFILE DATA:
- Skills: ${skills.join(', ') || 'Not specified'}
- Experience Level: ${experienceLevel}
- Industry Background: ${industry}
- Career Goals: ${goals}
- Education: ${education}
- Location: ${location}`;
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
1. Prioritize no-code/low-code solutions leveraging the user's existing skills and experience
2. Require minimal backend integration and avoid complex system architecture
3. Provide realistic startup costs that do not exceed $200 for the first month (include both monthly subscriptions and one-time costs)
4. Strictly target a 7–14 day build-and-launch timeline (from start to first usable MVP)
5. Include actionable next steps and key success factors for a lightweight MVP
6. Ensure viability scores reflect realistic market potential (no hype)
7. Keep scope limited to essentials; avoid custom infrastructure and heavy integrations
8. Prefer digital-first models (no inventory/logistics) for speed of delivery
9. Use familiar categories for tooling: app-builder, marketing-automation, customer-support, hosting, domain, other (examples acceptable)
10. Return a clear cost breakdown aligned to the above categories`;
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
      "estimatedStartupCost": "$100",
      "totalCostUsd": 100,
      "timelineDays": 10,
      "metadata": {
        "costBreakdown": [
          { "category": "app-builder", "vendor": "example", "costUsd": 20, "cadence": "monthly" },
          { "category": "marketing-automation", "vendor": "example", "costUsd": 10, "cadence": "monthly" },
          { "category": "customer-support", "vendor": "example", "costUsd": 20, "cadence": "monthly" }
        ]
      }
    }
  ]
}

REQUIREMENTS:
- Each suggestion must be unique and tailored to the user's profile
- Viability scores should range from 65-95 (realistic assessment)
- Total first-month cost (totalCostUsd) must be ≤ 200
- Timeline (timelineDays) must be within 7–14
- Include at least 2 costBreakdown items; 3 core categories preferred when applicable (app-builder, marketing-automation, customer-support)
- Target markets should be specific, not generic
- Focus on actionable, achievable MVPs using no-code/low-code tools
- Avoid complex backend systems or heavy integrations`;
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