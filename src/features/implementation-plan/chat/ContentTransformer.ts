import { ImplementationPlan } from '@/features/implementation-plan/types';

export class ContentTransformer {
  /**
   * Transform plan overview into conversational format
   */
  static transformOverview(overview: ImplementationPlan['overview']): string {
    const parts: string[] = [];

    parts.push('🎯 **Plan Overview**\n');
    
    if (overview.goals && overview.goals.length > 0) {
      parts.push('Here are the main goals we\'ll achieve:');
      overview.goals.forEach((goal, index) => {
        parts.push(`${index + 1}. ${goal}`);
      });
      parts.push('');
    }

    if (overview.successCriteria && overview.successCriteria.length > 0) {
      parts.push('**Success will be measured by:**');
      overview.successCriteria.forEach(criteria => {
        parts.push(`✅ ${criteria}`);
      });
      parts.push('');
    }

    if (overview.assumptions && overview.assumptions.length > 0) {
      parts.push('**Key assumptions:**');
      overview.assumptions.forEach(assumption => {
        parts.push(`💭 ${assumption}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Transform phases into conversational format
   */
  static transformPhases(phases: ImplementationPlan['phases']): string {
    if (!phases || phases.length === 0) {
      return '📋 No phases defined yet.';
    }

    const parts: string[] = [];
    parts.push('📋 **Implementation Phases**\n');
    parts.push('Here\'s how we\'ll break down the work:\n');

    phases.forEach((phase, index) => {
      parts.push(`## Phase ${index + 1}: ${phase.name}`);
      
      if (phase.duration) {
        parts.push(`⏱️ **Duration:** ${phase.duration}`);
      }

      if (phase.objectives && phase.objectives.length > 0) {
        parts.push('**What we\'ll accomplish:**');
        phase.objectives.forEach(objective => {
          parts.push(`• ${objective}`);
        });
      }

      if (phase.milestones && phase.milestones.length > 0) {
        parts.push('**Key milestones:**');
        phase.milestones.forEach(milestone => {
          parts.push(`🎯 ${milestone.title}`);
          if (milestone.due) {
            parts.push(`   Due: ${milestone.due}`);
          }
        });
      }

      parts.push(''); // Add spacing between phases
    });

    return parts.join('\n');
  }

  /**
   * Transform tasks into conversational format
   */
  static transformTasks(tasks: ImplementationPlan['tasks']): string {
    if (!tasks || tasks.length === 0) {
      return '📝 No specific tasks defined yet.';
    }

    const parts: string[] = [];
    parts.push('📝 **Action Items**\n');
    parts.push('Here are the specific tasks to complete:\n');

    // Group tasks by phase
    const tasksByPhase = tasks.reduce((acc, task) => {
      const phaseId = task.phaseId || 'unassigned';
      if (!acc[phaseId]) {
        acc[phaseId] = [];
      }
      acc[phaseId].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    Object.entries(tasksByPhase).forEach(([phaseId, phaseTasks]) => {
      if (phaseId !== 'unassigned') {
        parts.push(`### ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} Tasks:`);
      }

      phaseTasks.forEach((task, index) => {
        parts.push(`${index + 1}. **${task.title}**`);
        
        if (task.description) {
          parts.push(`   ${task.description}`);
        }
        
        if (task.effort) {
          parts.push(`   ⏱️ Effort: ${task.effort}`);
        }
        
        if (task.owner) {
          parts.push(`   👤 Owner: ${task.owner}`);
        }
        
        if (task.dependencies && task.dependencies.length > 0) {
          parts.push(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
        }
        
        parts.push(''); // Add spacing between tasks
      });
    });

    return parts.join('\n');
  }

  /**
   * Transform timeline into conversational format
   */
  static transformTimeline(timeline: ImplementationPlan['timeline']): string {
    if (!timeline) {
      return '📅 No timeline specified.';
    }

    const parts: string[] = [];
    parts.push('📅 **Project Timeline**\n');

    if (timeline.start && timeline.end) {
      parts.push(`🚀 **Start Date:** ${timeline.start}`);
      parts.push(`🏁 **End Date:** ${timeline.end}`);
      parts.push('');
    }

    if (timeline.milestones && timeline.milestones.length > 0) {
      parts.push('**Key Milestones:**');
      timeline.milestones.forEach(milestone => {
        parts.push(`🎯 ${milestone.title}${milestone.due ? ` (${milestone.due})` : ''}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Transform resources into conversational format
   */
  static transformResources(resources: ImplementationPlan['resources']): string {
    if (!resources) {
      return '👥 No resource requirements specified.';
    }

    const parts: string[] = [];
    parts.push('👥 **Resource Requirements**\n');

    if (resources.team && resources.team.length > 0) {
      parts.push('**Team Members Needed:**');
      resources.team.forEach(member => {
        parts.push(`• ${member.role}${member.count ? ` (${member.count})` : ''}`);
        if (member.skills && member.skills.length > 0) {
          parts.push(`  Skills: ${member.skills.join(', ')}`);
        }
        if (member.tools && member.tools.length > 0) {
          parts.push(`  Tools: ${member.tools.join(', ')}`);
        }
      });
      parts.push('');
    }

    if (resources.vendors && resources.vendors.length > 0) {
      parts.push('**External Vendors/Services:**');
      resources.vendors.forEach(vendor => {
        parts.push(`• ${vendor}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Transform budget into conversational format
   */
  static transformBudget(budget: ImplementationPlan['budget']): string {
    if (!budget) {
      return '💰 No budget information provided.';
    }

    const parts: string[] = [];
    parts.push('💰 **Budget Breakdown**\n');

    if (budget.total) {
      parts.push(`**Total Estimated Cost:** ${budget.total}`);
      parts.push('');
    }

    if (budget.items && budget.items.length > 0) {
      parts.push('**Cost Breakdown:**');
      budget.items.forEach(item => {
        parts.push(`• ${item.label}: ${item.cost}`);
        if (item.notes) {
          parts.push(`  Note: ${item.notes}`);
        }
      });
      parts.push('');
    }

    if (budget.assumptions && budget.assumptions.length > 0) {
      parts.push('**Budget Assumptions:**');
      budget.assumptions.forEach(assumption => {
        parts.push(`💭 ${assumption}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Transform risks into conversational format
   */
  static transformRisks(risks: ImplementationPlan['risks']): string {
    if (!risks || risks.length === 0) {
      return '⚠️ No specific risks identified.';
    }

    const parts: string[] = [];
    parts.push('⚠️ **Risk Assessment**\n');
    parts.push('Here are the potential risks and how we\'ll handle them:\n');

    risks.forEach((risk, index) => {
      parts.push(`${index + 1}. **${risk.item}**`);
      parts.push(`   📊 Likelihood: ${risk.likelihood} | Impact: ${risk.impact}`);
      
      if (risk.mitigation) {
        parts.push(`   🛡️ Mitigation: ${risk.mitigation}`);
      }
      
      parts.push(''); // Add spacing between risks
    });

    return parts.join('\n');
  }

  /**
   * Transform KPIs into conversational format
   */
  static transformKPIs(kpis: ImplementationPlan['kpis']): string {
    if (!kpis || kpis.length === 0) {
      return '📊 No KPIs defined.';
    }

    const parts: string[] = [];
    parts.push('📊 **Key Performance Indicators**\n');
    parts.push('We\'ll track success using these metrics:\n');

    kpis.forEach((kpi, index) => {
      parts.push(`${index + 1}. **${kpi.metric}**`);
      parts.push(`   🎯 Target: ${kpi.target}`);
      
      if (kpi.cadence) {
        parts.push(`   📅 Review: ${kpi.cadence}`);
      }
      
      parts.push(''); // Add spacing between KPIs
    });

    return parts.join('\n');
  }

  /**
   * Transform 90-day plan into conversational format
   */
  static transformNext90Days(next90Days: ImplementationPlan['next90Days']): string {
    if (!next90Days) {
      return '📅 No 90-day action plan provided.';
    }

    const parts: string[] = [];
    parts.push('📅 **Your Next 90 Days**\n');
    parts.push('Here\'s what to focus on in the immediate term:\n');

    if (next90Days.days30 && next90Days.days30.length > 0) {
      parts.push('## First 30 Days 🚀');
      next90Days.days30.forEach(item => {
        parts.push(`• ${item}`);
      });
      parts.push('');
    }

    if (next90Days.days60 && next90Days.days60.length > 0) {
      parts.push('## Days 31-60 📈');
      next90Days.days60.forEach(item => {
        parts.push(`• ${item}`);
      });
      parts.push('');
    }

    if (next90Days.days90 && next90Days.days90.length > 0) {
      parts.push('## Days 61-90 🎯');
      next90Days.days90.forEach(item => {
        parts.push(`• ${item}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Transform complete plan into conversational format
   */
  static transformCompletePlan(plan: ImplementationPlan): string {
    const sections: string[] = [];

    // Title and introduction
    sections.push(`# ${plan.meta.title}\n`);
    sections.push('🎉 **Your implementation plan is ready!** Here\'s everything you need to turn your business idea into reality.\n');

    // Overview
    sections.push(this.transformOverview(plan.overview));
    sections.push('---\n');

    // Phases
    sections.push(this.transformPhases(plan.phases));
    sections.push('---\n');

    // Next 90 days (prioritize this for immediate action)
    if (plan.next90Days) {
      sections.push(this.transformNext90Days(plan.next90Days));
      sections.push('---\n');
    }

    // Timeline
    if (plan.timeline) {
      sections.push(this.transformTimeline(plan.timeline));
      sections.push('---\n');
    }

    // Resources
    if (plan.resources) {
      sections.push(this.transformResources(plan.resources));
      sections.push('---\n');
    }

    // Budget
    if (plan.budget) {
      sections.push(this.transformBudget(plan.budget));
      sections.push('---\n');
    }

    // Risks
    if (plan.risks) {
      sections.push(this.transformRisks(plan.risks));
      sections.push('---\n');
    }

    // KPIs
    if (plan.kpis) {
      sections.push(this.transformKPIs(plan.kpis));
      sections.push('---\n');
    }

    // Tasks (detailed breakdown)
    sections.push(this.transformTasks(plan.tasks));

    // Closing message
    sections.push('\n🚀 **Ready to get started?** Your implementation plan is complete and ready to guide you through building your business!');

    return sections.join('\n');
  }
}