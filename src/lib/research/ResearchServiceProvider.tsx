"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ResearchDataService } from './service/research-data-service';
import { KnowledgeBase } from './types';
import knowledgeBaseData from './data/ai_employment_risks.json';

const ResearchServiceContext = createContext<ResearchDataService | null>(null);

export function ResearchServiceProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<ResearchDataService | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { initializeResearchService } = await import('./service');
        const serviceInstance = await initializeResearchService(knowledgeBaseData as KnowledgeBase);
        setService(serviceInstance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize research service');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Research service error: {error}</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-4">
        <p>Loading research data...</p>
      </div>
    );
  }

  return (
    <ResearchServiceContext.Provider value={service}>
      {children}
    </ResearchServiceContext.Provider>
  );
}

export function useResearchService(): ResearchDataService {
  const context = useContext(ResearchServiceContext);
  if (!context) {
    throw new Error('useResearchService must be used within ResearchServiceProvider');
  }
  return context;
}
