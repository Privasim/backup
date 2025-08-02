// Bureau of Labor Statistics API provider

import { BLSApiRequest, BLSApiResponse, BLSOccupationData, SalaryData } from '../types';
import { CostDataValidator } from '../utils/data-validation';
import { debugLog } from '@/components/debug/DebugConsole';

export class BLSProvider {
  private readonly baseUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
  private readonly registrationKey?: string;

  constructor(registrationKey?: string) {
    this.registrationKey = registrationKey;
  }

  // Get occupation wage data by SOC code
  async getOccupationWages(
    socCode: string, 
    area: string = 'national',
    year?: string
  ): Promise<SalaryData | null> {
    try {
      debugLog.info('BLSProvider', `Fetching wage data for SOC ${socCode}`, { area, year });

      // Build series ID for occupation wages
      const seriesId = this.buildWageSeriesId(socCode, area);
      
      const request: BLSApiRequest = {
        seriesid: [seriesId],
        startyear: year || new Date().getFullYear().toString(),
        endyear: year || new Date().getFullYear().toString(),
        catalog: false,
        calculations: true,
        annualaverage: true,
      };

      if (this.registrationKey) {
        request.registrationkey = this.registrationKey;
      }

      const response = await this.makeRequest(request);
      
      if (!response) {
        debugLog.error('BLSProvider', 'Failed to get valid response from BLS API');
        return null;
      }

      const salaryData = this.parseWageResponse(response, socCode);
      
      if (salaryData) {
        debugLog.success('BLSProvider', 'Successfully retrieved wage data', {
          median: salaryData.median,
          source: salaryData.source,
          confidence: salaryData.confidence
        });
      }

      return salaryData;
    } catch (error) {
      debugLog.error('BLSProvider', 'Error fetching BLS wage data', error);
      return null;
    }
  }

  // Get occupation employment statistics
  async getOccupationEmployment(socCode: string, area: string = 'national'): Promise<{
    employment: number;
    employmentPercent: number;
    confidence: number;
  } | null> {
    try {
      const seriesId = this.buildEmploymentSeriesId(socCode, area);
      
      const request: BLSApiRequest = {
        seriesid: [seriesId],
        startyear: new Date().getFullYear().toString(),
        endyear: new Date().getFullYear().toString(),
      };

      if (this.registrationKey) {
        request.registrationkey = this.registrationKey;
      }

      const response = await this.makeRequest(request);
      
      if (!response || !response.Results.series[0]?.data[0]) {
        return null;
      }

      const data = response.Results.series[0].data[0];
      const employment = parseFloat(data.value);

      return {
        employment,
        employmentPercent: employment / 1000, // Convert to percentage if needed
        confidence: 0.9, // BLS data is highly reliable
      };
    } catch (error) {
      debugLog.error('BLSProvider', 'Error fetching employment data', error);
      return null;
    }
  }

  // Search for SOC codes by occupation title
  async searchSOCCodes(occupationTitle: string): Promise<Array<{
    socCode: string;
    title: string;
    matchScore: number;
  }>> {
    // This would typically require a separate BLS API call or local SOC code database
    // For now, we'll use a mapping of common occupations to SOC codes
    const socMapping = this.getSOCMapping();
    const normalizedTitle = occupationTitle.toLowerCase().replace(/[^a-z\s]/g, '');
    
    const matches: Array<{ socCode: string; title: string; matchScore: number }> = [];
    
    for (const [title, socCode] of Object.entries(socMapping)) {
      const normalizedSOCTitle = title.toLowerCase();
      
      // Simple matching algorithm
      let matchScore = 0;
      
      if (normalizedSOCTitle === normalizedTitle) {
        matchScore = 1.0;
      } else if (normalizedSOCTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedSOCTitle)) {
        matchScore = 0.8;
      } else {
        // Check for word matches
        const titleWords = normalizedTitle.split(' ');
        const socWords = normalizedSOCTitle.split(' ');
        const commonWords = titleWords.filter(word => socWords.includes(word) && word.length > 2);
        matchScore = commonWords.length / Math.max(titleWords.length, socWords.length);
      }
      
      if (matchScore > 0.3) {
        matches.push({ socCode, title, matchScore });
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  private async makeRequest(request: BLSApiRequest): Promise<BLSApiResponse | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`BLS API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return CostDataValidator.validateBLSResponse(data);
    } catch (error) {
      debugLog.error('BLSProvider', 'BLS API request failed', error);
      return null;
    }
  }

  private parseWageResponse(response: BLSApiResponse, socCode: string): SalaryData | null {
    try {
      const series = response.Results.series[0];
      if (!series || !series.data || series.data.length === 0) {
        return null;
      }

      // Get the most recent data point
      const latestData = series.data[0];
      const wage = parseFloat(latestData.value);

      if (isNaN(wage) || wage <= 0) {
        return null;
      }

      return {
        median: wage,
        currency: 'USD',
        source: 'bls',
        confidence: 0.95, // BLS data is highly reliable
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      debugLog.error('BLSProvider', 'Error parsing wage response', error);
      return null;
    }
  }

  private buildWageSeriesId(socCode: string, area: string): string {
    // BLS series ID format for Occupational Employment Statistics (OES)
    // OEUS + area code + occupation code + data type
    const areaCode = area === 'national' ? '000000' : this.getAreaCode(area);
    const cleanSOC = socCode.replace('-', '');
    return `OEUS${areaCode}${cleanSOC}03`; // 03 = median hourly wage
  }

  private buildEmploymentSeriesId(socCode: string, area: string): string {
    const areaCode = area === 'national' ? '000000' : this.getAreaCode(area);
    const cleanSOC = socCode.replace('-', '');
    return `OEUS${areaCode}${cleanSOC}01`; // 01 = employment
  }

  private getAreaCode(area: string): string {
    // Simplified area code mapping - in production, this would be more comprehensive
    const areaCodes: Record<string, string> = {
      'california': '000006',
      'new york': '000036',
      'texas': '000048',
      'florida': '000012',
      'illinois': '000017',
      'national': '000000',
    };

    return areaCodes[area.toLowerCase()] || '000000';
  }

  private getSOCMapping(): Record<string, string> {
    // Common occupation to SOC code mapping
    return {
      'software developer': '15-1252',
      'software engineer': '15-1252',
      'web developer': '15-1254',
      'data scientist': '15-2051',
      'data analyst': '15-2041',
      'financial analyst': '13-2051',
      'marketing specialist': '13-1161',
      'content writer': '27-3043',
      'technical writer': '27-3042',
      'customer service representative': '43-4051',
      'sales representative': '41-4012',
      'human resources specialist': '13-1071',
      'project manager': '11-9021',
      'business analyst': '13-1111',
      'accountant': '13-2011',
      'graphic designer': '27-1024',
      'ux designer': '15-1255',
      'product manager': '11-2022',
      'operations manager': '11-1021',
      'marketing manager': '11-2021',
    };
  }
}