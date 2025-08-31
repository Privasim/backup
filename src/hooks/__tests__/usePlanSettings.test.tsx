import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { PlanSettingsProvider } from '@/contexts/PlanSettingsContext';
import { usePlanSettings } from '../usePlanSettings';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlanSettingsProvider>{children}</PlanSettingsProvider>
);

describe('usePlanSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('provides default settings and utilities', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    expect(result.current.settings.visualizationType).toBe('standard');
    expect(result.current.hasCustomSettings).toBe(false);
    expect(result.current.visualizationOptions).toHaveLength(2);
    expect(result.current.isValidVisualizationType('standard')).toBe(true);
    expect(result.current.isValidVisualizationType('invalid')).toBe(false);
  });

  it('provides correct display names and descriptions', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    expect(result.current.getVisualizationDisplayName('standard')).toBe('Standard View');
    expect(result.current.getVisualizationDisplayName('vertical-timeline')).toBe('Vertical Timeline');
    expect(result.current.getVisualizationDescription('standard')).toContain('Traditional list-based');
    expect(result.current.getVisualizationDescription('vertical-timeline')).toContain('Timeline-based view');
  });

  it('safely updates settings with validation', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    act(() => {
      result.current.safeUpdateSettings({ visualizationType: 'vertical-timeline' });
    });

    expect(result.current.settings.visualizationType).toBe('vertical-timeline');
    expect(result.current.hasCustomSettings).toBe(true);
  });

  it('ignores invalid visualization types in safe update', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    act(() => {
      result.current.safeUpdateSettings({ 
        visualizationType: 'invalid-type' as any 
      });
    });

    // Should remain at default
    expect(result.current.settings.visualizationType).toBe('standard');
  });

  it('calculates settings age correctly', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    expect(result.current.settingsAge).toBeGreaterThan(0);
    expect(typeof result.current.settingsAge).toBe('number');
  });

  it('determines if settings are stale', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    // Fresh settings should not be stale
    expect(result.current.isSettingsStale).toBe(false);
  });

  it('provides visualization options with correct structure', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    const options = result.current.visualizationOptions;
    
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({
      value: 'standard',
      label: 'Standard View',
      description: 'Traditional list-based implementation plan view',
    });
    expect(options[1]).toEqual({
      value: 'vertical-timeline',
      label: 'Vertical Timeline',
      description: 'Timeline-based view with phases and milestones',
    });
  });

  it('validates session ID updates', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    act(() => {
      result.current.safeUpdateSettings({ sessionId: 'new-session-id' });
    });

    expect(result.current.settings.sessionId).toBe('new-session-id');
  });

  it('validates version updates', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    act(() => {
      result.current.safeUpdateSettings({ version: '2.0.0' });
    });

    expect(result.current.settings.version).toBe('2.0.0');
  });

  it('updates timestamp when making changes', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    const originalTimestamp = result.current.settings.timestamp;

    act(() => {
      result.current.safeUpdateSettings({ visualizationType: 'vertical-timeline' });
    });

    expect(result.current.settings.timestamp).toBeGreaterThan(originalTimestamp);
  });

  it('does not update when no valid changes provided', () => {
    const { result } = renderHook(() => usePlanSettings(), { wrapper });

    const originalTimestamp = result.current.settings.timestamp;

    act(() => {
      result.current.safeUpdateSettings({ 
        visualizationType: 'invalid-type' as any 
      });
    });

    expect(result.current.settings.timestamp).toBe(originalTimestamp);
  });
});