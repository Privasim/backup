import { 
  AnalysisProvider, 
  AnalysisConfig, 
  AnalysisResult 
} from '@/components/chatbox/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { OpenRouterClient, getAvailableModels } from '@/lib/openrouter';
import { createAnalysisProvider } from '@/components/chatbox/utils/provider-utils';

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
  const keySkills = skillset?.categories?.flatMap(category => 
    category.skills
      .filter(skill => skill.highlight || skill.proficiency >= 4)
      .map(skill => ({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        yearsOfExperience: skill.yearsOfExperience
      }))
  ) || [];

  // Extract recent experience
  const recentExperience = experience
    ?.filter(exp => exp.current || (exp.endDate && new Date(exp.endDate) > new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)))
    ?.map(exp => ({
      title: exp.title,
      organization: exp.organization,
      type: exp.type,
      current: exp.current,
      skills: exp.skills || [],
      achievements: exp.achievements || []
    })) || [];

  return {
    profileType: profile.profileType,
    basicInfo: {
      currentRole: profile.currentRole,
      industry: profile.industry,
      yearsOfExperience: profile.yearsOfExperience,
      educationLevel: profile.educationLevel,
      fieldOfStudy: profile.fieldOfStudy
    },
    statistics: stats,
    keySkills,
    recentExperience,
    certifications: skillset?.certificationsDetailed?.map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      dateObtained: cert.dateObtained
    })) || [],
    languages: skillset?.languageProficiency?.map(lang => ({
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
 * Generate analysis prompt for profile data using templates
 */
export const generateProfilePrompt = (
  data: any, 
  customPrompt?: string,
  templateId: string = 'default-profile'
): { systemPrompt: string; userPrompt: string } => {
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
      const transformedData = transformProfileData(data);
      const prompts = generateProfilePrompt(transformedData, customPrompt);
      return prompts.userPrompt; // Return user prompt for compatibility
    },
    
    analyze: async (config: AnalysisConfig, data: ProfileFormData): Promise<AnalysisResult> => {
      const client = new OpenRouterClient(config.apiKey);
      
      // Transform and format the data
      const transformedData = transformProfileData(data);
      const prompts = generateProfilePrompt(transformedData, config.customPrompt);
      
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
      data: ProfileFormData,
      onChunk: (chunk: string) => void
    ): Promise<AnalysisResult> => {
      const client = new OpenRouterClient(config.apiKey);
      
      // Transform and format the data
      const transformedData = transformProfileData(data);
      const prompts = generateProfilePrompt(transformedData, config.customPrompt);
      
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