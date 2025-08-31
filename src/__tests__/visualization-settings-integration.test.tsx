import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSettingsProvider } from '@/contexts/PlanSettingsContext';
import { PlanSettings } from '@/components/settings/PlanSettings';
import { getVisualizationComponent } from '@/components/visualizations/visualizationRegistry';

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

// Integration test component
const IntegrationTestComponent: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<string>('standard');
  
  const visualizationComponent = getVisualizationComponent(selectedType);
  
  return (
    <PlanSettingsProvider>
      <div>
        <PlanSettings 
          onSettingsChange={(type) => setSelectedType(type)}
        />
        <div data-testid="selected-visualization">
          {visualizationComponent?.displayName || 'None'}
        </div>
        <div data-testid="supports-timeline">
          {visualizationComponent?.supportsFeatures.includes('timeline') ? 'Yes' : 'No'}
        </div>
      </div>
    </PlanSettingsProvider>
  );
};

describe('Visualization Settings Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('completes full workflow from settings to visualization selection', async () => {
    const user = userEvent.setup();
    
    render(<IntegrationTestComponent />);
    
    // Initially shows standard view
    expect(screen.getByTestId('selected-visualization')).toHaveTextContent('Standard View');
    expect(screen.getByTestId('supports-timeline')).toHaveTextContent('No');
    
    // Open settings dropdown
    const selector = screen.getByRole('button', { name: /select visualization type/i });
    await user.click(selector);
    
    // Select timeline view
    const timelineOption = screen.getByRole('option', { name: /vertical timeline/i });
    await user.click(timelineOption);
    
    // Verify visualization component changed
    await waitFor(() => {
      expect(screen.getByTestId('selected-visualization')).toHaveTextContent('Vertical Timeline');
      expect(screen.getByTestId('supports-timeline')).toHaveTextContent('Yes');
    });
  });

  it('persists settings across component remounts', async () => {
    const user = userEvent.setup();
    
    // Mock stored settings
    const storedSettings = {
      settings: {
        visualizationType: 'vertical-timeline',
        sessionId: 'test-session',
        timestamp: Date.now(),
        version: '1.0.0',
      },
      metadata: {
        lastUpdated: Date.now(),
        userAgent: 'test',
        version: '1.0.0',
      },
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSettings));
    
    const { unmount } = render(<IntegrationTestComponent />);
    
    // Should load with timeline view
    expect(screen.getByTestId('selected-visualization')).toHaveTextContent('Vertical Timeline');
    
    // Unmount and remount
    unmount();
    render(<IntegrationTestComponent />);
    
    // Should still have timeline view
    expect(screen.getByTestId('selected-visualization')).toHaveTextContent('Vertical Timeline');
  });

  it('handles visualization registry correctly', () => {
    render(<IntegrationTestComponent />);
    
    // Test that registry functions work
    const standardComponent = getVisualizationComponent('standard');
    const timelineComponent = getVisualizationComponent('vertical-timeline');
    const invalidComponent = getVisualizationComponent('invalid');
    
    expect(standardComponent).toBeTruthy();
    expect(standardComponent?.displayName).toBe('Standard View');
    expect(standardComponent?.isDefault).toBe(true);
    
    expect(timelineComponent).toBeTruthy();
    expect(timelineComponent?.displayName).toBe('Vertical Timeline');
    expect(timelineComponent?.isDefault).toBe(false);
    
    expect(invalidComponent).toBeNull();
  });

  it('provides proper accessibility support', async () => {
    const user = userEvent.setup();
    
    render(<IntegrationTestComponent />);
    
    const selector = screen.getByRole('button', { name: /select visualization type/i });
    
    // Test keyboard navigation
    selector.focus();
    await user.keyboard('{Enter}');
    
    // Should open dropdown
    expect(screen.getByRole('option', { name: /standard view/i })).toBeInTheDocument();
    
    // Test escape key
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /standard view/i })).not.toBeInTheDocument();
    });
  });
});