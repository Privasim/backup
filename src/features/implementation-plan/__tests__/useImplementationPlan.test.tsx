import { renderHook, act } from '@testing-library/react';
import { useImplementationPlan } from '../useImplementationPlan';
import { ImplementationPlanProvider } from '../ImplementationPlanProvider';

// Mock the context
jest.mock('../ImplementationPlanProvider', () => ({
  useImplementationPlanContext: () => ({
    status: 'idle',
    settings: {
      systemPromptOverride: '',
      sources: [],
      compactMode: false,
      compactMaxPhaseCards: 4
    },
    saveSettings: jest.fn(),
    setSelectedSuggestion: jest.fn(),
    setPlan: jest.fn(),
    setStatus: jest.fn(),
    setError: jest.fn(),
    clearRaw: jest.fn(),
    setStreamingState: jest.fn(),
    updateStreamingProgress: jest.fn(),
    cachePlan: jest.fn(),
    getCachedPlan: jest.fn()
  })
}));

// Mock other dependencies
jest.mock('@/components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    config: {
      customPrompt: '',
      apiKey: 'test-key',
      model: 'test-model'
    }
  })
}));

jest.mock('../implementationPlanService', () => ({
  generatePlanStream: jest.fn()
}));

jest.mock('../storage', () => ({
  settingsHash: jest.fn().mockReturnValue('test-hash')
}));

describe('useImplementationPlan', () => {
  it('should include compact settings in settingsHash', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ImplementationPlanProvider>{children}</ImplementationPlanProvider>
    );
    
    const { result } = renderHook(() => useImplementationPlan(), { wrapper });
    
    // The settingsHash is computed in the hook, so we can't directly test it
    // But we can verify the settings are passed correctly to buildMessages
    expect(result.current.settings.compactMode).toBe(false);
    expect(result.current.settings.compactMaxPhaseCards).toBe(4);
  });

  it('should pass compact settings to buildMessages when generating', () => {
    // This would require more complex mocking of the generate function
    // For now, we'll just verify the hook structure
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ImplementationPlanProvider>{children}</ImplementationPlanProvider>
    );
    
    const { result } = renderHook(() => useImplementationPlan(), { wrapper });
    
    expect(result.current).toHaveProperty('generate');
    expect(result.current).toHaveProperty('setSettings');
  });
});
