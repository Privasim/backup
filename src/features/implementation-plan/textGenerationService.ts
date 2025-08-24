import { OpenRouterClient } from '@/lib/openrouter/client';
import { ImplementationPlan, PlanSettings } from './types';
import { buildTextPrompts } from './promptBuilder';

export interface BusinessSuggestion {
  id?: string;
  title: string;
  description: string;
  category?: string;
  targetMarket?: string;
  estimatedStartupCost?: string;
  keyFeatures: string[];
}

export interface GenerationParams {
  suggestion: BusinessSuggestion;
  settings: PlanSettings;
  apiKey: string;
  model: string;
}

export interface ContentSection {
  type: 'overview' | 'phases' | 'tasks' | 'resources' | 'risks' | 'kpis' | 'timeline' | 'other';
  title: string;
  content: string;
  level: number;
}

export class TextGenerationService {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    this.client = new OpenRouterClient(apiKey);
  }

  async generatePlan(
    suggestion: BusinessSuggestion,
    settings: PlanSettings,
    onChunk?: (chunk: string) => void
  ): Promise<ImplementationPlan> {
    const { systemPrompt, userPrompt } = buildTextPrompts({ 
      suggestion, 
      settings,
      baseSystemPrompt: '',
      systemPromptOverride: settings.systemPromptOverride || '',
      sources: settings.sources || [],
      compactMode: settings.compactMode || false,
      compactMaxPhaseCards: settings.compactMaxPhaseCards || 4,
      lengthPreset: settings.lengthPreset || 'long'
    });
    
    let textContent = '';
    
    if (onChunk) {
      // Streaming generation
      await this.client.chat({
        model: settings.model || 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }, {
        stream: true,
        onChunk: (chunk: string) => {
          textContent += chunk;
          onChunk(chunk);
        }
      });
    } else {
      // Non-streaming generation
      const response = await this.client.chat({
        model: settings.model || 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });
      
      textContent = response?.choices?.[0]?.message?.content || '';
    }
    
    if (!textContent.trim()) {
      throw new Error('No content generated from API');
    }
    
    return this.createPlanFromText(textContent, suggestion);
  }

  private createPlanFromText(textContent: string, suggestion: BusinessSuggestion): ImplementationPlan {
    const contentSections = this.extractSections(textContent);
    
    return {
      meta: {
        ideaId: suggestion.id || `plan-${Date.now()}`,
        title: suggestion.title,
        category: suggestion.category || 'Business',
        version: 'v1',
        createdAt: new Date().toISOString()
      },
      overview: this.extractOverview(contentSections),
      phases: this.extractPhases(contentSections),
      tasks: this.extractTasks(contentSections),
      kpis: this.extractKPIs(contentSections),
      textContent,
      formattedContent: this.formatContent(textContent),
      contentSections,
      displayMode: 'hybrid'
    };
  }

  private extractSections(text: string): ContentSection[] {
    const sections: ContentSection[] = [];
    const lines = text.split('\n');
    let currentSection: ContentSection | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect headers (markdown style)
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const type = this.categorizeSection(title);
        
        currentSection = {
          type,
          title,
          content: '',
          level
        };
      } else if (currentSection && trimmed) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private categorizeSection(title: string): ContentSection['type'] {
    const lower = title.toLowerCase();
    
    if (lower.includes('overview') || lower.includes('summary') || lower.includes('executive')) {
      return 'overview';
    }
    if (lower.includes('phase') || lower.includes('stage') || lower.includes('milestone')) {
      return 'phases';
    }
    if (lower.includes('task') || lower.includes('action') || lower.includes('step')) {
      return 'tasks';
    }
    if (lower.includes('resource') || lower.includes('budget') || lower.includes('cost')) {
      return 'resources';
    }
    if (lower.includes('risk') || lower.includes('challenge') || lower.includes('mitigation')) {
      return 'risks';
    }
    if (lower.includes('kpi') || lower.includes('metric') || lower.includes('measure')) {
      return 'kpis';
    }
    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('roadmap')) {
      return 'timeline';
    }
    
    return 'other';
  }

  private extractOverview(sections: ContentSection[]) {
    const overviewSection = sections.find(s => s.type === 'overview');
    const goals = this.extractListItems(overviewSection?.content || '');
    
    return {
      goals: goals.length > 0 ? goals : ['Launch successful business based on the implementation plan'],
      successCriteria: ['Business launch', 'Initial customer acquisition', 'Revenue generation'],
      assumptions: ['Market conditions remain stable', 'Resources are available as planned']
    };
  }

  private extractPhases(sections: ContentSection[]) {
    const phasesSections = sections.filter(s => s.type === 'phases');
    const phases = [];
    
    for (let i = 0; i < phasesSections.length; i++) {
      const section = phasesSections[i];
      const objectives = this.extractListItems(section.content);
      
      phases.push({
        id: `phase-${i + 1}`,
        name: section.title,
        objectives: objectives.length > 0 ? objectives : ['Execute phase objectives'],
        duration: this.extractDuration(section.content) || '1-2 months',
        milestones: []
      });
    }
    
    // Fallback if no phases found
    if (phases.length === 0) {
      phases.push({
        id: 'phase-1',
        name: 'Implementation Phase',
        objectives: ['Execute the business plan successfully'],
        duration: '3-6 months',
        milestones: []
      });
    }
    
    return phases;
  }

  private extractTasks(sections: ContentSection[]) {
    const tasksSections = sections.filter(s => s.type === 'tasks');
    const tasks = [];
    
    for (let i = 0; i < tasksSections.length; i++) {
      const section = tasksSections[i];
      const taskItems = this.extractListItems(section.content);
      
      for (let j = 0; j < taskItems.length; j++) {
        tasks.push({
          id: `task-${i + 1}-${j + 1}`,
          phaseId: 'phase-1',
          title: taskItems[j],
          description: `Complete: ${taskItems[j]}`,
          owner: 'Business owner',
          effort: 'Medium'
        });
      }
    }
    
    // Fallback if no tasks found
    if (tasks.length === 0) {
      tasks.push({
        id: 'task-1',
        phaseId: 'phase-1',
        title: 'Execute implementation plan',
        description: 'Follow the implementation plan to launch the business',
        owner: 'Business owner',
        effort: 'High'
      });
    }
    
    return tasks;
  }

  private extractKPIs(sections: ContentSection[]) {
    const kpiSection = sections.find(s => s.type === 'kpis');
    if (!kpiSection) return undefined;
    
    const kpiItems = this.extractListItems(kpiSection.content);
    return kpiItems.map((item, index) => ({
      id: `kpi-${index + 1}`,
      metric: item.split(':')[0] || item,
      target: item.split(':')[1]?.trim() || 'TBD',
      description: item
    }));
  }

  private extractListItems(content: string): string[] {
    const lines = content.split('\n');
    const items = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match bullet points, numbered lists, or dashes
      const listMatch = trimmed.match(/^[-*•]\s+(.+)$/) || 
                       trimmed.match(/^\d+\.\s+(.+)$/) ||
                       trimmed.match(/^[→▶]\s+(.+)$/);
      
      if (listMatch) {
        items.push(listMatch[1].trim());
      }
    }
    
    return items;
  }

  private extractDuration(content: string): string | null {
    // Look for duration patterns like "2-3 months", "6 weeks", etc.
    const durationMatch = content.match(/(\d+[-–]\d+\s+(?:weeks?|months?|days?)|\d+\s+(?:weeks?|months?|days?))/i);
    return durationMatch ? durationMatch[0] : null;
  }

  private formatContent(textContent: string): string {
    // Basic formatting improvements
    return textContent
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
      .replace(/^\s+/gm, '') // Remove leading whitespace
      .trim();
  }
}