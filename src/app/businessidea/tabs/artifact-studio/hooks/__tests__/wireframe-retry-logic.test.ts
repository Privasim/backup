import { renderHook, act, waitFor } from '@testing-library/react';
import { useArtifactGeneration } from '../useArtifactGeneration';

// Mock dependencies
jest.mock('@/components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    config: {
      apiKey: 'test-api-key',
      model: 'test-model'
    }
  })
}));

// Mock OpenRouter client with controllable responses
const mockChat = jest.fn();
jest.mock('@/lib/openrouter', () => ({
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    chat: mockChat
  }))
}));

jest.mock('../utils/transpile', () => ({
  transpileTsxToJs: jest.fn().mockResolvedValue({
    ok: true,
    js: 'compiled code'
  })
}));

describe('Wireframe Retry Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Static wireframe detection and retry', () => {
    it('should retry when wireframe is detected as static', async () => {
      // First call returns static wireframe
      mockChat
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                return React.createElement('div', { className: 'p-4' },
                  React.createElement('h1', {}, 'Static Title'),
                  React.createElement('p', {}, 'Static content')
                );
              }
              ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));`
            }
          }]
        })
        // Second call returns interactive wireframe
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                const [count, setCount] = React.useState(0);
                return React.createElement('div', { className: 'p-4' },
                  React.createElement('button', {
                    onClick: () => setCount(count + 1)
                  }, 'Count: ' + count)
                );
              }
              ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));`
            }
          }]
        });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create a counter');
      });

      // Should be in retrying state after first static response
      expect(result.current.status).toBe('retrying');
      expect(result.current.retryCount).toBe(1);
      expect(result.current.interactivity?.level).toBe('static');

      // Fast-forward timers to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('compiled');
      });

      // Should have made two API calls
      expect(mockChat).toHaveBeenCalledTimes(2);
      expect(result.current.retryCount).toBe(1);
      expect(result.current.interactivity?.level).not.toBe('static');
    });

    it('should use enhanced prompts for retries', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', {}, 'Static');
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create a button');
      });

      // Fast-forward to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledTimes(2);
      });

      // Second call should have enhanced prompt
      const secondCall = mockChat.mock.calls[1];
      const messages = secondCall[0].messages;
      const userMessage = messages.find((m: any) => m.role === 'user');
      
      expect(userMessage.content).toContain('more interactive');
      expect(userMessage.content).toContain('Missing patterns');
      expect(userMessage.content).toContain('React.useState');
    });

    it('should implement exponential backoff for retries', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', {}, 'Static');
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create a form');
      });

      // First retry should happen after 1000ms
      expect(result.current.status).toBe('retrying');
      
      act(() => {
        jest.advanceTimersByTime(999);
      });
      expect(mockChat).toHaveBeenCalledTimes(1);
      
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledTimes(2);
      });

      // Second retry should happen after 2000ms
      act(() => {
        jest.advanceTimersByTime(1999);
      });
      expect(mockChat).toHaveBeenCalledTimes(2);
      
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(mockChat).toHaveBeenCalledTimes(3);
      });
    });

    it('should limit retry attempts to maximum of 2', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', {}, 'Always static');
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create interactive component');
      });

      // Fast-forward through all retries
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
          // Wait for any pending state updates
        });
      }

      // Should have made exactly 3 calls (initial + 2 retries)
      expect(mockChat).toHaveBeenCalledTimes(3);
      expect(result.current.retryCount).toBe(2);
    });
  });

  describe('Auto-repair functionality', () => {
    it('should apply auto-repair after max retries', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', { className: 'container' },
                React.createElement('button', { className: 'btn' }, 'Click me')
              );
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create a button');
      });

      // Fast-forward through all retries
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
          // Wait for state updates
        });
      }

      // Should have applied auto-repair
      expect(result.current.code).toContain('React.useState');
      expect(result.current.code).toContain('onClick:');
      expect(result.current.code).toContain('setClickCount');
      expect(result.current.interactivity?.level).not.toBe('static');
    });

    it('should show auto-repair progress messages', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', {}, 'Static');
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create component');
      });

      // Fast-forward through retries
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
          // Wait for state updates
        });
      }

      // Should show auto-repair messages
      const errors = result.current.compile.errors;
      expect(errors.some(error => error.includes('Auto-repair'))).toBe(true);
      expect(errors.some(error => error.includes('useState hooks'))).toBe(true);
      expect(errors.some(error => error.includes('Click handlers'))).toBe(true);
    });

    it('should improve interactivity score after auto-repair', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', { className: 'container' },
                React.createElement('button', { className: 'btn' }, 'Button'),
                React.createElement('input', { className: 'input' })
              );
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create form');
      });

      const initialScore = result.current.interactivity?.score || 0;

      // Fast-forward through retries to trigger auto-repair
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
          // Wait for state updates
        });
      }

      const finalScore = result.current.interactivity?.score || 0;
      expect(finalScore).toBeGreaterThan(initialScore);
      expect(finalScore).toBeGreaterThan(30); // Should be at least partial
    });
  });

  describe('Retry error handling', () => {
    it('should handle network errors during retries', async () => {
      mockChat
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                return React.createElement('div', {}, 'Static');
              }`
            }
          }]
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create component');
      });

      // Fast-forward to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.compile.errors.some(error => 
        error.includes('Network error')
      )).toBe(true);
    });

    it('should handle API rate limiting during retries', async () => {
      mockChat
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                return React.createElement('div', {}, 'Static');
              }`
            }
          }]
        })
        .mockRejectedValueOnce(new Error('429 rate limit exceeded'));

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create component');
      });

      // Fast-forward to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      const errors = result.current.compile.errors;
      expect(errors.some(error => error.includes('rate limit'))).toBe(true);
      expect(errors.some(error => error.includes('wait a moment'))).toBe(true);
    });

    it('should cancel retries when generation is cancelled', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              return React.createElement('div', {}, 'Static');
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create component');
      });

      expect(result.current.status).toBe('retrying');

      // Cancel before retry happens
      act(() => {
        result.current.cancelGeneration();
      });

      expect(result.current.status).toBe('idle');

      // Fast-forward past retry time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not have made additional API calls
      expect(mockChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry with streaming', () => {
    it('should handle streaming retries correctly', async () => {
      const mockStreamingResponse = async (options: any) => {
        if (options.onChunk) {
          // Simulate streaming static response first
          const chunks = [
            'function WireframeComponent() {',
            '  return React.createElement(\'div\', {},',
            '    \'Static content\'',
            '  );',
            '}'
          ];
          
          for (const chunk of chunks) {
            options.onChunk(chunk);
          }
        }
      };

      mockChat
        .mockImplementationOnce(mockStreamingResponse)
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                const [count, setCount] = React.useState(0);
                return React.createElement('button', {
                  onClick: () => setCount(count + 1)
                }, count);
              }`
            }
          }]
        });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create counter', { streaming: true });
      });

      expect(result.current.status).toBe('retrying');
      expect(result.current.rawStream).toContain('Static content');

      // Fast-forward to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('compiled');
      });

      expect(mockChat).toHaveBeenCalledTimes(2);
      expect(result.current.interactivity?.level).not.toBe('static');
    });

    it('should accumulate streaming content correctly during retries', async () => {
      const mockStreamingResponse = async (options: any) => {
        if (options.onChunk) {
          const chunks = ['function ', 'WireframeComponent() {', ' return null; }'];
          for (const chunk of chunks) {
            options.onChunk(chunk);
          }
        }
      };

      mockChat.mockImplementation(mockStreamingResponse);

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create component', { streaming: true });
      });

      expect(result.current.rawStream).toBe('function WireframeComponent() { return null; }');
      expect(result.current.code).toContain('WireframeComponent');
    });
  });

  describe('Regenerate with enhancements', () => {
    it('should regenerate with enhanced prompt', async () => {
      // Initial generation returns partial wireframe
      mockChat
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                const [count, setCount] = React.useState(0);
                return React.createElement('div', {}, count);
              }`
            }
          }]
        })
        // Regeneration returns fully interactive wireframe
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: `function WireframeComponent() {
                const [count, setCount] = React.useState(0);
                return React.createElement('button', {
                  onClick: () => setCount(count + 1)
                }, 'Count: ' + count);
              }`
            }
          }]
        });

      const { result } = renderHook(() => useArtifactGeneration());

      await act(async () => {
        await result.current.generateFromPrompt('Create counter');
      });

      expect(result.current.interactivity?.level).toBe('partial');

      await act(async () => {
        await result.current.regenerateWithEnhancements();
      });

      expect(mockChat).toHaveBeenCalledTimes(2);
      expect(result.current.interactivity?.level).toBe('interactive');
      
      // Should have used enhanced prompt
      const secondCall = mockChat.mock.calls[1];
      const messages = secondCall[0].messages;
      const userMessage = messages.find((m: any) => m.role === 'user');
      expect(userMessage.content).toContain('more interactive');
    });

    it('should clear cache when regenerating with enhancements', async () => {
      mockChat.mockResolvedValue({
        choices: [{
          message: {
            content: `function WireframeComponent() {
              const [count, setCount] = React.useState(0);
              return React.createElement('button', {
                onClick: () => setCount(count + 1)
              }, count);
            }`
          }
        }]
      });

      const { result } = renderHook(() => useArtifactGeneration());

      // First generation
      await act(async () => {
        await result.current.generateFromPrompt('Create counter');
      });

      expect(result.current.cacheHit).toBe(false);

      // Second generation should hit cache
      await act(async () => {
        await result.current.generateFromPrompt('Create counter');
      });

      expect(result.current.cacheHit).toBe(true);

      // Regenerate with enhancements should clear cache
      await act(async () => {
        await result.current.regenerateWithEnhancements();
      });

      expect(result.current.cacheHit).toBe(false);
      expect(mockChat).toHaveBeenCalledTimes(3); // Initial + cached + regenerated
    });
  });
});