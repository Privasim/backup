import { useSpecsGenerator as useSpecsGeneratorInternal } from './SpecsGeneratorProvider';

/**
 * Hook to access the specs generator context
 * Provides state, settings, and actions for generating technical specifications
 * 
 * @returns Object containing state, settings, and actions
 * 
 * @example
 * const { state, settings, actions } = useSpecsGenerator();
 * 
 * // Access current state
 * const { status, preview, result, error } = state;
 * 
 * // Access current settings
 * const { length, systemPrompt } = settings;
 * 
 * // Use actions
 * actions.setLength(10);
 * actions.setSystemPrompt('Create a spec focused on API design');
 * actions.generate();
 */
export function useSpecsGenerator() {
  return useSpecsGeneratorInternal();
}
