import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FinancialsProvider, useFinancials } from '../FinancialsContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock as any;

describe('FinancialsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide initial workbook state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { result } = renderHook(() => useFinancials(), { wrapper });
    
    expect(result.current.workbook).toBeDefined();
    expect(result.current.workbook.activeSheetId).toBe('sheet1');
    expect(result.current.sheet).toBeDefined();
  });

  it('should allow setting cell input', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { result } = renderHook(() => useFinancials(), { wrapper });
    
    act(() => {
      result.current.setCellInput('A1', 'Test Value');
    });
    
    expect(result.current.sheet.cells['A1']).toBeDefined();
    expect(result.current.sheet.cells['A1'].input).toBe('Test Value');
  });

  it('should allow adding a new sheet', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { result } = renderHook(() => useFinancials(), { wrapper });
    
    act(() => {
      result.current.addSheet('Test Sheet');
    });
    
    expect(Object.keys(result.current.workbook.sheets)).toHaveLength(2);
    expect(result.current.workbook.sheets['sheet2']).toBeDefined();
    expect(result.current.workbook.sheets['sheet2'].name).toBe('Test Sheet');
  });
});
