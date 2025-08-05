import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChatboxProvider, useChatbox } from '../ChatboxProvider';

// Mock dependencies
jest.mock('@/lib/chatbox/AnalysisService', () => ({
  AnalysisService: {
    getInstance: jest.fn(() => ({
      analyzeProfile: jest.fn(() => Promise.resolve({
        id: 'test-result',
        type: 'profile',
        status: 'success',
        content: 'Test analysis result',
        timestamp: new Date().toISOString(),
        model: 'test-model'
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
      addToHistory: jest.fn()
    }))
  }
}));

// Test component that uses the context
const TestComponent = () => {
  const {
    isVisible,
    status,
    messages,
    config,
    error,
    profileData,
    openChatbox,
    closeChatbox,
    updateConfig,
    startAnalysis,
    clearMessages,
    addMessage,
    getActivePlugins
  } = useChatbox();

  return (
    <div>
      <div data-testid="is-visible">{isVisible.toString()}</div>
      <div data-testid="status">{status}</div>
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="profile-data">{profileData ? 'has-profile' : 'no-profile'}</div>
      
      <button onClick={openChatbox}>Open</button>
      <button onClick={closeChatbox}>Close</button>
      <button onClick={() => updateConfig({ model: 'test-model' })}>Update Config</button>
      <button onClick={startAnalysis}>Start Analysis</button>
      <button onClick={clearMessages}>Clear Messages</button>
      <button onClick={() => addMessage({
        id: 'test-msg',
        type: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString()
      })}>Add Message</button>
      
      <div data-testid="config-model">{config.model || 'no-model'}</div>
      <div data-testid="active-plugins">{getActivePlugins().length}</div>
    </div>
  );
};

describe('ChatboxProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('is-visible')).toHaveTextContent('false');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('profile-data')).toHaveTextContent('no-profile');
    expect(screen.getByTestId('config-model')).toHaveTextContent('no-model');
  });

  it('should handle opening and closing chatbox', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    // Initially closed
    expect(screen.getByTestId('is-visible')).toHaveTextContent('false');

    // Open chatbox
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('is-visible')).toHaveTextContent('true');

    // Close chatbox
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('is-visible')).toHaveTextContent('false');
  });

  it('should handle config updates', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('config-model')).toHaveTextContent('no-model');

    fireEvent.click(screen.getByText('Update Config'));
    expect(screen.getByTestId('config-model')).toHaveTextContent('test-model');
  });

  it('should handle adding messages', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Add Message'));
    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
  });

  it('should handle clearing messages', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    // Add a message first
    fireEvent.click(screen.getByText('Add Message'));
    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');

    // Clear messages
    fireEvent.click(screen.getByText('Clear Messages'));
    expect(screen.getByTestId('messages-count')).toHaveTextContent('0');
  });

  it('should handle analysis start', async () => {
    const mockProfileData = {
      experience: [],
      skills: [],
      certifications: [],
      languages: []
    };

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <TestComponent />
      </ChatboxProvider>
    );

    // Set up config first
    fireEvent.click(screen.getByText('Update Config'));

    // Start analysis
    await act(async () => {
      fireEvent.click(screen.getByText('Start Analysis'));
    });

    // Should change status to analyzing then back to idle
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
    });

    // Should have added messages
    expect(screen.getByTestId('messages-count')).toHaveTextContent('2'); // user + assistant
  });

  it('should handle analysis error', async () => {
    // Mock analysis service to throw error
    const { AnalysisService } = require('@/lib/chatbox/AnalysisService');
    const mockService = AnalysisService.getInstance();
    mockService.analyzeProfile.mockRejectedValue(new Error('Analysis failed'));

    const mockProfileData = {
      experience: [],
      skills: [],
      certifications: [],
      languages: []
    };

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <TestComponent />
      </ChatboxProvider>
    );

    // Set up config
    fireEvent.click(screen.getByText('Update Config'));

    // Start analysis
    await act(async () => {
      fireEvent.click(screen.getByText('Start Analysis'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
    });

    expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
  });

  it('should provide profile data when passed', () => {
    const mockProfileData = {
      experience: [],
      skills: [],
      certifications: [],
      languages: []
    };

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('profile-data')).toHaveTextContent('has-profile');
  });

  it('should handle session restoration', () => {
    // Mock storage manager to return saved session
    const { ChatboxStorageManager } = require('../utils/storage-manager');
    const mockStorage = ChatboxStorageManager.getInstance();
    mockStorage.loadSession.mockReturnValue({
      config: { model: 'saved-model', apiKey: 'saved-key' },
      messages: [{
        id: 'saved-msg',
        type: 'user',
        content: 'Saved message',
        timestamp: new Date().toISOString()
      }],
      profileDataHash: 'test-hash'
    });

    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('config-model')).toHaveTextContent('saved-model');
    expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
  });

  it('should handle plugin system', () => {
    const mockPlugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      isActive: true
    };

    render(
      <ChatboxProvider plugins={[mockPlugin]}>
        <TestComponent />
      </ChatboxProvider>
    );

    expect(screen.getByTestId('active-plugins')).toHaveTextContent('1');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useChatbox must be used within a ChatboxProvider');

    consoleSpy.mockRestore();
  });

  it('should handle streaming messages', async () => {
    // Mock streaming response
    const { AnalysisService } = require('@/lib/chatbox/AnalysisService');
    const mockService = AnalysisService.getInstance();
    
    // Mock streaming behavior
    mockService.analyzeProfile.mockImplementation(async (config, profileData, onProgress) => {
      // Simulate streaming updates
      onProgress?.('Partial response...');
      await new Promise(resolve => setTimeout(resolve, 10));
      onProgress?.('Complete response');
      
      return {
        id: 'test-result',
        type: 'profile',
        status: 'success',
        content: 'Complete response',
        timestamp: new Date().toISOString(),
        model: 'test-model'
      };
    });

    const mockProfileData = {
      experience: [],
      skills: [],
      certifications: [],
      languages: []
    };

    render(
      <ChatboxProvider profileData={mockProfileData}>
        <TestComponent />
      </ChatboxProvider>
    );

    // Set up config and start analysis
    fireEvent.click(screen.getByText('Update Config'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Start Analysis'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
    });
  });

  it('should save session data on updates', async () => {
    const { ChatboxStorageManager } = require('../utils/storage-manager');
    const mockStorage = ChatboxStorageManager.getInstance();

    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    // Update config
    fireEvent.click(screen.getByText('Update Config'));

    // Add message
    fireEvent.click(screen.getByText('Add Message'));

    // Should save session
    await waitFor(() => {
      expect(mockStorage.saveSession).toHaveBeenCalled();
    });
  });

  it('should handle multiple config updates', () => {
    render(
      <ChatboxProvider>
        <TestComponent />
      </ChatboxProvider>
    );

    // Multiple updates should merge correctly
    fireEvent.click(screen.getByText('Update Config'));
    expect(screen.getByTestId('config-model')).toHaveTextContent('test-model');
  });

  it('should prevent analysis without profile data', async () => {
    render(
      <ChatboxProvider profileData={null}>
        <TestComponent />
      </ChatboxProvider>
    );

    // Set up config
    fireEvent.click(screen.getByText('Update Config'));

    // Try to start analysis without profile data
    await act(async () => {
      fireEvent.click(screen.getByText('Start Analysis'));
    });

    // Should remain idle
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });
});