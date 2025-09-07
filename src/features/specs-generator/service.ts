import { SpecsSettings, SpecsGenerationRequest, SpecsGenerationResult } from './types';
import { getSystemTemplate } from './constants';

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
3. Limit the specification to approximately ${settings.tokenBudget} tokens

Note: No implementation plan context was provided. Please generate a generic template structure.`;
  }
  
  // Build section inclusion instructions
  const sections: string[] = [];
  if (settings.include.requirements) sections.push('Requirements');
  if (settings.include.api) sections.push('API Endpoints');
  if (settings.include.dataModel) sections.push('Data Model');
  if (settings.include.nonFunctional) sections.push('Non-Functional Requirements');
  if (settings.include.security) sections.push('Security Considerations');
  if (settings.include.risks) sections.push('Risk Mitigation');
  if (settings.include.acceptance) sections.push('Acceptance Criteria');
  if (settings.include.glossary) sections.push('Glossary');
  
  const sectionInstructions = sections.length > 0 
    ? `Include the following sections in your specification: ${sections.join(', ')}.`
    : 'Include appropriate sections for a complete technical specification.';
  
  // Build outline style instructions
  let outlineStyleInstruction = '';
  switch (settings.outlineStyle) {
    case 'numbered':
      outlineStyleInstruction = 'Use numbered headings (e.g., 1., 2., 2.1, 2.2) for the specification structure.';
      break;
    case 'bulleted':
      outlineStyleInstruction = 'Use bulleted headings with markdown headings (e.g., ## Requirements) for the specification structure.';
      break;
    case 'headings':
      outlineStyleInstruction = 'Use markdown headings (e.g., # Requirements) for the specification structure.';
      break;
  }
  
  // Build audience and tone instructions
  let audienceInstruction = '';
  switch (settings.audienceLevel) {
    case 'exec':
      audienceInstruction = 'Target the specification for executive stakeholders with high-level technical understanding.';
      break;
    case 'pm':
      audienceInstruction = 'Target the specification for project managers with moderate technical understanding.';
      break;
    case 'engineer':
      audienceInstruction = 'Target the specification for software engineers with detailed technical understanding.';
      break;
  }
  
  let toneInstruction = '';
  switch (settings.tone) {
    case 'concise':
      toneInstruction = 'Use a concise writing style with minimal elaboration.';
      break;
    case 'detailed':
      toneInstruction = 'Use a detailed writing style with comprehensive explanations.';
      break;
    case 'formal':
      toneInstruction = 'Use a formal writing style appropriate for technical documentation.';
      break;
    case 'neutral':
      toneInstruction = 'Use a neutral, clear writing style suitable for technical documentation.';
      break;
  }
  
  // Build language instruction
  const languageInstruction = settings.language && settings.language !== 'English' 
    ? `Write the specification in ${settings.language}.`
    : '';
  
  // Build token budget instruction
  const tokenBudgetInstruction = settings.tokenBudget 
    ? `Limit the total response to approximately ${settings.tokenBudget} tokens.`
    : 'Limit the specification to a concise length.';
  
  // Build the prompt with all constraints
  return `Generate a technical specification document in Markdown format based on the following implementation plan:

<IMPLEMENTATION_PLAN>
${normalizedPlan}
</IMPLEMENTATION_PLAN>

Instructions:
1. Provide a comprehensive technical specification based on the implementation plan above
2. ${sectionInstructions}
3. ${outlineStyleInstruction}
4. ${audienceInstruction}
5. ${toneInstruction}
6. ${languageInstruction}
7. ${tokenBudgetInstruction}

