import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfileData } from './types';

// Session storage key
const STORAGE_KEY = 'user-profile-data';

interface UserProfileContextType {
  profileData: UserProfileData;
  setProfileData: (data: Partial<UserProfileData>) => void;
  resetProfileData: () => void;
  isDirty: boolean;
}

// Default empty profile data
const defaultProfileData: UserProfileData = {
  skills: [],
};

// Create context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Debounce function for session storage updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  // Initialize state from session storage or default
  const [profileData, setProfileDataState] = useState<UserProfileData>(() => {
    if (typeof window === 'undefined') return defaultProfileData;
    
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : defaultProfileData;
    } catch (error) {
      console.error('Error loading profile data from session storage:', error);
      return defaultProfileData;
    }
  });
  
  const [isDirty, setIsDirty] = useState(false);
  
  // Debounce profile data for session storage updates
  const debouncedProfileData = useDebounce(profileData, 500);
  
  // Update session storage when profile data changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedProfileData));
    } catch (error) {
      console.error('Error saving profile data to session storage:', error);
    }
  }, [debouncedProfileData]);
  
  // Update profile data (partial updates)
  const setProfileData = (data: Partial<UserProfileData>) => {
    setProfileDataState(prev => {
      const updated = { ...prev, ...data };
      setIsDirty(true);
      return updated;
    });
  };
  
  // Reset profile data to default
  const resetProfileData = () => {
    setProfileDataState(defaultProfileData);
    setIsDirty(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };
  
  return (
    <UserProfileContext.Provider value={{ 
      profileData, 
      setProfileData, 
      resetProfileData,
      isDirty
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

// Custom hook to use the profile context
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  
  return context;
}
