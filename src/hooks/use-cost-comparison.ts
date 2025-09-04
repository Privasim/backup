import { useState, useEffect } from 'react';

export interface CostComparisonConfig {
  humanHourlyCost: number;
  aiHourlyCost: number;
  hoursPerWeek: number;
  weeksPerYear: number;
}

export interface CostComparisonData {
  humanCost: number;
  aiCost: number;
  savings: number;
  savingsPercentage: number;
}

/**
 * Hook to calculate cost comparison between human and AI labor
 */
export function useCostComparison(config: CostComparisonConfig) {
  const [data, setData] = useState<CostComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Calculate annual costs
      const annualHours = config.hoursPerWeek * config.weeksPerYear;
      const humanCost = config.humanHourlyCost * annualHours;
      const aiCost = config.aiHourlyCost * annualHours;
      
      // Calculate savings
      const savings = humanCost - aiCost;
      const savingsPercentage = Math.round((savings / humanCost) * 100);

      // Set the calculated data
      setData({
        humanCost,
        aiCost,
        savings,
        savingsPercentage
      });
    } catch (err) {
      setError('Failed to calculate cost comparison');
      console.error('Cost comparison calculation error:', err);
    } finally {
      setLoading(false);
    }
  }, [config.humanHourlyCost, config.aiHourlyCost, config.hoursPerWeek, config.weeksPerYear]);

  return { data, loading, error };
}
