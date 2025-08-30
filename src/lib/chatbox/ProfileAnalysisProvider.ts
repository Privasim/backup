import { 
  AnalysisProvider, 
  AnalysisConfig, 
  AnalysisResult 
} from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { createAnalysisProvider } from '@/components/chatbox/utils/provider-utils';
import { transformUserProfileToAnalysisData } from '@/components/chatbox/utils/profile-transformation';

/**
 * Transform profile data into analysis-ready format
 */
export const transformProfileData = (profileData: ProfileFormData) => {
  const {
    profile,
    experience,
    skillset,
    metadata
  } = profileData;

  // Calculate profile completeness and statistics
  const stats = {
    profileComplete: !!profile.profileType,
    experienceCount: experience?.length || 0,
    skillsCount: skillset?.categories?.reduce((total, cat) => total + cat.skills.length, 0) || 0,
    certificationsCount: skillset?.certificationsDetailed?.length || 0,
    languagesCount: skillset?.languageProficiency?.length || 0,
    completionPercentage: 0
  };

  const totalItems = 1 + stats.experienceCount + stats.skillsCount + stats.certificationsCount + stats.languagesCount;
  const completedItems = (stats.profileComplete ? 1 : 0) + stats.experienceCount + stats.skillsCount + stats.certificationsCount + stats.languagesCount;
  stats.completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Extract key skills with proficiency levels
  const keySkills = skillset?.categories?.flatMap((category: any) => 
    category.skills
      .filter((skill: any) => skill.highlight || skill.proficiency >= 4)
      .map((skill: any) => ({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        yearsOfExperience: skill.yearsOfExperience
      }))
  ) || [];

  // Extract recent experience with safe field access
  const recentExperience = experience
    ?.filter(exp => {
      // Safe access to current and endDate fields
      const isCurrent = exp && typeof exp === 'object' && 'current' in exp ? exp.current : false;
      const endDate = exp && typeof exp === 'object' && 'endDate' in exp ? exp.endDate : null;
      return isCurrent || (endDate && new Date(endDate) > new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000));
    })
    ?.map(exp => ({
      title: exp.title || 'Unknown Position',
      organization: exp.organization || 'Unknown Organization',
      type: exp.type || 'Unknown Type',
      current: exp && typeof exp === 'object' && 'current' in exp ? exp.current : false,
      skills: exp.skills || [],
      achievements: exp.achievements || []
    })) || [];

  return {
    profileType: profile.profileType,
    basicInfo: {
      currentRole: profile.currentRole || 'Not specified',
      industry: profile.industry || 'Not specified',
      yearsOfExperience: profile.yearsOfExperience || 'Not specified',
      educationLevel: profile.educationLevel || 'Not specified',
      fieldOfStudy: profile.fieldOfStudy || 'Not specified'
    },
    statistics: stats,
    keySkills,
    recentExperience,
    certifications: skillset?.certificationsDetailed?.map((cert: any) => ({
      name: cert.name,
      issuer: cert.issuer,
      dateObtained: cert.dateObtained
    })) || [],
    languages: skillset?.languageProficiency?.map((lang: any) => ({
      language: lang.language,
      proficiency: lang.proficiency
    })) || [],
    metadata: {
      lastModified: metadata.lastModified,
      completionPercentage: stats.completionPercentage
    }
  };
};

/**
 * Generate analysis prompt for ProfileAnalysisData format
 */
