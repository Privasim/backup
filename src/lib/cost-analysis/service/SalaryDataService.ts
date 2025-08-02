// Service for aggregating salary data from multiple sources

import { BLSProvider, PayScaleProvider } from '../providers';
import { SalaryData, UserProfile, CostAnalysisError } from '../types';
import { CostAnalysisCacheManager } from '../utils/cache-manager';
import { CostDataValidator } from '../utils/data-validation';
import { debugLog } from '@/components/debug/DebugConsole';

export class SalaryDataService {
  private blsProvider: BLSProvider;
  private payScaleProvider?: PayScaleProvider;
  private cache: CostAnalysisCacheManager;

  constructor(payScaleApiKey?: string) {
    this.blsProvider = new BLSProvider();
    if (payScaleApiKey) {
      this.payScaleProvider = new PayScaleProvider(payScaleApiKey);
    }
    this.cache = new CostAnalysisCacheManager();
  }

  // Get comprehensive salary data from multiple sources
  async getSalaryData(profile: UserProfile): Promise<SalaryData | null> {
    try {
      debugLog.info('SalaryDataService', 'Fetching salary data', {
        occupation: profile.occupation,
        location: profile.location,
        experience: profile.experience
      });

      // Check cache first
      const cacheKey = this.cache.generateSalaryKey(
        profile.occupation,
        profile.location,
        profile.experience
      );
      
      const cached = await this.cache.get<SalaryData>(cacheKey);
      if (cached) {
        debugLog.info('SalaryDataService', 'Using cached salary data');
        return cached;
      }

      // Try multiple data sources in order of preference
      let salaryData = await this.getFromPayScale(profile);
      
      if (!salaryData || salaryData.confidence < 0.7) {
        debugLog.info('SalaryDataService', 'PayScale data insufficient, trying BLS');
        const blsData = await this.getFromBLS(profile);
        
        if (blsData && (!salaryData || blsData.confidence > salaryData.confidence)) {
          salaryData = blsData;
        }
      }

      // Fallback to estimated data if no reliable source found
      if (!salaryData || salaryData.confidence < 0.5) {
        debugLog.warn('SalaryDataService', 'Using estimated salary data as fallback');
        salaryData = this.getEstimatedSalary(profile);
      }

      // Cache the result
      if (salaryData) {
        await this.cache.set(cacheKey, salaryData, 24 * 60 * 60 * 1000); // 24 hour cache
        
        debugLog.success('SalaryDataService', 'Successfully retrieved salary data', {
          source: salaryData.source,
          median: salaryData.median,
          confidence: salaryData.confidence
        });
      }

      return salaryData;
    } catch (error) {
      debugLog.error('SalaryDataService', 'Error fetching salary data', error);
      return this.getEstimatedSalary(profile);
    }
  }

  // Get salary data from PayScale API
  private async getFromPayScale(profile: UserProfile): Promise<SalaryData | null> {
    if (!this.payScaleProvider) {
      debugLog.info('SalaryDataService', 'PayScale provider not configured');
      return null;
    }

    try {
      return await this.payScaleProvider.getSalaryData(
        profile.occupation,
        profile.location,
        profile.experience,
        profile.skills
      );
    } catch (error) {
      debugLog.error('SalaryDataService', 'PayScale API error', error);
      return null;
    }
  }

  // Get salary data from BLS API
  private async getFromBLS(profile: UserProfile): Promise<SalaryData | null> {
    try {
      // First, find the appropriate SOC code for the occupation
      const socMatches = await this.blsProvider.searchSOCCodes(profile.occupation);
      
      if (socMatches.length === 0) {
        debugLog.warn('SalaryDataService', 'No SOC code found for occupation', profile.occupation);
        return null;
      }

      // Use the best matching SOC code
      const bestMatch = socMatches[0];
      debugLog.info('SalaryDataService', `Using SOC code ${bestMatch.socCode} for ${profile.occupation}`);

      // Get wage data from BLS
      const blsData = await this.blsProvider.getOccupationWages(
        bestMatch.socCode,
        this.normalizeBLSLocation(profile.location)
      );

      if (!blsData) {
        return null;
      }

      // Apply experience adjustment
      const experienceMultiplier = this.getExperienceMultiplier(profile.experience);
      const adjustedMedian = blsData.median * experienceMultiplier;

      return {
        ...blsData,
        median: Math.round(adjustedMedian),
        experienceAdjustment: experienceMultiplier,
        confidence: blsData.confidence * bestMatch.matchScore, // Adjust confidence by match quality
      };
    } catch (error) {
      debugLog.error('SalaryDataService', 'BLS API error', error);
      return null;
    }
  }

