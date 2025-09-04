// File: src/modules/job-loss-viz/utils/forecast.ts

interface Datum { ts: string; value: number }

export interface ForecastResult {
  historical: Datum[];
  forecast: Datum[];
}

/**
 * Creates a simple linear projection forecast until 2028
 * @param historicalData - Array of historical data points
 * @returns ForecastResult with historical and forecast data
 */
export function createForecastUntil2028(historicalData: Datum[]): ForecastResult {
  if (!historicalData || historicalData.length === 0) {
    return { historical: [], forecast: [] };
  }

  // Sort data by date
  const sorted = [...historicalData].sort((a, b) => 
    new Date(a.ts).getTime() - new Date(b.ts).getTime()
  );

  // Get last data point
  const lastPoint = sorted[sorted.length - 1];
  const lastDate = new Date(lastPoint.ts);
  const lastValue = lastPoint.value;

  // Calculate trend based on last 3-6 months of data
  const recentData = sorted.slice(-6);
  const trend = calculateTrend(recentData);

  // Generate forecast points until 2028
  const forecast: Datum[] = [];
  let currentDate = new Date(lastDate);
  const endDate = new Date('2028-12-31');

  let currentValue = lastValue;
  let monthIndex = 1;

  while (currentDate <= endDate) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Simple linear projection based on trend
    currentValue += trend;
    
    forecast.push({
      ts: currentDate.toISOString().split('T')[0],
      value: Math.max(0, Math.round(currentValue))
    });
    
    monthIndex++;
  }

  return {
    historical: sorted,
    forecast
  };
}

/**
 * Calculates trend from historical data
 * @param data - Recent data points
 * @returns Monthly trend value
 */
function calculateTrend(data: Datum[]): number {
  if (data.length < 2) return 0;

  // Simple linear regression slope
  const n = data.length;
  const xValues = data.map((_, index) => index);
  const yValues = data.map(point => point.value);

  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Return monthly trend (slope * 1 month)
  return slope || 0;
}

/**
 * Helper function to get month difference between two dates
 */
function getMonthDifference(startDate: Date, endDate: Date): number {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
         (endDate.getMonth() - startDate.getMonth());
}
