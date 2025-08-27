import { renderHook } from '@testing-library/react';
import { usePlanSync, isPlanConversation, getLatestPlanContent } from '../plan-sync';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { Conversation } from '@/components/chatbox/types';

// Mock the chatbox provider
jest.mock('@/components/chatbox/ChatboxProvider');
const mockUseChatbox = useChatbox as jest.MockedFunction<typeof useChatbox>;

// Mock tab state utilities
jest.mock('../tab-state', () => ({
  getImplementationPlanTabState: jest.fn(),
  setImplementationPlanTabState: jest.fn(),
  updateLastViewedPlanConversation: jest.fn(),
}));

describe('plan-sync utilities', () => {
  describe('isPlanConversation', () => {
    it('identifies plan conversations by title ending with " Plan"', () => {
      const conversation: Conversation = {
        id: 'test-1',
        title: 'My Business Plan',
        messages: [],
        unread: 0
      };

      expect(isPlanConversation(conversation)).toBe(true);
    });

    it('identifies plan conversations by title containing "Implementation"', () => {
      const conversation: Conversation = {
        id: 'test-2',
        title: 'Implementation Strategy',
        messages: [],
        unread: 0
      };

      expect(isPlanConversation(conversation)).toBe(true);
    });

    it('identifies plan conversations by title containing "Business Plan"', () => {
      const conversation: Conversation = {
        id: 'test-3',
        title: 'Business Plan for Startup',
        messages: [],
        unread: 0
      };

      expect(isPlanConversation(conversation)).toBe(true);
    });

    it('returns false for non-plan conversations', () => {
      const conversation: Conversation = {
        id: 'test-4',
        title: 'General Discussion',
        messages: [],
        unread: 0
      };

      expect(isPlanConversation(conversation)).toBe(false);
    });
  });

  describe('getLatestPlanContent', () => {
    it('returns empty string for conversation with no messages', () => {
      const conversation: Conversation = {
        id: 'test-1',
        title: 'Test Plan',
        messages: [],
        unread: 0
      };

      expect(getLatestPlanContent(conversation)).toBe('');
    });

    it('returns empty string for conversation with no assistant messages', () => {
      const conversation: Conversation = {
        id: 'test-2',
        title: 'Test Plan',
        messages: [
          {
            id: 'msg-1',
            type: 'user',
            content: 'Generate a plan',
            timestamp: '2023-01-01T00:00:00Z'
          }
        ],
        unread: 0
      };

      expect(getLatestPlanContent(conversation)).toBe('');
    });

    it('returns content from the latest assistant message', () => {
      const conversation: Conversation = {
        id: 'test-3',
        title: 'Test Plan',
        messages: [
          {
            id: 'msg-1',
            type: 'user',
            content: 'Generate a plan',
            timestamp: '2023-01-01T00:00:00Z'
          },
          {
            id: 'msg-2',
            type: 'assistant',
            content: 'First plan version',
            timestamp: '2023-01-01T00:01:00Z'
          },
          {
            id: 'msg-3',
            type: 'assistant',
            content: 'Updated plan version',
            timestamp: '2023-01-01T00:02:00Z'
          }
        ],
        unread: 0
      };

      expect(getLatestPlanContent(conversation)).toBe('Updated plan version');
    });
  });

  describe('usePlanSync', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns null for current plan content when no conversations exist', () => {
      mockUseChatbox.mockReturnValue({
        conversations: [],
        activeConversationId: undefined,
        status: 'idle',
        // Add other required properties with default values
        isVisible: false,
        messages: [],
        error: undefined,
        currentAnalysis: undefined,
        businessSuggestions: { suggestions: [], suggestionStatus: 'idle', suggestionError: undefined, lastGeneratedAt: undefined },
        plugins: [],
        providers: [],
        profileData: undefined,
        useMockData: false,
        openChatbox: jest.fn(),
        closeChatbox: jest.fn(),
        toggleChatbox: jest.fn(),
        updateConfig: jest.fn(),
        setProfileData: jest.fn(),
        addMessage: jest.fn(),
        clearMessages: jest.fn(),
        startAnalysis: jest.fn(),
        retryAnalysis: jest.fn(),
        registerPlugin: jest.fn(),
        unregisterPlugin: jest.fn(),
        getActivePlugins: jest.fn(),
        registerProvider: jest.fn(),
        getProvider: jest.fn(),
        saveSession: jest.fn(),
        loadSession: jest.fn(),
        clearStorage: jest.fn(),
        toggleMockData: jest.fn(),
        generateBusinessSuggestions: jest.fn(),
        clearBusinessSuggestions: jest.fn(),
        generatePlanOutline: jest.fn(),
        generateFullPlan: jest.fn(),
        setPlanStreamBridge: jest.fn(),
        openConversation: jest.fn(),
        createConversation: jest.fn(),
        addMessageToConversation: jest.fn(),
        appendToConversationMessage: jest.fn(),
        createPlanConversation: jest.fn(),
        config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 }
      });

      const { result } = renderHook(() => usePlanSync());

      expect(result.current.currentPlanContent).toBeNull();
      expect(result.current.getActivePlanConversation()).toBeNull();
    });

    it('returns plan content when plan conversation exists', () => {
      const planConversation: Conversation = {
        id: 'plan-1',
        title: 'My Business Plan',
        messages: [
          {
            id: 'msg-1',
            type: 'assistant',
            content: '# Implementation Plan\n\nThis is the plan content.',
            timestamp: '2023-01-01T00:00:00Z'
          }
        ],
        unread: 0
      };

      mockUseChatbox.mockReturnValue({
        conversations: [planConversation],
        activeConversationId: 'plan-1',
        status: 'completed',
        // Add other required properties with default values
        isVisible: false,
        messages: [],
        error: undefined,
        currentAnalysis: undefined,
        businessSuggestions: { suggestions: [], suggestionStatus: 'idle', suggestionError: undefined, lastGeneratedAt: undefined },
        plugins: [],
        providers: [],
        profileData: undefined,
        useMockData: false,
        openChatbox: jest.fn(),
        closeChatbox: jest.fn(),
        toggleChatbox: jest.fn(),
        updateConfig: jest.fn(),
        setProfileData: jest.fn(),
        addMessage: jest.fn(),
        clearMessages: jest.fn(),
        startAnalysis: jest.fn(),
        retryAnalysis: jest.fn(),
        registerPlugin: jest.fn(),
        unregisterPlugin: jest.fn(),
        getActivePlugins: jest.fn(),
        registerProvider: jest.fn(),
        getProvider: jest.fn(),
        saveSession: jest.fn(),
        loadSession: jest.fn(),
        clearStorage: jest.fn(),
        toggleMockData: jest.fn(),
        generateBusinessSuggestions: jest.fn(),
        clearBusinessSuggestions: jest.fn(),
        generatePlanOutline: jest.fn(),
        generateFullPlan: jest.fn(),
        setPlanStreamBridge: jest.fn(),
        openConversation: jest.fn(),
        createConversation: jest.fn(),
        addMessageToConversation: jest.fn(),
        appendToConversationMessage: jest.fn(),
        createPlanConversation: jest.fn(),
        config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 }
      });

      const { result } = renderHook(() => usePlanSync());

      expect(result.current.currentPlanContent).toBe('# Implementation Plan\n\nThis is the plan content.');
      expect(result.current.getActivePlanConversation()).toEqual(planConversation);
      expect(result.current.planGenerationStatus).toBe('completed');
    });

    it('maps chatbox status to plan generation status correctly', () => {
      mockUseChatbox.mockReturnValue({
        conversations: [],
        activeConversationId: undefined,
        status: 'analyzing',
        // Add other required properties with default values
        isVisible: false,
        messages: [],
        error: undefined,
        currentAnalysis: undefined,
        businessSuggestions: { suggestions: [], suggestionStatus: 'idle', suggestionError: undefined, lastGeneratedAt: undefined },
        plugins: [],
        providers: [],
        profileData: undefined,
        useMockData: false,
        openChatbox: jest.fn(),
        closeChatbox: jest.fn(),
        toggleChatbox: jest.fn(),
        updateConfig: jest.fn(),
        setProfileData: jest.fn(),
        addMessage: jest.fn(),
        clearMessages: jest.fn(),
        startAnalysis: jest.fn(),
        retryAnalysis: jest.fn(),
        registerPlugin: jest.fn(),
        unregisterPlugin: jest.fn(),
        getActivePlugins: jest.fn(),
        registerProvider: jest.fn(),
        getProvider: jest.fn(),
        saveSession: jest.fn(),
        loadSession: jest.fn(),
        clearStorage: jest.fn(),
        toggleMockData: jest.fn(),
        generateBusinessSuggestions: jest.fn(),
        clearBusinessSuggestions: jest.fn(),
        generatePlanOutline: jest.fn(),
        generateFullPlan: jest.fn(),
        setPlanStreamBridge: jest.fn(),
        openConversation: jest.fn(),
        createConversation: jest.fn(),
        addMessageToConversation: jest.fn(),
        appendToConversationMessage: jest.fn(),
        createPlanConversation: jest.fn(),
        config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 }
      });

      const { result } = renderHook(() => usePlanSync());

      expect(result.current.planGenerationStatus).toBe('idle'); // No plan conversation, so idle
    });
  });
});