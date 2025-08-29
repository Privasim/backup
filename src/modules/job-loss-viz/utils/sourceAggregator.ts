// File: src/modules/job-loss-viz/utils/sourceAggregator.ts

import type { AggregatedSourceRef, SourceRef, YtdPoint } from '../types';
import { toSourceRefs } from './validate';

/**
 * Derives a publisher name from a URL if not provided
 * @param url The source URL
 * @returns A publisher name or undefined
 */
export function derivePublisherFromUrl(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. prefix if present
    const domain = hostname.replace(/^www\./, '');
    
    // Extract the main domain name (e.g., bloomberg.com -> Bloomberg)
    const parts = domain.split('.');
    if (parts.length >= 2) {
      // Get the main domain part (e.g., "bloomberg" from "bloomberg.com")
      const mainDomain = parts[parts.length - 2];
      // Capitalize the first letter
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    }
    
    return domain;
  } catch (e) {
    return undefined;
  }
}

/**
 * Aggregates sources from all YTD points, deduplicating by URL and tracking occurrences
 * @param points Array of YTD points with dates and sources
 * @returns Array of aggregated sources with occurrence data
 */
export function aggregateSourcesFromYtd(points: YtdPoint[]): AggregatedSourceRef[] {
  // Sort points by date to ensure chronological processing
  const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));
  
  // Map to track unique sources by URL
  const sourceMap = new Map<string, AggregatedSourceRef>();
  
  // Process each point
  for (const point of sortedPoints) {
    const date = point.date;
    const month = date.substring(0, 7); // YYYY-MM
    
    // Normalize sources to SourceRef objects
    const sourceRefs = toSourceRefs(point.sources);
    
    // Process each source
    for (const source of sourceRefs) {
      const { url } = source;
      
      if (sourceMap.has(url)) {
        // Update existing source
        const existing = sourceMap.get(url)!;
        existing.occurrences += 1;
        existing.lastDate = date;
        
        // Add month if not already included
        if (!existing.months.includes(month)) {
          existing.months.push(month);
        }
      } else {
        // Create new aggregated source
        const publisher = source.publisher || derivePublisherFromUrl(url);
        
        sourceMap.set(url, {
          ...source,
          publisher,
          firstDate: date,
          lastDate: date,
          occurrences: 1,
          months: [month]
        });
      }
    }
  }
  
  // Convert map to array and sort by lastDate (most recent first)
  return Array.from(sourceMap.values())
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

/**
 * Computes the date range from an array of YTD points
 * @param points Array of YTD points
 * @returns Object with start and end dates, or undefined if no points
 */
export function getSourceDateRange(points: YtdPoint[]): { start: string; end: string } | undefined {
  if (!points || points.length === 0) return undefined;
  
  const dates = points.map(p => p.date);
  const start = dates.reduce((min, date) => date < min ? date : min, dates[0]);
  const end = dates.reduce((max, date) => date > max ? date : max, dates[0]);
  
  return { start, end };
}

/**
 * Formats a date range for display
 * @param start ISO date string
 * @param end ISO date string
 * @returns Formatted date range string (e.g., "Jan 2025 – Aug 2025")
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startYear = startDate.getFullYear();
  
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endYear = endDate.getFullYear();
  
  if (startYear === endYear) {
    return `${startMonth} – ${endMonth} ${endYear}`;
  }
  
  return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
}
