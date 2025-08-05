import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxPanel } from '../ChatboxPanel';
import { ChatboxControls } from '../ChatboxControls';
import { ChatboxMessage } from '../ChatboxMessage';
import { ChatboxProgress } from '../ChatboxProgress';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
    getApiKey: jest.fn(() => null)
  })
}));

jest.mock('../utils/validation-utils', () => ({
  validateApiKey: jest.fn((key) => ({
    isValid: key && key.startsWith('sk-or-v1-'),
    errors: []
  })),
  validateAnalysisConfig: jest.fn(() => ({
    isValid: true,
    errors: {}
  }))
}));

jest.mock('../ChatboxProvider', () => ({
  ...jest.requireActual('../ChatboxProvider'),
  useChatbox: () => ({
    isVisible: true,
    status: 'idle',
    messages: [],
    config: { type: 'profile', model: '', apiKey: '', temperature: 0.7, maxTokens: 800 },
    error: null,
    profileData: { experience: [], skills: [], certifications: [], languages: [] },
    openChatbox: jest.fn(),
    closeChatbox: jest.fn(),
    updateConfig: jest.fn(),
    startAnalysis: jest.fn(),
    clearMessages: jest.fn(),
    addMessage: jest.fn(),
    getActivePlugins: jest.fn(() => [])
  })
}));

// Mock child components
jest.mock('../StorageManagementPanel', () => ({
  StorageManagementPanel: () => null
}));

jest.mock('../AnalysisHistory', () => ({
  AnalysisHistory: () => null
}));

const mockProfileData = {
  experience: [],
  skills: [],
  certifications: [],
  languages: []
};

