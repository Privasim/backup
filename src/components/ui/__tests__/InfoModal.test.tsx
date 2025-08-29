import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InfoModal } from '../InfoModal';

describe('InfoModal', () => {
  const mockOnClose = jest.fn();
  const testTitle = 'Test Modal';
  const testContent = 'Modal content';

  beforeEach(() => {
    mockOnClose.mockClear();
    // Mock document.body methods
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      configurable: true,
    });
  });

  it('renders nothing when closed', () => {
    render(
      <InfoModal isOpen={false} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    expect(screen.queryByText(testContent)).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose} title={testTitle}>
        {testContent}
      </InfoModal>
    );
    
    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose} title={testTitle}>
        {testContent}
      </InfoModal>
    );
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when escape key is pressed', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    // Click on the backdrop (parent div of the modal)
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when clicking inside the modal', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    const modalContent = screen.getByText(testContent);
    fireEvent.mouseDown(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('applies correct size class based on size prop', () => {
    const { rerender } = render(
      <InfoModal isOpen={true} onClose={mockOnClose} size="sm">
        {testContent}
      </InfoModal>
    );
    
    expect(screen.getByRole('dialog').className).toContain('max-w-md');
    
    rerender(
      <InfoModal isOpen={true} onClose={mockOnClose} size="lg">
        {testContent}
      </InfoModal>
    );
    
    expect(screen.getByRole('dialog').className).toContain('max-w-2xl');
  });

  it('prevents body scrolling when open', () => {
    render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scrolling when closed', () => {
    const { rerender } = render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(
      <InfoModal isOpen={false} onClose={mockOnClose}>
        {testContent}
      </InfoModal>
    );
    
    expect(document.body.style.overflow).toBe('auto');
  });

  it('manages focus trap correctly', () => {
    // Mock focus-related functions
    const mockFocus = jest.fn();
    Element.prototype.focus = mockFocus;
    
    render(
      <InfoModal isOpen={true} onClose={mockOnClose}>
        <button>First Button</button>
        <button>Second Button</button>
      </InfoModal>
    );
    
    // Wait for the focus to be set after the timeout
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    expect(mockFocus).toHaveBeenCalled();
  });
});
