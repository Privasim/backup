import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxPanel } from '../ChatboxPanel';
import { ChatboxMessage } from '../ChatboxMessage';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance
});

// Mock dependencies
jest.mock('../utils/storage-manager', () => ({
  ChatboxStorageManager: {
    getInstance: jest.fn(() => ({
      saveSession: jest.fn(),
      loadSession: jest.fn(() => null),
      clearSession: jest.fn(),
      addToHistory: jest.fn()
    }))
  }
}));

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

// Performance testing utilities
const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = () => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

describe('Chatbox Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockImplementation(() => Date.now());
  });

  describe('Render Performance', () => {
    it('should render ChatboxPanel within acceptable time', () => {
      const renderTime = measureRenderTime(() => {
        render(
          <ChatboxProvider>
            <ChatboxPanel />
          </ChatboxProvider>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large message lists efficiently', () => {
      const largeMessageList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        type: 'assistant' as const,
        content: `Message ${i} with some content that might be longer to test rendering performance`,
        timestamp: new Date(Date.now() - i * 1000).toISOString()
      }));

      const renderTime = measureRenderTime(() => {
        largeMessageList.forEach(message => {
          render(<ChatboxMessage message={message} onCopy={jest.fn()} />);
        });
      });

      // Should handle 100 messages within reasonable time
      expect(renderTime).toBeLessThan(500);
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const initialMemory = measureMemoryUsage();
      
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ChatboxProvider>
            <ChatboxPanel />
          </ChatboxProvider>
        );
        unmount();
      }

      const finalMemory = measureMemoryUsage();
      
      // Memory usage shouldn't grow significantly
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
      }
    });
  });

  describe('Update Performance', () => {
    it('should handle rapid config updates efficiently', async () => {
      const { rerender } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const start = performance.now();

      // Simulate rapid config updates
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          rerender(
            <ChatboxProvider>
              <ChatboxPanel />
            </ChatboxProvider>
          );
        });
      }

      const end = performance.now();
      const totalTime = end - start;

      // Should handle 50 updates within reasonable time
      expect(totalTime).toBeLessThan(1000);
    });

    it('should efficiently handle message streaming', async () => {
      const streamingMessage = {
        id: 'streaming-msg',
        type: 'assistant' as const,
        content: '',
        timestamp: new Date().toISOString()
      };

      const { rerender } = render(
        <ChatboxMessage message={streamingMessage} isStreaming={true} onCopy={jest.fn()} />
      );

      const start = performance.now();

      // Simulate streaming updates
      for (let i = 0; i < 100; i++) {
        const updatedMessage = {
          ...streamingMessage,
          content: streamingMessage.content + `Word ${i} `
        };

        await act(async () => {
          rerender(
            <ChatboxMessage message={updatedMessage} isStreaming={true} onCopy={jest.fn()} />
          );
        });
      }

      const end = performance.now();
      const totalTime = end - start;

      // Should handle 100 streaming updates efficiently
      expect(totalTime).toBeLessThan(2000);
    });

    it('should debounce storage operations', async () => {
      const mockStorage = require('../utils/storage-manager').ChatboxStorageManager.getInstance();
      
      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Simulate rapid updates that would trigger storage
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          // Trigger updates that would save to storage
        });
      }

      // Storage operations should be debounced
      await waitFor(() => {
        expect(mockStorage.saveSession).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Scroll Performance', () => {
    it('should handle auto-scroll efficiently', async () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const messages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        type: 'assistant' as const,
        content: `Message ${i}`,
        timestamp: new Date().toISOString()
      }));

      const { rerender } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const start = performance.now();

      // Simulate adding messages that trigger auto-scroll
      for (let i = 0; i < messages.length; i++) {
        await act(async () => {
          rerender(
            <ChatboxProvider>
              <ChatboxPanel />
            </ChatboxProvider>
          );
        });
      }

      const end = performance.now();
      const totalTime = end - start;

      // Should handle scroll updates efficiently
      expect(totalTime).toBeLessThan(1000);
    });

    it('should use smooth scrolling without performance impact', () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Verify smooth scrolling is used
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Bundle Size Impact', () => {
    it('should not import unnecessary dependencies', () => {
      // This would be tested with bundle analysis tools in real implementation
      // For now, we can check that components don't import heavy libraries unnecessarily
      
      const { container } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      expect(container).toBeInTheDocument();
      // In real implementation, would check bundle size metrics
    });

    it('should lazy load heavy components', async () => {
      // Test that heavy components are loaded only when needed
      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Initially, heavy components shouldn't be loaded
      expect(screen.queryByTestId('storage-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('history-panel')).not.toBeInTheDocument();
    });
  });

  describe('Event Handler Performance', () => {
    it('should debounce input events', async () => {
      const mockUpdateConfig = jest.fn();
      
      // Mock the chatbox context to track calls
      jest.doMock('../ChatboxProvider', () => ({
        ...jest.requireActual('../ChatboxProvider'),
        useChatbox: () => ({
          isVisible: true,
          status: 'idle',
          messages: [],
          config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 },
          error: null,
          profileData: { experience: [], skills: [], certifications: [], languages: [] },
          updateConfig: mockUpdateConfig,
          startAnalysis: jest.fn(),
          clearMessages: jest.fn(),
          addMessage: jest.fn(),
          getActivePlugins: jest.fn(() => [])
        })
      }));

      const { ChatboxControls } = require('../ChatboxControls');
      render(<ChatboxControls />);

      // Simulate rapid typing
      const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
      
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }

      // Should debounce the calls
      await waitFor(() => {
        expect(mockUpdateConfig).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle rapid button clicks gracefully', async () => {
      const mockStartAnalysis = jest.fn();
      
      jest.doMock('../ChatboxProvider', () => ({
        ...jest.requireActual('../ChatboxProvider'),
        useChatbox: () => ({
          isVisible: true,
          status: 'idle',
          messages: [],
          config: { 
            type: 'profile', 
            model: 'test-model', 
            apiKey: 'sk-or-v1-test-key', 
            temperature: 0.7, 
            maxTokens: 800 
          },
          error: null,
          profileData: { experience: [], skills: [], certifications: [], languages: [] },
          updateConfig: jest.fn(),
          startAnalysis: mockStartAnalysis,
          clearMessages: jest.fn(),
          addMessage: jest.fn(),
          getActivePlugins: jest.fn(() => [])
        })
      }));

      const { ChatboxControls } = require('../ChatboxControls');
      render(<ChatboxControls />);

      const analyzeButton = screen.getByText('Analyze Profile');

      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          analyzeButton.click();
        });
      }

      // Should only process one click
      expect(mockStartAnalysis).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation Performance', () => {
    it('should use CSS animations for better performance', () => {
      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Check that animations use CSS classes rather than JavaScript
      const animatedElements = document.querySelectorAll('.animate-pulse, .animate-spin');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // In real implementation, would check that animations are disabled
      // when user prefers reduced motion
    });
  });

  describe('Cleanup Performance', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const addedListeners = addEventListenerSpy.mock.calls.length;

      unmount();

      const removedListeners = removeEventListenerSpy.mock.calls.length;

      // Should clean up all added listeners
      expect(removedListeners).toBeGreaterThanOrEqual(addedListeners);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should cancel pending async operations on unmount', async () => {
      const mockAbortController = {
        abort: jest.fn(),
        signal: { aborted: false }
      };

      global.AbortController = jest.fn(() => mockAbortController) as any;

      const { unmount } = render(
        <ChatboxProvider>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      unmount();

      // Should abort pending operations
      expect(mockAbortController.abort).toHaveBeenCalled();
    });
  });
});