'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { OccupationRisk } from '@/lib/research/service';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface RiskComparisonData {
  userRisk: number;
  benchmarkRisk: number;
  occupation: string;
  percentile: number;
}

export interface RiskComparisonChartProps {
  data: RiskComparisonData;
  className?: string;
  height?: number;
  showPercentile?: boolean;
  animated?: boolean;
}

export function RiskComparisonChart({
  data,
  className = '',
  height = 300,
  showPercentile = true,
  animated = true,
}: RiskComparisonChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  const getRiskColor = (risk: number): string => {
    if (risk >= 0.8) return '#e74c3c'; // Very High - Red
    if (risk >= 0.6) return '#f39c12'; // High - Orange
    if (risk >= 0.4) return '#f1c40f'; // Medium - Yellow
    return '#27ae60'; // Low - Green
  };

  const getRiskLabel = (risk: number): string => {
    if (risk >= 0.8) return 'Very High';
    if (risk >= 0.6) return 'High';
    if (risk >= 0.4) return 'Medium';
    return 'Low';
  };

  const chartData = {
    labels: ['Your Risk', 'Benchmark Risk'],
    datasets: [
      {
        label: 'AI Exposure Risk',
        data: [data.userRisk * 100, data.benchmarkRisk * 100],
        backgroundColor: [
          getRiskColor(data.userRisk),
          getRiskColor(data.benchmarkRisk),
        ],
        borderColor: [
          getRiskColor(data.userRisk),
          getRiskColor(data.benchmarkRisk),
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animated ? 1500 : 0,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `AI Exposure Risk: ${data.occupation}`,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const risk = value / 100;
            const label = getRiskLabel(risk);
            return `${context.label}: ${value.toFixed(1)}% (${label})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: 'Risk Level (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Comparison',
        },
      },
    },
  };

  const difference = Math.abs(data.userRisk - data.benchmarkRisk) * 100;
  const isHigher = data.userRisk > data.benchmarkRisk;
  const comparisonText = difference < 5 
    ? 'Your risk is similar to the benchmark'
    : `Your risk is ${difference.toFixed(1)}% ${isHigher ? 'higher' : 'lower'} than the benchmark`;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div 
        ref={chartRef}
        className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: `${height}px` }}
      >
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Your Risk Level:</span>
          <span className={`font-semibold px-2 py-1 rounded text-white`} 
                style={{ backgroundColor: getRiskColor(data.userRisk) }}>
            {getRiskLabel(data.userRisk)} ({(data.userRisk * 100).toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Benchmark Risk:</span>
          <span className={`font-semibold px-2 py-1 rounded text-white`}
                style={{ backgroundColor: getRiskColor(data.benchmarkRisk) }}>
            {getRiskLabel(data.benchmarkRisk)} ({(data.benchmarkRisk * 100).toFixed(1)}%)
          </span>
        </div>

        {showPercentile && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Your Percentile:</span>
            <span className="font-semibold text-blue-600">
              {data.percentile}th percentile
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-700 font-medium">
            {comparisonText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskComparisonChart;