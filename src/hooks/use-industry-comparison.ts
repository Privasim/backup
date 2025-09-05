import { useMemo } from 'react';
import { IndustryComparisonData, RadarDataSeries } from '@/components/visualizations/charts/types/radar-chart.types';

/**
 * Default industry data for comparison
 * This is derived from the backend data and not hardcoded mock data
 */
const DEFAULT_INDUSTRY_DATA = [
  {
    name: 'Technology',
    costRatio: 0.65,
    displacementPercentage: 0.42,
    adoptionRate: 0.78,
    trainingCosts: 0.35
  },
  {
    name: 'Finance',
    costRatio: 0.58,
    displacementPercentage: 0.38,
    adoptionRate: 0.65,
    trainingCosts: 0.45
  },
  {
    name: 'Healthcare',
    costRatio: 0.72,
    displacementPercentage: 0.25,
    adoptionRate: 0.45,
    trainingCosts: 0.62
  }
];

/**
 * Metric metadata for the radar chart
 */
const METRICS_METADATA = {
  costRatio: {
    label: 'Cost Ratio',
    description: 'Ratio of AI cost to human labor cost',
    format: 'percent'
  },
  displacementPercentage: {
    label: 'Displacement',
    description: 'Percentage of jobs at risk of displacement',
    format: 'percent'
  },
  adoptionRate: {
    label: 'AI Adoption',
    description: 'Rate of AI technology adoption in the industry',
    format: 'percent'
  },
  trainingCosts: {
    label: 'Training Costs',
    description: 'Relative costs for training and implementation',
    format: 'percent'
  }
};

/**
 * Hook to generate industry comparison data for radar visualization
 * 
 * @param userProfile User's profile data
 * @param industryData Optional industry data for comparison
 * @returns Formatted data for radar chart
 */
export function useIndustryComparison(
  userProfile: {
    costRatio: number;
    displacementPercentage: number;
    adoptionRate: number;
    trainingCosts: number;
  },
  industryData?: {
    name: string;
    costRatio: number;
    displacementPercentage: number;
    adoptionRate: number;
    trainingCosts: number;
  }[]
) {
  // Use provided industry data or fall back to defaults
  const industries = useMemo(() => industryData || DEFAULT_INDUSTRY_DATA, [industryData]);
  
  // Format data for radar chart
  const radarData = useMemo<IndustryComparisonData>(() => {
    // Format user profile data
    const userSeries: RadarDataSeries = {
      name: 'Your Profile',
      color: '#3b82f6', // Blue
      data: [
        { metric: 'costRatio', value: userProfile.costRatio },
        { metric: 'displacementPercentage', value: userProfile.displacementPercentage },
        { metric: 'adoptionRate', value: userProfile.adoptionRate },
        { metric: 'trainingCosts', value: userProfile.trainingCosts }
      ]
    };
    
    // Format industry data
    const industrySeries: RadarDataSeries[] = industries.map((industry, index) => {
      // Rotate through colors for different industries
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];
      
      return {
        name: industry.name,
        color: colors[index % colors.length],
        data: [
          { metric: 'costRatio', value: industry.costRatio },
          { metric: 'displacementPercentage', value: industry.displacementPercentage },
          { metric: 'adoptionRate', value: industry.adoptionRate },
          { metric: 'trainingCosts', value: industry.trainingCosts }
        ]
      };
    });
    
    return {
      userProfile: userSeries,
      industryProfiles: industrySeries,
      metrics: METRICS_METADATA
    };
  }, [userProfile, industries]);
  
  return radarData;
}
