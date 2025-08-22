/**
 * Hook for fetching dashboard metrics data
 * Supports both Supabase and mock data modes
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  DashboardFilters, 
  DimensionBreakdown, 
  MetricKPI, 
  TimeSeriesPoint 
} from './metrics-types';
import { computeDelta, addBreakdownColors } from './metrics-selectors';

// Mock data for development
const MOCK_KPIS: MetricKPI[] = [
  {
    key: 'total_spend',
    value: 11670000,
    deltaAbs: 2730000,
    deltaPct: 30.6,
    asOf: new Date().toISOString(),
    unit: 'currency',
    label: 'Total Spend',
    color: '#0088FE'
  },
  {
    key: 'total_impressions',
    value: 47403,
    deltaAbs: -5700,
    deltaPct: -11.4,
    asOf: new Date().toISOString(),
    unit: 'count',
    label: 'Total Impressions',
    color: '#8884D8'
  },
  {
    key: 'viewable_impressions',
    value: 55093,
    deltaAbs: 2200,
    deltaPct: 4.2,
    asOf: new Date().toISOString(),
    unit: 'count',
    label: 'Viewable Impressions',
    color: '#00C49F'
  },
  {
    key: 'total_sales',
    value: 12330000,
    deltaAbs: 5400000,
    deltaPct: 46.0,
    asOf: new Date().toISOString(),
    unit: 'currency',
    label: 'Total Sales',
    color: '#FF8042'
  }
];

// Mock time series data
const generateMockTimeSeries = (days: number, baseValue: number, volatility: number): TimeSeriesPoint[] => {
  const result: TimeSeriesPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a value with some randomness but following a trend
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    const trendFactor = 1 + (0.5 - (i / days)) * 0.3; // Slight upward trend
    const value = baseValue * randomFactor * trendFactor;
    
    result.push({
      ts: date.toISOString(),
      value: Math.round(value)
    });
  }
  
  return result;
};

// Mock breakdown data
const MOCK_CONTEXTUAL_BREAKDOWN: DimensionBreakdown[] = [
  { metric: 'impressions', dimension: 'contextual', category: 'Food', value: 30, percentage: 30 },
  { metric: 'impressions', dimension: 'contextual', category: 'Tech', value: 25, percentage: 25 },
  { metric: 'impressions', dimension: 'contextual', category: 'News', value: 20, percentage: 20 },
  { metric: 'impressions', dimension: 'contextual', category: 'Health', value: 15, percentage: 15 },
  { metric: 'impressions', dimension: 'contextual', category: 'Shopping', value: 10, percentage: 10 }
];

const MOCK_DEVICE_BREAKDOWN: DimensionBreakdown[] = [
  { metric: 'impressions', dimension: 'device', category: 'Mobile', value: 60, percentage: 60 },
  { metric: 'impressions', dimension: 'device', category: 'Desktop', value: 30, percentage: 30 },
  { metric: 'impressions', dimension: 'device', category: 'Tablet', value: 10, percentage: 10 }
];

const MOCK_CHANNEL_BREAKDOWN: DimensionBreakdown[] = [
  { metric: 'spend', dimension: 'channel', category: 'Social', value: 3500000, percentage: 30 },
  { metric: 'spend', dimension: 'channel', category: 'Search', value: 2800000, percentage: 24 },
  { metric: 'spend', dimension: 'channel', category: 'Display', value: 1750000, percentage: 15 },
  { metric: 'spend', dimension: 'channel', category: 'Video', value: 1400000, percentage: 12 },
  { metric: 'spend', dimension: 'channel', category: 'Email', value: 935000, percentage: 8 },
  { metric: 'spend', dimension: 'channel', category: 'Direct', value: 700000, percentage: 6 },
  { metric: 'spend', dimension: 'channel', category: 'Affiliate', value: 585000, percentage: 5 }
];

const MOCK_CREATIVE_BREAKDOWN: DimensionBreakdown[] = [
  { metric: 'resonance', dimension: 'creative', category: 'Creative A', value: 79, percentage: 79 },
  { metric: 'resonance', dimension: 'creative', category: 'Creative B', value: 67, percentage: 67 },
  { metric: 'resonance', dimension: 'creative', category: 'Creative C', value: 54, percentage: 54 },
  { metric: 'resonance', dimension: 'creative', category: 'Creative D', value: 47, percentage: 47 }
];

// Add colors to mock breakdowns
const coloredContextualBreakdown = addBreakdownColors(MOCK_CONTEXTUAL_BREAKDOWN, 'contextual');
const coloredDeviceBreakdown = addBreakdownColors(MOCK_DEVICE_BREAKDOWN, 'device');
const coloredChannelBreakdown = addBreakdownColors(MOCK_CHANNEL_BREAKDOWN, 'channel');
const coloredCreativeBreakdown = addBreakdownColors(MOCK_CREATIVE_BREAKDOWN, 'creative');

interface DashboardDataResult {
  kpis: MetricKPI[];
  series: Record<string, TimeSeriesPoint[]>;
  breakdowns: Record<string, DimensionBreakdown[]>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch dashboard data from Supabase or mock data
 */
