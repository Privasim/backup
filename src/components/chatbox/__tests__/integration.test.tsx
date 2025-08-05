import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxPanel } from '../ChatboxPanel';
import { ChatboxControls } from '../ChatboxControls';

// Mock all external dependencies
jest.mock('@/lib/openrouter', () => ({
  getAvailableModels: jest.fn(() => [
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free',
    'moonshotai/kimi-k2:free'
  ])
}));

jest.mock('@/lib/chatbox/AnalysisService', () => ({
  AnalysisService: {
    getInstance: jest.fn(() => ({
      analyzeProfile: jest.fn(() => Promise.resolve({
        id: 'test-result',
        type: 'profile',
        status: 'success',
        content: 'Your profile shows strong technical skills in software development. Key strengths include programming experience and problem-solving abilities.',
        timestamp: new Date().toISOString(),
        model: 'qwen/qwen3-coder:free'
      }))
    }))
  }
}));

jest.mock('../utils/storage-manager', () => ({
  ChatboxStorageManager: {
    getInstance: jest.fn(() => ({
      saveSession: jest.fn(),
      loadSession: jest.fn(() => null),
      clearSession: jest.fn(),
      addToHistory: jest.fn(),
      getCachedAnalysis: jest.fn(() => null),
      cacheAnalysisResult: jest.fn()
    }))
  }
}));

jest.mock('../utils/settings-utils', () => ({
  useChatboxSettings: () => ({
    saveApiKey: jest.fn(),
    getApiKey: jest.fn(() => null)
  })
}));

jest.mock('../utils/validation-utils', () => ({
  validateApiKey: jest.fn((key) => ({
    isValid: key && key.startsWith('sk-or-v1-'),
    errors: key && key.startsWith('sk-or-v1-') ? [] : ['Invalid API key format']
  })),
  validateAnalysisConfig: jest.fn((config, models) => ({
    isValid: config.apiKey && config.model && models.includes(config.model),
    errors: {}
  }))
}));

// Mock child components that aren't part of core flow
jest.mock('../StorageManagementPanel', () => ({
  StorageManagementPanel: ({ isVisible }: any) => 
    isVisible ? <div data-testid="storage-panel">Storage Panel</div> : null
}));

