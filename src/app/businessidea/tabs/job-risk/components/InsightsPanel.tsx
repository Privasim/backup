"use client";

import React from 'react';
import { DataDrivenInsights } from '@/components/insights/DataDrivenInsights';
import { DataDrivenInsightsModel } from '@/components/insights/types';

export type InsightsPanelProps = {
  insights: DataDrivenInsightsModel;
  loading?: boolean;
  error?: string[];
  className?: string;
};

export default function InsightsPanel({ insights, loading = false, error, className }: InsightsPanelProps) {
  return (
    <div className={className}>
      <DataDrivenInsights 
        insights={insights}
        loading={loading}
        errors={error}
        slots={{
          headerRight: (
            <div className="text-sm text-gray-500">
              {loading ? 'Analyzing...' : 'Data-driven insights'}
            </div>
          )
        }}
      />
    </div>
  );
}