export function useDashboardData(
  userId: string, 
  filters: DashboardFilters,
  useMockData: boolean = true
): DashboardDataResult {
  const [kpis, setKpis] = useState<MetricKPI[]>([]);
  const [series, setSeries] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [breakdowns, setBreakdowns] = useState<Record<string, DimensionBreakdown[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of current request to cancel stale ones
  const currentRequestId = useRef<string>('');
  
  // Function to fetch data from Supabase
  const fetchFromSupabase = useCallback(async (
    userId: string, 
    filters: DashboardFilters
  ): Promise<{
    kpis: MetricKPI[];
    series: Record<string, TimeSeriesPoint[]>;
    breakdowns: Record<string, DimensionBreakdown[]>;
  }> => {
    try {
      // Generate a unique ID for this request
      const requestId = Date.now().toString();
      currentRequestId.current = requestId;
      
      // Dynamically import Supabase client to avoid hard dependency
      const { supabase } = await import('../../../lib/supabase/client');
      
      // Check if this request is still current
      if (currentRequestId.current !== requestId) {
        throw new Error('Request cancelled');
      }
      
      // Fetch KPIs
      const { data: kpiData, error: kpiError } = await supabase.rpc(
        'kpis_for_timerange',
        { 
          user_id: userId,
          time_range: filters.timeRange
        }
      );
      
      if (kpiError) throw new Error(`Failed to fetch KPIs: ${kpiError.message}`);
      
      // Check if this request is still current
      if (currentRequestId.current !== requestId) {
        throw new Error('Request cancelled');
      }
      
      // Fetch time series for impressions
      const { data: impressionsData, error: impressionsError } = await supabase.rpc(
        'timeseries_for_metric',
        {
          user_id: userId,
          metric_key: 'impressions',
          time_range: filters.timeRange,
          rollup: filters.timeRange === '12w' ? 'week' : 'day'
        }
      );
      
      if (impressionsError) throw new Error(`Failed to fetch impressions: ${impressionsError.message}`);
      
      // Check if this request is still current
      if (currentRequestId.current !== requestId) {
        throw new Error('Request cancelled');
      }
      
      // Fetch breakdowns
      const breakdownPromises = [
        supabase.rpc('breakdown_for_metric', {
          user_id: userId,
          metric_key: 'impressions',
          dimension_key: 'contextual',
          time_range: filters.timeRange,
          top_n: 5
        }),
        supabase.rpc('breakdown_for_metric', {
          user_id: userId,
          metric_key: 'impressions',
          dimension_key: 'device',
          time_range: filters.timeRange,
          top_n: 3
        }),
        supabase.rpc('breakdown_for_metric', {
          user_id: userId,
          metric_key: 'spend',
          dimension_key: 'channel',
          time_range: filters.timeRange,
          top_n: 10
        }),
        supabase.rpc('breakdown_for_metric', {
          user_id: userId,
          metric_key: 'resonance',
          dimension_key: 'creative',
          time_range: filters.timeRange,
          top_n: 4
        })
      ];
      
      const [contextualRes, deviceRes, channelRes, creativeRes] = await Promise.all(breakdownPromises);
      
      if (contextualRes.error) throw new Error(`Failed to fetch contextual: ${contextualRes.error.message}`);
      if (deviceRes.error) throw new Error(`Failed to fetch device: ${deviceRes.error.message}`);
      if (channelRes.error) throw new Error(`Failed to fetch channel: ${channelRes.error.message}`);
      if (creativeRes.error) throw new Error(`Failed to fetch creative: ${creativeRes.error.message}`);
      
      // Check if this request is still current
      if (currentRequestId.current !== requestId) {
        throw new Error('Request cancelled');
      }
      
      // Process and return the data
      return {
        kpis: kpiData,
        series: {
          'impressions': impressionsData
        },
        breakdowns: {
          'contextual': addBreakdownColors(contextualRes.data, 'contextual'),
          'device': addBreakdownColors(deviceRes.data, 'device'),
          'channel': addBreakdownColors(channelRes.data, 'channel'),
          'creative': addBreakdownColors(creativeRes.data, 'creative')
        }
      };
    } catch (err: any) {
      if (err.message === 'Request cancelled') {
        // Silent fail for cancelled requests
        return { kpis: [], series: {}, breakdowns: {} };
      }
      
      console.error('Error fetching dashboard data:', err);
      throw new Error(err.message || 'Failed to fetch dashboard data');
    }
  }, []);
  
  // Function to get mock data
  const getMockData = useCallback((filters: DashboardFilters) => {
    // Generate time series based on filter
    let days: number;
    switch (filters.timeRange) {
      case '30d': days = 30; break;
      case '12w': days = 84; break;
      case '7d':
      default: days = 7;
    }
    
    const impressionsSeries = generateMockTimeSeries(days, 6500, 0.2);
    
    return {
      kpis: MOCK_KPIS,
      series: {
        'impressions': impressionsSeries
      },
      breakdowns: {
        'contextual': coloredContextualBreakdown,
        'device': coloredDeviceBreakdown,
        'channel': coloredChannelBreakdown,
        'creative': coloredCreativeBreakdown
      }
    };
  }, []);
  
  // Function to fetch data (either from Supabase or mock)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (useMockData) {
        // Use mock data
        data = getMockData(filters);
      } else {
        // Use Supabase
        data = await fetchFromSupabase(userId, filters);
      }
      
      setKpis(data.kpis);
      setSeries(data.series);
      setBreakdowns(data.breakdowns);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, useMockData, fetchFromSupabase, getMockData]);
  
  // Refresh function exposed to consumers
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  
  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    kpis,
    series,
    breakdowns,
    loading,
    error,
    refresh
  };
}