  // Get estimated salary based on quiz data and industry standards
  private getEstimatedSalary(profile: UserProfile): SalaryData {
    debugLog.info('SalaryDataService', 'Generating estimated salary data');

    // Base salary estimates by occupation
    const baseSalaries: Record<string, number> = {
      'software-developer': 95000,
      'software-engineer': 100000,
      'web-developer': 75000,
      'data-scientist': 110000,
      'data-analyst': 70000,
      'financial-analyst': 75000,
      'marketing-specialist': 60000,
      'content-writer': 50000,
      'customer-support': 40000,
      'sales-representative': 55000,
      'hr-specialist': 65000,
      'project-manager': 90000,
      'business-analyst': 80000,
      'accountant': 60000,
      'graphic-designer': 50000,
      'ux-designer': 85000,
      'product-manager': 120000,
    };

    const normalizedOccupation = profile.occupation.toLowerCase().replace(/\s+/g, '-');
    let baseSalary = baseSalaries[normalizedOccupation] || 65000;

    // Apply experience multiplier
    const experienceMultiplier = this.getExperienceMultiplier(profile.experience);
    baseSalary *= experienceMultiplier;

    // Apply location adjustment
    const locationMultiplier = this.getLocationMultiplier(profile.location);
    baseSalary *= locationMultiplier;

    // Extract salary from quiz data if available
    const quizSalary = this.extractSalaryFromRange(profile.salaryRange);
    if (quizSalary && Math.abs(quizSalary - baseSalary) / baseSalary < 0.5) {
      // Use quiz salary if it's within 50% of estimated salary
      baseSalary = (baseSalary + quizSalary) / 2; // Average the two estimates
    }

    return {
      median: Math.round(baseSalary),
      currency: 'USD',
      source: 'estimated',
      confidence: 0.6, // Lower confidence for estimated data
      lastUpdated: new Date().toISOString(),
      locationAdjustment: locationMultiplier,
      experienceAdjustment: experienceMultiplier,
    };
  }

  private getExperienceMultiplier(experience: string): number {
    const multipliers: Record<string, number> = {
      'entry-level': 0.8,
      'junior': 0.85,
      '0-1 years': 0.8,
      '1-2 years': 0.85,
      'mid-level': 1.0,
      '2-5 years': 0.95,
      '5-10 years': 1.15,
      'senior': 1.3,
      '10+ years': 1.4,
      'lead': 1.5,
      'executive': 1.6,
    };

    const normalized = experience.toLowerCase();
    return multipliers[normalized] || 1.0;
  }

  private getLocationMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
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
      'remote': 1.1, // Remote often pays slightly above average
      'usa': 1.0,
      'philippines': 0.25,
      'singapore': 0.8,
      'india': 0.2,
      'uk': 1.2,
      'canada': 0.9,
      'australia': 1.1,
    };

    const normalized = location.toLowerCase();
    return multipliers[normalized] || 1.0;
  }

  private extractSalaryFromRange(salaryRange: string): number | null {
    if (!salaryRange) return null;

    // Extract numbers from salary range strings
    const matches = salaryRange.match(/[\d,]+/g);
    if (!matches) return null;

    const numbers = matches.map(match => parseInt(match.replace(/,/g, '')));
    
    if (numbers.length === 1) {
      return numbers[0];
    } else if (numbers.length >= 2) {
      // Return the average of the range
      return (numbers[0] + numbers[1]) / 2;
    }

    return null;
  }

  private normalizeBLSLocation(location: string): string {
    // Convert location to BLS area format
    const locationMappings: Record<string, string> = {
      'california': 'california',
      'new york': 'new york',
      'texas': 'texas',
      'florida': 'florida',
      'illinois': 'illinois',
      'san francisco': 'california',
      'los angeles': 'california',
      'chicago': 'illinois',
      'boston': 'massachusetts',
      'seattle': 'washington',
      'remote': 'national',
      'usa': 'national',
    };

    const normalized = location.toLowerCase();
    return locationMappings[normalized] || 'national';
  }

  // Get cache statistics
  getCacheStats() {
    return this.cache.getStats();
  }

  // Clear salary data cache
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}