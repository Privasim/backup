// File: src/components/insights/prompt/narrative-service.ts

import { GeneratedNarratives, validateGeneratedNarratives } from './narrative-schema';
import { PromptSettings } from './settings-registry';
import { buildInsightsPrompt } from './prompt-builder';

// Define the research data structure
interface ResearchData {
  riskScore?: number;
  threatDrivers?: string[];
  automationExposure?: Array<{
    task: string;
    exposure: number;
  }>;
  skillImpacts?: Array<{
    skill: string;
    impact: string;
    rationale?: string;
  }>;
  mitigation?: Array<{
    action: string;
    priority: string;
  }>;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
}

interface NarrativeServiceParams {
  researchData: ResearchData;
  settings: PromptSettings;
  model: string;
  apiKey: string;
}

interface NarrativeServiceResult {
  data: GeneratedNarratives | null;
  error?: string;
  raw?: string;
}

export const generateNarratives = async (params: NarrativeServiceParams): Promise<NarrativeServiceResult> => {
  const { researchData, settings, model, apiKey } = params;
  
  // Validate inputs
  if (!model) {
    return { data: null, error: 'No model specified' };
  }
  
  if (!apiKey) {
    return { data: null, error: 'No API key provided' };
  }
  
  try {
    // Build the prompt
    const { system, user, schemaInstruction } = buildInsightsPrompt({ researchData, settings });
    const fullUserPrompt = user + schemaInstruction;
    
    // Prepare the API request
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: fullUserPrompt }
      ],
      temperature: 0.7,
      max_tokens: settings.constraints.maxChars ? Math.min(4000, settings.constraints.maxChars * 2) : 2000,
      response_format: { type: 'json_object' }
    };
    
    // Make the API call
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Required for openrouter
        'X-Title': 'JobRiskAnalysis' // Optional, for analytics
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        data: null, 
        error: `API request failed with status ${response.status}: ${errorText}` 
      };
    }
    
    // Parse the response
    const responseData = await response.json();
    
    // Extract the content
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      return { 
        data: null, 
        error: 'No content in response',
        raw: JSON.stringify(responseData)
      };
    }
    
    // Try to parse the JSON from the response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError: any) {
      // If JSON parsing fails, try to extract JSON from the content
      const jsonMatch = content.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (extractError: any) {
          return { 
            data: null, 
            error: `Failed to parse JSON from response: ${parseError.message || 'Unknown error'}`,
            raw: content
          };
        }
      } else {
        return { 
          data: null, 
          error: `Failed to parse JSON from response: ${parseError.message || 'Unknown error'}`,
          raw: content
        };
      }
    }
    
    // Validate the parsed content
    const validation = validateGeneratedNarratives(parsedContent);
    
    if (!validation.ok) {
      return { 
        data: null, 
        error: `Validation failed: ${validation.error}`,
        raw: content
      };
    }
    
    return { 
      data: validation.data!,
      raw: content
    };
    
  } catch (error) {
    // Handle network errors or other unexpected issues
    return { 
      data: null, 
      error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};
