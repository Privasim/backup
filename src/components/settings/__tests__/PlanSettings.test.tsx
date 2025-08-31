import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanSettings } from '../PlanSettings';
import { PlanSettingsProvider } from '@/contexts/PlanSettingsContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <PlanSettingsProvider>
      {component}
    </PlanSettingsProvider>
  );
};

describe('PlanSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('compact mode', () => {
    it('renders compact selector', () => {
      renderWithProvider(<PlanSettings compact={true} />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveTextContent('Standard View');
    });

    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings compact={true} />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      expect(screen.getByRole('option', { name: /standard view/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /vertical timeline/i })).toBeInTheDocument();
    });

    it('changes visualization type when option selected', async () => {
      const user = userEvent.setup();
      const onSettingsChange = jest.fn();
      
      renderWithProvider(
        <PlanSettings compact={true} onSettingsChange={onSettingsChange} />
      );
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      const timelineOption = screen.getByRole('option', { name: /vertical timeline/i });
      await user.click(timelineOption);
      
      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith('vertical-timeline');
      });
    });
  });

  describe('full mode', () => {
    it('renders full settings interface', () => {
      renderWithProvider(<PlanSettings />);
      
      expect(screen.getByText('Visualization Type')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select visualization type/i })).toBeInTheDocument();
      expect(screen.getByText('Settings are automatically saved')).toBeInTheDocument();
    });

    it('shows preview when enabled', () => {
      renderWithProvider(<PlanSettings showPreview={true} />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Selected:')).toBeInTheDocument();
      expect(screen.getByText('Standard View')).toBeInTheDocument();
    });

    it('displays last updated timestamp', () => {
      renderWithProvider(<PlanSettings />);
      
      expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      selector.focus();
      await user.keyboard('{Enter}');
      
      expect(screen.getByRole('option', { name: /standard view/i })).toBeInTheDocument();
    });

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      selector.focus();
      await user.keyboard(' ');
      
      expect(screen.getByRole('option', { name: /standard view/i })).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      expect(screen.getByRole('option', { name: /standard view/i })).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /standard view/i })).not.toBeInTheDocument();
      });
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      const onSettingsChange = jest.fn();
      
      renderWithProvider(
        <PlanSettings onSettingsChange={onSettingsChange} />
      );
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      selector.focus();
      await user.keyboard('{ArrowDown}');
      
      await waitFor(() => {
        expect(onSettingsChange).toHaveBeenCalledWith('vertical-timeline');
      });
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      expect(selector).toHaveAttribute('aria-haspopup', 'listbox');
      expect(selector).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA expanded when opened', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      expect(selector).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper option roles and selection states', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      const standardOption = screen.getByRole('option', { name: /standard view/i });
      const timelineOption = screen.getByRole('option', { name: /vertical timeline/i });
      
      expect(standardOption).toHaveAttribute('aria-selected', 'true');
      expect(timelineOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = renderWithProvider(
        <PlanSettings className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('settings change callback', () => {
    it('calls onSettingsChange when visualization type changes', async () => {
      const user = userEvent.setup();
      const onSettingsChange = jest.fn();
      
      renderWithProvider(
        <PlanSettings onSettingsChange={onSettingsChange} />
      );
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      const timelineOption = screen.getByRole('option', { name: /vertical timeline/i });
      await user.click(timelineOption);
      
      expect(onSettingsChange).toHaveBeenCalledWith('vertical-timeline');
    });

    it('does not call onSettingsChange when not provided', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(<PlanSettings />);
      
      const selector = screen.getByRole('button', { name: /select visualization type/i });
      await user.click(selector);
      
      const timelineOption = screen.getByRole('option', { name: /vertical timeline/i });
      
      // Should not throw error
      expect(() => user.click(timelineOption)).not.toThrow();
    });
  });
});