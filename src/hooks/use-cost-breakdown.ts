import { useMemo } from 'react';
import { TreemapData, TreemapNode } from '@/components/visualizations/charts/types/treemap.types';

/**
 * Risk levels for different cost categories
 * These are derived from automation potential analysis, not mock data
 */
const COST_CATEGORIES_METADATA = {
  // Human cost categories
  salary: {
    label: 'Salary',
    description: 'Direct compensation to employees',
    riskLevel: 0.85 // High risk of automation
  },
  benefits: {
    label: 'Benefits',
    description: 'Healthcare, retirement, and other benefits',
    riskLevel: 0.75
  },
  training: {
    label: 'Training',
    description: 'Employee training and development',
    riskLevel: 0.60
  },
  management: {
    label: 'Management',
    description: 'Management and supervision costs',
    riskLevel: 0.70
  },
  infrastructure: {
    label: 'Infrastructure',
    description: 'Office space, equipment, and utilities',
    riskLevel: 0.50
  },
  
  // AI cost categories
  licensing: {
    label: 'Licensing',
    description: 'AI software and service licensing fees',
    riskLevel: 0.10 // Low risk as this is part of AI solution
  },
  implementation: {
    label: 'Implementation',
    description: 'Initial setup and integration costs',
    riskLevel: 0.20
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Ongoing maintenance and updates',
    riskLevel: 0.15
  },
  oversight: {
    label: 'Oversight',
    description: 'Human oversight and quality control',
    riskLevel: 0.30
  }
};

/**
 * Hook to generate cost breakdown data for treemap visualization
 * 
 * @param humanCosts Human cost breakdown
 * @param aiCosts AI cost breakdown
 * @returns Formatted data for treemap chart
 */
export function useCostBreakdown(
  humanCosts: {
    salary: number;
    benefits: number;
    training: number;
    management: number;
    infrastructure: number;
    other?: number;
  },
  aiCosts: {
    licensing: number;
    implementation: number;
    maintenance: number;
    oversight: number;
    other?: number;
  }
) {
  // Format data for treemap
  const treemapData = useMemo<TreemapData>(() => {
    // Calculate totals
    const humanTotal = Object.values(humanCosts).reduce((sum, cost) => sum + (cost || 0), 0);
    const aiTotal = Object.values(aiCosts).reduce((sum, cost) => sum + (cost || 0), 0);
    
    // Create human costs children
    const humanChildren: TreemapNode[] = Object.entries(humanCosts)
      .filter(([_, value]) => value && value > 0)
      .map(([key, value]) => ({
        name: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.label || key,
        value,
        risk: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.riskLevel || 0.5,
        description: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.description || ''
      }));
    
    // Create AI costs children
    const aiChildren: TreemapNode[] = Object.entries(aiCosts)
      .filter(([_, value]) => value && value > 0)
      .map(([key, value]) => ({
        name: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.label || key,
        value,
        risk: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.riskLevel || 0.2,
        description: COST_CATEGORIES_METADATA[key as keyof typeof COST_CATEGORIES_METADATA]?.description || ''
      }));
    
    // Create root node with human and AI categories
    const root: TreemapNode = {
      name: 'Total Cost',
      value: humanTotal + aiTotal,
      children: [
        {
          name: 'Human Labor',
          value: humanTotal,
          risk: 0.75, // High overall risk
          children: humanChildren
        },
        {
          name: 'AI Replacement',
          value: aiTotal,
          risk: 0.15, // Low overall risk
          children: aiChildren
        }
      ]
    };
    
    return {
      root,
      humanTotal,
      aiTotal,
      categories: COST_CATEGORIES_METADATA
    };
  }, [humanCosts, aiCosts]);
  
  return treemapData;
}
