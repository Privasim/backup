// File: src/components/insights/prompt/prompt-builder.ts

import { PromptSettings } from './settings-registry';

// Define the research data structure that will be passed to the prompt builder
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

interface PromptComponents {
  system: string;
  user: string;
  schemaInstruction: string;
}

export const buildInsightsPrompt = (input: { 
  researchData: ResearchData; 
  settings: PromptSettings 
}): PromptComponents => {
  const { researchData, settings } = input;
  
  // Build the system prompt
  const systemComponents = [];
  
  // Role and purpose
  systemComponents.push('You are an expert HR analyst and career advisor providing data-driven insights about job market risks.');
  
  // Tone instruction
  systemComponents.push(`Use a ${settings.tone} tone in your responses.`);
  
  // Audience instruction
  systemComponents.push(`Tailor your language for a ${settings.audience} audience.`);
  
  // Structure instruction
  switch (settings.structure) {
    case 'paragraph':
      systemComponents.push('Format your responses using paragraphs with clear, flowing sentences.');
      break;
    case 'bulleted':
      systemComponents.push('Format your responses using bullet points for easy scanning.');
      break;
    case 'hybrid':
      systemComponents.push('Format your responses using a combination of paragraphs and bullet points for clarity and readability.');
      break;
  }
  
  // Verbosity instruction
  switch (settings.verbosity) {
    case 'short':
      systemComponents.push('Be concise and to the point. Focus on the most critical insights only.');
      break;
    case 'medium':
      systemComponents.push('Provide a balanced level of detail, covering key points without excessive elaboration.');
      break;
    case 'long':
      systemComponents.push('Provide comprehensive explanations with detailed context and examples where relevant.');
      break;
  }
  
  // Section inclusion instructions
  const includedSections = [];
  if (settings.sections.risk) includedSections.push('overall risk assessment');
  if (settings.sections.drivers) includedSections.push('threat drivers');
  if (settings.sections.automation) includedSections.push('automation exposure');
  if (settings.sections.skills) includedSections.push('skill impacts');
  if (settings.sections.mitigation) includedSections.push('mitigation strategies');
  if (settings.sections.sources) includedSections.push('data sources');
  
  if (includedSections.length > 0) {
    systemComponents.push(`Include analysis of the following sections: ${includedSections.join(', ')}.`);
  }
  
  // Constraints
  if (settings.constraints.avoidOverclaiming) {
    systemComponents.push('Avoid making definitive predictions about the future. Use probabilistic language like "may", "could", "might", and "tends to".');
  }
  
  if (settings.constraints.citeSources && researchData.sources && researchData.sources.length > 0) {
    systemComponents.push('When referencing specific data points, cite the relevant sources.');
  }
  
  if (settings.constraints.maxChars) {
    systemComponents.push(`Limit your total response to approximately ${settings.constraints.maxChars} characters.`);
  }
  
  // Disclaimer instruction
  if (settings.disclaimer.enabled) {
    const disclaimerText = settings.disclaimer.style === 'strong' 
      ? 'Include a strong disclaimer noting that these are data-driven projections subject to significant uncertainty and should not be taken as definitive career advice.'
      : 'Include a gentle disclaimer noting that these insights are based on data analysis and should be considered alongside other factors in career planning.';
    systemComponents.push(disclaimerText);
  }
  
  const systemPrompt = systemComponents.join(' ');
  
  // Build the user prompt
  const userData = JSON.stringify(researchData, null, 2);
  const userPrompt = `Analyze the following job market risk data and provide insights according to the instructions:\n\n${userData}`;
  
  // Build the schema instruction
  const schemaInstruction = `

IMPORTANT: Respond ONLY with a valid JSON object that conforms to this schema:
{
  "summary": "string (optional, overall summary of the analysis)",
  "narratives": {
    "riskNarrative": "string (optional, narrative for overall risk)",
    "threatNarrative": "string (optional, narrative for threat drivers)",
    "automationNarrative": "string (optional, narrative for automation exposure)",
    "skillsNarrative": "string (optional, narrative for skill impacts)",
    "mitigationNarrative": "string (optional, narrative for mitigation strategies)",
    "methodologyNote": "string (optional, note about analysis methodology)",
    "confidenceNote": "string (optional, note about confidence level)",
    "oneLiner": "string (optional, concise summary for minimal view)"
  },
  "mitigation": [
    {
      "action": "string (required)",
      "priority": "'high' | 'medium' | 'low' (required)"
    }
  ],
  "threatDrivers": [
    "string (optional, threat drivers)"
  ],
  "skillImpacts": [
    {
      "skill": "string (required)",
      "impact": "'high' | 'medium' | 'low' (required)",
      "rationale": "string (optional)"
    }
  ],
  "sources": [
    {
      "title": "string (required)",
      "url": "string (optional)"
    }
  ]
}

Do not include any other text, explanations, or markdown formatting. Only return the JSON object.`;

  return {
    system: systemPrompt,
    user: userPrompt,
    schemaInstruction: schemaInstruction
  };
};
