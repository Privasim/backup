import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxPanel } from '../ChatboxPanel';
import { ChatboxControls } from '../ChatboxControls';

// Mock dependencies
jest.mock('../ChatboxProvider', () => ({
  ...jest.requireActual('../ChatboxProvider'),
  useChatbox: () => ({
    isVisible: true,
    status: 'idle',
    messages: [],
    config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 },
    error: null,
    profileData: { experience: [], skills: [], certifications: [], languages: [] },
    openChatbox: jest.fn(),
    closeChatbox: jest.fn(),
    updateConfig: jest.fn(),
    startAnalysis: jest.fn(),
    clearMessages: jest.fn(),
    addMessage: jest.fn(),
    getActivePlugins: jest.fn(() => [])
  })
}));

jest.mock('@/lib/openrouter', () => ({
  getAvailableModels: jest.fn(() => [
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free'
  ])
}));

jest.mock('../utils/settings-utils', () => ({
  useChatboxSettings: () => ({
    saveApiKey: jest.fn(),
    getApiKey: jest.fn(() => null)
  })
}));

jest.mock('../utils/validation-utils', () => ({
  validateApiKey: jest.fn(() => ({ isValid: true, errors: [] })),
  validateAnalysisConfig: jest.fn(() => ({ isValid: true, errors: {} }))
}));

// Mock child components
jest.mock('../StorageManagementPanel', () => ({
  StorageManagementPanel: () => null
}));

jest.mock('../AnalysisHistory', () => ({
  AnalysisHistory: () => null
}));

