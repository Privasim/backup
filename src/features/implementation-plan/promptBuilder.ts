type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

interface BuildParams {
  baseSystemPrompt?: string;
  systemPromptOverride?: string;
  sources?: string[];
  suggestion: any; // BusinessSuggestion shape
  compactMode?: boolean;
  compactMaxPhaseCards?: number;
  lengthPreset?: 'brief' | 'standard' | 'long';
  settings?: any; // PlanSettings
}

// Legacy function for backward compatibility
export function buildMessages(params: BuildParams) {
  const { systemPrompt, userPrompt } = buildTextPrompts(params);
  return {
    systemMessage: { role: 'system' as const, content: systemPrompt },
    userMessage: { role: 'user' as const, content: userPrompt }
  };
}

// New text-based prompt builder
export function buildTextPrompts({ 
  baseSystemPrompt = '', 
  systemPromptOverride = '', 
  sources = [], 
  suggestion, 
  compactMode = false, 
  compactMaxPhaseCards = 4, 
  lengthPreset = 'long' 
}: BuildParams): { systemPrompt: string; userPrompt: string } {
  
  const systemPrompt = buildSystemPrompt({
    baseSystemPrompt,
    systemPromptOverride,
    sources,
    lengthPreset,
    compactMode,
    compactMaxPhaseCards
  });
  
  const userPrompt = buildUserPrompt(suggestion, lengthPreset);
  
  return { systemPrompt, userPrompt };
}

function buildSystemPrompt({
  baseSystemPrompt,
  systemPromptOverride,
  sources,
  lengthPreset,
  compactMode,
  compactMaxPhaseCards
}: {
  baseSystemPrompt?: string;
  systemPromptOverride?: string;
  sources?: string[];
  lengthPreset?: 'brief' | 'standard' | 'long';
  compactMode?: boolean;
  compactMaxPhaseCards?: number;
}): string {
  
  const systemParts: string[] = [];

  // Base system prompt (similar to ChatboxProvider)
  const corePrompt = `You are a helpful business planning expert. Create detailed, actionable implementation plans in clear, conversational markdown format. Be encouraging and practical. Use emojis and clear formatting to make the content engaging and easy to read.`;
  
  if (baseSystemPrompt) {
    systemParts.push(baseSystemPrompt.trim());
  } else {
    systemParts.push(corePrompt);
  }

  // Implementation plan requirements
  if (systemPromptOverride?.trim()) {
    systemParts.push(`Implementation Plan Requirements (Override):\n${systemPromptOverride.trim()}`);
  } else {
    const baseRequirements = `Implementation Plan Requirements:
- Create a comprehensive business implementation plan in markdown format
- Use clear headers, bullet points, and engaging formatting
- Include: executive summary, phases with objectives/timelines, key tasks, milestones, resources, budget, risks, KPIs
- Be practical and actionable with specific steps
- Use encouraging language and emojis to make it engaging
- Focus on real-world implementation details`;
    
    // Add length preset constraints
    const lengthInstructions = getLengthInstructions(lengthPreset, compactMode, compactMaxPhaseCards);
    
    systemParts.push(`${baseRequirements}\n${lengthInstructions}`);
  }

  // Sources and constraints
  if (sources && sources.length > 0) {
    const srcList = sources.map((s, i) => `  - [${i + 1}] ${s}`).join('\n');
    systemParts.push(`Sources and Constraints:\n- Use the following sources for grounding where applicable\n${srcList}\n- If source relevance is low, annotate assumptions clearly`);
  }

  return systemParts.join('\n\n');
}

function buildUserPrompt(suggestion: any, lengthPreset?: 'brief' | 'standard' | 'long'): string {
  const facts: string[] = [];
  if (suggestion?.title) facts.push(`**Title**: ${suggestion.title}`);
  if (suggestion?.category) facts.push(`**Category**: ${suggestion.category}`);
  if (suggestion?.description) facts.push(`**Description**: ${suggestion.description}`);
  if (suggestion?.targetMarket) facts.push(`**Target Market**: ${suggestion.targetMarket}`);
  if (suggestion?.estimatedStartupCost) facts.push(`**Estimated Startup Cost**: ${suggestion.estimatedStartupCost}`);
  if (Array.isArray(suggestion?.keyFeatures)) facts.push(`**Key Features**: ${suggestion.keyFeatures.join(', ')}`);

  const lengthGuidance = lengthPreset === 'brief' 
    ? '\n\n**Note**: Keep this plan concise and focused on the most essential elements only.'
    : lengthPreset === 'standard'
    ? '\n\n**Note**: Provide a balanced plan with key details but avoid excessive length.'
    : '\n\n**Note**: Provide a comprehensive and detailed implementation plan.';

  return `Create a clear, actionable implementation plan in markdown format for the business idea below:

${facts.join('\n')}${lengthGuidance}

Please structure your response with clear markdown headers and engaging content that will help the entrepreneur successfully implement this business idea.`;
}

function getLengthInstructions(
  lengthPreset?: 'brief' | 'standard' | 'long',
  compactMode?: boolean,
  compactMaxPhaseCards?: number
): string {
  
  if (lengthPreset === 'brief') {
    return `
Length Requirements (Brief):
- Keep the entire response concise and focused
- Produce exactly 1-2 main phases with key tasks only
- Focus on core execution steps only
- Aim for practical, actionable content without excessive detail`;
  }
  
  if (lengthPreset === 'standard') {
    return `
Length Requirements (Standard):
- Produce at most 2-3 clearly separated phases
- Keep content concise and focused
- Include key tasks, milestones, and risks
- Balance detail with readability`;
  }
  
  if (compactMode) {
    return `
Length Requirements (Compact):
- Produce at most ${compactMaxPhaseCards || 4} clearly separated phases
- Keep content concise and focused
- Prioritize most important elements`;
  }
  
  return `
Length Requirements (Comprehensive):
- Provide a complete implementation plan with all relevant details
- Include comprehensive phases, tasks, and supporting information
- Be thorough while maintaining readability`;
}
