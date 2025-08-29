// File: src/modules/job-loss-viz/data/industryMap.ts

/**
 * Maps job roles to their respective industries
 * This mapping is used to categorize role-based data into industry segments
 */
export const ROLE_TO_INDUSTRY: Record<string, string> = {
  // BPO / Customer Service
  'Customer Service & Support': 'BPO',
  'Data Entry & Administrative': 'BPO',
  
  // Technology
  'Software Development (Entry-Level)': 'Technology',
  'Software Development': 'Technology',
  
  // Media & Content
  'Content Creation / Copywriting': 'Media & Content',
  'Media & Journalism': 'Media & Content',
  
  // Financial Services
  'Financial Analysts (Junior)': 'Financial Services',
  'Legal Support Staff': 'Financial Services',
  
  // Retail
  'Retail Sales Associates': 'Retail',
};

/**
 * Default industry for roles not explicitly mapped
 */
export const DEFAULT_INDUSTRY = 'Other';

/**
 * Maps a role to its industry using the ROLE_TO_INDUSTRY mapping
 * @param role The job role to map
 * @returns The corresponding industry or DEFAULT_INDUSTRY if not found
 */
export function mapRoleToIndustry(role: string): string {
  return ROLE_TO_INDUSTRY[role] || DEFAULT_INDUSTRY;
}

/**
 * Groups roles by industry and aggregates their counts
 * @param roles Array of role objects with counts
 * @returns Object mapping industries to their total counts
 */
export function aggregateRolesByIndustry(
  roles: Array<{ role: string; count: number; sources: any[] }>
): Record<string, { count: number; roles: string[]; sources: Set<string> }> {
  return roles.reduce((acc, { role, count, sources }) => {
    const industry = mapRoleToIndustry(role);
    
    if (!acc[industry]) {
      acc[industry] = {
        count: 0,
        roles: [],
        sources: new Set()
      };
    }
    
    acc[industry].count += count;
    acc[industry].roles.push(role);
    
    // Add all sources to the set (deduplicates automatically)
    sources.forEach(source => {
      const url = typeof source === 'string' ? source : source.url;
      acc[industry].sources.add(url);
    });
    
    return acc;
  }, {} as Record<string, { count: number; roles: string[]; sources: Set<string> }>);
}
