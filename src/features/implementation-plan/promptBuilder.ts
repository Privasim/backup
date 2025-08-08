type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

interface BuildParams {
  baseSystemPrompt?: string;
  systemPromptOverride?: string;
  sources?: string[];
  suggestion: any; // BusinessSuggestion shape
}

export function buildMessages({ baseSystemPrompt = '', systemPromptOverride = '', sources = [], suggestion }: BuildParams) {
  const systemParts: string[] = [];

  if (baseSystemPrompt) systemParts.push(baseSystemPrompt.trim());

  if (systemPromptOverride?.trim()) {
    systemParts.push(`Implementation Plan Requirements (Override):\n${systemPromptOverride.trim()}`);
  } else {
    systemParts.push(`Implementation Plan Requirements:\n- Provide a streamlined but complete plan\n- Include phases, key tasks, milestones, risks, resources, budget, KPIs, and 30/60/90-day actions\n- Prefer concise bullet points with clear ownership and effort\n- Return a single JSON object matching the agreed schema\n- If unsure, make reasonable assumptions and state them in 'overview.assumptions'`);
  }

  if (sources.length > 0) {
    const srcList = sources.map((s, i) => `  - [${i + 1}] ${s}`).join('\n');
    systemParts.push(`Sources and Constraints:\n- Use the following sources for grounding where applicable\n${srcList}\n- If source relevance is low, annotate assumptions clearly`);
  }

  const systemMessage: Msg = {
    role: 'system',
    content: systemParts.join('\n\n')
  };

  const facts: string[] = [];
  if (suggestion?.title) facts.push(`Title: ${suggestion.title}`);
  if (suggestion?.category) facts.push(`Category: ${suggestion.category}`);
  if (suggestion?.description) facts.push(`Description: ${suggestion.description}`);
  if (suggestion?.targetMarket) facts.push(`Target Market: ${suggestion.targetMarket}`);
  if (suggestion?.estimatedStartupCost) facts.push(`Estimated Startup Cost: ${suggestion.estimatedStartupCost}`);
  if (Array.isArray(suggestion?.keyFeatures)) facts.push(`Key Features: ${suggestion.keyFeatures.join('; ')}`);

  const userMessage: Msg = {
    role: 'user',
    content: `Generate an implementation plan in JSON for the business idea below.\n\nBusiness Suggestion:\n${facts.join('\n')}\n\nOutput strictly as JSON only.`
  };

  return { systemMessage, userMessage };
}
