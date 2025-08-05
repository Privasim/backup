/**
 * Service for integrating chatbox with profile system
 */

import { ProfileFormData } from '@/app/businessidea/types/profile.types';

export interface ProfileIntegrationConfig {
  autoTriggerAnalysis: boolean;
  triggerDelay: number; // ms
  minProfileCompletion: number; // percentage
  enableChangeDetection: boolean;
  changeDetectionInterval: number; // ms
}

export interface ProfileAnalysisData {
  profileType: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  metadata: {
    completionLevel: number;
    lastModified: string;
  };
}

export class ProfileIntegrationService {
  private static instance: ProfileIntegrationService;
  private config: ProfileIntegrationConfig;
  private listeners: Set<(data: ProfileAnalysisData) => void> = new Set();
  private lastProfileHash: string | null = null;
  private changeDetectionTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      autoTriggerAnalysis: true,
      triggerDelay: 2000, // 2 seconds
      minProfileCompletion: 50, // 50%
      enableChangeDetection: true,
      changeDetectionInterval: 30000 // 30 seconds
    };
  }

  public static getInstance(): ProfileIntegrationService {
    if (!ProfileIntegrationService.instance) {
      ProfileIntegrationService.instance = new ProfileIntegrationService();
    }
    return ProfileIntegrationService.instance;
  }

  /**
   * Configure the integration service
   */
  public configure(config: Partial<ProfileIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart change detection if configuration changed
    if (this.config.enableChangeDetection) {
      this.startChangeDetection();
    } else {
      this.stopChangeDetection();
    }
  }

  /**
   * Transform profile data for analysis
   */
  public transformProfileData(profileData: ProfileFormData): ProfileAnalysisData {
    if (!profileData) {
      throw new Error('No profile data provided');
    }

    // Extract profile information
    const profile = profileData.profile || {};
    const experience = profileData.experience || [];
    const skillset = profileData.skillset || {};
    const metadata = profileData.metadata || {};

    // Transform experience data
    const transformedExperience = experience.map((exp: any) => ({
      title: exp.title || exp.position || 'Unknown Position',
      company: exp.company || exp.organization || 'Unknown Company',
      duration: exp.duration || `${exp.startDate || 'Unknown'} - ${exp.endDate || 'Present'}`,
      description: exp.description || exp.responsibilities || ''
    }));

    // Transform skills data
    const transformedSkills = {
      technical: skillset.technical || skillset.categories?.find((cat: any) => cat.name === 'Technical')?.skills?.map((s: any) => s.name) || [],
      soft: skillset.soft || skillset.categories?.find((cat: any) => cat.name === 'Soft Skills')?.skills?.map((s: any) => s.name) || [],
      languages: skillset.languageProficiency?.map((lang: any) => `${lang.language} (${lang.level || lang.proficiency})`) || skillset.languages || [],
      certifications: skillset.certificationsDetailed?.map((cert: any) => cert.name || cert.title) || skillset.certifications || []
    };

    // Calculate completion level
    const totalFields = 4; // profileType, experience, skills, metadata
    let completedFields = 0;
    
    if (profile.profileType) completedFields++;
    if (transformedExperience.length > 0) completedFields++;
    if (Object.values(transformedSkills).some(arr => arr.length > 0)) completedFields++;
    if (metadata.lastModified) completedFields++;

    return {
      profileType: profile.profileType || 'unknown',
      experience: transformedExperience,
      skills: transformedSkills,
      metadata: {
        completionLevel: Math.round((completedFields / totalFields) * 100),
        lastModified: metadata.lastModified || new Date().toISOString()
      }
    };
  }

  /**
   * Check if profile meets minimum requirements for analysis
   */
  public isAnalysisReady(profileData: ProfileFormData): boolean {
    try {
      const analysisData = this.transformProfileData(profileData);
      return analysisData.metadata.completionLevel >= this.config.minProfileCompletion;
    } catch {
      return false;
    }
  }

  /**
   * Generate hash for profile change detection
   */
  private generateProfileHash(profileData: ProfileFormData): string {
    try {
      const analysisData = this.transformProfileData(profileData);
      return JSON.stringify({
        profileType: analysisData.profileType,
        experienceCount: analysisData.experience.length,
        skillsCount: Object.values(analysisData.skills).reduce((total, arr) => total + arr.length, 0),
        lastModified: analysisData.metadata.lastModified
      });
    } catch {
      return '';
    }
  }

  /**
   * Handle profile save event
   */
  public async handleProfileSave(profileData: ProfileFormData): Promise<void> {
    if (!this.config.autoTriggerAnalysis) return;
    if (!this.isAnalysisReady(profileData)) return;

    try {
      const analysisData = this.transformProfileData(profileData);
      
      // Update profile hash for change detection
      this.lastProfileHash = this.generateProfileHash(profileData);

      // Trigger analysis after delay
      setTimeout(() => {
        this.notifyListeners(analysisData);
      }, this.config.triggerDelay);

    } catch (error) {
      console.error('Profile save handling failed:', error);
    }
  }

  /**
   * Handle profile change detection
   */
  public handleProfileChange(profileData: ProfileFormData): boolean {
    if (!this.config.enableChangeDetection) return false;

    const currentHash = this.generateProfileHash(profileData);
    const hasChanged = this.lastProfileHash !== null && this.lastProfileHash !== currentHash;

    if (hasChanged && this.isAnalysisReady(profileData)) {
      this.lastProfileHash = currentHash;
      
      try {
        const analysisData = this.transformProfileData(profileData);
        this.notifyListeners(analysisData);
        return true;
      } catch (error) {
        console.error('Profile change handling failed:', error);
      }
    }

    return false;
  }

  /**
   * Start automatic change detection
   */
  private startChangeDetection(): void {
    this.stopChangeDetection(); // Clear existing timer

    if (typeof window === 'undefined') return; // Server-side check

    this.changeDetectionTimer = setInterval(() => {
      // This would need to be connected to the profile context
      // For now, it's a placeholder for the detection mechanism
      console.debug('Profile change detection tick');
    }, this.config.changeDetectionInterval);
  }

  /**
   * Stop automatic change detection
   */
  private stopChangeDetection(): void {
    if (this.changeDetectionTimer) {
      clearInterval(this.changeDetectionTimer);
      this.changeDetectionTimer = null;
    }
  }

  /**
   * Add listener for profile analysis events
   */
  public addAnalysisListener(listener: (data: ProfileAnalysisData) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove listener for profile analysis events
   */
  public removeAnalysisListener(listener: (data: ProfileAnalysisData) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of analysis trigger
   */
  private notifyListeners(data: ProfileAnalysisData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Profile analysis listener error:', error);
      }
    });
  }

  /**
   * Get current configuration
   */
  public getConfig(): ProfileIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Get analysis readiness status
   */
  public getAnalysisStatus(profileData: ProfileFormData): {
    ready: boolean;
    completionLevel: number;
    missing: string[];
    requirements: {
      minCompletion: number;
      autoTrigger: boolean;
    };
  } {
    try {
      const analysisData = this.transformProfileData(profileData);
      const missing: string[] = [];

      if (!analysisData.profileType || analysisData.profileType === 'unknown') {
        missing.push('profile type');
      }
      if (analysisData.experience.length === 0) {
        missing.push('work experience');
      }
      if (Object.values(analysisData.skills).every(arr => arr.length === 0)) {
        missing.push('skills information');
      }

      return {
        ready: analysisData.metadata.completionLevel >= this.config.minProfileCompletion,
        completionLevel: analysisData.metadata.completionLevel,
        missing,
        requirements: {
          minCompletion: this.config.minProfileCompletion,
          autoTrigger: this.config.autoTriggerAnalysis
        }
      };
    } catch {
      return {
        ready: false,
        completionLevel: 0,
        missing: ['valid profile data'],
        requirements: {
          minCompletion: this.config.minProfileCompletion,
          autoTrigger: this.config.autoTriggerAnalysis
        }
      };
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopChangeDetection();
    this.listeners.clear();
    this.lastProfileHash = null;
  }
}

// Export singleton instance
export const profileIntegrationService = ProfileIntegrationService.getInstance();