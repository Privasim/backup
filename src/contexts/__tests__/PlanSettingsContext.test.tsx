import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSettingsProvider, usePlanSettings } from '../PlanSettingsContext';

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

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { settings, updateSettings, resetSettings } = usePlanSettings();
  
  return (
    <div>
      <div data-testid="visualization-type">{settings.visualizationType}</div>
      <div data-testid="session-id">{settings.sessionId}</div>
      <div data-testid="timestamp">{settings.timestamp}</div>
      <div data-testid="version">{settings.version}</div>
      
      <button 
        data-testid="update-to-timeline"
        onClick={() => updateSettings({ visualizationType: 'vertical-timeline' })}
      >
        Set Timeline
      </button>
      
      <button 
        data-testid="reset-settings"
        onClick={resetSettings}
      >
        Reset
      </button>
    </div>
  );
};

describe('PlanSettingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('provides default settings when no stored settings exist', () => {
    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    expect(screen.getByTestId('visualization-type')).toHaveTextContent('standard');
    expect(screen.getByTestId('version')).toHaveTextContent('1.0.0');
    expect(screen.getByTestId('session-id')).toHaveTextContent(/^session_/);
  });

  it('loads settings from localStorage', () => {
    const storedSettings = {
      settings: {
        visualizationType: 'vertical-timeline',
        sessionId: 'test-session',
        timestamp: 1234567890,
        version: '1.0.0',
      },
      metadata: {
        lastUpdated: 1234567890,
        userAgent: 'test',
        version: '1.0.0',
      },
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSettings));

    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    expect(screen.getByTestId('visualization-type')).toHaveTextContent('vertical-timeline');
    expect(screen.getByTestId('session-id')).toHaveTextContent('test-session');
  });

  it('updates settings and persists to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    await user.click(screen.getByTestId('update-to-timeline'));

    await waitFor(() => {
      expect(screen.getByTestId('visualization-type')).toHaveTextContent('vertical-timeline');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'plan-visualization-settings',
      expect.stringContaining('vertical-timeline')
    );
  });

  it('resets settings to defaults', async () => {
    const user = userEvent.setup();

    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    // First update to timeline
    await user.click(screen.getByTestId('update-to-timeline'));
    
    await waitFor(() => {
      expect(screen.getByTestId('visualization-type')).toHaveTextContent('vertical-timeline');
    });

    // Then reset
    await user.click(screen.getByTestId('reset-settings'));

    await waitFor(() => {
      expect(screen.getByTestId('visualization-type')).toHaveTextContent('standard');
    });
  });

  it('handles invalid stored settings gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    expect(screen.getByTestId('visualization-type')).toHaveTextContent('standard');
  });

  it('handles version mismatch in stored settings', () => {
    const storedSettings = {
      settings: {
        visualizationType: 'vertical-timeline',
        sessionId: 'test-session',
        timestamp: 1234567890,
        version: '0.9.0', // Old version
      },
      metadata: {
        lastUpdated: 1234567890,
        userAgent: 'test',
        version: '0.9.0',
      },
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSettings));

    render(
      <PlanSettingsProvider>
        <TestComponent />
      </PlanSettingsProvider>
    );

    // Should fall back to defaults due to version mismatch
    expect(screen.getByTestId('visualization-type')).toHaveTextContent('standard');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePlanSettings must be used within a PlanSettingsProvider');

    consoleSpy.mockRestore();
  });
});