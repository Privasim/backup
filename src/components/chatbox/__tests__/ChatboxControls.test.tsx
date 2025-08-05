import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatboxControls } from '../ChatboxControls';

// Mock dependencies
jest.mock('@/lib/openrouter', () => ({
  getAvailableModels: jest.fn(() => [
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free',
    'moonshotai/kimi-k2:free'
  ])
}));

jest.mock('../utils/settings-utils', () => ({
  useChatboxSettings: () => ({
    saveApiKey: jest.fn(),
    getApiKey: jest.fn(() => 'saved-key')
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

// Mock the chatbox context
const mockChatboxContext = {
  config: {
    type: 'profile' as const,
    model: '',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 800
  },
  status: 'idle' as const,
  updateConfig: jest.fn(),
  startAnalysis: jest.fn(),
  profileData: {
    experience: [],
    skills: [],
    certifications: [],
    languages: []
  }
};

jest.mock('../ChatboxProvider', () => ({
  useChatbox: () => mockChatboxContext
}));

// Mock child components
jest.mock('../StorageManagementPanel', () => ({
  StorageManagementPanel: ({ isVisible, onClose }: any) => 
    isVisible ? <div data-testid="storage-panel">Storage Panel <button onClick={onClose}>Close</button></div> : null
}));

jest.mock('../AnalysisHistory', () => ({
  AnalysisHistory: ({ isVisible, onClose }: any) => 
    isVisible ? <div data-testid="history-panel">History Panel <button onClick={onClose}>Close</button></div> : null
}));

describe('ChatboxControls', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock context
    mockChatboxContext.config = {
      type: 'profile',
      model: '',
      apiKey: '',
      temperature: 0.7,
      maxTokens: 800
    };
    mockChatboxContext.status = 'idle';
  });

  it('should render model selection dropdown', () => {
    render(<ChatboxControls />);

    expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
    expect(screen.getByText('Select an AI model')).toBeInTheDocument();
  });

  it('should render API key input', () => {
    render(<ChatboxControls />);

    expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('sk-or-v1-...')).toBeInTheDocument();
  });

  it('should handle model selection', async () => {
    render(<ChatboxControls />);

    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    expect(mockChatboxContext.updateConfig).toHaveBeenCalledWith({
      model: 'qwen/qwen3-coder:free',
      apiKey: 'saved-key'
    });
  });

  it('should handle API key input', async () => {
    render(<ChatboxControls />);

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    await user.type(apiKeyInput, 'sk-or-v1-test-key');

    expect(mockChatboxContext.updateConfig).toHaveBeenCalledWith({
      apiKey: 'sk-or-v1-test-key'
    });
  });

  it('should handle API key paste', async () => {
    render(<ChatboxControls />);

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    
    // Simulate paste event
    fireEvent.paste(apiKeyInput, {
      clipboardData: {
        getData: () => 'sk-or-v1-pasted-key'
      }
    });

    expect(mockChatboxContext.updateConfig).toHaveBeenCalledWith({
      apiKey: 'sk-or-v1-pasted-key'
    });
  });

  it('should toggle API key visibility', async () => {
    render(<ChatboxControls />);

    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');
    expect(apiKeyInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    await user.click(toggleButton);

    expect(apiKeyInput).toHaveAttribute('type', 'text');
  });

  it('should show validation status for API key', () => {
    // Mock valid API key
    mockChatboxContext.config.apiKey = 'sk-or-v1-valid-key';
    
    render(<ChatboxControls />);

    // Should show validation icon (green checkmark)
    const validationIcon = screen.getByRole('img', { hidden: true });
    expect(validationIcon).toBeInTheDocument();
  });

  it('should disable analyze button when invalid config', () => {
    render(<ChatboxControls />);

    const analyzeButton = screen.getByText('Analyze Profile');
    expect(analyzeButton).toBeDisabled();
  });

  it('should enable analyze button when valid config', () => {
    mockChatboxContext.config = {
      type: 'profile',
      model: 'qwen/qwen3-coder:free',
      apiKey: 'sk-or-v1-valid-key',
      temperature: 0.7,
      maxTokens: 800
    };

    render(<ChatboxControls />);

    const analyzeButton = screen.getByText('Analyze Profile');
    expect(analyzeButton).not.toBeDisabled();
  });

  it('should handle analyze button click', async () => {
    mockChatboxContext.config = {
      type: 'profile',
      model: 'qwen/qwen3-coder:free',
      apiKey: 'sk-or-v1-valid-key',
      temperature: 0.7,
      maxTokens: 800
    };

    render(<ChatboxControls />);

    const analyzeButton = screen.getByText('Analyze Profile');
    await user.click(analyzeButton);

    expect(mockChatboxContext.startAnalysis).toHaveBeenCalled();
  });

  it('should show analyzing state', () => {
    mockChatboxContext.status = 'analyzing';

    render(<ChatboxControls />);

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('should show security notice', () => {
    render(<ChatboxControls />);

    expect(screen.getByText('Secure & Private')).toBeInTheDocument();
    expect(screen.getByText(/Your API key is stored locally/)).toBeInTheDocument();
  });

  it('should show message when no profile data', () => {
    mockChatboxContext.profileData = null;

    render(<ChatboxControls />);

    expect(screen.getByText('Complete your profile to enable analysis')).toBeInTheDocument();
  });

  it('should open analysis history panel', async () => {
    render(<ChatboxControls />);

    const historyButton = screen.getByText('Analysis History');
    await user.click(historyButton);

    expect(screen.getByTestId('history-panel')).toBeInTheDocument();
  });

  it('should open storage management panel', async () => {
    render(<ChatboxControls />);

    const storageButton = screen.getByText('Manage Storage');
    await user.click(storageButton);

    expect(screen.getByTestId('storage-panel')).toBeInTheDocument();
  });

  it('should close panels when close button clicked', async () => {
    render(<ChatboxControls />);

    // Open history panel
    const historyButton = screen.getByText('Analysis History');
    await user.click(historyButton);

    expect(screen.getByTestId('history-panel')).toBeInTheDocument();

    // Close panel
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('history-panel')).not.toBeInTheDocument();
    });
  });

  it('should show model description when selected', async () => {
    render(<ChatboxControls />);

    const modelSelect = screen.getByLabelText(/AI Model/);
    await user.selectOptions(modelSelect, 'qwen/qwen3-coder:free');

    expect(screen.getByText('Optimized for coding and analysis tasks')).toBeInTheDocument();
  });

  it('should show validation errors', () => {
    // Mock validation to return errors
    const { validateAnalysisConfig } = require('../utils/validation-utils');
    validateAnalysisConfig.mockReturnValue({
      isValid: false,
      errors: { model: 'Please select a model' }
    });

    render(<ChatboxControls />);

    // Trigger validation by interacting with form
    const modelSelect = screen.getByLabelText(/AI Model/);
    fireEvent.blur(modelSelect);

    expect(screen.getByText('Please select a model')).toBeInTheDocument();
  });

  it('should be accessible with proper labels and ARIA attributes', () => {
    render(<ChatboxControls />);

    // Check for required field indicators
    expect(screen.getAllByText('*')).toHaveLength(2);

    // Check for proper labeling
    expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
    expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();

    // Check button accessibility
    const analyzeButton = screen.getByRole('button', { name: /Analyze Profile/ });
    expect(analyzeButton).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    render(<ChatboxControls />);

    const modelSelect = screen.getByLabelText(/AI Model/);
    const apiKeyInput = screen.getByPlaceholderText('sk-or-v1-...');

    // Tab navigation
    modelSelect.focus();
    expect(document.activeElement).toBe(modelSelect);

    await user.tab();
    expect(document.activeElement).toBe(apiKeyInput);
  });

  it('should apply custom className', () => {
    const { container } = render(<ChatboxControls className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});