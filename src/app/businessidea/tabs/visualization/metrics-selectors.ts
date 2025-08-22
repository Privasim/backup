/**
 * Pure data transformation functions for metrics dashboard
 */
import { DimensionBreakdown, MetricKPI, TimeSeriesPoint } from './metrics-types';

/**
 * Computes delta values between current and previous values
 */
export function computeDelta(current: number, previous: number): { deltaAbs: number; deltaPct: number } {
  if (previous === 0) {
    return { deltaAbs: current, deltaPct: current > 0 ? 100 : 0 };
  }
  
  const deltaAbs = current - previous;
  const deltaPct = (deltaAbs / Math.abs(previous)) * 100;
  
  return {
    deltaAbs,
    deltaPct: Number.isFinite(deltaPct) ? deltaPct : 0
  };
}

/**
 * Formats a number based on its unit type
 */
export function formatMetricValue(value: number, unit: string): string {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return '—';
  }

  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2
      }).format(value);
    
    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 1
      }).format(value / 100);
    
    case 'count':
    default:
      return new Intl.NumberFormat('en-US', {
        notation: value >= 10000 ? 'compact' : 'standard',
        maximumFractionDigits: 1
      }).format(value);
  }
}

/**
 * Formats a delta percentage for display
 */
export function formatDeltaPct(deltaPct: number): string {
  if (!Number.isFinite(deltaPct)) return '0%';
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    signDisplay: 'always',
    maximumFractionDigits: 1
  }).format(deltaPct / 100);
  
  return formatted;
}

/**
 * Gets the color class for a delta value
 */
export function getDeltaColorClass(deltaPct: number): string {
  if (!Number.isFinite(deltaPct)) return 'text-gray-500';
  
  if (deltaPct > 0) return 'text-green-500';
  if (deltaPct < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Rolls up time series data to the specified granularity
 */
export function rollupSeries(
  points: TimeSeriesPoint[], 
  granularity: 'day' | 'week' | 'month'
): TimeSeriesPoint[] {
  if (!points || points.length === 0) return [];

  const rollupMap = new Map<string, { sum: number; count: number; ts: string }>();
  
  points.forEach(point => {
    const date = new Date(point.ts);
    let key: string;
    
    switch (granularity) {
      case 'week':
        // Get the Monday of the week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        key = monday.toISOString().split('T')[0];
        break;
      
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        break;
      
      case 'day':
      default:
        key = date.toISOString().split('T')[0];
        break;
    }
    
    if (!rollupMap.has(key)) {
      rollupMap.set(key, { sum: 0, count: 0, ts: key });
    }
    
    const entry = rollupMap.get(key)!;
    entry.sum += point.value;
    entry.count += 1;
  });
  
  return Array.from(rollupMap.values())
    .map(({ sum, count, ts }) => ({
      ts,
      value: sum / count,
    }))
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

/**
 * Gets the top N items from a breakdown
 */
export function topN(items: DimensionBreakdown[], n: number): DimensionBreakdown[] {
  if (!items || items.length === 0) return [];
  
  // Sort by value descending
  const sorted = [...items].sort((a, b) => b.value - a.value);
  
  // Take top N items
  const topItems = sorted.slice(0, n);
  
  // Calculate percentages
  const total = items.reduce((sum, item) => sum + item.value, 0);
  
  return topItems.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));
}

/**
 * Calculates min, max, and average for a time series
 */
export function getSeriesStats(points: TimeSeriesPoint[]): { min: number; max: number; avg: number } {
  if (!points || points.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }
  
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  
  points.forEach(point => {
    min = Math.min(min, point.value);
    max = Math.max(max, point.value);
    sum += point.value;
  });
  
  return {
    min,
    max,
    avg: sum / points.length
  };
}

/**
 * Adds color to dimension breakdowns based on category
 */
export function addBreakdownColors(
  breakdowns: DimensionBreakdown[], 
  dimension: string
): DimensionBreakdown[] {
  if (!breakdowns || breakdowns.length === 0) return [];
  
  // Color palettes by dimension
  const colorPalettes: Record<string, string[]> = {
    contextual: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'],
    device: ['#0088FE', '#00C49F', '#FFBB28'],
    channel: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#ffc658', '#ff8042', '#d0ed57'],
    creative: ['#00C49F', '#0088FE', '#FFBB28', '#FF8042']
  };
  
  const colors = colorPalettes[dimension] || ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
  return breakdowns.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));
}

/**
 * Generates a simple sparkline data array from a time series
 * Returns a simplified array with fewer points for tiny sparklines
 */
export function generateSparklineData(points: TimeSeriesPoint[], numPoints = 10): TimeSeriesPoint[] {
  if (!points || points.length === 0) return [];
  if (points.length <= numPoints) return points;
  
  const step = Math.ceil(points.length / numPoints);
  const result: TimeSeriesPoint[] = [];
  
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  
  // Always include the last point
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  
  return result;
}