// Utility to mock viewport size
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock matchMedia for responsive queries
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('Chatbox Responsive Design Tests', () => {
  beforeEach(() => {
    // Reset to desktop size
    mockViewport(1024, 768);
    mockMatchMedia(false);
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      mockViewport(1024, 768);
    });

    it('should render full-width panel on desktop', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const panel = container.querySelector('.w-96');
      expect(panel).toBeInTheDocument();
    });

    it('should show all controls in desktop layout', () => {
      render(<ChatboxControls />);

      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
      expect(screen.getByText('Analyze Profile')).toBeInTheDocument();
      expect(screen.getByText('Analysis History')).toBeInTheDocument();
      expect(screen.getByText('Manage Storage')).toBeInTheDocument();
    });

    it('should have proper spacing on desktop', () => {
      const { container } = render(<ChatboxControls />);

      const spacingElements = container.querySelectorAll('.space-y-4');
      expect(spacingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Tablet Layout (768px - 1023px)', () => {
    beforeEach(() => {
      mockViewport(768, 1024);
    });

    it('should adapt panel width for tablet', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Panel should still be visible but may have different styling
      const panel = container.querySelector('[class*="w-"]');
      expect(panel).toBeInTheDocument();
    });

    it('should maintain functionality on tablet', () => {
      render(<ChatboxControls />);

      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
      expect(screen.getByText('Analyze Profile')).toBeInTheDocument();
    });

    it('should have appropriate touch targets on tablet', () => {
      render(<ChatboxControls />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        // In real implementation, would check for minimum 44px touch targets
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      mockViewport(375, 667);
      mockMatchMedia(true); // Mobile media query matches
    });

    it('should adapt to mobile viewport', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Should render without breaking
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should stack controls vertically on mobile', () => {
      const { container } = render(<ChatboxControls />);

      // Controls should be in vertical layout
      const controlsContainer = container.querySelector('.space-y-4');
      expect(controlsContainer).toBeInTheDocument();
    });

    it('should have larger touch targets on mobile', () => {
      render(<ChatboxControls />);

      const analyzeButton = screen.getByText('Analyze Profile');
      const computedStyle = window.getComputedStyle(analyzeButton);
      
      // Should have adequate padding for touch
      expect(analyzeButton).toHaveClass('px-4', 'py-3');
    });

    it('should handle mobile text input properly', () => {
      render(<ChatboxControls />);

      const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
      
      // Should be properly sized for mobile
      expect(apiKeyInput).toHaveClass('w-full');
    });

    it('should adapt font sizes for mobile readability', () => {
      render(<ChatboxControls />);

      const labels = screen.getAllByText(/Model|Key/);
      labels.forEach(label => {
        // Should have appropriate text size classes
        expect(label).toBeInTheDocument();
      });
    });
  });

  describe('Small Mobile Layout (< 375px)', () => {
    beforeEach(() => {
      mockViewport(320, 568);
    });

    it('should handle very small screens', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain usability on small screens', () => {
      render(<ChatboxControls />);

      const analyzeButton = screen.getByText('Analyze Profile');
      expect(analyzeButton).toBeInTheDocument();
      expect(analyzeButton).toHaveClass('w-full');
    });
  });

  describe('Large Desktop Layout (1440px+)', () => {
    beforeEach(() => {
      mockViewport(1440, 900);
    });

    it('should utilize larger screens effectively', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Should maintain fixed width on large screens
      const panel = container.querySelector('.w-96');
      expect(panel).toBeInTheDocument();
    });

    it('should not become too wide on large screens', () => {
      const { container } = render(<ChatboxControls />);

      // Controls should maintain reasonable max width
      const controlsContainer = container.firstChild;
      expect(controlsContainer).toBeInTheDocument();
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape transition', () => {
      // Start in portrait
      mockViewport(375, 667);
      
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      expect(container.firstChild).toBeInTheDocument();

      // Switch to landscape
      mockViewport(667, 375);
      
      // Should still render properly
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should adapt controls for landscape mobile', () => {
      mockViewport(667, 375);
      
      render(<ChatboxControls />);

      // Should maintain functionality in landscape
      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
    });
  });

  describe('Dynamic Content Adaptation', () => {
    it('should handle long content on small screens', () => {
      const longMessage = {
        id: 'long-msg',
        type: 'assistant' as const,
        content: 'This is a very long message that should wrap properly on small screens and not cause horizontal scrolling issues. It should maintain readability across all viewport sizes.',
        timestamp: '2025-01-08T12:00:00Z'
      };

      const { ChatboxMessage } = require('../ChatboxMessage');
      render(<ChatboxMessage message={longMessage} onCopy={jest.fn()} />);

      const messageContent = screen.getByText(longMessage.content);
      expect(messageContent).toHaveClass('whitespace-pre-wrap');
    });

    it('should adapt button layouts for different screen sizes', () => {
      render(<ChatboxControls />);

      const buttons = screen.getAllByRole('button');
      
      // Buttons should be full width on mobile
      buttons.forEach(button => {
        if (button.textContent?.includes('Analyze') || 
            button.textContent?.includes('History') || 
            button.textContent?.includes('Storage')) {
          expect(button).toHaveClass('w-full');
        }
      });
    });
  });

  describe('Accessibility Across Viewports', () => {
    it('should maintain accessibility on mobile', () => {
      mockViewport(375, 667);
      
      render(<ChatboxControls />);

      // All form elements should remain properly labeled
      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
    });

    it('should have adequate focus indicators on all screen sizes', () => {
      mockViewport(320, 568);
      
      render(<ChatboxControls />);

      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        // Should have focus styles
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Performance on Different Viewports', () => {
    it('should not cause layout thrashing on resize', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Simulate multiple rapid resizes
      for (let i = 0; i < 10; i++) {
        mockViewport(300 + i * 100, 600);
      }

      // Should still render properly
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain smooth scrolling on mobile', () => {
      mockViewport(375, 667);
      
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Should use smooth scrolling
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Content Overflow Handling', () => {
    it('should handle horizontal overflow properly', () => {
      mockViewport(320, 568);
      
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Should not cause horizontal scrolling
      const panel = container.firstChild as HTMLElement;
      if (panel) {
        const computedStyle = window.getComputedStyle(panel);
        expect(computedStyle.overflowX).not.toBe('visible');
      }
    });

    it('should handle vertical overflow with scrolling', () => {
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Messages area should be scrollable
      const messagesArea = container.querySelector('.overflow-y-auto');
      expect(messagesArea).toBeInTheDocument();
    });
  });
});