/**
 * Helper functions for automation exposure visualizations
 */

import { AutomationExposureItem } from '@/components/insights/types';

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Gets the severity band for an exposure value
 */
export function getSeverityBand(
  value: number, 
  lowThreshold = 40, 
  highThreshold = 70
): 'low' | 'moderate' | 'high' {
  const clamped = clamp(value);
  if (clamped >= highThreshold) return 'high';
  if (clamped >= lowThreshold) return 'moderate';
  return 'low';
}

/**
 * Gets the severity label for an exposure value
 */
export function getSeverityLabel(
  value: number,
  lowThreshold = 40,
  highThreshold = 70
): 'Low' | 'Moderate' | 'High' {
  const band = getSeverityBand(value, lowThreshold, highThreshold);
  return band.charAt(0).toUpperCase() + band.slice(1) as 'Low' | 'Moderate' | 'High';
}

/**
 * Gets CSS class for a severity band
 */
export function getSeverityClass(band: 'low' | 'moderate' | 'high' | string): string {
  switch (band.toLowerCase()) {
    case 'high':
      return 'badge-error';
    case 'moderate':
      return 'badge-warning';
    case 'low':
      return 'badge-success';
    default:
      return 'badge-neutral';
  }
}

/**
 * Calculates statistics from automation exposure data
 */
export function calculateExposureStats(items: AutomationExposureItem[], minExposure = 0) {
  // Filter and clamp values
  const validItems = items
    .filter(item => typeof item.exposure === 'number')
    .map(item => ({
      ...item,
      exposure: clamp(item.exposure)
    }))
    .filter(item => item.exposure >= minExposure);
  
  const total = validItems.length;
  
  if (total === 0) {
    return {
      avg: 0,
      median: 0,
      p90: 0,
      counts: { high: 0, moderate: 0, low: 0, total: 0 },
      topTask: null,
      aboveThreshold: 0,
      aboveThresholdPercent: 0
    };
  }
  
  // Sort for calculations
  const sortedAsc = [...validItems].sort((a, b) => a.exposure - b.exposure);
  const sortedDesc = [...validItems].sort((a, b) => b.exposure - a.exposure);
  
  // Calculate statistics
  const sum = validItems.reduce((acc, item) => acc + item.exposure, 0);
  const avg = Math.round(sum / total);
  
  const median = total % 2 === 1
    ? sortedAsc[(total - 1) / 2].exposure
    : Math.round((sortedAsc[total / 2 - 1].exposure + sortedAsc[total / 2].exposure) / 2);
  
  const p90Index = Math.max(0, Math.ceil(0.9 * total) - 1);
  const p90 = sortedAsc[p90Index].exposure;
  
  // Count by severity band
  const counts = {
    high: validItems.filter(item => item.exposure > 70).length,
    moderate: validItems.filter(item => item.exposure > 40 && item.exposure <= 70).length,
    low: validItems.filter(item => item.exposure <= 40).length,
    total
  };
  
  // Top task
  const topTask = sortedDesc.length > 0 ? sortedDesc[0] : null;
  
  // Above threshold (default 50%)
  const threshold = 50;
  const aboveThreshold = validItems.filter(item => item.exposure >= threshold).length;
  const aboveThresholdPercent = total > 0 ? Math.round((aboveThreshold / total) * 100) : 0;
  
  return {
    avg,
    median,
    p90,
    counts,
    topTask,
    aboveThreshold,
    aboveThresholdPercent
  };
}

/**
 * Creates histogram bins from exposure data
 */
export function createHistogramBins(
  items: AutomationExposureItem[], 
  binCount = 10,
  minExposure = 0
) {
  const validItems = items
    .filter(item => typeof item.exposure === 'number')
    .map(item => ({
      ...item,
      exposure: clamp(item.exposure)
    }))
    .filter(item => item.exposure >= minExposure);
  
  const binSize = 100 / binCount;
  const bins = Array(binCount).fill(0).map((_, i) => ({
    rangeStart: i * binSize,
    rangeEnd: (i + 1) * binSize,
    count: 0
  }));
  
  // Count items in each bin
  validItems.forEach(item => {
    const binIndex = Math.min(binCount - 1, Math.floor(item.exposure / binSize));
    bins[binIndex].count++;
  });
  
  return bins;
}

/**
 * Formats exposure value as percentage
 */
export function formatExposure(value: number): string {
  return `${Math.round(clamp(value))}%`;
}

/**
 * Generates ARIA label for exposure chart
 */
export function getExposureAriaLabel(
  value: number,
  lowThreshold = 40,
  highThreshold = 70
): string {
  const clamped = clamp(value);
  const severity = getSeverityLabel(clamped, lowThreshold, highThreshold);
  return `Automation exposure: ${formatExposure(clamped)} (${severity} risk)`;
}
