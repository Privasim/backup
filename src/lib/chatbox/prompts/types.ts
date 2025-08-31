/**
 * Type definitions for prompt templates and related structures
 */

/**
 * Prompt template interface
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  isBuiltIn: boolean;
}

/**
 * Template category interface
 */
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: PromptTemplate[];
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Template storage options
 */
export interface TemplateStorageOptions {
  namespace?: string;
  maxTemplates?: number;
  enableVersioning?: boolean;
}

/**
 * Template filter options
 */
export interface TemplateFilterOptions {
  category?: string;
  tags?: string[];
  author?: string;
  isBuiltIn?: boolean;
  searchTerm?: string;
}

/**
 * Template creation options
 */
export interface TemplateCreateOptions {
  id?: string; // Optional, will be auto-generated if not provided
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  isBuiltIn?: boolean;
}

/**
 * Template update options
 */
export interface TemplateUpdateOptions {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

/**
 * Template export format
 */
export interface TemplateExport {
  templates: PromptTemplate[];
  categories: TemplateCategory[];
  exportedAt: string;
  version: string;
}