export const generateProfileAnalysisPrompt = (
  data: any,
  customPrompt?: string,
  customSystemPrompt?: string
): { systemPrompt: string; userPrompt: string } => {
  const systemPrompt = customSystemPrompt || 
    'You are a professional career analyst providing actionable insights based on user profiles. Analyze the provided profile data and give specific, actionable advice for career development, skill improvement, and opportunities.';

  if (customPrompt) {
    return {
      systemPrompt,
      userPrompt: customPrompt.replace('{{PROFILE_DATA}}', JSON.stringify(data, null, 2))
    };
  }

  // Generate user prompt from ProfileAnalysisData
  const userPrompt = `Please analyze this career profile and provide insights:

**Profile Type:** ${data.profileType || 'Unknown'}

**Experience:**
${data.experience?.map((exp: any) => 
  `- ${exp.title} at ${exp.company} (${exp.duration})${exp.description ? ': ' + exp.description : ''}`
).join('\n') || 'No experience listed'}

**Skills:**
- Technical Skills: ${data.skills?.technical?.join(', ') || 'None listed'}
- Soft Skills: ${data.skills?.soft?.join(', ') || 'None listed'}
- Languages: ${data.skills?.languages?.join(', ') || 'None listed'}
- Certifications: ${data.skills?.certifications?.join(', ') || 'None listed'}

**Profile Completion:** ${data.metadata?.completionLevel || 0}%

Please provide:
1. **Strengths Analysis** - Key strengths based on experience and skills
2. **Growth Opportunities** - Areas for improvement and development
3. **Career Recommendations** - Specific next steps and career paths
4. **Skill Development** - Recommended skills to learn or improve
5. **Market Insights** - Industry trends and opportunities

Keep the analysis practical, specific, and actionable.`;

  return {
    systemPrompt,
    userPrompt
  };
};

/**
 * Generate analysis prompt for profile data using templates (legacy)
 */
