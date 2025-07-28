'use client';

import { useEffect, useState } from 'react';

interface Factor {
  name: string;
  value: number;
  icon: string;
  description: string;
}

interface FactorsChartProps {
  factors: {
    automation: number;
    aiReplacement: number;
    skillDemand: number;
    industryGrowth: number;
  };
  animated?: boolean;
}

export default function FactorsChart({ factors, animated = true }: FactorsChartProps) {
  const [animatedValues, setAnimatedValues] = useState({
    automation: 0,
    aiReplacement: 0,
    skillDemand: 0,
    industryGrowth: 0
  });

  const factorData: Factor[] = [
    {
      name: 'Automation Risk',
      value: factors.automation,
      icon: '🤖',
      description: 'Likelihood of tasks being automated'
    },
    {
      name: 'AI Replacement',
      value: factors.aiReplacement,
      icon: '🧠',
      description: 'Risk of AI replacing human judgment'
    },
    {
      name: 'Skill Demand',
      value: factors.skillDemand,
      icon: '📈',
      description: 'Market demand for your skills'
    },
    {
      name: 'Industry Growth',
      value: factors.industryGrowth,
      icon: '🏢',
      description: 'Overall industry expansion rate'
    }
  ];

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValues(factors);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValues(factors);
    }
  }, [factors, animated]);

  const getBarColor = (value: number, isPositive: boolean = false) => {
    if (isPositive) {
      // For positive metrics like skill demand and industry growth
      if (value >= 70) return 'bg-green-500';
      if (value >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      // For risk metrics like automation and AI replacement
      if (value >= 70) return 'bg-red-500';
      if (value >= 40) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  };

  const getTextColor = (value: number, isPositive: boolean = false) => {
    if (isPositive) {
      if (value >= 70) return 'text-green-700';
      if (value >= 40) return 'text-yellow-700';
      return 'text-red-700';
    } else {
      if (value >= 70) return 'text-red-700';
      if (value >= 40) return 'text-yellow-700';
      return 'text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      {factorData.map((factor, index) => {
        const isPositive = factor.name === 'Skill Demand' || factor.name === 'Industry Growth';
        const animatedValue = animatedValues[Object.keys(factors)[index] as keyof typeof factors];
        
        return (
          <div key={factor.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{factor.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                  <p className="text-xs text-gray-600">{factor.description}</p>
                </div>
              </div>
              <div className={`text-right ${getTextColor(factor.value, isPositive)}`}>
                <div className="text-2xl font-bold">{Math.round(animatedValue)}%</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1500 ease-out ${getBarColor(factor.value, isPositive)}`}
                  style={{ width: `${animatedValue}%` }}
                />
              </div>
              
              {/* Value labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">Understanding the Metrics</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Risk / Low Opportunity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium Risk / Moderate Opportunity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low Risk / High Opportunity</span>
          </div>
        </div>
      </div>
    </div>
  );
}