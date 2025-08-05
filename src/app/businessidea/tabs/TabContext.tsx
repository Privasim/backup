'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type TabContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabContext = createContext<TabContextType | undefined>(undefined);

type TabProviderProps = {
  children: ReactNode;
  initialTab?: string;
};

export function TabProvider({ children, initialTab = 'businessplan' }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

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
