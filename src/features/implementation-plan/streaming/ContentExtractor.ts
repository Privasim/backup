import type { FormattedContent, ProcessedSection, GenerationPhase } from './types';

export class ContentExtractor {
  /**
   * Extract readable content from JSON data structure
   */
  extractReadableContent(data: any, sectionType: GenerationPhase): FormattedContent {
    try {
      switch (sectionType) {
        case 'overview':
          return this.extractOverviewContent(data);
        case 'phases':
          return this.extractPhasesContent(data);
        case 'tasks':
          return this.extractTasksContent(data);
        case 'timeline':
          return this.extractTimelineContent(data);
        case 'resources':
          return this.extractResourcesContent(data);
        case 'budget':
          return this.extractBudgetContent(data);
        case 'risks':
          return this.extractRisksContent(data);
        case 'kpis':
          return this.extractKPIsContent(data);
        case 'next90days':
          return this.extractNext90DaysContent(data);
        default:
          return this.extractGenericContent(data);
      }
    } catch (error) {
      return {
        bulletPoints: ['Processing content...'],
        description: 'Content is being generated'
      };
    }
  }

  private extractOverviewContent(data: any): FormattedContent {
    const overview = data.overview || {};
    return {
      title: 'Business Overview',
      bulletPoints: [
        ...(overview.goals || []).map((goal: string) => `Goal: ${goal}`),
        ...(overview.successCriteria || []).map((criteria: string) => `Success: ${criteria}`),
        ...(overview.assumptions || []).map((assumption: string) => `Assumption: ${assumption}`)
      ],
      description: 'Strategic foundation and key objectives'
    };
  }

  private extractPhasesContent(data: any): FormattedContent {
    const phases = data.phases || [];
    return {
      title: 'Implementation Phases',
      bulletPoints: phases.map((phase: any, index: number) => 
        `Phase ${index + 1}: ${phase.name}${phase.duration ? ` (${phase.duration})` : ''}`
      ),
      description: `${phases.length} phases planned for systematic execution`
    };
  }

  private extractTasksContent(data: any): FormattedContent {
    const tasks = data.tasks || [];
    const topTasks = tasks.slice(0, 8); // Show first 8 tasks
    return {
      title: 'Key Tasks',
      bulletPoints: topTasks.map((task: any) => 
        `${task.title}${task.effort ? ` (${task.effort})` : ''}`
      ),
      description: `${tasks.length} tasks identified${tasks.length > 8 ? ', showing top priorities' : ''}`
    };
  }

  private extractTimelineContent(data: any): FormattedContent {
    const timeline = data.timeline || {};
    const bulletPoints: string[] = [];
    
    if (timeline.start) bulletPoints.push(`Start: ${timeline.start}`);
    if (timeline.end) bulletPoints.push(`End: ${timeline.end}`);
    if (timeline.milestones) {
      timeline.milestones.slice(0, 5).forEach((milestone: any) => {
        bulletPoints.push(`Milestone: ${milestone.title}${milestone.due ? ` (${milestone.due})` : ''}`);
      });
    }

    return {
      title: 'Project Timeline',
      bulletPoints,
      description: 'Key dates and milestones'
    };
  }

  private extractResourcesContent(data: any): FormattedContent {
    const resources = data.resources || {};
    const bulletPoints: string[] = [];

    if (resources.team) {
      resources.team.forEach((member: any) => {
        bulletPoints.push(`${member.role}${member.count ? ` (${member.count})` : ''}`);
      });
    }

    if (resources.vendors) {
      resources.vendors.forEach((vendor: string) => {
        bulletPoints.push(`Vendor: ${vendor}`);
      });
    }

    return {
      title: 'Required Resources',
      bulletPoints,
      description: 'Team members and external resources needed'
    };
  }

  private extractBudgetContent(data: any): FormattedContent {
    const budget = data.budget || {};
    const bulletPoints: string[] = [];

    if (budget.items) {
      budget.items.forEach((item: any) => {
        bulletPoints.push(`${item.label}: ${item.cost}`);
      });
    }

    if (budget.total) {
      bulletPoints.push(`Total Budget: ${budget.total}`);
    }

    return {
      title: 'Budget Breakdown',
      bulletPoints,
      description: 'Financial planning and cost estimates'
    };
  }

  private extractRisksContent(data: any): FormattedContent {
    const risks = data.risks || [];
    return {
      title: 'Risk Assessment',
      bulletPoints: risks.map((risk: any) => 
        `${risk.item} (${risk.likelihood}/${risk.impact})`
      ),
      description: `${risks.length} risks identified with mitigation strategies`
    };
  }

  private extractKPIsContent(data: any): FormattedContent {
    const kpis = data.kpis || [];
    return {
      title: 'Key Performance Indicators',
      bulletPoints: kpis.map((kpi: any) => 
        `${kpi.metric}: ${kpi.target}${kpi.cadence ? ` (${kpi.cadence})` : ''}`
      ),
      description: 'Success metrics and measurement criteria'
    };
  }

  private extractNext90DaysContent(data: any): FormattedContent {
    const next90 = data.next90Days || {};
    const bulletPoints: string[] = [];

    if (next90.days30) {
      bulletPoints.push('First 30 Days:');
      next90.days30.slice(0, 3).forEach((item: string) => bulletPoints.push(`  • ${item}`));
    }

    if (next90.days60) {
      bulletPoints.push('Days 31-60:');
      next90.days60.slice(0, 3).forEach((item: string) => bulletPoints.push(`  • ${item}`));
    }

    if (next90.days90) {
      bulletPoints.push('Days 61-90:');
      next90.days90.slice(0, 3).forEach((item: string) => bulletPoints.push(`  • ${item}`));
    }

    return {
      title: 'Next 90 Days Action Plan',
      bulletPoints,
      description: 'Immediate priorities and quick wins'
    };
  }

  private extractGenericContent(data: any): FormattedContent {
    const bulletPoints: string[] = [];
    
    if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          bulletPoints.push(`${key}: ${value.length} items`);
        } else if (typeof value === 'string') {
          bulletPoints.push(`${key}: ${value}`);
        } else if (typeof value === 'object' && value !== null) {
          bulletPoints.push(`${key}: [object]`);
        }
      });
    }

    return {
      bulletPoints: bulletPoints.length > 0 ? bulletPoints : ['Content being processed...'],
      description: 'Additional plan details'
    };
  }

  /**
   * Format bullet points for display
   */
  formatBulletPoints(items: string[]): string[] {
    return items.map(item => item.trim()).filter(Boolean);
  }

  /**
   * Format description text
   */
  formatDescription(text: string): string {
    return text.trim();
  }

  /**
   * Extract title from various data structures
   */
  extractTitle(data: any): string | null {
    if (data?.meta?.title) return data.meta.title;
    if (data?.title) return data.title;
    if (data?.name) return data.name;
    return null;
  }
}