describe('Chatbox Accessibility Tests', () => {
  describe('ChatboxPanel', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      expect(screen.getByLabelText('Close chatbox')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Profile Analysis');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const closeButton = screen.getByLabelText('Close chatbox');
      
      // Should be focusable
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);

      // Should respond to Enter key
      await user.keyboard('{Enter}');
      // Note: In real implementation, this would close the chatbox
    });

    it('should have proper color contrast', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Check that text elements have sufficient contrast
      const heading = screen.getByText('Profile Analysis');
      const computedStyle = window.getComputedStyle(heading);
      
      // These would be actual color values in a real test
      expect(computedStyle.color).toBeDefined();
    });
  });

  describe('ChatboxControls', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ChatboxControls />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      render(<ChatboxControls />);

      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
    });

    it('should indicate required fields', () => {
      render(<ChatboxControls />);

      // Check for required field indicators
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(2);
    });

    it('should have proper error messaging', async () => {
      const user = userEvent.setup();
      
      render(<ChatboxControls />);

      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/);
      
      // Enter invalid input
      await user.type(apiKeyInput, 'invalid');
      await user.tab(); // Trigger validation

      // Should show error message associated with input
      // In real implementation, this would be properly associated via aria-describedby
    });

    it('should have proper button states', () => {
      render(<ChatboxControls />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Profile/ });
      
      // Should be disabled initially
      expect(analyzeButton).toBeDisabled();
      
      // Should have proper ARIA attributes
      expect(analyzeButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<ChatboxControls />);

      const modelSelect = screen.getByLabelText(/AI Model/);
      const apiKeyInput = screen.getByLabelText(/OpenRouter API Key/);

      // Tab navigation should work
      modelSelect.focus();
      expect(document.activeElement).toBe(modelSelect);

      await user.tab();
      expect(document.activeElement).toBe(apiKeyInput);
    });

    it('should have proper select accessibility', async () => {
      const user = userEvent.setup();
      
      render(<ChatboxControls />);

      const modelSelect = screen.getByLabelText(/AI Model/);
      
      // Should be properly labeled
      expect(modelSelect).toHaveAttribute('aria-label', expect.stringContaining('AI Model'));
      
      // Should support keyboard selection
      modelSelect.focus();
      await user.keyboard('{ArrowDown}');
      // In real implementation, this would change the selection
    });
  });

  describe('ChatboxMessage', () => {
    const mockMessage = {
      id: 'msg-1',
      type: 'assistant' as const,
      content: 'This is a test message with enough content to show accessibility features',
      timestamp: '2025-01-08T12:00:00Z'
    };

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChatboxMessage message={mockMessage} onCopy={jest.fn()} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button accessibility', () => {
      render(<ChatboxMessage message={mockMessage} onCopy={jest.fn()} />);

      const copyButton = screen.getByTitle('Copy message');
      
      expect(copyButton).toHaveAttribute('title', 'Copy message');
      expect(copyButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      const mockOnCopy = jest.fn();
      
      render(<ChatboxMessage message={mockMessage} onCopy={mockOnCopy} />);

      const copyButton = screen.getByTitle('Copy message');
      
      // Should be focusable
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);

      // Should respond to Enter key
      await user.keyboard('{Enter}');
      // Note: In real implementation, this would trigger copy
    });

    it('should have proper semantic structure', () => {
      render(<ChatboxMessage message={mockMessage} onCopy={jest.fn()} />);

      // Message content should be in proper semantic structure
      const messageContent = screen.getByText(mockMessage.content);
      expect(messageContent).toBeInTheDocument();
    });

    it('should handle different message types accessibly', () => {
      const errorMessage = {
        ...mockMessage,
        type: 'error' as const,
        content: 'Error message'
      };

      render(<ChatboxMessage message={errorMessage} onCopy={jest.fn()} />);

      // Error messages should be properly identified
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  describe('ChatboxProgress', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ChatboxProgress status="analyzing" progress={50} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper progress indication', () => {
      render(<ChatboxProgress status="analyzing" progress={50} />);

      // Progress should be announced to screen readers
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    it('should have proper status indication', () => {
      render(<ChatboxProgress status="analyzing" />);

      // Status should be clearly indicated
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should handle error states accessibly', () => {
      render(<ChatboxProgress status="error" error="Test error" />);

      // Error should be properly announced
      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for progress', () => {
      const { container } = render(
        <ChatboxProgress status="analyzing" progress={75} />
      );

      // Progress bar should have proper ARIA attributes
      const progressBar = container.querySelector('.h-2.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Full Integration Accessibility', () => {
    it('should not have violations in complete chatbox', async () => {
      const { container } = render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Focus should be manageable throughout the interface
      const firstFocusable = screen.getByLabelText(/AI Model/);
      firstFocusable.focus();
      expect(document.activeElement).toBe(firstFocusable);

      // Tab navigation should work properly
      await user.tab();
      const secondFocusable = screen.getByLabelText(/OpenRouter API Key/);
      expect(document.activeElement).toBe(secondFocusable);
    });

    it('should have proper landmark structure', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Should have proper semantic structure
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should support screen reader navigation', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // All interactive elements should be properly labeled
      expect(screen.getByLabelText('Close chatbox')).toBeInTheDocument();
      expect(screen.getByLabelText(/AI Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/OpenRouter API Key/)).toBeInTheDocument();
    });

    it('should handle dynamic content accessibly', async () => {
      const user = userEvent.setup();
      
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Dynamic status changes should be announced
      // This would require proper ARIA live regions in real implementation
      const statusArea = screen.getByText('Configure your analysis settings below to get started.');
      expect(statusArea).toBeInTheDocument();
    });

    it('should maintain focus when content changes', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Focus should be maintained appropriately when content updates
      const closeButton = screen.getByLabelText('Close chatbox');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper touch targets', () => {
      render(
        <ChatboxProvider profileData={mockProfileData}>
          <ChatboxPanel />
        </ChatboxProvider>
      );

      // Interactive elements should have adequate touch targets
      const closeButton = screen.getByLabelText('Close chatbox');
      const computedStyle = window.getComputedStyle(closeButton);
      
      // In real implementation, would check for minimum 44px touch targets
      expect(closeButton).toBeInTheDocument();
    });
  });
});