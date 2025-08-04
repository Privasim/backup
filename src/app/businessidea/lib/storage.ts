import { ProfileFormData, Profile } from '../types/profile.types';

const STORAGE_KEYS = {
  PROFILE_DRAFT: 'profile_draft',
  PROFILE_COMPLETED: 'profile_completed',
  PROFILE_METADATA: 'profile_metadata'
} as const;

// Storage utilities
export class ProfileStorage {
  private static isClient = typeof window !== 'undefined';

  // Save draft profile with auto-save functionality
  static saveDraft(profileData: Partial<ProfileFormData>): boolean {
    if (!this.isClient) return false;
    
    try {
      const existingDraft = this.getDraft();
      const updatedDraft = {
        ...existingDraft,
        ...profileData,
        metadata: {
          ...existingDraft?.metadata,
          ...profileData.metadata,
          lastModified: new Date().toISOString(),
          isDraft: true
        }
      };
      
      localStorage.setItem(STORAGE_KEYS.PROFILE_DRAFT, JSON.stringify(updatedDraft));
      return true;
    } catch (error) {
      console.error('Failed to save profile draft:', error);
      return false;
    }
  }

  // Get draft profile
  static getDraft(): ProfileFormData | null {
    if (!this.isClient) return null;
    
    try {
      const draft = localStorage.getItem(STORAGE_KEYS.PROFILE_DRAFT);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to retrieve profile draft:', error);
      return null;
    }
  }

  // Save completed profile
  static saveCompleted(profileData: ProfileFormData): boolean {
    if (!this.isClient) return false;
    
    try {
      const completedProfile = {
        ...profileData,
        metadata: {
          ...profileData.metadata,
          completedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          isDraft: false
        }
      };
      
      localStorage.setItem(STORAGE_KEYS.PROFILE_COMPLETED, JSON.stringify(completedProfile));
      // Clear draft after completion
      this.clearDraft();
      return true;
    } catch (error) {
      console.error('Failed to save completed profile:', error);
      return false;
    }
  }

  // Get completed profile
  static getCompleted(): ProfileFormData | null {
    if (!this.isClient) return null;
    
    try {
      const completed = localStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETED);
      return completed ? JSON.parse(completed) : null;
    } catch (error) {
      console.error('Failed to retrieve completed profile:', error);
      return null;
    }
  }

  // Clear draft
  static clearDraft(): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE_DRAFT);
      return true;
    } catch (error) {
      console.error('Failed to clear profile draft:', error);
      return false;
    }
  }

  // Clear all profile data
  static clearAll(): boolean {
    if (!this.isClient) return false;
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear all profile data:', error);
      return false;
    }
  }

  // Check if profile exists (draft or completed)
  static hasProfile(): boolean {
    return this.getDraft() !== null || this.getCompleted() !== null;
  }

  // Get profile status
  static getProfileStatus(): 'none' | 'draft' | 'completed' {
    if (this.getCompleted()) return 'completed';
    if (this.getDraft()) return 'draft';
    return 'none';
  }

  // Export profile data for external use
  static exportProfile(): string | null {
    const completed = this.getCompleted();
    const draft = this.getDraft();
    const profileData = completed || draft;
    
    if (!profileData) return null;
    
    try {
      return JSON.stringify(profileData, null, 2);
    } catch (error) {
      console.error('Failed to export profile:', error);
      return null;
    }
  }

  // Import profile data
  static importProfile(jsonData: string): boolean {
    if (!this.isClient) return false;
    
    try {
      const profileData = JSON.parse(jsonData) as ProfileFormData;
      
      // Validate basic structure
      if (!profileData.profile || !profileData.metadata) {
        throw new Error('Invalid profile data structure');
      }
      
      // Save as draft for review
      return this.saveDraft(profileData);
    } catch (error) {
      console.error('Failed to import profile:', error);
      return false;
    }
  }
}

// Debounced auto-save hook
export const useAutoSave = (delay: number = 500) => {
  let timeoutId: NodeJS.Timeout;
  
  return (profileData: Partial<ProfileFormData>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      ProfileStorage.saveDraft(profileData);
    }, delay);
  };
};

// Storage event listener for cross-tab synchronization
export const useStorageSync = (callback: (profileData: ProfileFormData | null) => void) => {
  if (typeof window === 'undefined') return;
  
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.PROFILE_DRAFT || event.key === STORAGE_KEYS.PROFILE_COMPLETED) {
      const profileData = ProfileStorage.getDraft() || ProfileStorage.getCompleted();
      callback(profileData);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};