import { GoToMarketStrategies } from '../types';

export const exportToJSON = (strategies: GoToMarketStrategies): void => {
  const content = JSON.stringify(strategies, null, 2);
  const filename = `go-to-market-${strategies.businessContext.businessIdea.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  downloadFile(content, filename, 'application/json');
};

export const exportToMarkdown = (strategies: GoToMarketStrategies): void => {
  const content = generateMarkdownContent(strategies);
  const filename = `go-to-market-${strategies.businessContext.businessIdea.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`;
  downloadFile(content, filename, 'text/markdown');
};

export const copyToClipboard = async (strategies: GoToMarketStrategies, format: 'json' | 'markdown' = 'json'): Promise<void> => {
  const content = format === 'json' 
    ? JSON.stringify(strategies, null, 2)
    : generateMarkdownContent(strategies);
  
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

export const importFromJSON = (jsonString: string): GoToMarketStrategies => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields
    if (!parsed.id || !parsed.businessContext || !parsed.marketingStrategies) {
      throw new Error('Invalid strategy format: missing required fields');
    }
    
    return parsed as GoToMarketStrategies;
  } catch (error) {
    throw new Error(`Failed to import strategies: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
};

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function generateMarkdownContent(strategies: GoToMarketStrategies): string {
  const { businessContext, marketingStrategies, salesChannels, pricingStrategies, distributionPlans, implementationTimeline, toolRecommendations } = strategies;
  
  let markdown = `# Go-to-Market Strategy: ${businessContext.businessIdea}\n\n`;
  markdown += `*Generated on ${new Date(strategies.generatedAt).toLocaleDateString()}*\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `**Business Idea:** ${businessContext.businessIdea}\n\n`;
  markdown += `**Target Market:** ${businessContext.targetMarket}\n\n`;
  markdown += `**Value Proposition:** ${businessContext.valueProposition}\n\n`;
  
  if (businessContext.goals.length > 0) {
    markdown += `**Key Goals:**\n`;
    businessContext.goals.forEach(goal => {
      markdown += `- ${goal}\n`;
    });
    markdown += `\n`;
  }
  
  // Marketing Strategies
  if (marketingStrategies.length > 0) {
    markdown += `## Marketing Strategies\n\n`;
    marketingStrategies.forEach((strategy, index) => {
      markdown += `### ${index + 1}. ${strategy.title}\n\n`;
      markdown += `**Type:** ${strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)}\n\n`;
      markdown += `**Description:** ${strategy.description}\n\n`;
      markdown += `**Timeline:** ${strategy.timeline}\n\n`;
      markdown += `**Budget:** ${strategy.budget.min} - ${strategy.budget.max} ${strategy.budget.currency}\n\n`;
      markdown += `**Expected ROI:** ${strategy.expectedROI}\n\n`;
      markdown += `**Difficulty:** ${strategy.difficulty.charAt(0).toUpperCase() + strategy.difficulty.slice(1)}\n\n`;
      
      if (strategy.tactics.length > 0) {
        markdown += `**Tactics:**\n`;
        strategy.tactics.forEach(tactic => {
          markdown += `- **${tactic.name}** (${tactic.timeframe}, ${tactic.estimatedCost}): ${tactic.description}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Sales Channels
  if (salesChannels.length > 0) {
    markdown += `## Sales Channels\n\n`;
    salesChannels.forEach((channel, index) => {
      markdown += `### ${index + 1}. ${channel.name}\n\n`;
      markdown += `**Type:** ${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}\n\n`;
      markdown += `**Description:** ${channel.description}\n\n`;
      markdown += `**Expected Reach:** ${channel.expectedReach}\n\n`;
      markdown += `**Suitability Score:** ${channel.suitabilityScore}/100\n\n`;
      
      markdown += `**Cost Structure:**\n`;
      markdown += `- Setup: ${channel.costStructure.setup}\n`;
      markdown += `- Monthly: ${channel.costStructure.monthly}\n`;
      if (channel.costStructure.commission) {
        markdown += `- Commission: ${channel.costStructure.commission}\n`;
      }
      markdown += `\n`;
      
      if (channel.implementationSteps.length > 0) {
        markdown += `**Implementation Steps:**\n`;
        channel.implementationSteps.forEach((step, stepIndex) => {
          markdown += `${stepIndex + 1}. **${step.title}** (${step.estimatedTime}): ${step.description}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Pricing Strategies
  if (pricingStrategies.length > 0) {
    markdown += `## Pricing Strategies\n\n`;
    pricingStrategies.forEach((pricing, index) => {
      markdown += `### ${index + 1}. ${pricing.title}\n\n`;
      markdown += `**Model:** ${pricing.model.charAt(0).toUpperCase() + pricing.model.slice(1)}\n\n`;
      markdown += `**Description:** ${pricing.description}\n\n`;
      markdown += `**Market Fit Score:** ${pricing.marketFit}/100\n\n`;
      
      if (pricing.pricePoints.length > 0) {
        markdown += `**Price Points:**\n\n`;
        pricing.pricePoints.forEach(point => {
          markdown += `- **${point.tier}** - ${point.price}\n`;
          markdown += `  - Target: ${point.targetSegment}\n`;
          if (point.features.length > 0) {
            markdown += `  - Features: ${point.features.join(', ')}\n`;
          }
          markdown += `\n`;
        });
      }
      
      markdown += `**Competitive Analysis:** ${pricing.competitiveAnalysis}\n\n`;
      markdown += `---\n\n`;
    });
  }
  
  // Distribution Plans
  if (distributionPlans.length > 0) {
    markdown += `## Distribution Plans\n\n`;
    distributionPlans.forEach((plan, index) => {
      markdown += `### ${index + 1}. ${plan.channel}\n\n`;
      markdown += `**Strategy:** ${plan.strategy}\n\n`;
      markdown += `**Timeline:** ${plan.timeline}\n\n`;
      markdown += `**Expected Outcome:** ${plan.expectedOutcome}\n\n`;
      
      if (plan.resources.length > 0) {
        markdown += `**Required Resources:**\n`;
        plan.resources.forEach(resource => {
          markdown += `- ${resource}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Implementation Timeline
  if (implementationTimeline.length > 0) {
    markdown += `## Implementation Timeline\n\n`;
    implementationTimeline.forEach(phase => {
      markdown += `### ${phase.phase} (${phase.startDate} - ${phase.endDate})\n\n`;
      
      if (phase.activities.length > 0) {
        markdown += `**Activities:**\n`;
        phase.activities.forEach(activity => {
          markdown += `- ${activity}\n`;
        });
        markdown += `\n`;
      }
      
      if (phase.milestones.length > 0) {
        markdown += `**Milestones:**\n`;
        phase.milestones.forEach(milestone => {
          markdown += `- ${milestone}\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  // Tool Recommendations
  if (toolRecommendations.length > 0) {
    markdown += `## Recommended Tools\n\n`;
    toolRecommendations.forEach(tool => {
      markdown += `### ${tool.name}\n\n`;
      markdown += `**Category:** ${tool.category}\n\n`;
      markdown += `**Cost:** ${tool.costEstimate}\n\n`;
      markdown += `**Priority:** ${tool.implementationPriority.charAt(0).toUpperCase() + tool.implementationPriority.slice(1)}\n\n`;
      markdown += `**Complexity:** ${tool.integrationComplexity.charAt(0).toUpperCase() + tool.integrationComplexity.slice(1)}\n\n`;
      markdown += `**Relevance Score:** ${tool.relevanceScore}/100\n\n`;
      
      if (tool.recommendedFor.length > 0) {
        markdown += `**Recommended For:**\n`;
        tool.recommendedFor.forEach(use => {
          markdown += `- ${use}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  return markdown;
}