// PayScale API provider for location-specific salary data

import { PayScaleApiRequest, PayScaleApiResponse, SalaryData } from '../types';
import { CostDataValidator } from '../utils/data-validation';
import { debugLog } from '@/components/debug/DebugConsole';

export class PayScaleProvider {
  private readonly baseUrl = 'https://api.payscale.com/v1/salary';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get salary data with location and experience adjustments
  async getSalaryData(
    job: string,
    location?: string,
    experience?: string,
    skills?: string[]
  ): Promise<SalaryData | null> {
    try {
      debugLog.info('PayScaleProvider', `Fetching salary data for ${job}`, {
        location,
        experience,
        skillCount: skills?.length || 0
      });

      const request: PayScaleApiRequest = {
        job: this.normalizeJobTitle(job),
        location: location ? this.normalizeLocation(location) : undefined,
        experience: experience ? this.normalizeExperience(experience) : undefined,
        skills: skills?.slice(0, 5), // Limit to top 5 skills
      };

      const response = await this.makeRequest(request);
      
      if (!response) {
        debugLog.error('PayScaleProvider', 'Failed to get valid response from PayScale API');
        return null;
      }

      const salaryData = this.parsePayScaleResponse(response);
      
      if (salaryData) {
        debugLog.success('PayScaleProvider', 'Successfully retrieved salary data', {
          median: salaryData.median,
          locationAdjustment: salaryData.locationAdjustment,
          experienceAdjustment: salaryData.experienceAdjustment,
          confidence: salaryData.confidence
        });
      }

      return salaryData;
    } catch (error) {
      debugLog.error('PayScaleProvider', 'Error fetching PayScale salary data', error);
      return null;
    }
  }

  // Get location adjustment factor
  async getLocationAdjustment(baseLocation: string, targetLocation: string): Promise<number | null> {
    try {
      // This would typically be a separate API call to get cost of living adjustments
      // For now, we'll use hardcoded adjustments based on common locations
      const adjustments = this.getLocationAdjustments();
      
      const baseAdjustment = adjustments[baseLocation.toLowerCase()] || 1.0;
      const targetAdjustment = adjustments[targetLocation.toLowerCase()] || 1.0;
      
      return targetAdjustment / baseAdjustment;
    } catch (error) {
      debugLog.error('PayScaleProvider', 'Error calculating location adjustment', error);
      return null;
    }
  }

  // Get experience level multiplier
  getExperienceMultiplier(experience: string): number {
    const multipliers: Record<string, number> = {
      'entry-level': 0.8,
      'junior': 0.85,
      '0-1 years': 0.8,
      '1-2 years': 0.85,
      'mid-level': 1.0,
      '2-5 years': 0.95,
      '5-10 years': 1.1,
      'senior': 1.25,
      '10+ years': 1.3,
      'lead': 1.4,
      'executive': 1.5,
    };

    const normalizedExperience = experience.toLowerCase();
    return multipliers[normalizedExperience] || 1.0;
  }

