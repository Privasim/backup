/**
 * Service for storing and retrieving prompt templates
 */

import { 
  PromptTemplate, 
  TemplateCategory, 
  TemplateStorageOptions,
  TemplateFilterOptions,
  TemplateCreateOptions,
  TemplateUpdateOptions,
  TemplateExport
} from './types';

// Default storage options
const DEFAULT_OPTIONS: TemplateStorageOptions = {
  namespace: 'prompt-templates',
  maxTemplates: 50,
  enableVersioning: true
};

/**
 * Template Storage Service
 * Handles persistence of prompt templates using localStorage
 */
export class TemplateStorage {
  private options: TemplateStorageOptions;
  private storageKey: string;
  
  constructor(options: Partial<TemplateStorageOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.storageKey = `${this.options.namespace}-storage`;
  }
  
  /**
   * Initialize storage with default templates if empty
   */
  public async initialize(defaultTemplates: PromptTemplate[] = []): Promise<void> {
    const templates = await this.getAllTemplates();
    
    if (templates.length === 0 && defaultTemplates.length > 0) {
      await this.saveTemplates(defaultTemplates);
    }
  }
  
  /**
   * Get all templates
   */
  public async getAllTemplates(): Promise<PromptTemplate[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving templates:', error);
      return [];
    }
  }
  
  /**
   * Get template by ID
   */
  public async getTemplateById(id: string): Promise<PromptTemplate | null> {
    const templates = await this.getAllTemplates();
    return templates.find(template => template.id === id) || null;
  }
  
  /**
   * Filter templates by criteria
   */
  public async filterTemplates(options: TemplateFilterOptions): Promise<PromptTemplate[]> {
    const templates = await this.getAllTemplates();
    
    return templates.filter(template => {
      // Filter by category
      if (options.category && template.category !== options.category) {
        return false;
      }
      
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const hasAllTags = options.tags.every(tag => template.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      
      // Filter by author
      if (options.author && template.author !== options.author) {
        return false;
      }
      
      // Filter by built-in status
      if (options.isBuiltIn !== undefined && template.isBuiltIn !== options.isBuiltIn) {
        return false;
      }
      
      // Filter by search term
      if (options.searchTerm) {
        const searchTerm = options.searchTerm.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(searchTerm);
        const matchesDescription = template.description.toLowerCase().includes(searchTerm);
        const matchesContent = template.content.toLowerCase().includes(searchTerm);
        const matchesTags = template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        if (!(matchesName || matchesDescription || matchesContent || matchesTags)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Save a new template
   */
  public async saveTemplate(options: TemplateCreateOptions): Promise<PromptTemplate> {
    const templates = await this.getAllTemplates();
    
    // Check if we've reached the maximum number of templates
    if (templates.length >= (this.options.maxTemplates || DEFAULT_OPTIONS.maxTemplates!)) {
      throw new Error(`Maximum number of templates (${this.options.maxTemplates}) reached`);
    }
    
    // Generate a unique ID if not provided
    const id = options.id || this.generateUniqueId();
    
    // Check if ID already exists
    if (templates.some(t => t.id === id)) {
      throw new Error(`Template with ID ${id} already exists`);
    }
    
    const now = new Date().toISOString();
    
    const newTemplate: PromptTemplate = {
      id,
      name: options.name,
      description: options.description,
      content: options.content,
      category: options.category,
      tags: options.tags,
      version: 1,
      createdAt: now,
      updatedAt: now,
      author: options.author,
      isBuiltIn: options.isBuiltIn || false
    };
    
    templates.push(newTemplate);
    await this.saveTemplates(templates);
    
    return newTemplate;
  }
  
  /**
   * Update an existing template
   */
  public async updateTemplate(id: string, options: TemplateUpdateOptions): Promise<PromptTemplate> {
    const templates = await this.getAllTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    const template = templates[templateIndex];
    
    // Don't allow updating built-in templates unless explicitly overridden
    if (template.isBuiltIn) {
      throw new Error('Cannot update built-in templates');
    }
    
    const updatedTemplate: PromptTemplate = {
      ...template,
      name: options.name || template.name,
      description: options.description || template.description,
      content: options.content || template.content,
      category: options.category || template.category,
      tags: options.tags || template.tags,
      author: options.author || template.author,
      version: template.version + 1,
      updatedAt: new Date().toISOString()
    };
    
    templates[templateIndex] = updatedTemplate;
    await this.saveTemplates(templates);
    
    return updatedTemplate;
  }
  
  /**
   * Delete a template
   */
  public async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.getAllTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return false;
    }
    
    // Don't allow deleting built-in templates
    if (templates[templateIndex].isBuiltIn) {
      throw new Error('Cannot delete built-in templates');
    }
    
    templates.splice(templateIndex, 1);
    await this.saveTemplates(templates);
    
    return true;
  }
  
  /**
   * Export templates
   */
  public async exportTemplates(includeBuiltIn: boolean = false): Promise<TemplateExport> {
    const templates = await this.getAllTemplates();
    const filteredTemplates = includeBuiltIn ? templates : templates.filter(t => !t.isBuiltIn);
    
    // Group templates by category
    const categoriesMap = new Map<string, TemplateCategory>();
    
    filteredTemplates.forEach(template => {
      if (!categoriesMap.has(template.category)) {
        categoriesMap.set(template.category, {
          id: template.category,
          name: template.category, // Use category as name for now
          description: '', // Empty description for now
          templates: []
        });
      }
      
      categoriesMap.get(template.category)!.templates.push(template);
    });
    
    return {
      templates: filteredTemplates,
      categories: Array.from(categoriesMap.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }
  
  /**
   * Import templates
   */
  public async importTemplates(data: TemplateExport, overwrite: boolean = false): Promise<number> {
    if (!data.templates || !Array.isArray(data.templates)) {
      throw new Error('Invalid import data format');
    }
    
    const currentTemplates = await this.getAllTemplates();
    let importCount = 0;
    
    // Process each template
    for (const template of data.templates) {
      const existingIndex = currentTemplates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Template exists
        if (overwrite) {
          // Update existing template if overwrite is enabled
          currentTemplates[existingIndex] = {
            ...template,
            isBuiltIn: false, // Imported templates are never built-in
            updatedAt: new Date().toISOString()
          };
          importCount++;
        }
      } else {
        // New template
        currentTemplates.push({
          ...template,
          isBuiltIn: false, // Imported templates are never built-in
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        importCount++;
      }
    }
    
    // Save updated templates
    await this.saveTemplates(currentTemplates);
    
    return importCount;
  }
  
  /**
   * Clear all templates (except built-in)
   */
  public async clearTemplates(includeBuiltIn: boolean = false): Promise<void> {
    const templates = await this.getAllTemplates();
    const remainingTemplates = includeBuiltIn ? [] : templates.filter(t => t.isBuiltIn);
    
    await this.saveTemplates(remainingTemplates);
  }
  
  /**
   * Save templates to storage
   */
  private async saveTemplates(templates: PromptTemplate[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
      throw new Error('Failed to save templates');
    }
  }
  
  /**
   * Generate a unique ID
   */
  private generateUniqueId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const templateStorage = new TemplateStorage();