Technical Specification (in Markdown format):`;
}

/**
 * Build a prompt for generating technical specifications based on a business suggestion
 * Uses a compact payload: description + up to top 3 key features
 */
export function buildSuggestionPrompt(
  suggestion: { description: string; keyFeatures: string[] },
  settings: SpecsSettings
): string {
  const description = (suggestion?.description || '').trim();
  const features = Array.isArray(suggestion?.keyFeatures) ? suggestion.keyFeatures.slice(0, 3) : [];

  // Build section inclusion instructions (reuse logic)
  const sections: string[] = [];
  if (settings.include.requirements) sections.push('Requirements');
  if (settings.include.api) sections.push('API Endpoints');
  if (settings.include.dataModel) sections.push('Data Model');
  if (settings.include.nonFunctional) sections.push('Non-Functional Requirements');
  if (settings.include.security) sections.push('Security Considerations');
  if (settings.include.risks) sections.push('Risk Mitigation');
  if (settings.include.acceptance) sections.push('Acceptance Criteria');
  if (settings.include.glossary) sections.push('Glossary');

  const sectionInstructions = sections.length > 0
    ? `Include the following sections in your specification: ${sections.join(', ')}.`
    : 'Include appropriate sections for a complete technical specification.';

  // Outline style
  let outlineStyleInstruction = '';
  switch (settings.outlineStyle) {
    case 'numbered':
      outlineStyleInstruction = 'Use numbered headings (e.g., 1., 2., 2.1, 2.2) for the specification structure.';
      break;
    case 'bulleted':
      outlineStyleInstruction = 'Use bulleted headings with markdown headings (e.g., ## Requirements) for the specification structure.';
      break;
    case 'headings':
      outlineStyleInstruction = 'Use markdown headings (e.g., # Requirements) for the specification structure.';
      break;
  }

  // Audience & tone
  let audienceInstruction = '';
  switch (settings.audienceLevel) {
    case 'exec':
      audienceInstruction = 'Target the specification for executive stakeholders with high-level technical understanding.';
      break;
    case 'pm':
      audienceInstruction = 'Target the specification for project managers with moderate technical understanding.';
      break;
    case 'engineer':
      audienceInstruction = 'Target the specification for software engineers with detailed technical understanding.';
      break;
  }

  let toneInstruction = '';
  switch (settings.tone) {
    case 'concise':
      toneInstruction = 'Use a concise writing style with minimal elaboration.';
      break;
    case 'detailed':
      toneInstruction = 'Use a detailed writing style with comprehensive explanations.';
      break;
    case 'formal':
      toneInstruction = 'Use a formal writing style appropriate for technical documentation.';
      break;
    case 'neutral':
      toneInstruction = 'Use a neutral, clear writing style suitable for technical documentation.';
      break;
  }

  const languageInstruction = settings.language && settings.language !== 'English'
    ? `Write the specification in ${settings.language}.`
    : '';

  const tokenBudgetInstruction = settings.tokenBudget
    ? `Limit the total response to approximately ${settings.tokenBudget} tokens.`
    : 'Limit the specification to a concise length.';

  // Build features list
  const featuresList = features.length > 0 ? features.map(f => `- ${String(f)}`).join('\n') : '- (none provided)';

  // Compose the prompt
  return `Generate a technical specification document in Markdown format based on the following business suggestion context:

<SUGGESTION_DESCRIPTION>
${description}
</SUGGESTION_DESCRIPTION>

<KEY_FEATURES>
${featuresList}
</KEY_FEATURES>

Instructions:
1. Provide a comprehensive technical specification based on the suggestion context above
2. ${sectionInstructions}
3. ${outlineStyleInstruction}
4. ${audienceInstruction}
5. ${toneInstruction}
6. ${languageInstruction}
7. ${tokenBudgetInstruction}

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
  const prompt =
    req.source === 'suggestion' && req.suggestion
      ? buildSuggestionPrompt(req.suggestion, req.settings)
      : buildPrompt(req.planText, req.settings);
  
  // Prepare the API request
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  const requestBody = {
    model: req.model,
    messages: [
      { role: 'system', content: getSystemTemplate(req.settings.docProfile) },
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
        markdown: accumulatedContent + '\n\nContact: [Your Name]\nEmail: [your@email.com]\nPhone: [123-456-7890]',
        meta: {
          createdAt: new Date().toISOString(),
          tokenBudget: req.settings.tokenBudget,
          source: (req.source === 'suggestion' && req.suggestion) ? 'suggestion' : 'plan'
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
        tokenBudget: req.settings.tokenBudget,
        source: (req.source === 'suggestion' && req.suggestion) ? 'suggestion' : 'plan'
      }
    };
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate specifications: ${error.message}`);
    }
    throw new Error('Failed to generate specifications: Unknown error');
  }
}