  private async makeRequest(request: PayScaleApiRequest): Promise<PayScaleApiResponse | null> {
    try {
      const url = new URL(this.baseUrl);
      
      // Add query parameters
      url.searchParams.append('job', request.job);
      url.searchParams.append('format', 'json');
      
      if (request.location) {
        url.searchParams.append('location', request.location);
      }
      
      if (request.experience) {
        url.searchParams.append('experience', request.experience);
      }
      
      if (request.skills && request.skills.length > 0) {
        url.searchParams.append('skills', request.skills.join(','));
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('PayScale API authentication failed - check API key');
        }
        if (response.status === 429) {
          throw new Error('PayScale API rate limit exceeded');
        }
        throw new Error(`PayScale API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return CostDataValidator.validatePayScaleResponse(data);
    } catch (error) {
      debugLog.error('PayScaleProvider', 'PayScale API request failed', error);
      return null;
    }
  }

  private parsePayScaleResponse(response: PayScaleApiResponse): SalaryData | null {
    try {
      const { salary, location_factor, experience_factor, confidence } = response.data;
      const { sample_size, last_updated, currency } = response.metadata;

      // Calculate adjusted median salary
      let adjustedMedian = salary.median;
      
      if (location_factor && location_factor !== 1.0) {
        adjustedMedian *= location_factor;
      }
      
      if (experience_factor && experience_factor !== 1.0) {
        adjustedMedian *= experience_factor;
      }

      // Calculate confidence based on sample size and API confidence
      const sampleSizeConfidence = Math.min(sample_size / 100, 1.0); // Normalize sample size
      const finalConfidence = (confidence + sampleSizeConfidence) / 2;

      return {
        median: Math.round(adjustedMedian),
        mean: salary.percentile75 ? Math.round((salary.median + salary.percentile75) / 2) : undefined,
        percentile25: salary.percentile25 ? Math.round(salary.percentile25 * (location_factor || 1) * (experience_factor || 1)) : undefined,
        percentile75: salary.percentile75 ? Math.round(salary.percentile75 * (location_factor || 1) * (experience_factor || 1)) : undefined,
        currency: currency || 'USD',
        source: 'payscale',
        confidence: Math.round(finalConfidence * 100) / 100,
        lastUpdated: last_updated || new Date().toISOString(),
        locationAdjustment: location_factor,
        experienceAdjustment: experience_factor,
      };
    } catch (error) {
      debugLog.error('PayScaleProvider', 'Error parsing PayScale response', error);
      return null;
    }
  }

  private normalizeJobTitle(job: string): string {
    // Normalize job titles to match PayScale's expected format
    const jobMappings: Record<string, string> = {
      'software-developer': 'Software Developer',
      'software-engineer': 'Software Engineer',
      'web-developer': 'Web Developer',
      'data-scientist': 'Data Scientist',
      'data-analyst': 'Data Analyst',
      'financial-analyst': 'Financial Analyst',
      'marketing-specialist': 'Marketing Specialist',
      'content-writer': 'Content Writer',
      'customer-support': 'Customer Service Representative',
      'sales-representative': 'Sales Representative',
      'hr-specialist': 'Human Resources Specialist',
      'project-manager': 'Project Manager',
      'business-analyst': 'Business Analyst',
      'accountant': 'Accountant',
      'graphic-designer': 'Graphic Designer',
      'ux-designer': 'UX Designer',
      'product-manager': 'Product Manager',
    };

    const normalized = job.toLowerCase().replace(/\s+/g, '-');
    return jobMappings[normalized] || job.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private normalizeLocation(location: string): string {
    // Normalize location names to match PayScale's expected format
    const locationMappings: Record<string, string> = {
      'san francisco': 'San Francisco, CA',
      'new york': 'New York, NY',
      'los angeles': 'Los Angeles, CA',
      'chicago': 'Chicago, IL',
      'boston': 'Boston, MA',
      'seattle': 'Seattle, WA',
      'austin': 'Austin, TX',
      'denver': 'Denver, CO',
      'atlanta': 'Atlanta, GA',
      'miami': 'Miami, FL',
      'remote': 'United States',
      'usa': 'United States',
      'philippines': 'Philippines',
      'singapore': 'Singapore',
      'india': 'India',
      'uk': 'United Kingdom',
      'canada': 'Canada',
      'australia': 'Australia',
    };

    const normalized = location.toLowerCase();
    return locationMappings[normalized] || location;
  }

  private normalizeExperience(experience: string): string {
    // Normalize experience levels to match PayScale's expected format
    const experienceMappings: Record<string, string> = {
      'entry-level': '0-1 years',
      'junior': '1-2 years',
      'mid-level': '2-5 years',
      'senior': '5-10 years',
      'lead': '10+ years',
      'executive': '10+ years',
      '0-1 years': '0-1 years',
      '1-2 years': '1-2 years',
      '2-5 years': '2-5 years',
      '5-10 years': '5-10 years',
      '10+ years': '10+ years',
    };

    const normalized = experience.toLowerCase();
    return experienceMappings[normalized] || experience;
  }

  private getLocationAdjustments(): Record<string, number> {
    // Cost of living adjustments relative to national average
    return {
      'san francisco': 1.8,
      'new york': 1.7,
      'los angeles': 1.5,
      'seattle': 1.4,
      'boston': 1.3,
      'chicago': 1.1,
      'austin': 1.0,
      'denver': 1.0,
      'atlanta': 0.9,
      'miami': 0.95,
      'remote': 1.0,
      'usa': 1.0,
      'philippines': 0.2,
      'singapore': 0.8,
      'india': 0.15,
      'uk': 1.2,
      'canada': 0.9,
      'australia': 1.1,
    };
  }
}