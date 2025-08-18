import { useState, useEffect } from 'react';
import { useResearchService } from '@/lib/research/ResearchServiceProvider';

interface OccupationRiskData {
  riskScore: number;
  threatDrivers: string[];
  skillImpacts: Array<{
    skill: string;
    impact: 'high' | 'medium' | 'low';
    rationale?: string;
  }>;
  mitigation: string[];
  sources: Array<{
    title: string;
    url?: string;
  }>;
}

export function useRealOccupationRisk(occupationCode?: string): {
  data: OccupationRiskData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<OccupationRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const researchService = useResearchService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const occupationData = await researchService.getOccupationRiskWithFallback(occupationCode || undefined);
        
        const riskScore = Math.max(0, Math.min(100, Math.round((occupationData?.riskScore || 0) * 100)));
        
        setData({
          riskScore,
          threatDrivers: occupationData?.threatDrivers || [],
          skillImpacts: (occupationData?.skillImpacts || []).map((impact: any) => ({
            skill: impact.skill || 'Unknown Skill',
            impact: (impact.impact || 'medium') as 'high' | 'medium' | 'low',
            rationale: impact.rationale
          })),
          mitigation: occupationData?.mitigation || [],
          sources: [
            {
              title: 'AI Employment Risks Knowledge Base',
              url: 'https://github.com/your-repo/ai-employment-risks'
            }
          ]
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load occupation risk data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [researchService, occupationCode]);

  return { data, loading, error };
}
