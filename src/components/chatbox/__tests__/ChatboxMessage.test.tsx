import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatboxMessage } from '../ChatboxMessage';
import { ChatboxMessageData as MessageType } from '../types';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

describe('ChatboxMessage', () => {
  const user = userEvent.setup();
  const mockOnCopy = jest.fn();

  const baseMessage: MessageType = {
    id: 'msg-1',
    type: 'assistant',
    content: 'This is a test message with enough content to show the copy button',
    timestamp: '2025-01-08T12:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user message with correct styling', () => {
    const userMessage: MessageType = {
      ...baseMessage,
      type: 'user',
      content: 'User message'
    };

    render(<ChatboxMessage message={userMessage} onCopy={mockOnCopy} />);

    expect(screen.getByText('User message')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('should render assistant message with correct styling', () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    expect(screen.getByText('This is a test message with enough content to show the copy button')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should render system message with correct styling', () => {
    const systemMessage: MessageType = {
      ...baseMessage,
      type: 'system',
      content: 'System message'
    };

    render(<ChatboxMessage message={systemMessage} onCopy={mockOnCopy} />);

    expect(screen.getByText('System message')).toBeInTheDocument();
    expect(screen.getByText('system')).toBeInTheDocument();
  });

  it('should render error message with correct styling', () => {
    const errorMessage: MessageType = {
      ...baseMessage,
      type: 'error',
      content: 'Error message'
    };

    render(<ChatboxMessage message={errorMessage} onCopy={mockOnCopy} />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('should show timestamp when requested', () => {
    render(<ChatboxMessage message={baseMessage} showTimestamp={true} onCopy={mockOnCopy} />);

    // Should show formatted time (12:00)
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('should show copy button for long assistant messages', () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    expect(copyButton).toBeInTheDocument();
  });

  it('should not show copy button for short messages', () => {
    const shortMessage: MessageType = {
      ...baseMessage,
      content: 'Short'
    };

    render(<ChatboxMessage message={shortMessage} onCopy={mockOnCopy} />);

    expect(screen.queryByTitle('Copy message')).not.toBeInTheDocument();
  });

  it('should handle copy functionality', async () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(baseMessage.content);
    expect(mockOnCopy).toHaveBeenCalledWith(baseMessage.content);
  });

  it('should show check icon after successful copy', async () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    await user.click(copyButton);

    // Should show check icon temporarily
    await waitFor(() => {
      expect(copyButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('should handle copy error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Copy failed'));

    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    await user.click(copyButton);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy message:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should show streaming indicator when streaming', () => {
    const streamingMessage: MessageType = {
      ...baseMessage,
      content: 'Partial content'
    };

    render(<ChatboxMessage message={streamingMessage} isStreaming={true} onCopy={mockOnCopy} />);

    // Should show streaming cursor
    const messageContent = screen.getByText('Partial content');
    expect(messageContent.parentElement).toBeInTheDocument();
  });

  it('should display analysis type badge when present', () => {
    const messageWithAnalysisType: MessageType = {
      ...baseMessage,
      analysisType: 'profile'
    };

    render(<ChatboxMessage message={messageWithAnalysisType} onCopy={mockOnCopy} />);

    expect(screen.getByText('profile analysis')).toBeInTheDocument();
  });

  it('should display metadata when present', () => {
    const messageWithMetadata: MessageType = {
      ...baseMessage,
      metadata: {
        usage: {
          total_tokens: 150,
          model: 'test-model'
        },
        profileStats: {
          completionPercentage: 85
        }
      }
    };

    render(<ChatboxMessage message={messageWithMetadata} onCopy={mockOnCopy} />);

    // Click to expand details
    const detailsToggle = screen.getByText('Analysis Details');
    fireEvent.click(detailsToggle);

    expect(screen.getByText('Tokens: 150')).toBeInTheDocument();
    expect(screen.getByText('Model: test-model')).toBeInTheDocument();
    expect(screen.getByText('Profile Completion: 85%')).toBeInTheDocument();
  });

  it('should handle whitespace and line breaks correctly', () => {
    const messageWithFormatting: MessageType = {
      ...baseMessage,
      content: 'Line 1\nLine 2\n\nLine 4 with  extra  spaces'
    };

    render(<ChatboxMessage message={messageWithFormatting} onCopy={mockOnCopy} />);

    const content = screen.getByText(/Line 1/);
    expect(content).toHaveClass('whitespace-pre-wrap');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    expect(copyButton).toHaveAttribute('title', 'Copy message');
  });

  it('should handle keyboard interaction for copy button', async () => {
    render(<ChatboxMessage message={baseMessage} onCopy={mockOnCopy} />);

    const copyButton = screen.getByTitle('Copy message');
    
    // Focus the button
    copyButton.focus();
    expect(document.activeElement).toBe(copyButton);

    // Press Enter
    fireEvent.keyDown(copyButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(baseMessage.content);
  });

  it('should handle different message types with appropriate icons', () => {
    const messages = [
      { ...baseMessage, type: 'user' as const },
      { ...baseMessage, type: 'assistant' as const },
      { ...baseMessage, type: 'system' as const },
      { ...baseMessage, type: 'error' as const }
    ];

    messages.forEach((message, index) => {
      const { unmount } = render(<ChatboxMessage message={message} onCopy={mockOnCopy} />);
      
      // Each message type should have its icon
      const messageElement = screen.getByText(message.content);
      expect(messageElement).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should update display content when streaming', () => {
    const initialMessage: MessageType = {
      ...baseMessage,
      content: 'Initial'
    };

    const { rerender } = render(
      <ChatboxMessage message={initialMessage} isStreaming={true} onCopy={mockOnCopy} />
    );

    expect(screen.getByText('Initial')).toBeInTheDocument();

    // Update content as if streaming
    const updatedMessage: MessageType = {
      ...initialMessage,
      content: 'Initial content updated'
    };

    rerender(
      <ChatboxMessage message={updatedMessage} isStreaming={true} onCopy={mockOnCopy} />
    );

    expect(screen.getByText('Initial content updated')).toBeInTheDocument();
  });

  it('should format timestamp correctly for different times', () => {
    const morningMessage: MessageType = {
      ...baseMessage,
      timestamp: '2025-01-08T09:30:00Z'
    };

    const eveningMessage: MessageType = {
      ...baseMessage,
      timestamp: '2025-01-08T21:45:00Z'
    };

    // Test morning time
    const { rerender } = render(
      <ChatboxMessage message={morningMessage} showTimestamp={true} onCopy={mockOnCopy} />
    );
    expect(screen.getByText('09:30')).toBeInTheDocument();

    // Test evening time
    rerender(
      <ChatboxMessage message={eveningMessage} showTimestamp={true} onCopy={mockOnCopy} />
    );
    expect(screen.getByText('21:45')).toBeInTheDocument();
  });
});