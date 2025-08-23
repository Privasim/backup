import React, { createContext, useContext, ReactNode } from 'react';
import { useToolsRegistry, ToolsRegistryState } from './useToolsRegistry';

const ToolsRegistryContext = createContext<ToolsRegistryState | null>(null);

export interface ToolsProviderProps {
  children: ReactNode;
}

export function ToolsProvider({ children }: ToolsProviderProps) {
  const toolsRegistry = useToolsRegistry();
  
  return (
    <ToolsRegistryContext.Provider value={toolsRegistry}>
      {children}
    </ToolsRegistryContext.Provider>
  );
}

export function useToolsRegistryContext(): ToolsRegistryState {
  const context = useContext(ToolsRegistryContext);
  if (!context) {
    throw new Error('useToolsRegistryContext must be used within a ToolsProvider');
  }
  return context;
}
