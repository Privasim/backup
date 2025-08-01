import { getResearchService, OccupationRisk } from './index';
import { OccupationData } from '../types';

export interface AssessmentIntegration {
  getUserOccupationRisk(userResponses: any): Promise<OccupationRisk | null>;
  compareWithBenchmark(userRisk: number, occupation: string): Promise<ComparisonResult>;
  getRecommendations(occupationRisk: OccupationRisk): Promise<string[]>;
  generateRiskReport(userResponses: any): Promise<RiskReport>;
}

export interface ComparisonResult {
  userRisk: number;
  benchmarkRisk: number;
  percentileDifference: number;
  riskCategory: 'lower' | 'similar' | 'higher';
  message: string;
}

export interface RiskReport {
  occupation: OccupationData;
  riskAssessment: OccupationRisk;
  comparison: ComparisonResult;
  recommendations: string[];
  similarOccupations: OccupationData[];
  actionItems: ActionItem[];
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  category: 'skill_development' | 'career_planning' | 'adaptation' | 'monitoring';
  title: string;
  description: string;
  timeframe: string;
}

export class ResearchAssessmentIntegration implements AssessmentIntegration {
  async getUserOccupationRisk(userResponses: any): Promise<OccupationRisk | null> {
    try {
      // Extract occupation from user responses
      const occupation = this.extractOccupationFromResponses(userResponses);
      if (!occupation) {
        return null;
      }

      const service = getResearchService();
      return await service.getOccupationRiskWithFallback(occupation);
    } catch (error) {
      console.error('Failed to get user occupation risk:', error);
      return null;
    }
  }

  async compareWithBenchmark(userRisk: number, occupation: string): Promise<ComparisonResult> {
    try {
      const service = getResearchService();
      const occupationRisk = await service.getOccupationRiskWithFallback(occupation);

      if (!occupationRisk) {
        throw new Error(`Occupation not found: ${occupation}`);
      }

      const benchmarkRisk = occupationRisk.occupation.riskScore;
      const percentileDifference = userRisk - benchmarkRisk;

      let riskCategory: 'lower' | 'similar' | 'higher';
      let message: string;

      if (Math.abs(percentileDifference) <= 0.1) {
        riskCategory = 'similar';
        message = `Your risk level is similar to the benchmark for ${occupation} (${(benchmarkRisk * 100).toFixed(1)}%)`;
      } else if (percentileDifference < 0) {
        riskCategory = 'lower';
        message = `Your risk level is ${Math.abs(percentileDifference * 100).toFixed(1)}% lower than the benchmark for ${occupation}`;
      } else {
        riskCategory = 'higher';
        message = `Your risk level is ${(percentileDifference * 100).toFixed(1)}% higher than the benchmark for ${occupation}`;
      }

      return {
        userRisk,
        benchmarkRisk,
        percentileDifference,
        riskCategory,
        message,
      };
    } catch (error) {
      console.error('Failed to compare with benchmark:', error);
      throw error;
    }
  }

  async getRecommendations(occupationRisk: OccupationRisk): Promise<string[]> {
    const recommendations: string[] = [];
    const { occupation, riskLevel } = occupationRisk;

    // Base recommendations by risk level
    switch (riskLevel) {
      case 'very_high':
        recommendations.push(
          'Consider developing skills that complement AI rather than compete with it',
          'Focus on uniquely human capabilities like emotional intelligence and creative problem-solving',
          'Explore adjacent roles that have lower AI exposure',
          'Stay updated on AI developments in your field to anticipate changes'
        );
        break;

      case 'high':
        recommendations.push(
          'Develop hybrid skills that combine your expertise with AI tools',
          'Focus on strategic and supervisory aspects of your role',
          'Build skills in AI collaboration and tool management',
          'Consider specializing in areas where human judgment is critical'
        );
        break;

      case 'medium':
        recommendations.push(
          'Learn to work effectively with AI tools in your field',
          'Develop skills in areas that are harder to automate',
          'Stay informed about AI developments affecting your industry',
          'Focus on building interpersonal and leadership skills'
        );
        break;

      case 'low':
        recommendations.push(
          'Continue developing your core professional skills',
          'Consider how AI tools might enhance your productivity',
          'Stay aware of industry trends and technological developments',
          'Focus on career advancement and specialization'
        );
        break;
    }

    // Occupation-specific recommendations
    const occupationSpecific = this.getOccupationSpecificRecommendations(occupation);
    recommendations.push(...occupationSpecific);

    return recommendations;
  }

  async generateRiskReport(userResponses: any): Promise<RiskReport> {
    const occupationRisk = await this.getUserOccupationRisk(userResponses);
    if (!occupationRisk) {
      throw new Error('Unable to generate risk report: occupation not found');
    }

    const userRisk = this.calculateUserRiskFromResponses(userResponses);
    const comparison = await this.compareWithBenchmark(userRisk, occupationRisk.occupation.name);
    const recommendations = await this.getRecommendations(occupationRisk);
    const actionItems = this.generateActionItems(occupationRisk, comparison);

    return {
      occupation: occupationRisk.occupation,
      riskAssessment: occupationRisk,
      comparison,
      recommendations,
      similarOccupations: occupationRisk.similarOccupations,
      actionItems,
    };
  }

  private extractOccupationFromResponses(userResponses: any): string | null {
    // Extract occupation from user responses
    // This would depend on the structure of your quiz responses
    if (userResponses.occupation) {
      return userResponses.occupation;
    }

    if (userResponses.jobTitle) {
      return userResponses.jobTitle;
    }

    // Try to infer from skills or industry
    if (userResponses.skills && Array.isArray(userResponses.skills)) {
      return this.inferOccupationFromSkills(userResponses.skills);
    }

    return null;
  }

