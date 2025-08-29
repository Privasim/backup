import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatboxLayout from '../ChatboxLayout';
import { ChatboxProvider } from '../ChatboxProvider';

// Mock the RightDockSwitcher component
jest.mock('@/features/messenger/components/RightDockSwitcher', () => ({
  RightDockSwitcher: ({ visible, onClose, className }: any) => (
    <div data-testid="mock-right-dock-switcher" className={className}>
      {visible ? 'Visible' : 'Hidden'}
      <button data-testid="mock-close-button" onClick={onClose}>Close</button>
    </div>
  )
}));

// Mock useChatbox hook
const mockCloseChatbox = jest.fn();
const mockIsVisible = jest.fn().mockReturnValue(true);

jest.mock('../ChatboxProvider', () => ({
  useChatbox: () => ({
    isVisible: mockIsVisible(),
    closeChatbox: mockCloseChatbox,
    status: 'idle',
    messages: [],
    error: null,
    clearMessages: jest.fn(),
    getActivePlugins: jest.fn().mockReturnValue([]),
    useMockData: false,
    toggleMockData: jest.fn(),
    profileData: null,
    conversations: [],
    activeConversationId: null
  }),
  ChatboxProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ChatboxLayout Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsVisible.mockReturnValue(true);
  });

  test('renders RightDockSwitcher with correct props', () => {
    render(
      <ChatboxProvider>
        <ChatboxLayout>
          <div>Content</div>
        </ChatboxLayout>
      </ChatboxProvider>
    );

    // Check that RightDockSwitcher is rendered
    const rightDockSwitcher = screen.getByTestId('mock-right-dock-switcher');
    expect(rightDockSwitcher).toBeInTheDocument();
    expect(rightDockSwitcher).toHaveTextContent('Visible');
    
    // Check that content is rendered
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('passes visibility state to RightDockSwitcher', () => {
    mockIsVisible.mockReturnValue(false);
    
    render(
      <ChatboxProvider>
        <ChatboxLayout>
          <div>Content</div>
        </ChatboxLayout>
      </ChatboxProvider>
    );

    // RightDockSwitcher should not be visible
    expect(screen.queryByTestId('mock-right-dock-switcher')).not.toBeInTheDocument();
  });

  test('passes closeChatbox function to RightDockSwitcher', () => {
    render(
      <ChatboxProvider>
        <ChatboxLayout>
          <div>Content</div>
        </ChatboxLayout>
      </ChatboxProvider>
    );

    // Click the close button in the RightDockSwitcher
    fireEvent.click(screen.getByTestId('mock-close-button'));
    
    // Check that closeChatbox was called
    expect(mockCloseChatbox).toHaveBeenCalledTimes(1);
  });

  test('applies correct styling based on position prop', () => {
    render(
      <ChatboxProvider>
        <ChatboxLayout position="left">
          <div>Content</div>
        </ChatboxLayout>
      </ChatboxProvider>
    );

    // Check that the dock is positioned on the left
    const dockContainer = screen.getByTestId('mock-right-dock-switcher').parentElement;
    expect(dockContainer).toHaveClass('left-0');
    expect(dockContainer).not.toHaveClass('right-0');
  });
});
