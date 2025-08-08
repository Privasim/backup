import type { ImplementationPlan } from './types';

// Try to extract JSON object from a raw streamed string.
export function parsePlanFromString(raw: string, suggestion?: any): ImplementationPlan | undefined {
  if (!raw) return undefined;

  // Heuristic: find first '{' and last '}' to attempt JSON parse
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return undefined;

  const candidate = raw.slice(first, last + 1);
  try {
    const parsed = JSON.parse(candidate);
    // Minimal validation: required fields
    if (parsed && parsed.meta && parsed.overview && parsed.phases && parsed.tasks) {
      // Ensure meta has title/ideaId fallback from suggestion
      parsed.meta = {
        ideaId: parsed.meta.ideaId || suggestion?.id || suggestion?.title || 'idea',
        title: parsed.meta.title || suggestion?.title || 'Business Idea',
        category: parsed.meta.category || suggestion?.category,
        version: parsed.meta.version || 'v1',
        createdAt: parsed.meta.createdAt || new Date().toISOString()
      };
      return parsed as ImplementationPlan;
    }
  } catch {
    // ignore and fallback
  }
  return undefined;
}