  private inferOccupationFromSkills(skills: string[]): string | null {
    // Simple skill-to-occupation mapping
    const skillMappings: Record<string, string> = {
      'programming': 'Software Developers',
      'coding': 'Software Developers',
      'javascript': 'Web Developers',
      'python': 'Data Scientists',
      'data analysis': 'Data Scientists',
      'writing': 'Technical Writers',
      'design': 'Graphic Designers',
      'finance': 'Financial Analysts',
      'accounting': 'Accountants and Auditors',
      'legal': 'Lawyers',
      'marketing': 'Market Research Analysts',
    };

    for (const skill of skills) {
      const normalizedSkill = skill.toLowerCase();
      for (const [key, occupation] of Object.entries(skillMappings)) {
        if (normalizedSkill.includes(key)) {
          return occupation;
        }
      }
    }

    return null;
  }

  private calculateUserRiskFromResponses(userResponses: any): number {
    // Calculate user-specific risk based on their responses
    // This is a simplified calculation - you'd implement based on your quiz logic
    
    let riskScore = 0.5; // Base risk
    
    // Adjust based on AI tool usage
    if (userResponses.aiToolUsage === 'frequent') {
      riskScore += 0.2;
    } else if (userResponses.aiToolUsage === 'never') {
      riskScore -= 0.1;
    }

    // Adjust based on task types
    if (userResponses.taskTypes && Array.isArray(userResponses.taskTypes)) {
      const automationProneTasks = ['data entry', 'report generation', 'content creation'];
      const matches = userResponses.taskTypes.filter((task: string) =>
        automationProneTasks.some(prone => task.toLowerCase().includes(prone))
      );
      riskScore += matches.length * 0.1;
    }

    // Adjust based on adaptability
    if (userResponses.adaptability === 'high') {
      riskScore -= 0.15;
    } else if (userResponses.adaptability === 'low') {
      riskScore += 0.15;
    }

    return Math.max(0, Math.min(1, riskScore));
  }

  private getOccupationSpecificRecommendations(occupation: OccupationData): string[] {
    const recommendations: string[] = [];

    // Get recommendations based on key tasks
    const keyTasks = occupation.keyTasks.join(' ').toLowerCase();

    if (keyTasks.includes('programming') || keyTasks.includes('coding')) {
      recommendations.push(
        'Focus on system architecture and complex problem-solving',
        'Develop expertise in AI/ML integration and prompt engineering',
        'Specialize in areas requiring deep domain knowledge'
      );
    }

    if (keyTasks.includes('analysis') || keyTasks.includes('data')) {
      recommendations.push(
        'Develop skills in AI model interpretation and validation',
        'Focus on strategic analysis and business insight generation',
        'Build expertise in data governance and ethics'
      );
    }

    if (keyTasks.includes('writing') || keyTasks.includes('content')) {
      recommendations.push(
        'Specialize in strategic communication and storytelling',
        'Develop expertise in content strategy and audience analysis',
        'Focus on editing and quality assurance of AI-generated content'
      );
    }

    if (keyTasks.includes('design') || keyTasks.includes('creative')) {
      recommendations.push(
        'Focus on creative strategy and concept development',
        'Develop skills in user experience and human-centered design',
        'Specialize in brand strategy and visual communication'
      );
    }

    return recommendations;
  }

  private generateActionItems(occupationRisk: OccupationRisk, comparison: ComparisonResult): ActionItem[] {
    const actionItems: ActionItem[] = [];
    const { riskLevel } = occupationRisk;

    // High priority items based on risk level
    if (riskLevel === 'very_high' || riskLevel === 'high') {
      actionItems.push({
        priority: 'high',
        category: 'skill_development',
        title: 'Develop AI Collaboration Skills',
        description: 'Learn to work effectively with AI tools and understand their capabilities and limitations',
        timeframe: '3-6 months',
      });

      actionItems.push({
        priority: 'high',
        category: 'career_planning',
        title: 'Explore Adjacent Roles',
        description: 'Research career paths that leverage your existing skills but have lower AI exposure',
        timeframe: '1-3 months',
      });
    }

    // Medium priority items
    actionItems.push({
      priority: 'medium',
      category: 'adaptation',
      title: 'Stay Informed on Industry Trends',
      description: 'Regularly follow AI developments and their impact on your industry',
      timeframe: 'Ongoing',
    });

    actionItems.push({
      priority: 'medium',
      category: 'skill_development',
      title: 'Enhance Uniquely Human Skills',
      description: 'Focus on developing emotional intelligence, creativity, and complex problem-solving abilities',
      timeframe: '6-12 months',
    });

    // Low priority monitoring items
    actionItems.push({
      priority: 'low',
      category: 'monitoring',
      title: 'Regular Risk Assessment',
      description: 'Reassess your AI exposure risk quarterly as technology and your role evolve',
      timeframe: 'Quarterly',
    });

    return actionItems;
  }
}

// Export singleton instance
export const assessmentIntegration = new ResearchAssessmentIntegration();

// Utility functions for easy integration
export async function integrateWithAssessment(userResponses: any) {
  return assessmentIntegration.generateRiskReport(userResponses);
}

export async function getOccupationComparison(userRisk: number, occupation: string) {
  return assessmentIntegration.compareWithBenchmark(userRisk, occupation);
}