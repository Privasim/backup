import { SpecsSettings, SpecsGenerationRequest, SpecsGenerationResult } from './types';

/**
 * Build a prompt for generating technical specifications based on implementation plan
 * @param planText The implementation plan text to base the spec on
 * @param settings User settings for spec generation
 * @returns Formatted prompt string for the LLM
 */
export function buildPrompt(planText: string, settings: SpecsSettings): string {
  // Normalize and trim the plan text
  const normalizedPlan = planText.trim();
  
  // If plan is empty, return a specific prompt
  if (!normalizedPlan) {
    return `Generate a technical specification document in Markdown format with the following instructions:

1. Provide a concise technical specification based on the implementation plan
2. Format the output in clean Markdown with appropriate headings and bullet points
3. Limit the specification to approximately ${settings.length} lines
4. Follow this system prompt guidance: ${settings.systemPrompt}

Note: No implementation plan context was provided. Please generate a generic template structure.`;
  }
  
  // Build the prompt with constraints
  return `Generate a technical specification document in Markdown format based on the following implementation plan:

<IMPLEMENTATION_PLAN>
${normalizedPlan}
</IMPLEMENTATION_PLAN>

Instructions:
1. Provide a concise technical specification based on the implementation plan above
2. Format the output in clean Markdown with appropriate headings and bullet points
3. Limit the specification to approximately ${settings.length} lines
4. Follow this system prompt guidance: ${settings.systemPrompt}

Technical Specification (in Markdown format):`;
}

/**
 * Generate technical specifications using an LLM API
 * @param req Generation request parameters
 * @param onChunk Optional callback for streaming chunks
 * @returns Promise resolving to the generated specification result
 */
export async function generateSpecs(
  req: SpecsGenerationRequest,
  onChunk?: (chunk: string) => void
): Promise<SpecsGenerationResult> {
  // Validate inputs
  if (!req.apiKey) {
    throw new Error('API key is required for specification generation');
  }
  
  if (!req.model) {
    throw new Error('Model is required for specification generation');
  }
  
  // Build the prompt
  const prompt = buildPrompt(req.planText, req.settings);
  
  // Prepare the API request
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  const requestBody = {
    model: req.model,
    messages: [
      { role: 'system', content: req.settings.systemPrompt },
      { role: 'user', content: prompt }
    ],
    stream: req.streaming && !!onChunk
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Optional, for openrouter dashboard
        'X-Title': 'Business Idea App' // Optional, for openrouter dashboard
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Handle streaming response
    if (req.streaming && onChunk) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response body reader');
      }
      
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                  onChunk(content);
                }
              } catch (e) {
                // Skip parsing errors for individual stream chunks
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      return {
        markdown: accumulatedContent,
        meta: {
          createdAt: new Date().toISOString(),
          length: req.settings.length,
          source: 'plan'
        }
      };
    }
    
    // Handle non-streaming response
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      markdown: content,
      meta: {
        createdAt: new Date().toISOString(),
        length: req.settings.length,
        source: 'plan'
      }
    };
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate specifications: ${error.message}`);
    }
    throw new Error('Failed to generate specifications: Unknown error');
  }
}
