import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightDockSwitcher } from '../RightDockSwitcher';

// Mock the ChatboxPanel and MessengerPanel components
jest.mock('@/components/chatbox/ChatboxPanel', () => ({
  __esModule: true,
  default: ({ className, onClose }: any) => (
    <div data-testid="mock-chatbox-panel" className={className}>
      ChatboxPanel Content
      <button data-testid="chatbox-back-button" onClick={onClose}>Back</button>
    </div>
  )
}));

jest.mock('../MessengerPanel', () => ({
  MessengerPanel: ({ className, onClose }: any) => (
    <div data-testid="mock-messenger-panel" className={className}>
      MessengerPanel Content
      <button data-testid="messenger-back-button" onClick={onClose}>Back</button>
    </div>
  )
}));

// Mock the MessengerProvider context
jest.mock('../../contexts/MessengerProvider', () => ({
  MessengerProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('RightDockSwitcher', () => {
  test('renders with tabs visible and chatbox panel active by default', () => {
    render(<RightDockSwitcher visible={true} />);
    
    // Check that tabs are visible
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Messenger')).toBeInTheDocument();
    
    // Check that ChatboxPanel is rendered by default
    expect(screen.getByTestId('mock-chatbox-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-messenger-panel')).not.toBeInTheDocument();
  });

  test('switches between panels when tabs are clicked', () => {
    render(<RightDockSwitcher visible={true} />);
    
    // Initially ChatboxPanel should be visible
    expect(screen.getByTestId('mock-chatbox-panel')).toBeInTheDocument();
    
    // Click on Messenger tab
    fireEvent.click(screen.getByText('Messenger'));
    
    // Now MessengerPanel should be visible and ChatboxPanel hidden
    expect(screen.getByTestId('mock-messenger-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-chatbox-panel')).not.toBeInTheDocument();
    
    // Click on Analysis tab
    fireEvent.click(screen.getByText('Analysis'));
    
    // ChatboxPanel should be visible again
    expect(screen.getByTestId('mock-chatbox-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-messenger-panel')).not.toBeInTheDocument();
  });

  test('back button in messenger panel switches to chatbox panel', () => {
    render(<RightDockSwitcher visible={true} />);
    
    // Switch to Messenger panel
    fireEvent.click(screen.getByText('Messenger'));
    expect(screen.getByTestId('mock-messenger-panel')).toBeInTheDocument();
    
    // Click back button in Messenger panel
    fireEvent.click(screen.getByTestId('messenger-back-button'));
    
    // Should switch back to ChatboxPanel
    expect(screen.getByTestId('mock-chatbox-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-messenger-panel')).not.toBeInTheDocument();
  });

  test('back button in chatbox panel calls onClose', () => {
    const mockOnClose = jest.fn();
    render(<RightDockSwitcher visible={true} onClose={mockOnClose} />);
    
    // Click back button in ChatboxPanel
    fireEvent.click(screen.getByTestId('chatbox-back-button'));
    
    // Should call onClose
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not render anything when visible is false', () => {
    render(<RightDockSwitcher visible={false} />);
    
    // Nothing should be rendered
    expect(screen.queryByText('Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('Messenger')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-chatbox-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-messenger-panel')).not.toBeInTheDocument();
  });
});