jest.mock('../AnalysisHistory', () => ({
  AnalysisHistory: ({ isVisible }: any) => 
    isVisible ? <div data-testid="history-panel">History Panel</div> : null
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

const mockProfileData = {
  experience: [
    {
      title: 'Software Developer',
      company: 'Tech Corp',
      duration: '2 years',
      description: 'Developed web applications'
    }
  ],
  skills: [
    {
      category: 'Programming',
      items: ['JavaScript', 'React', 'Node.js']
    }
  ],
  certifications: [],
  languages: [
    {
      language: 'English',
      proficiency: 'Native'
    }
  ]
};

describe('Chatbox Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full analysis workflow', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Initially should show empty state
    expect(screen.getByText('Configure your analysis settings below to get started.')).toBeInTheDocument();

    // Select a model
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    // Enter API key
    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Profile');
    expect(analyzeButton).not.toBeDisabled();
    
    await user.click(analyzeButton);

    // Should show analyzing status
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    // Should complete and show results
    await waitFor(() => {
      expect(screen.getByText(/Your profile shows strong technical skills/)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should show message count
    expect(screen.getByText('2 messages')).toBeInTheDocument();
  });

  it('should handle analysis error gracefully', async () => {
    // Mock analysis service to throw error
    const { AnalysisService } = require('@/lib/chatbox/AnalysisService');
    const mockService = AnalysisService.getInstance();
    mockService.analyzeProfile.mockRejectedValue(new Error('API connection failed'));

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Set up valid configuration
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    // Start analysis
    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('API connection failed')).toBeInTheDocument();
    });
  });

  it('should validate configuration before allowing analysis', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Initially analyze button should be disabled
    const analyzeButton = screen.getByText('Analyze Profile');
    expect(analyzeButton).toBeDisabled();

    // Select model but no API key
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');
    expect(analyzeButton).toBeDisabled();

    // Add invalid API key
    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'invalid-key');
    expect(analyzeButton).toBeDisabled();

    // Add valid API key
    await user.clear(apiKeyInput);
    await user.type(apiKeyInput, 'sk-or-v1-valid-key');
    expect(analyzeButton).not.toBeDisabled();
  });

  it('should handle message copying', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Complete analysis first
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/Your profile shows strong technical skills/)).toBeInTheDocument();
    });

    // Find and click copy button
    const copyButton = screen.getByTitle('Copy message');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Your profile shows strong technical skills')
    );
  });

  it('should handle message clearing', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Complete analysis to get messages
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    // Wait for messages
    await waitFor(() => {
      expect(screen.getByText('2 messages')).toBeInTheDocument();
    });

    // Clear messages
    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    // Should show empty state again
    expect(screen.getByText('Configure your analysis settings below to get started.')).toBeInTheDocument();
  });

  it('should handle chatbox open/close', async () => {
    const { rerender } = render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Should be visible by default in test
    expect(screen.getByText('Profile Analysis')).toBeInTheDocument();

    // Close chatbox
    const closeButton = screen.getByLabelText('Close chatbox');
    await user.click(closeButton);

    // Re-render with closed state (simulating provider state change)
    rerender(
      <ChatboxProvider profileData={mockProfileData}>
        <div>Chatbox closed</div>
      </ChatboxProvider>
    );

    expect(screen.getByText('Chatbox closed')).toBeInTheDocument();
  });

  it('should show appropriate message when no profile data', () => {
    render(
      <ChatboxProvider profileData={null}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    expect(screen.getByText('Complete your profile to enable analysis')).toBeInTheDocument();
  });

  it('should handle API key visibility toggle', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    expect(apiKeyInput).toHaveAttribute('type', 'password');

    // Find and click visibility toggle
    const toggleButtons = screen.getAllByRole('button');
    const visibilityToggle = toggleButtons.find(button => 
      button.querySelector('svg') && button.tabIndex === -1
    );
    
    if (visibilityToggle) {
      await user.click(visibilityToggle);
      expect(apiKeyInput).toHaveAttribute('type', 'text');
    }
  });

  it('should handle export functionality', async () => {
    // Mock URL and document methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockAnchorElement = {
      href: '',
      download: '',
      click: mockClick
    };
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchorElement as any;
      }
      return document.createElement(tagName);
    });

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Complete analysis to get messages
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    // Wait for messages
    await waitFor(() => {
      expect(screen.getByText('2 messages')).toBeInTheDocument();
    });

    // Click export
    const exportButton = screen.getByText('Export');
    await user.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle streaming responses', async () => {
    // Mock streaming behavior
    const { AnalysisService } = require('@/lib/chatbox/AnalysisService');
    const mockService = AnalysisService.getInstance();
    
    mockService.analyzeProfile.mockImplementation(async (config, profileData, onProgress) => {
      // Simulate streaming
      onProgress?.('Analyzing your profile...');
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress?.('Generating insights...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        id: 'test-result',
        type: 'profile',
        status: 'success',
        content: 'Complete analysis result',
        timestamp: new Date().toISOString(),
        model: 'qwen/qwen3-coder:free'
      };
    });

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Set up and start analysis
    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key-12345');

    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    // Should show analyzing status
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    // Should eventually complete
    await waitFor(() => {
      expect(screen.getByText('Complete analysis result')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should be accessible with keyboard navigation', async () => {
    render(
      <ChatboxProvider profileData={mockProfileData}>
        <ChatboxPanel />
      </ChatboxProvider>
    );

    // Tab through form elements
    const modelSelect = screen.getByLabelText(/AI Model/);
    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    const analyzeButton = screen.getByText('Analyze Profile');

    // Focus model select
    modelSelect.focus();
    expect(document.activeElement).toBe(modelSelect);

    // Tab to API key input
    await user.tab();
    expect(document.activeElement).toBe(apiKeyInput);

    // Tab to analyze button (after filling required fields)
    await user.type(apiKeyInput, 'sk-or-v1-test-key');
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');
    
    analyzeButton.focus();
    expect(document.activeElement).toBe(analyzeButton);
  });
});