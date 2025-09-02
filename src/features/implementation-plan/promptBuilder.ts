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
    const baseRequirements = `Implementation Plan Requirements (Strict):

1. Output MUST be markdown.

2. Produce EXACTLY 3 phases. Never use fewer or more than 3 phases.

3. For EACH phase, use the exact keys and order below (one per line):
   • Phase [number] - [Name]
   • Timeline: [duration]
   • Tools: [comma-separated list with pricing if applicable]
   • Channels: [comma-separated list]
   • Description: [one concise sentence]

Example (format template):

Phase 1 - Build
Timeline: 7-14 days
Tools: Lovable.dev ($0), bolt.new ($0), V0
Channels: 
Description: Create specs and build prototype

Phase 2 - Marketing Automation
Timeline: 7-14 days
Tools: make.com, n8n, zapier
Channels: Facebook, LinkedIn
Description: Setup automated marketing campaigns

Phase 3 - Feedback and Iteration
Timeline: 14-30 days
Tools: CRM Tools
Channels: Facebook, Email
Description: Collect user feedback and iterate\n
- Do NOT add extra sections before, between, or after the 3 phases unless explicitly requested.
- Keep names and keys exactly as shown (Phase N - Name, Timeline, Tools, Channels, Description).`;
    
    // Add length preset constraints (must not alter phase count)
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
- Keep each phase extremely concise.
- Timeline: short range only (e.g., 7-14 days).
- Tools: max 2-3 items total; prefer free/low-cost.
- Channels: max 1-2.
- Description: 1 short sentence.
- Do NOT change the number of phases (must remain 3).`;
  }
  
  if (lengthPreset === 'standard') {
    return `
Length Requirements (Standard):
- Keep content concise and focused.
- Timeline: short, readable ranges.
- Tools: 3-4 items.
- Channels: 2-3 items.
- Description: 1 sentence with concrete action.
- Do NOT change the number of phases (must remain 3).`;
  }
  
  if (compactMode) {
    return `
Length Requirements (Compact Mode):
- Favor brevity and clarity across all fields.
- Tools and Channels should list only the most important items.
- Do NOT add or remove phases; always 3 phases.`;
  }
  
  return `
Length Requirements (Comprehensive):
- Provide clear but sufficiently detailed entries for each field.
- Keep structure strict; do not add sections beyond the 3 phases.
- Always exactly 3 phases.`;
}
