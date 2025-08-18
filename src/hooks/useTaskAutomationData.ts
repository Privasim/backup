import { useState, useEffect } from 'react';

export interface TaskAutomationData {
  automationExposure: {
    task: string;
    exposure: number;
  }[];
  sources: {
    title: string;
    url?: string;
  }[];
}

export function useTaskAutomationData(occupation?: string) {
  const [data, setData] = useState<TaskAutomationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setData({
          automationExposure: [
            { task: 'Data entry', exposure: 85 },
            { task: 'Report generation', exposure: 65 },
            { task: 'Email communication', exposure: 45 },
            { task: 'Scheduling', exposure: 70 },
            { task: 'Research', exposure: 55 }
          ],
          sources: [
            { title: 'MIT Task Automation Study' },
            { title: 'Oxford AI Impact Report' }
          ]
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch task automation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occupation]);

  return { data, loading, error };
}
