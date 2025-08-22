// File: src/app/businessidea/tabs/financials/adapters/list-plan-adapter.ts

export function mapPlanToRows(input: unknown): (string | number)[][] {
  // Handle null/undefined input
  if (!input) {
    return [['No data available']];
  }
  
  // If it's already an array of arrays, return as is
  if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
    return input as (string | number)[][];
  }
  
  // Handle object input (typical plan structure)
  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    
    // Handle plan with tasks array
    if (Array.isArray(obj.tasks)) {
      const header = ['Task', 'Effort', 'Phase', 'Cost'];
      const rows = obj.tasks.map((task: any) => [
        task.title || task.name || 'Unnamed Task',
        task.effort || task.duration || 'N/A',
        task.phase || 'N/A',
        task.cost || task.budget || 0
      ]);
      
      return [header, ...rows];
    }
    
    // Handle plan with phases array
    if (Array.isArray(obj.phases)) {
      const header = ['Phase', 'Tasks', 'Duration', 'Budget'];
      const rows = obj.phases.map((phase: any) => [
        phase.name || phase.title || 'Unnamed Phase',
        Array.isArray(phase.tasks) ? phase.tasks.length : 0,
        phase.duration || 'N/A',
        phase.budget || phase.cost || 0
      ]);
      
      return [header, ...rows];
    }
    
    // Handle generic object - convert keys/values to rows
    const header = ['Key', 'Value'];
    const rows = Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    ]);
    
    return [header, ...rows];
  }
  
  // Handle primitive values
  return [['Value'], [String(input)]];
}
