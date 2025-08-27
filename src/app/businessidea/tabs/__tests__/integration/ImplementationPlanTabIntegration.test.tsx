import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabProvider } from '../../TabContext';
import TabContainer from '../../TabContainer';
import { SuggestionCard } from '@/components/business/SuggestionCard';
import { BusinessSuggestion } from '@/components/chatbox/types';

// Mock the chatbox provider
jest.mock('@/components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    conversations: [],
    activeConversationId: undefined,
    status: 'idle',
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
  })
}));

// Mock other providers
jest.mock('@/features/implementation-plan/ImplementationPlanProvider', () => ({
  ImplementationPlanProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useImplementationPlanContext: () => ({})
}));

jest.mock('@/features/specs-generator/SpecsGeneratorProvider', () => ({
  SpecsGeneratorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock BridgeConnector
jest.mock('../../BridgeConnector', () => {
  return function BridgeConnector() {
    return null;
  };
});

// Mock other tab components to avoid complex dependencies
jest.mock('../../BusinessPlanContent', () => {
  return function BusinessPlanContent() {
    return <div>Business Plan Content</div>;
  };
});

jest.mock('../../user-profile', () => {
  return function UserProfileTab() {
    return <div>User Profile Tab</div>;
  };
});

jest.mock('../../FinancialsContent', () => {
  return function FinancialsContent() {
    return <div>Financials Content</div>;
  };
});

jest.mock('../../ToolsContent', () => {
  return function ToolsContent() {
    return <div>Tools Content</div>;
  };
});

jest.mock('../../VisualizationContent', () => {
  return function VisualizationContent() {
    return <div>Visualization Content</div>;
  };
});

jest.mock('../../job-risk', () => {
  return function JobRiskAnalysisTab() {
    return <div>Job Risk Analysis Tab</div>;
  };
});

jest.mock('../../ListTab', () => {
  return function ListTab() {
    return <div>List Tab</div>;
  };
});

jest.mock('../../MobileTab', () => {
  return function MobileTab() {
    return <div>Mobile Tab</div>;
  };
});

jest.mock('../../GoToMarketV2Content', () => {
  return function GoToMarketV2Content() {
    return <div>Go To Market V2 Content</div>;
  };
});

jest.mock('../../artifact-studio', () => {
  return function ArtifactStudio() {
    return <div>Artifact Studio</div>;
  };
});

jest.mock('../../SpecsContent', () => ({
  SpecsContent: function SpecsContent() {
    return <div>Specs Content</div>;
  }
}));

describe('Implementation Plan Tab Integration', () => {
  const mockSuggestion: BusinessSuggestion = {
    id: 'test-suggestion-1',
    title: 'AI-Powered Task Manager',
    description: 'A smart task management app that uses AI to prioritize and organize tasks.',
    category: 'Productivity',
    targetMarket: 'Professionals and teams',
    estimatedStartupCost: '$50,000 - $100,000',
    viabilityScore: 85,
    keyFeatures: [
      'AI-powered task prioritization',
      'Team collaboration tools',
      'Smart scheduling'
    ],
    metadata: {
      timeToMarket: '6-9 months',
      marketSize: '$2.3B'
    }
  };

  it('renders implementation plan tab in navigation', () => {
    render(
      <TabProvider>
        <TabContainer />
      </TabProvider>
    );

    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
  });

  it('switches to implementation plan tab when clicked', async () => {
    render(
      <TabProvider>
        <TabContainer />
      </TabProvider>
    );

    const planTab = screen.getByLabelText('Plan');
    fireEvent.click(planTab);

    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });
  });

  it('shows empty state in implementation plan tab when no plan exists', async () => {
    render(
      <TabProvider initialTab="implementation-plan">
        <TabContainer />
      </TabProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
      expect(screen.getByText(/Generate an implementation plan by clicking/)).toBeInTheDocument();
    });
  });

  it('integrates with SuggestionCard to switch tabs on plan creation', async () => {
    const mockOnCreatePlan = jest.fn();

    const { rerender } = render(
      <TabProvider>
        <div>
          <SuggestionCard 
            suggestion={mockSuggestion} 
            onCreatePlan={mockOnCreatePlan}
          />
          <TabContainer />
        </div>
      </TabProvider>
    );

    // Click the "Create Implementation Plan" button
    const createPlanButton = screen.getByText('Create Implementation Plan');
    fireEvent.click(createPlanButton);

    // Should call the onCreatePlan callback
    expect(mockOnCreatePlan).toHaveBeenCalledWith(mockSuggestion, undefined);

    // Should switch to implementation plan tab and show empty state initially
    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });
  });

  it('handles tab switching between different tabs including implementation plan', async () => {
    render(
      <TabProvider>
        <TabContainer />
      </TabProvider>
    );

    // Start with business plan tab (default)
    expect(screen.getByText('Business Plan Content')).toBeInTheDocument();

    // Switch to implementation plan tab
    const planTab = screen.getByLabelText('Plan');
    fireEvent.click(planTab);

    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });

    // Switch to another tab
    const listTab = screen.getByLabelText('List');
    fireEvent.click(listTab);

    await waitFor(() => {
      expect(screen.getByText('List Tab')).toBeInTheDocument();
    });

    // Switch back to implementation plan tab
    fireEvent.click(planTab);

    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });
  });

  it('maintains tab state when switching between tabs', async () => {
    render(
      <TabProvider>
        <TabContainer />
      </TabProvider>
    );

    // Switch to implementation plan tab
    const planTab = screen.getByLabelText('Plan');
    fireEvent.click(planTab);

    await waitFor(() => {
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });

    // Switch to another tab and back
    const financialsTab = screen.getByLabelText('Financials');
    fireEvent.click(financialsTab);

    await waitFor(() => {
      expect(screen.getByText('Financials Content')).toBeInTheDocument();
    });

    // Switch back to implementation plan tab
    fireEvent.click(planTab);

    await waitFor(() => {
      // Should still show the empty state (state preserved)
      expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    });
  });
});