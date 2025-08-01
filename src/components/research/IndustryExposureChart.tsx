'use client';

import React, { useEffect, useState } from 'react';
import { useIndustryData } from '@/hooks/useResearchData';

// Simple fallback chart component to replace Chart.js dependency
const Bar = ({ data, options }: { data: any; options: any }) => (
  <div className="bg-gray-100 rounded-lg p-4 h-full">
    <div className="text-center mb-4">
      <h3 className="text-lg font-semibold">{options?.plugins?.title?.text || 'Industry Exposure Chart'}</h3>
    </div>
    <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
      {data?.datasets?.[0]?.data?.map((value: number, index: number) => (
        <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
          <span className="text-sm truncate flex-1">{data.labels?.[index]}</span>
          <div className="flex items-center ml-2">
            <div 
              className="h-4 bg-blue-500 rounded mr-2"
              style={{ width: `${Math.max(value * 2, 10)}px` }}
            ></div>
            <span className="text-sm font-medium w-12 text-right">{value.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export interface IndustryExposureChartProps {
  className?: string;
  height?: number;
  limit?: number;
  showEmployment?: boolean;
}

export function IndustryExposureChart({
  className = '',
  height = 400,
  limit = 15,
  showEmployment = false,
}: IndustryExposureChartProps) {
  const { industries, isLoading, error } = useIndustryData();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (industries.length > 0) {
      const sortedIndustries = [...industries]
        .sort((a, b) => b.exposureScore - a.exposureScore)
        .slice(0, limit);

      const data = {
        labels: sortedIndustries.map(industry => {
          // Truncate long industry names
          const name = industry.industry;
          return name.length > 25 ? name.substring(0, 25) + '...' : name;
        }),
        datasets: [
          {
            label: 'AI Exposure Score',
            data: sortedIndustries.map(industry => industry.exposureScore * 100),
            backgroundColor: sortedIndustries.map(industry => {
              const score = industry.exposureScore;
              if (score >= 0.7) return '#e74c3c'; // High exposure - Red
              if (score >= 0.5) return '#f39c12'; // Medium exposure - Orange
              if (score >= 0.3) return '#f1c40f'; // Low-medium exposure - Yellow
              return '#27ae60'; // Low exposure - Green
            }),
            borderColor: sortedIndustries.map(industry => {
              const score = industry.exposureScore;
              if (score >= 0.7) return '#c0392b';
              if (score >= 0.5) return '#d68910';
              if (score >= 0.3) return '#d4ac0d';
              return '#229954';
            }),
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      };

      if (showEmployment) {
        data.datasets.push({
          label: 'Employment (millions)',
          data: sortedIndustries.map(industry => parseFloat(industry.employment)),
          backgroundColor: 'rgba(52, 152, 219, 0.6)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y1',
        } as any);
      }

      setChartData(data);
    }
  }, [industries, limit, showEmployment]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No industry data available</p>
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Industry-Level AI Exposure',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            
            if (datasetLabel === 'AI Exposure Score') {
              return `${datasetLabel}: ${value.toFixed(1)}%`;
            } else {
              return `${datasetLabel}: ${value.toFixed(1)}M`;
            }
          },
          afterLabel: (context: any) => {
            if (context.datasetIndex === 0) {
              const industry = industries.find(ind => 
                ind.industry.startsWith(context.label.replace('...', ''))
              );
              if (industry) {
                return [
                  `NAICS Code: ${industry.naicsCode}`,
                  `Employment: ${industry.employment}M`,
                  `Share: ${industry.share}`,
                ];
              }
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Industry',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'AI Exposure Score (%)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
      ...(showEmployment && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Employment (millions)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      }),
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>High Exposure (≥70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span>Medium Exposure (50-69%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span>Low-Medium Exposure (30-49%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Low Exposure (&lt;30%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndustryExposureChart;