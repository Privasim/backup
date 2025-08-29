import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MessengerProvider, useMessenger } from '../contexts/MessengerProvider';
import { OpenRouterClient } from '@/lib/openrouter/client';
import { debugLog } from '@/components/debug/DebugConsole';

// Mock dependencies
jest.mock('@/lib/openrouter/client', () => {
  const mockStreamResponse = jest.fn();
  const mockNonStreamResponse = jest.fn();
  
  return {
    OpenRouterClient: jest.fn().mockImplementation(() => ({
      chat: jest.fn(async (request, options) => {
        if (options?.stream) {
          return mockStreamResponse(request, options);
        } else {
          return mockNonStreamResponse(request, options);
        }
      })
    })),
    getAvailableModels: jest.fn().mockReturnValue([
      'qwen/qwen3-coder:free',
      'z-ai/glm-4.5-air:free',
      'moonshotai/kimi-k2:free'
    ])
  };
});

jest.mock('@/components/debug/DebugConsole', () => ({
  debugLog: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    success: jest.fn()
  }
}));

// Test component that uses the messenger context
const TestComponent = () => {
  const {
    config,
    status,
    messages,
    error,
    updateConfig,
    sendMessage,
    stop,
    clear
  } = useMessenger();
  
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="config-model">{config.model}</div>
      <div data-testid="config-apikey">{config.apiKey ? 'has-key' : 'no-key'}</div>
      
      <button 
        data-testid="update-config" 
        onClick={() => updateConfig({ model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' })}
      >
        Update Config
      </button>
      
      <button 
        data-testid="send-message" 
        onClick={() => sendMessage({ content: 'Hello AI' })}
      >
        Send Message
      </button>
      
      <button 
        data-testid="stop-streaming" 
        onClick={stop}
      >
        Stop
      </button>
      
      <button 
        data-testid="clear-messages" 
        onClick={clear}
      >
        Clear
      </button>
    </div>
  );
};

describe('MessengerProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides default context values', () => {
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('message-count')).toHaveTextContent('0');
    expect(screen.getByTestId('config-model')).toHaveTextContent('');
    expect(screen.getByTestId('config-apikey')).toHaveTextContent('no-key');
  });
  
  test('updates configuration correctly', () => {
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    fireEvent.click(screen.getByTestId('update-config'));
    
    expect(screen.getByTestId('config-model')).toHaveTextContent('test-model');
    expect(screen.getByTestId('config-apikey')).toHaveTextContent('has-key');
    expect(debugLog.info).toHaveBeenCalledWith('Messenger', 'Updating configuration', expect.any(Object));
  });
  
  test('clears messages and errors', () => {
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    // First update config to valid values
    fireEvent.click(screen.getByTestId('update-config'));
    
    // Send a message
    const mockChat = (OpenRouterClient as jest.Mock).mock.results[0].value.chat;
    mockChat.mockResolvedValueOnce({
      choices: [{ message: { content: 'Hello Human' } }]
    });
    
    fireEvent.click(screen.getByTestId('send-message'));
    
    // Clear messages
    fireEvent.click(screen.getByTestId('clear-messages'));
    
    expect(screen.getByTestId('message-count')).toHaveTextContent('0');
    expect(debugLog.info).toHaveBeenCalledWith('Messenger', 'Clearing all messages');
  });
  
  test('shows error when sending message without config', async () => {
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    // Try to send without setting config
    fireEvent.click(screen.getByTestId('send-message'));
    
    expect(screen.getByTestId('error')).toHaveTextContent('API key and model are required');
    expect(debugLog.error).toHaveBeenCalledWith('Messenger', 'API key and model are required');
  });
  
  test('shows error when API key format is invalid', async () => {
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    // Update with invalid API key format
    act(() => {
      const { updateConfig } = (screen.getByTestId('update-config') as any).onclick();
      updateConfig({ model: 'test-model', apiKey: 'invalid-key' });
    });
    
    // Try to send message
    fireEvent.click(screen.getByTestId('send-message'));
    
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid API key format');
    expect(debugLog.error).toHaveBeenCalledWith(
      'Messenger', 
      'Invalid API key format', 
      expect.any(Object)
    );
  });
  
  test('handles non-streaming message sending', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Hello Human' } }],
      usage: { total_tokens: 50 }
    };
    
    const mockChat = jest.fn().mockResolvedValue(mockResponse);
    (OpenRouterClient as jest.Mock).mockImplementation(() => ({
      chat: mockChat
    }));
    
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    // Set valid config
    fireEvent.click(screen.getByTestId('update-config'));
    
    // Send non-streaming message
    await act(async () => {
      const { sendMessage } = (screen.getByTestId('send-message') as any).onclick();
      await sendMessage({ content: 'Hello AI', stream: false });
    });
    
    expect(mockChat).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'test-model',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello AI' })
        ])
      }),
      expect.objectContaining({ stream: false })
    );
    
    expect(debugLog.success).toHaveBeenCalledWith(
      'Messenger', 
      'Non-streaming response completed', 
      expect.any(Object)
    );
  });
  
  test('handles API errors gracefully', async () => {
    const mockError = new Error('API rate limit exceeded');
    const mockChat = jest.fn().mockRejectedValue(mockError);
    
    (OpenRouterClient as jest.Mock).mockImplementation(() => ({
      chat: mockChat
    }));
    
    render(
      <MessengerProvider>
        <TestComponent />
      </MessengerProvider>
    );
    
    // Set valid config
    fireEvent.click(screen.getByTestId('update-config'));
    
    // Send message that will fail
    await act(async () => {
      const { sendMessage } = (screen.getByTestId('send-message') as any).onclick();
      await sendMessage({ content: 'Hello AI' });
    });
    
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('error')).toHaveTextContent('Rate limit exceeded');
    expect(debugLog.error).toHaveBeenCalledWith(
      'Messenger',
      'Error in sendMessage: API rate limit exceeded',
      expect.any(Error),
      expect.any(String)
    );
  });
});
