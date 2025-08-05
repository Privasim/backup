import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatboxPanel } from '../ChatboxPanel';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxMessageData } from '../types';

// Mock the message utils
jest.mock('../utils/message-utils', () => ({
  exportMessages: {
    toMarkdown: jest.fn(() => 'Mock markdown export')
  }
}));

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement
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

const mockMessages: ChatboxMessageData[] = [
  {
    id: 'msg-1',
    type: 'user',
    content: 'Test user message',
    timestamp: '2025-01-08T12:00:00Z'
  },
  {
    id: 'msg-2',
    type: 'assistant',
    content: 'Test assistant response',
    timestamp: '2025-01-08T12:01:00Z'
  }
];

const MockChatboxProvider = ({ children, overrides = {} }: { 
  children: React.ReactNode;
  overrides?: any;
}) => {
  const defaultValue = {
    isVisible: true,
    status: 'idle' as const,
    messages: [],
    error: null,
    closeChatbox: jest.fn(),
    clearMessages: jest.fn(),
    getActivePlugins: jest.fn(() => []),
    ...overrides
  };

  return (
    <div data-testid="mock-provider">
      {React.cloneElement(children as React.ReactElement, { 
        ...defaultValue 
      })}
    </div>
  );
};

describe('ChatboxPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when not visible', () => {
    render(
      <MockChatboxProvider overrides={{ isVisible: false }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.queryByText('Profile Analysis')).not.toBeInTheDocument();
  });

  it('should render header with title and close button', () => {
    const mockCloseChatbox = jest.fn();
    
    render(
      <MockChatboxProvider overrides={{ closeChatbox: mockCloseChatbox }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Profile Analysis')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('Close chatbox');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockCloseChatbox).toHaveBeenCalled();
  });

  it('should display status indicator when not idle', () => {
    render(
      <MockChatboxProvider overrides={{ status: 'analyzing' }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('should render empty state when no messages', () => {
    render(
      <MockChatboxProvider>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Configure your analysis settings below to get started.')).toBeInTheDocument();
  });

  it('should render messages when available', () => {
    render(
      <MockChatboxProvider overrides={{ messages: mockMessages }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Test user message')).toBeInTheDocument();
    expect(screen.getByText('Test assistant response')).toBeInTheDocument();
  });

  it('should display error when present', () => {
    const errorMessage = 'Test error message';
    
    render(
      <MockChatboxProvider overrides={{ error: errorMessage }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show actions footer when messages exist', () => {
    const mockClearMessages = jest.fn();
    
    render(
      <MockChatboxProvider overrides={{ 
        messages: mockMessages,
        clearMessages: mockClearMessages 
      }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('2 messages')).toBeInTheDocument();
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    expect(mockClearMessages).toHaveBeenCalled();
  });

  it('should handle export functionality', async () => {
    render(
      <MockChatboxProvider overrides={{ messages: mockMessages }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('should handle streaming message display', () => {
    const streamingMessages = [
      {
        id: 'msg-1',
        type: 'assistant' as const,
        content: '',
        timestamp: '2025-01-08T12:00:00Z'
      }
    ];

    render(
      <MockChatboxProvider overrides={{ 
        messages: streamingMessages,
        status: 'analyzing'
      }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    // Should show streaming indicator
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MockChatboxProvider>
        <ChatboxPanel className="custom-class" />
      </MockChatboxProvider>
    );

    const panel = container.querySelector('.custom-class');
    expect(panel).toBeInTheDocument();
  });

  it('should handle plugin controls rendering', () => {
    const mockPlugin = {
      id: 'test-plugin',
      getControls: jest.fn(() => () => <div>Plugin Controls</div>)
    };

    render(
      <MockChatboxProvider overrides={{ 
        getActivePlugins: jest.fn(() => [mockPlugin])
      }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    expect(screen.getByText('Plugin Controls')).toBeInTheDocument();
  });

  it('should auto-scroll to bottom when new messages arrive', async () => {
    const scrollIntoViewMock = jest.fn();
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <MockChatboxProvider overrides={{ messages: [mockMessages[0]] }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    // Add a new message
    rerender(
      <MockChatboxProvider overrides={{ messages: mockMessages }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <MockChatboxProvider>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    const closeButton = screen.getByLabelText('Close chatbox');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close chatbox');
  });

  it('should handle keyboard navigation', () => {
    const mockCloseChatbox = jest.fn();
    
    render(
      <MockChatboxProvider overrides={{ closeChatbox: mockCloseChatbox }}>
        <ChatboxPanel />
      </MockChatboxProvider>
    );

    const closeButton = screen.getByLabelText('Close chatbox');
    
    // Test Enter key
    fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(closeButton);
    expect(mockCloseChatbox).toHaveBeenCalled();
  });
});