import { useMemo } from 'react';
import { CostProjectionDataPoint, CostProjectionMilestone, CostProjectionConfig } from '@/components/visualizations/charts/types/cost-projection.types';

const DEFAULT_CONFIG: CostProjectionConfig = {
  years: 5,
  humanCostGrowthRate: 0.03, // 3% annual growth for human costs
  aiCostGrowthRate: 0.01, // 1% annual growth for AI costs (technology tends to get cheaper)
  roiThreshold: 0.2, // 20% ROI threshold
  showAnnotations: true,
  showCumulativeSavings: true
};

/**
 * Hook to generate cost projection data for visualization
 * 
 * @param humanHourlyCost Base human hourly cost
 * @param aiHourlyCost Base AI hourly cost
 * @param hoursPerWeek Hours worked per week
 * @param weeksPerYear Weeks worked per year
 * @param configOverrides Optional configuration overrides
 * @returns Cost projection data and milestones
 */
export function useCostProjection(
  humanHourlyCost: number,
  aiHourlyCost: number,
  hoursPerWeek: number,
  weeksPerYear: number,
  configOverrides?: Partial<CostProjectionConfig>
) {
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...configOverrides
  }), [configOverrides]);

  // Generate projection data points
  const projectionData = useMemo(() => {
    const data: CostProjectionDataPoint[] = [];
    let cumulativeSavings = 0;
    
    // Calculate annual hours
    const annualHours = hoursPerWeek * weeksPerYear;
    
    // Calculate initial annual costs
    const initialHumanCost = humanHourlyCost * annualHours;
    const initialAiCost = aiHourlyCost * annualHours;
    
    // Generate data for each year
    for (let year = 0; year < config.years; year++) {
      // Calculate costs with growth rates
      const humanCostMultiplier = Math.pow(1 + config.humanCostGrowthRate, year);
      const aiCostMultiplier = Math.pow(1 + config.aiCostGrowthRate, year);
      
      const yearHumanCost = initialHumanCost * humanCostMultiplier;
      const yearAiCost = initialAiCost * aiCostMultiplier;
      
      // Calculate yearly savings and update cumulative
      const yearlySavings = yearHumanCost - yearAiCost;
      cumulativeSavings += yearlySavings;
      
      data.push({
        period: `Year ${year + 1}`,
        humanCost: Math.round(yearHumanCost),
        aiCost: Math.round(yearAiCost),
        cumulativeSavings: Math.round(cumulativeSavings)
      });
    }
    
    return data;
  }, [humanHourlyCost, aiHourlyCost, hoursPerWeek, weeksPerYear, config]);

  // Calculate milestones (break-even point, ROI threshold)
  const milestones = useMemo(() => {
    const result: CostProjectionMilestone[] = [];
    
    // Find break-even point (when cumulative savings becomes positive)
    let breakEvenFound = false;
    let previousSavings = 0;
    
    projectionData.forEach((point, index) => {
      // Break-even detection (when cumulative savings crosses from negative to positive)
      if (!breakEvenFound && point.cumulativeSavings >= 0 && (index === 0 || projectionData[index - 1].cumulativeSavings < 0)) {
        breakEvenFound = true;
        
        // If it's not the first period, interpolate for more accuracy
        let breakEvenPeriod = point.period;
        if (index > 0) {
          const prev = projectionData[index - 1];
          const totalChange = point.cumulativeSavings - prev.cumulativeSavings;
          const portionToZero = (0 - prev.cumulativeSavings) / totalChange;
          const yearFraction = index - 1 + portionToZero;
          breakEvenPeriod = `Year ${yearFraction.toFixed(1)}`;
        }
        
        result.push({
          period: breakEvenPeriod,
          type: 'break-even',
          label: 'Break-even',
          value: 0
        });
      }
      
      // ROI threshold detection
      const initialInvestment = projectionData[0].aiCost;
      const roi = point.cumulativeSavings / initialInvestment;
      
      if (roi >= config.roiThreshold && (index === 0 || projectionData[index - 1].cumulativeSavings / initialInvestment < config.roiThreshold)) {
        result.push({
          period: point.period,
          type: 'roi-threshold',
          label: `${(config.roiThreshold * 100).toFixed(0)}% ROI`,
          value: roi
        });
      }
      
      previousSavings = point.cumulativeSavings;
    });
    
    return result;
  }, [projectionData, config.roiThreshold]);

  return {
    data: projectionData,
    milestones,
    config
  };
}
