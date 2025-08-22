/**
 * Bridge between dashboard visualization and chatbox
 * Builds context payloads for ChatboxControls to analyze metrics
 */
import { 
  ChartContextPayload, 
  DashboardFilters, 
  DimensionBreakdown, 
  MetricKPI, 
  TimeSeriesPoint 
} from './metrics-types';
import { formatMetricValue, getSeriesStats, topN } from './metrics-selectors';

/**
 * Formats a time range for display in chat context
 */
function formatTimeRange(timeRange: string): string {
  switch (timeRange) {
    case '7d': return 'last 7 days';
    case '30d': return 'last 30 days';
    case '12w': return 'last 12 weeks';
    default: return timeRange;
  }
}

/**
 * Builds a chart context payload for ChatboxControls
 */
export function buildChartContext(args: { 
  cardId: string;
  metric: string;
  filters: DashboardFilters;
  series?: TimeSeriesPoint[];
  breakdown?: DimensionBreakdown[];
  kpi?: MetricKPI;
  title: string;
}): ChartContextPayload {
  const { cardId, metric, filters, series, breakdown, kpi, title } = args;
  
  // Base payload
  const payload: ChartContextPayload = {
    metric,
    filters,
    title,
    chartType: cardId.startsWith('kpi') 
      ? 'kpi' 
      : cardId.includes('donut') 
        ? 'donut' 
        : cardId.includes('line') 
          ? 'line' 
          : 'bar'
  };
  
  // Add time window
  if (filters.timeRange) {
    const now = new Date();
    let startDate: Date;
    
    switch (filters.timeRange) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '12w':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 12 * 7);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    payload.visibleWindow = {
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }
  
  // Add KPI data
  if (kpi) {
    payload.highlights = {
      currentValue: kpi.value,
      deltaValue: kpi.deltaAbs,
      deltaPercent: kpi.deltaPct
    };
  }
  
  // Add time series data
  if (series && series.length > 0) {
    // Get last 5 points for context
    payload.lastPoints = series.slice(-5);
    
    // Add stats
    const stats = getSeriesStats(series);
    payload.highlights = {
      ...payload.highlights,
      min: stats.min,
      max: stats.max,
      avg: stats.avg
    };
  }
  
  // Add breakdown data
  if (breakdown && breakdown.length > 0) {
    // Get top 5 categories
    const topCategories = topN(breakdown, 5);
    payload.topCategories = topCategories.map(item => ({
      category: item.category,
      value: item.value
    }));
  }
  
  return payload;
}

/**
 * Generates a prompt for the chatbox based on chart context
 */
export function generateChartPrompt(payload: ChartContextPayload): string {
  const { metric, filters, chartType, title } = payload;
  
  let prompt = `Please analyze the "${title}" chart showing ${metric} data for the ${formatTimeRange(filters.timeRange)}`;
  
  if (filters.compareTo === 'prev') {
    prompt += ` compared to the previous period`;
  }
  
  if (filters.segment) {
    prompt += ` filtered by segment "${filters.segment}"`;
  }
  
  // Add chart-specific context
  switch (chartType) {
    case 'kpi':
      if (payload.highlights) {
        const { currentValue, deltaValue, deltaPercent } = payload.highlights;
        prompt += `. The current value is ${formatMetricValue(currentValue, 'count')} which is ${deltaPercent >= 0 ? 'up' : 'down'} ${Math.abs(deltaPercent).toFixed(1)}% from the previous period.`;
      }
      break;
      
    case 'donut':
      if (payload.topCategories && payload.topCategories.length > 0) {
        prompt += `. The top category is "${payload.topCategories[0].category}" at ${formatMetricValue(payload.topCategories[0].value, 'count')}.`;
      }
      break;
      
    case 'line':
      if (payload.highlights) {
        const { min, max, avg } = payload.highlights;
        prompt += `. The values range from ${formatMetricValue(min, 'count')} to ${formatMetricValue(max, 'count')} with an average of ${formatMetricValue(avg, 'count')}.`;
      }
      break;
      
    case 'bar':
      if (payload.topCategories && payload.topCategories.length > 0) {
        prompt += `. The highest value is for "${payload.topCategories[0].category}" at ${formatMetricValue(payload.topCategories[0].value, 'count')}.`;
      }
      break;
  }
  
  prompt += ` What insights can you provide about this data? What trends or patterns do you see? What recommendations would you make based on this information?`;
  
  return prompt;
}

/**
 * Initiates a chat analysis with the provided context
 * This function should be called with the ChatboxControls API
 */
export async function explainChart(
  payload: ChartContextPayload, 
  startAnalysis: (prompt: string, contextData?: any) => Promise<void>
): Promise<void> {
  const prompt = generateChartPrompt(payload);
  await startAnalysis(prompt, { chartContext: payload });
}