export const generateProfilePrompt = (
  data: any, 
  customPrompt?: string,
  templateId: string = 'default-profile',
  customSystemPrompt?: string
): { systemPrompt: string; userPrompt: string } => {
  // If custom system prompt is provided, use it with the template user prompt
  if (customSystemPrompt) {
    // Import prompt templates
    const { getPromptTemplate, renderPromptTemplate } = require('./prompts/ProfileAnalysisPrompts');
    
    const template = getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Prompt template not found: ${templateId}`);
    }

    const profileData = data;
    
    // Prepare template data for user prompt
    const templateData = {
      profileType: profileData.profileType,
      currentRole: profileData.basicInfo.currentRole || 'Not specified',
      industry: profileData.basicInfo.industry || 'Not specified',
      yearsOfExperience: profileData.basicInfo.yearsOfExperience || 'Not specified',
      completionPercentage: profileData.statistics.completionPercentage,
      skillsCount: profileData.keySkills.length,
      keySkills: profileData.keySkills.map(skill => 
        `- ${skill.name} (${skill.category}, Level ${skill.proficiency}/5${skill.yearsOfExperience ? `, ${skill.yearsOfExperience} years` : ''})`
      ).join('\n') || 'No key skills specified',
      experienceCount: profileData.recentExperience.length,
      recentExperience: profileData.recentExperience.map(exp => 
        `- ${exp.title} at ${exp.organization} (${exp.type}${exp.current ? ', Current' : ''})`
      ).join('\n') || 'No recent experience specified',
      certificationsCount: profileData.certifications.length,
      certifications: profileData.certifications.map(cert => 
        `- ${cert.name} by ${cert.issuer} (${cert.dateObtained})`
      ).join('\n') || 'No certifications specified',
      languagesCount: profileData.languages.length,
      languages: profileData.languages.map(lang => 
        `- ${lang.language} (${lang.proficiency})`
      ).join('\n') || 'No languages specified'
    };
    
    const renderedTemplate = renderPromptTemplate(template, templateData);
    
    return {
      systemPrompt: customSystemPrompt,
      userPrompt: renderedTemplate.userPrompt
    };
  }
  
  // Legacy custom prompt handling (for backward compatibility)
  if (customPrompt) {
    return {
      systemPrompt: 'You are a professional career analyst providing actionable insights.',
      userPrompt: customPrompt.replace('{{PROFILE_DATA}}', JSON.stringify(data, null, 2))
    };
  }

  // Import prompt templates
  const { getPromptTemplate, renderPromptTemplate } = require('./prompts/ProfileAnalysisPrompts');
  
  const template = getPromptTemplate(templateId);
  if (!template) {
    throw new Error(`Prompt template not found: ${templateId}`);
  }

  const profileData = data;
  
  // Prepare template data
  const templateData = {
    profileType: profileData.profileType,
    currentRole: profileData.basicInfo.currentRole || 'Not specified',
    industry: profileData.basicInfo.industry || 'Not specified',
    yearsOfExperience: profileData.basicInfo.yearsOfExperience || 'Not specified',
    completionPercentage: profileData.statistics.completionPercentage,
    skillsCount: profileData.keySkills.length,
    keySkills: profileData.keySkills.map(skill => 
      `- ${skill.name} (${skill.category}, Level ${skill.proficiency}/5${skill.yearsOfExperience ? `, ${skill.yearsOfExperience} years` : ''})`
    ).join('\n') || 'No key skills specified',
    experienceCount: profileData.recentExperience.length,
    recentExperience: profileData.recentExperience.map(exp => 
      `- ${exp.title} at ${exp.organization} (${exp.type}${exp.current ? ', Current' : ''})`
    ).join('\n') || 'No recent experience specified',
    certificationsCount: profileData.certifications.length,
    certifications: profileData.certifications.map(cert => 
      `- ${cert.name} by ${cert.issuer} (${cert.dateObtained})`
    ).join('\n') || 'No certifications specified',
    languagesCount: profileData.languages.length,
    languages: profileData.languages.map(lang => 
      `- ${lang.language} (${lang.proficiency})`
    ).join('\n') || 'No languages specified'
  };
  
  return renderPromptTemplate(template, templateData);
};

/**
 * Create the OpenRouter-based profile analysis provider
 */
export const createProfileAnalysisProvider = (): AnalysisProvider => {
  return createAnalysisProvider({
    id: 'openrouter-profile',
    name: 'OpenRouter Profile Analysis',
    supportedModels: getAvailableModels(),
    
    validateConfig: (config: AnalysisConfig) => {
      // Validate API key format
      if (!config.apiKey || !config.apiKey.startsWith('sk-or-v1-')) {
        return false;
      }
      
      // Validate model is supported
      if (!getAvailableModels().includes(config.model)) {
        return false;
      }
      
      // Validate analysis type
      if (config.type !== 'profile') {
        return false;
      }
      
      return true;
    },
    
    formatPrompt: (data: any, customPrompt?: string) => {
      // Use the adapter facade to normalize any input type
      const { toAnalysisData } = require('@/lib/profile-analysis');
      let transformedData;
      
      try {
        transformedData = toAnalysisData(data);
      } catch (error) {
        // Fallback to direct transformation if adapter fails
        if (data && data.profileType && data.experience && data.skills && data.metadata) {
          transformedData = data;
        } else {
          transformedData = transformProfileData(data);
        }
      }
      
      const prompts = generateProfileAnalysisPrompt(transformedData, customPrompt);
      return prompts.userPrompt; // Return user prompt for compatibility
    },
    
    analyze: async (config: AnalysisConfig, data: any): Promise<AnalysisResult> => {
      const client = new OpenRouterClient(config.apiKey);
      
      // Use the adapter facade to normalize any input type
      const { toAnalysisData } = require('@/lib/profile-analysis');
      let transformedData;
      
      try {
        transformedData = toAnalysisData(data);
      } catch (error) {
        // Fallback to direct transformation if adapter fails
        if (data && data.profileType && data.experience && data.skills && data.metadata) {
          transformedData = data;
        } else {
          transformedData = transformProfileData(data);
        }
      }
      
      // Check if customPrompt is actually a system prompt (starts with "You are")
      const isSystemPrompt = config.customPrompt?.trim().toLowerCase().startsWith('you are');
      const customSystemPrompt = isSystemPrompt ? config.customPrompt : undefined;
      const legacyCustomPrompt = !isSystemPrompt ? config.customPrompt : undefined;
      
      // Generate prompts using the ProfileAnalysisData format
      const prompts = generateProfileAnalysisPrompt(
        transformedData, 
        legacyCustomPrompt,
        customSystemPrompt
      );
      
      try {
        // Make the API request (non-streaming for now, streaming will be handled at the UI level)
        const response = await client.chat({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: prompts.systemPrompt
            },
            {
              role: 'user',
              content: prompts.userPrompt
            }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 800
        });
        
        if (!response || !response.choices || response.choices.length === 0) {
          throw new Error('No response received from AI model');
        }
        
        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response from AI model');
        }
        
        return {
          id: `profile-analysis-${Date.now()}`,
          type: 'profile',
          status: 'success',
          content: content.trim(),
          timestamp: new Date().toISOString(),
          model: config.model,
          metadata: {
            usage: response.usage,
            profileStats: transformedData.statistics,
            promptLength: prompts.userPrompt.length,
            responseLength: content.length
          }
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        
        return {
          id: `profile-analysis-error-${Date.now()}`,
          type: 'profile',
          status: 'error',
          content: '',
          timestamp: new Date().toISOString(),
          model: config.model,
          error: `Profile analysis failed: ${errorMessage}`,
          metadata: {
            originalError: error
          }
        };
      }
    },

    /**
     * Streaming analysis method for real-time updates
     */
    analyzeStreaming: async (
      config: AnalysisConfig, 
      data: any,
      onChunk: (chunk: string) => void
    ): Promise<AnalysisResult> => {
      const client = new OpenRouterClient(config.apiKey);
      
      // Use the adapter facade to normalize any input type
      const { toAnalysisData } = require('@/lib/profile-analysis');
      let transformedData;
      
      try {
        transformedData = toAnalysisData(data);
      } catch (error) {
        // Fallback to direct transformation if adapter fails
        if (data && data.profileType && data.experience && data.skills && data.metadata) {
          transformedData = data;
        } else {
          transformedData = transformProfileData(data);
        }
      }
      
      // Check if customPrompt is actually a system prompt (starts with "You are")
      const isSystemPrompt = config.customPrompt?.trim().toLowerCase().startsWith('you are');
      const customSystemPrompt = isSystemPrompt ? config.customPrompt : undefined;
      const legacyCustomPrompt = !isSystemPrompt ? config.customPrompt : undefined;
      
      // Generate prompts using the ProfileAnalysisData format
      const prompts = generateProfileAnalysisPrompt(
        transformedData, 
        legacyCustomPrompt,
        customSystemPrompt
      );
      
      let fullContent = '';
      
      try {
        // Make streaming API request
        await client.chat({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: prompts.systemPrompt
            },
            {
              role: 'user',
              content: prompts.userPrompt
            }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 800
        }, {
          stream: true,
          onChunk: (chunk: string) => {
            fullContent += chunk;
            onChunk(chunk);
          }
        });
        
        if (!fullContent) {
          throw new Error('No content received from streaming response');
        }
        
        return {
          id: `profile-analysis-stream-${Date.now()}`,
          type: 'profile',
          status: 'success',
          content: fullContent.trim(),
          timestamp: new Date().toISOString(),
          model: config.model,
          metadata: {
            profileStats: transformedData.statistics,
            promptLength: prompts.userPrompt.length,
            responseLength: fullContent.length,
            streaming: true
          }
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Streaming analysis failed';
        
        return {
          id: `profile-analysis-stream-error-${Date.now()}`,
          type: 'profile',
          status: 'error',
          content: fullContent, // Include partial content if any
          timestamp: new Date().toISOString(),
          model: config.model,
          error: `Streaming analysis failed: ${errorMessage}`,
          metadata: {
            originalError: error,
            partialContent: fullContent,
            streaming: true
          }
        };
      }
    }
  });
};