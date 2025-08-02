// Data validation utilities for API responses and cost calculations

import { 
  BLSApiResponse, 
  PayScaleApiResponse, 
  SalaryData, 
  AICostData, 
  CostAnalysisError 
} from '../types';

export class CostDataValidator {
  
  // BLS API Response Validation
  static validateBLSResponse(response: any): BLSApiResponse | null {
    try {
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      if (response.status !== 'REQUEST_SUCCEEDED') {
        throw new Error(`BLS API error: ${response.message?.join(', ') || 'Unknown error'}`);
      }

      if (!response.Results?.series || !Array.isArray(response.Results.series)) {
        throw new Error('Missing or invalid series data');
      }

      // Validate series data structure
      for (const series of response.Results.series) {
        if (!series.seriesID || !Array.isArray(series.data)) {
          throw new Error('Invalid series structure');
        }

        for (const dataPoint of series.data) {
          if (!dataPoint.year || !dataPoint.value) {
            throw new Error('Invalid data point structure');
          }
        }
      }

      return response as BLSApiResponse;
    } catch (error) {
      console.error('BLS response validation failed:', error);
      return null;
    }
  }

  // PayScale API Response Validation
  static validatePayScaleResponse(response: any): PayScaleApiResponse | null {
    try {
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      if (response.status !== 'success') {
        throw new Error(`PayScale API error: ${response.message || 'Unknown error'}`);
      }

      if (!response.data?.salary) {
        throw new Error('Missing salary data');
      }

      const salary = response.data.salary;
      if (typeof salary.median !== 'number' || salary.median <= 0) {
        throw new Error('Invalid median salary value');
      }

      return response as PayScaleApiResponse;
    } catch (error) {
      console.error('PayScale response validation failed:', error);
      return null;
    }
  }

  // Salary Data Validation
  static validateSalaryData(data: Partial<SalaryData>): SalaryData | null {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid salary data format');
      }

      if (typeof data.median !== 'number' || data.median <= 0) {
        throw new Error('Invalid median salary');
      }

      if (!data.currency || typeof data.currency !== 'string') {
        throw new Error('Missing or invalid currency');
      }

      if (!data.source || !['bls', 'payscale', 'estimated'].includes(data.source)) {
        throw new Error('Invalid data source');
      }

      if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
        throw new Error('Invalid confidence value');
      }

      // Set defaults for optional fields
      const validated: SalaryData = {
        median: data.median,
        mean: data.mean,
        percentile25: data.percentile25,
        percentile75: data.percentile75,
        currency: data.currency,
        source: data.source,
        confidence: data.confidence,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        locationAdjustment: data.locationAdjustment,
        experienceAdjustment: data.experienceAdjustment,
      };

      return validated;
    } catch (error) {
      console.error('Salary data validation failed:', error);
      return null;
    }
  }

  // AI Cost Data Validation
  static validateAICostData(data: Partial<AICostData>): AICostData | null {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid AI cost data format');
      }

      if (!data.modelPricing) {
        throw new Error('Missing model pricing data');
      }

      const pricing = data.modelPricing;
      if (typeof pricing.promptTokenCost !== 'number' || pricing.promptTokenCost < 0) {
        throw new Error('Invalid prompt token cost');
      }

      if (typeof pricing.completionTokenCost !== 'number' || pricing.completionTokenCost < 0) {
        throw new Error('Invalid completion token cost');
      }

      if (!data.taskEstimation) {
        throw new Error('Missing task estimation data');
      }

      const estimation = data.taskEstimation;
      if (typeof estimation.tokensPerTask !== 'number' || estimation.tokensPerTask <= 0) {
        throw new Error('Invalid tokens per task');
      }

      if (!data.annualCosts) {
        throw new Error('Missing annual costs data');
      }

      const costs = data.annualCosts;
      if (typeof costs.total !== 'number' || costs.total < 0) {
        throw new Error('Invalid total annual cost');
      }

      return data as AICostData;
    } catch (error) {
      console.error('AI cost data validation failed:', error);
      return null;
    }
  }

  // Numeric Range Validation
  static validateNumericRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} must be a valid number`);
    }

    if (value < min || value > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }

    return true;
  }

  // String Validation
  static validateString(value: any, fieldName: string, required: boolean = true): boolean {
    if (required && (!value || typeof value !== 'string' || value.trim().length === 0)) {
      throw new Error(`${fieldName} is required and must be a non-empty string`);
    }

    if (value && typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    return true;
  }

  // Create standardized error
  static createValidationError(
    message: string, 
    details?: any, 
    recoverable: boolean = true
  ): CostAnalysisError {
    return {
      type: 'validation_error',
      message,
      details,
      recoverable,
      fallbackAvailable: recoverable,
    };
  }

  // Sanitize user input
  static sanitizeUserInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .substring(0, 200); // Limit length
  }

  // Validate occupation code format (SOC codes)
  static validateSOCCode(code: string): boolean {
    // SOC codes format: XX-XXXX or XX-XXXX.XX
    const socPattern = /^\d{2}-\d{4}(\.\d{2})?$/;
    return socPattern.test(code);
  }

  // Validate currency format
  static validateCurrency(amount: number, currency: string): boolean {
    if (typeof amount !== 'number' || amount < 0) {
      return false;
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    return validCurrencies.includes(currency.toUpperCase());
  }

  // Validate confidence score
  static validateConfidence(confidence: number): boolean {
    return typeof confidence === 'number' && 
           confidence >= 0 && 
           confidence <= 1 && 
           !isNaN(confidence);
  }
}