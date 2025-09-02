'use client';

import { z } from 'zod';

// Define the template schema with validation
const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name too long'),
  prompt: z.string().min(50, 'Prompt must be at least 50 characters').max(2000, 'Prompt too long'),
  variables: z.array(z.string()),
  createdAt: z.string().datetime(),
});

// Export the type derived from the schema
export type BusinessTemplate = z.infer<typeof templateSchema>;

// Storage key for localStorage
const STORAGE_KEY = 'business_suggestion_templates';

// Normalize template identifiers to avoid case/whitespace drift
function normalizeTemplateId(id: string): string {
  return id.trim().toLowerCase();
}

// Default templates
const DEFAULT_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'saas',
    name: 'SaaS',
    prompt: 'Generate innovative SaaS business ideas based on the following profile:\n\nSkills: {skills}\nInterests: {interests}\nBudget: {budget}\n\nFocus on subscription-based software solutions with recurring revenue models. Consider both B2B and B2C opportunities.',
    variables: ['skills', 'interests', 'budget'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'retail',
    name: 'Retail',
    prompt: 'Generate retail business ideas based on the following profile:\n\nSkills: {skills}\nInterests: {interests}\nBudget: {budget}\n\nFocus on physical or e-commerce product-based businesses. Consider inventory management, supply chain, and customer experience aspects.',
    variables: ['skills', 'interests', 'budget'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course',
    name: 'Course',
    prompt: 'Generate online course business ideas based on the following profile:\n\nSkills: {skills}\nInterests: {interests}\nBudget: {budget}\n\nFocus on educational content that can be packaged as digital courses. Consider target audience, pricing models, and marketing strategies.',
    variables: ['skills', 'interests', 'budget'],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Retrieves all templates including defaults and custom ones
 */
export const getTemplates = async (): Promise<BusinessTemplate[]> => {
  try {
    // Get custom templates from storage
    const storedTemplatesJson = localStorage.getItem(STORAGE_KEY);
    const customTemplates: BusinessTemplate[] = storedTemplatesJson 
      ? JSON.parse(storedTemplatesJson)
      : [];
    
    // Validate each template
    const validCustomTemplates = customTemplates.filter(template => {
      try {
        templateSchema.parse(template);
        return true;
      } catch (err) {
        console.error('Invalid template found:', template, err);
        return false;
      }
    });
    
    // Combine default and custom templates
    return [...DEFAULT_TEMPLATES, ...validCustomTemplates];
  } catch (err) {
    console.error('Failed to get templates:', err);
    return DEFAULT_TEMPLATES;
  }
};

/**
 * Saves a new template to storage
 */
export const saveTemplate = async (template: BusinessTemplate): Promise<void> => {
  try {
    // Normalize and validate the template
    const normalized: BusinessTemplate = { ...template, id: normalizeTemplateId(template.id) };
    templateSchema.parse(normalized);

    // Get existing custom templates
    const storedTemplatesJson = localStorage.getItem(STORAGE_KEY);
    const existingTemplates: BusinessTemplate[] = storedTemplatesJson
      ? JSON.parse(storedTemplatesJson)
      : [];

    // Check if template with same ID already exists (case-insensitive)
    const templateIndex = existingTemplates.findIndex(
      (t) => normalizeTemplateId(t.id) === normalized.id
    );

    if (templateIndex >= 0) {
      // Update existing template
      existingTemplates[templateIndex] = normalized;
    } else {
      // Add new template
      existingTemplates.push(normalized);
    }

    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTemplates));
  } catch (err) {
    console.error('Failed to save template:', err);
    throw err;
  }
};

/**
 * Deletes a template from storage
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    // Cannot delete default templates
    if (DEFAULT_TEMPLATES.some(t => t.id === id)) {
      throw new Error('Cannot delete default templates');
    }
    
    // Get existing templates
    const storedTemplatesJson = localStorage.getItem(STORAGE_KEY);
    if (!storedTemplatesJson) return;
    
    const existingTemplates: BusinessTemplate[] = JSON.parse(storedTemplatesJson);
    
    // Filter out the template to delete
    const updatedTemplates = existingTemplates.filter(t => t.id !== id);
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  } catch (err) {
    console.error('Failed to delete template:', err);
    throw err;
  }
};

/**
 * Gets a template by ID
 */
export const getTemplateById = async (id: string): Promise<BusinessTemplate | undefined> => {
  const nid = normalizeTemplateId(id);
  // Check default templates first (case-insensitive)
  const defaultTemplate = DEFAULT_TEMPLATES.find((t) => normalizeTemplateId(t.id) === nid);
  if (defaultTemplate) return defaultTemplate;

  // Check custom templates
  const templates = await getTemplates();
  return templates.find((t) => normalizeTemplateId(t.id) === nid);
};

/**
 * Sanitizes a template prompt to prevent XSS
 */
export const sanitizePrompt = (prompt: string): string => {
  // Basic sanitization - remove HTML tags
  return prompt.replace(/<[^>]*>?/gm, '');
};

/**
 * Interpolates variables in a template prompt
 */
export const interpolateTemplate = (
  template: BusinessTemplate, 
  variables: Record<string, string>
): string => {
  let result = template.prompt;
  
  // Replace each variable placeholder with its value
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
};
