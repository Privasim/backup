'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type ArtifactSubTabId = 'code' | 'preview';

type ArtifactSubTabContextType = {
  activeSubTab: ArtifactSubTabId;
  setActiveSubTab: React.Dispatch<React.SetStateAction<ArtifactSubTabId>>;
};

const ArtifactSubTabContext = createContext<ArtifactSubTabContextType | undefined>(undefined);

type ArtifactSubTabProviderProps = {
  children: ReactNode;
  initialTab?: ArtifactSubTabId;
};

export function ArtifactSubTabProvider({ 
  children, 
  initialTab = 'code' 
}: ArtifactSubTabProviderProps) {
  const [activeSubTab, setActiveSubTab] = useState<ArtifactSubTabId>(initialTab);

  return (
    <ArtifactSubTabContext.Provider value={{ activeSubTab, setActiveSubTab }}>
      {children}
    </ArtifactSubTabContext.Provider>
  );
}

export function useArtifactSubTab(): ArtifactSubTabContextType {
  const context = useContext(ArtifactSubTabContext);
  if (context === undefined) {
    throw new Error('useArtifactSubTab must be used within an ArtifactSubTabProvider');
  }
  return context;
}

export type { ArtifactSubTabId };