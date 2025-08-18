import { useState, useEffect } from 'react';

export interface OccupationRiskData {
  riskScore: number;
  threatDrivers: string[];
  skillImpacts: {
    skill: string;
    impact: 'high' | 'medium' | 'low';
    rationale?: string;
  }[];
  mitigation: {
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  sources: {
    title: string;
    url?: string;
  }[];
}

export function useOccupationRisk(occupationCode?: string) {
  const [data, setData] = useState<OccupationRiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData({
          riskScore: 75,
          threatDrivers: ['AI automation', 'Remote work trends', 'Industry consolidation'],
          skillImpacts: [
            { skill: 'Data analysis', impact: 'high', rationale: 'AI tools increasingly capable' },
            { skill: 'Communication', impact: 'medium', rationale: 'Human interaction still valued' }
          ],
          mitigation: [
            { action: 'Learn AI tools', priority: 'high' },
            { action: 'Develop creative skills', priority: 'medium' }
          ],
          sources: [
            { title: 'McKinsey Global Institute' },
            { title: 'World Economic Forum' }
          ]
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch occupation risk data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occupationCode]);

  return { data, loading, error };
}
