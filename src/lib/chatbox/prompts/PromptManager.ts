/**
 * PromptManager service
 * Manages prompt templates and provides an interface for template operations
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  PromptTemplate, 
  TemplateCategory, 
  ValidationResult, 
  TemplateFilterOptions,
  TemplateCreateOptions,
  TemplateUpdateOptions,
  TemplateExport
} from './types';
import { templateStorage } from './TemplateStorage';
import { templateValidator } from './TemplateValidator';

/**
 * PromptManager Service
 * Provides a unified interface for managing prompt templates
 */
export class PromptManager {
  /**
   * Initialize the prompt manager
   */
  public async initialize(): Promise<void> {
    await templateStorage.initialize();
  }

  /**
   * Get all templates
   */
  public async getAllTemplates(): Promise<PromptTemplate[]> {
    return templateStorage.getAllTemplates();
  }

  /**
   * Get templates by category
   */
  public async getTemplatesByCategory(category: TemplateCategory): Promise<PromptTemplate[]> {
    return templateStorage.getTemplatesByCategory(category);
  }

  /**
   * Get template by ID
   */
  public async getTemplateById(id: string): Promise<PromptTemplate | null> {
    return templateStorage.getTemplateById(id);
  }

  /**
   * Filter templates
   */
  public async filterTemplates(options: TemplateFilterOptions): Promise<PromptTemplate[]> {
    return templateStorage.filterTemplates(options);
  }

  /**
   * Create a new template
   */
  public async createTemplate(options: TemplateCreateOptions): Promise<{ template: PromptTemplate | null, validationResult: ValidationResult }> {
    // Validate the template
    const validationResult = templateValidator.validateTemplate(options);
    
    if (!validationResult.isValid) {
      return { template: null, validationResult };
    }
    
    // Create the template
    const template: PromptTemplate = {
      id: uuidv4(),
      name: options.name,
      description: options.description,
      content: options.content,
      category: options.category,
      tags: options.tags || [],
      isBuiltIn: false,
      isEditable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save the template
    await templateStorage.saveTemplate(template);
    
    return { template, validationResult };
  }

  /**
   * Update an existing template
   */
  public async updateTemplate(id: string, options: TemplateUpdateOptions): Promise<{ template: PromptTemplate | null, validationResult: ValidationResult }> {
    // Get the existing template
    const existingTemplate = await templateStorage.getTemplateById(id);
    
    if (!existingTemplate) {
      return { 
        template: null, 
        validationResult: { 
          isValid: false, 
          errors: ['Template not found'], 
          warnings: [] 
        } 
      };
    }
    
    // Check if the template is editable
    if (!existingTemplate.isEditable) {
      return { 
        template: null, 
        validationResult: { 
          isValid: false, 
          errors: ['Template is not editable'], 
          warnings: [] 
        } 
      };
    }
    
    // Create updated template
    const updatedTemplate: PromptTemplate = {
      ...existingTemplate,
      name: options.name || existingTemplate.name,
      description: options.description || existingTemplate.description,
      content: options.content || existingTemplate.content,
      category: options.category || existingTemplate.category,
      tags: options.tags || existingTemplate.tags,
      updatedAt: new Date().toISOString()
    };
    
    // Validate the updated template
    const validationResult = templateValidator.validateTemplate(updatedTemplate);
    
    if (!validationResult.isValid) {
      return { template: null, validationResult };
    }
    
    // Save the updated template
    await templateStorage.saveTemplate(updatedTemplate);
    
    return { template: updatedTemplate, validationResult };
  }

  /**
   * Delete a template
   */
  public async deleteTemplate(id: string): Promise<boolean> {
    // Get the existing template
    const existingTemplate = await templateStorage.getTemplateById(id);
    
    if (!existingTemplate) {
      return false;
    }
    
    // Check if the template is editable
    if (!existingTemplate.isEditable) {
      return false;
    }
    
    // Delete the template
    return templateStorage.deleteTemplate(id);
  }

  /**
   * Export templates
   */
  public async exportTemplates(ids?: string[]): Promise<TemplateExport> {
    let templates: PromptTemplate[];
    
    if (ids && ids.length > 0) {
      templates = [];
      
      for (const id of ids) {
        const template = await templateStorage.getTemplateById(id);
        if (template) {
          templates.push(template);
        }
      }
    } else {
      templates = await templateStorage.getAllTemplates();
    }
    
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templates
    };
  }

  /**
   * Import templates
   */
  public async importTemplates(exportData: TemplateExport): Promise<{ 
    success: boolean, 
    imported: number, 
    failed: number, 
    errors: string[] 
  }> {
    const result = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Validate the export data
    if (!exportData.version || !exportData.templates || !Array.isArray(exportData.templates)) {
      result.errors.push('Invalid export data format');
      return result;
    }
    
    // Import each template
    for (const template of exportData.templates) {
      // Validate the template
      const validationResult = templateValidator.validateTemplate(template);
      
      if (!validationResult.isValid) {
        result.failed++;
        result.errors.push(`Failed to import template "${template.name}": ${validationResult.errors.join(', ')}`);
        continue;
      }
      
      // Create a new template with a new ID
      const newTemplate: PromptTemplate = {
        ...template,
        id: uuidv4(),
        isBuiltIn: false,
        isEditable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save the template
      try {
        await templateStorage.saveTemplate(newTemplate);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to save template "${template.name}": ${error}`);
      }
    }
    
    result.success = result.imported > 0;
    
    return result;
  }

  /**
   * Get a template preview
   */
  public getTemplatePreview(template: PromptTemplate, maxLength: number = 150): string {
    return templateValidator.generateContentPreview(template.content, maxLength);
  }

  /**
   * Validate a template
   */
  public validateTemplate(template: Partial<PromptTemplate>): ValidationResult {
    return templateValidator.validateTemplate(template);
  }
}

// Export singleton instance
export const promptManager = new PromptManager();