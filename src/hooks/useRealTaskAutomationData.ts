import { useState, useEffect } from 'react';
import { useResearchService } from '@/lib/research/ResearchServiceProvider';

interface TaskAutomationData {
  automationExposure: Array<{
    task: string;
    exposure: number;
  }>;
  sources: Array<{
    title: string;
    url?: string;
  }>;
}

export function useRealTaskAutomationData(occupation?: string): {
  data: TaskAutomationData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<TaskAutomationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const researchService = useResearchService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const taskData = await researchService.getTaskAutomationData();
        
        const automationExposure = taskData.map(item => ({
          task: item.description || item.taskCategory || 'Unknown Task',
          exposure: Math.max(0, Math.min(100, Math.round((item.automationPotential || 0) * 100)))
        }));

        setData({
          automationExposure,
          sources: [
            {
              title: 'AI Employment Risks Knowledge Base',
              url: 'https://github.com/your-repo/ai-employment-risks'
            }
          ]
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task automation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [researchService, occupation]);

  return { data, loading, error };
}
