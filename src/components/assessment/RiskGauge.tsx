'use client';

import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function RiskGauge({ score, level, size = 'lg', animated = true }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, animated]);

  const getSize = () => {
    switch (size) {
      case 'sm': return { width: 120, height: 120, strokeWidth: 8 };
      case 'md': return { width: 160, height: 160, strokeWidth: 10 };
      case 'lg': return { width: 200, height: 200, strokeWidth: 12 };
    }
  };

  const getColor = () => {
    switch (level) {
      case 'Low': return '#10B981'; // green-500
      case 'Medium': return '#F59E0B'; // amber-500
      case 'High': return '#EF4444'; // red-500
    }
  };

  const { width, height, strokeWidth } = getSize();
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={animated ? 'transition-all duration-2000 ease-out' : ''}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold text-gray-900 ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl'}`}>
            {Math.round(animatedScore)}%
          </div>
          <div className={`font-medium ${size === 'lg' ? 'text-sm' : 'text-xs'}`} style={{ color: getColor() }}>
            {level} Risk
          </div>
        </div>
      </div>
      
      {/* Risk level indicator */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                (level === 'Low' && i === 1) ||
                (level === 'Medium' && i <= 2) ||
                (level === 'High' && i <= 3)
                  ? 'opacity-100'
                  : 'opacity-30'
              }`}
              style={{ backgroundColor: getColor() }}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${size === 'lg' ? 'text-sm' : 'text-xs'}`} style={{ color: getColor() }}>
          {level} Risk Level
        </span>
      </div>
    </div>
  );
}