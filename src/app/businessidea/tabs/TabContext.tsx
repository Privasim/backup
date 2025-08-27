'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type TabContextType = {
  activeTab: TabId;
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
};

const TabContext = createContext<TabContextType | undefined>(undefined);

type TabProviderProps = {
  children: ReactNode;
  initialTab?: string;
};

// List of all valid tab IDs for type safety
export const validTabs = ['businessplan', 'userprofile', 'financials', 'tools', 'visualization', 'jobrisk', 'list', 'mobile', 'gotomarket-v2', 'artifact-studio', 'specs', 'implementation-plan'] as const;
export type TabId = typeof validTabs[number];

export function TabProvider({ children, initialTab = 'businessplan' }: TabProviderProps) {
  // Ensure the initialTab is valid, fallback to 'businessplan' if not
  const validatedInitialTab = validTabs.includes(initialTab as TabId) 
    ? initialTab as TabId 
    : 'businessplan';
  const [activeTab, setActiveTab] = useState<TabId>(validatedInitialTab);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab(): TabContextType {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
}
