import { useMemo } from 'react';
import { useImplementationPlanContext } from '@/features/implementation-plan/ImplementationPlanProvider';
import { ImplementationContext } from '../types';

export const useImplementationContext = () => {
  const planContext = useImplementationPlanContext();
  
  const context = useMemo<ImplementationContext | null>(() => {
    // Check if we have a plan with required data
    if (!planContext.plan || planContext.status !== 'success') {
      return null;
    }
    
    const plan = planContext.plan;
    
    // Validate minimum required context
    if (!plan.meta?.title || !plan.overview?.goals?.length) {
      return null;
    }
    
    return {
      title: plan.meta.title,
      overview: plan.overview.goals.join('\n'),
      phases: plan.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        objectives: phase.objectives,
        duration: phase.duration || 'Not specified'
      })),
      tasks: plan.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || 'No description provided'
      })),
      kpis: plan.kpis?.map(kpi => ({
        id: kpi.id || `kpi-${Date.now()}`,
        metric: kpi.metric,
        target: kpi.target
      }))
    };
  }, [planContext.plan, planContext.status]);
  
  const isValid = useMemo(() => {
    return context !== null && 
           context.title.length > 0 && 
           context.overview.length > 0 &&
           context.phases.length > 0;
  }, [context]);
  
  return {
    context,
    isValid,
    status: planContext.status,
    error: planContext.error
  };
};
