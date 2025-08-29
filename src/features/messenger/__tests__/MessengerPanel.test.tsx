import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessengerPanel } from '../components/MessengerPanel';
import { MessengerProvider } from '../contexts/MessengerProvider';
import { ChatboxControls } from '@/components/chatbox/ChatboxControls';

// Mock dependencies
jest.mock('@/components/chatbox/ChatboxControls', () => ({
  ChatboxControls: jest.fn(() => (
    <div data-testid="mock-chatbox-controls">
      <button data-testid="mock-model-select">Select Model</button>
      <button data-testid="mock-api-input">Enter API Key</button>
    </div>
  ))
}));

jest.mock('../contexts/MessengerProvider', () => {
  const originalModule = jest.requireActual('../contexts/MessengerProvider');
  
  return {
    ...originalModule,
    useMessenger: jest.fn(() => ({
      config: { model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' },
      status: 'idle',
      messages: [],
      error: undefined,
      updateConfig: jest.fn(),
      sendMessage: jest.fn(),
      stop: jest.fn(),
      clear: jest.fn(),
    }))
  };
});

jest.mock('@heroicons/react/24/outline', () => ({
  ArrowLeftIcon: () => <div data-testid="mock-arrow-left-icon" />,
  EllipsisVerticalIcon: () => <div data-testid="mock-ellipsis-icon" />,
  PaperAirplaneIcon: () => <div data-testid="mock-paper-airplane-icon" />,
  SparklesIcon: () => <div data-testid="mock-sparkles-icon" />,
  XMarkIcon: () => <div data-testid="mock-x-mark-icon" />,
  Cog6ToothIcon: () => <div data-testid="mock-cog-icon" />
}));

describe('MessengerPanel', () => {
  const renderMessengerPanel = () => {
    return render(
      <MessengerProvider>
        <MessengerPanel />
      </MessengerProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with initial state', () => {
    renderMessengerPanel();
    
    // Check header elements
    expect(screen.getByText('AI Messenger')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cog-icon')).toBeInTheDocument();
    
    // Check empty state
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    
    // Check composer is present
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByTestId('mock-paper-airplane-icon')).toBeInTheDocument();
  });

  test('toggles settings panel when settings button is clicked', () => {
    renderMessengerPanel();
    
    // Settings should be collapsed initially
    const settingsButton = screen.getByLabelText('Settings');
    
    // Click to expand
    fireEvent.click(settingsButton);
    
    // ChatboxControls should now be visible
    expect(screen.getByTestId('mock-chatbox-controls')).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(settingsButton);
    
    // Note: We can't easily test that it's hidden due to CSS transitions
    // but the click handler should have been called
  });

  test('passes correct props to ChatboxControls', () => {
    renderMessengerPanel();
    
    // Expand settings
    fireEvent.click(screen.getByLabelText('Settings'));
    
    // Check ChatboxControls was rendered with correct props
    expect(ChatboxControls).toHaveBeenCalledWith(
      expect.objectContaining({
        controlSource: 'external',
        externalConfig: expect.objectContaining({
          model: 'test-model',
          apiKey: expect.any(String)
        }),
        onExternalConfigChange: expect.any(Function),
        forceMode: 'configOnly'
      }),
      expect.anything()
    );
  });

  test('handles message input and submission', () => {
    const { useMessenger } = require('../contexts/MessengerProvider');
    const mockSendMessage = jest.fn();
    
    useMessenger.mockReturnValue({
      config: { model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' },
      status: 'idle',
      messages: [],
      error: undefined,
      updateConfig: jest.fn(),
      sendMessage: mockSendMessage,
      stop: jest.fn(),
      clear: jest.fn(),
    });
    
    renderMessengerPanel();
    
    // Type a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Send the message
    const sendButton = screen.getByLabelText('Send');
    fireEvent.click(sendButton);
    
    // Check if sendMessage was called with correct content
    expect(mockSendMessage).toHaveBeenCalledWith({ content: 'Hello AI' });
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  test('shows stop button during streaming', () => {
    const { useMessenger } = require('../contexts/MessengerProvider');
    const mockStop = jest.fn();
    
    useMessenger.mockReturnValue({
      config: { model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' },
      status: 'streaming',
      messages: [],
      error: undefined,
      updateConfig: jest.fn(),
      sendMessage: jest.fn(),
      stop: mockStop,
      clear: jest.fn(),
    });
    
    renderMessengerPanel();
    
    // Stop button should be visible instead of send button
    const stopButton = screen.getByLabelText('Stop');
    expect(stopButton).toBeInTheDocument();
    
    // Click stop button
    fireEvent.click(stopButton);
    
    // Check if stop was called
    expect(mockStop).toHaveBeenCalled();
  });

  test('shows error message when present', () => {
    const { useMessenger } = require('../contexts/MessengerProvider');
    
    useMessenger.mockReturnValue({
      config: { model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' },
      status: 'error',
      messages: [],
      error: 'API key is invalid',
      updateConfig: jest.fn(),
      sendMessage: jest.fn(),
      stop: jest.fn(),
      clear: jest.fn(),
    });
    
    renderMessengerPanel();
    
    // Error message should be displayed
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('API key is invalid')).toBeInTheDocument();
  });

  test('clears conversation when clear button is clicked', () => {
    const { useMessenger } = require('../contexts/MessengerProvider');
    const mockClear = jest.fn();
    
    useMessenger.mockReturnValue({
      config: { model: 'test-model', apiKey: 'sk-or-v1-12345678901234567890123456789012' },
      status: 'idle',
      messages: [],
      error: undefined,
      updateConfig: jest.fn(),
      sendMessage: jest.fn(),
      stop: jest.fn(),
      clear: mockClear,
    });
    
    renderMessengerPanel();
    
    // Expand settings to see clear button
    fireEvent.click(screen.getByLabelText('Settings'));
    
    // Click clear button
    const clearButton = screen.getByText('Clear Conversation');
    fireEvent.click(clearButton);
    
    // Check if clear was called
    expect(mockClear).toHaveBeenCalled();
  });
});
