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

2. Produce EXACTLY 3 phases in this exact order and naming. Never rename, reorder, add, or remove phases (reject synonyms):
   • Phase 1 - Building
   • Phase 2 - Marketing
   • Phase 3 - Feedback and Iteration

3. For EACH phase, use the exact keys below in this order. Keys MUST appear once per phase on their own lines. The Description content may span multiple lines:
   • Phase [number] - [Name]
   • Timeline: [duration]
   • Tools: [comma-separated list]
   • Channels: [comma-separated list or N/A]
   • Description: [phase-specific content]

4. Phase-specific requirements:
   • Phase 1 - Building
     - Timeline MUST be 7-14 days.
     - Description MUST include all of the following:
       - A 3–4 sentence product description (what it is, who it's for, core value).
       - PRD (concise bullets): Problem, Target users, Core features/scope, Success metrics.
       - Tech Specs (concise bullets): stack, high-level architecture, data model, APIs, infra/deployment.
     - Keep PRD and Tech Specs inside the Description section as bullet points. Do NOT introduce new keys.

   • Phase 2 - Marketing (GTM)
     - Timeline MUST be 14-30 days.
     - Description focuses on: ICP, positioning, messaging, channels, campaign plan, content strategy, experiments, and measurement.

   • Phase 3 - Feedback and Iteration (Sales & Feedback)
     - Timeline MUST be 30-60 days.
     - Description focuses on: sales enablement, pipeline setup, feedback collection (surveys/interviews/analytics), and product iteration/improvements.

5. Data integrity (No mock data):
   • Do NOT fabricate specific data (e.g., prices, counts, names, metrics, testimonials). No mock data.
   • If information is unknown, write "TBD" and add a short note on how to obtain it. Clearly label assumptions.

Example (format template; values are placeholders to show structure only):

Phase 1 - Building
Timeline: 7-14 days
Tools: TBD
Channels: N/A
Description: Provide a 3–4 sentence product description covering what it is, who it's for, and the core value proposition.
PRD:
- Problem: TBD
- Target users: TBD
- Core features/scope: TBD
- Success metrics: TBD
Tech Specs:
- Stack: TBD
- Architecture: TBD
- Data model: TBD
- APIs: TBD
- Infra/deployment: TBD

Phase 2 - Marketing
Timeline: 14-30 days
Tools: TBD
Channels: TBD
Description: Define ICP, positioning and messaging; outline channels and campaign plan; propose content strategy, experiments, and measurement (no fabricated metrics).

Phase 3 - Feedback and Iteration
Timeline: 30-60 days
Tools: TBD
Channels: TBD
Description: Set up sales enablement and pipeline; collect feedback via surveys/interviews/analytics; plan product iterations based on validated insights.

- Do NOT add extra sections before, between, or after the 3 phases unless explicitly requested.
- Keep names and keys exactly as shown (Phase N - Name, Timeline, Tools, Channels, Description).`;
    
    // Add length preset constraints (must not alter phase count or fixed timelines)
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
- Keep each phase concise.
- Timelines are FIXED per phase and MUST remain: Phase 1 = 7-14 days, Phase 2 = 14-30 days, Phase 3 = 30-60 days.
- Tools: max 2-3 items total; avoid fabricated specifics; use "TBD" when unknown.
- Channels: max 1-2; use "N/A" if not applicable.
- Description:
  • Phase 1: Minimum 3 sentences for product description + terse PRD and Tech Specs bullets.
  • Phase 2 & 3: 1–2 concise sentences aligned to scope.
- Do NOT change the number or order of phases (must remain exactly 3).`;
  }
  
  if (lengthPreset === 'standard') {
    return `
Length Requirements (Standard):
- Keep content concise and focused.
- Timelines are FIXED per phase and MUST remain: Phase 1 = 7-14 days, Phase 2 = 14-30 days, Phase 3 = 30-60 days.
- Tools: 3-4 items; avoid fabricated specifics; use "TBD" when unknown.
- Channels: 2-3 items; use "N/A" if not applicable.
- Description:
  • Phase 1: 3–4 sentence product description + concise PRD and Tech Specs bullets.
  • Phase 2 & 3: 1–3 sentences aligned to scope with concrete actions.
- Do NOT change the number or order of phases (must remain exactly 3).`;
  }
  
  if (compactMode) {
    return `
Length Requirements (Compact Mode):
- Favor brevity and clarity across all fields.
- Tools and Channels should list only the most important items; avoid fabricated specifics.
- Phase 1 still requires at least 3 sentences for the product description plus terse PRD and Tech Specs bullets.
- Do NOT add or remove phases; always exactly 3 in the fixed order and names.`;
  }
  
  return `
Length Requirements (Comprehensive):
- Provide clear but sufficiently detailed entries for each field.
- Timelines are FIXED per phase and MUST remain: Phase 1 = 7-14 days, Phase 2 = 14-30 days, Phase 3 = 30-60 days.
- Phase 1: 3–4 sentence product description + PRD and Tech Specs bullets (no extra keys).
- Phase 2 & 3: Add actionable details but avoid fabricated specifics; label assumptions and use "TBD" where needed.
- Keep structure strict; do not add sections beyond the 3 phases; always exactly 3 phases.`;
}
