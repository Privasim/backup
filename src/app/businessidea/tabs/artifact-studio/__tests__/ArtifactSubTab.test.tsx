import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactSubTabProvider, useArtifactSubTab } from '../context/ArtifactSubTabContext';
import { ArtifactSubTabNavigation } from '../components/ArtifactSubTabNavigation';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CodeBracketIcon: () => <div data-testid="code-icon">Code Icon</div>,
  EyeIcon: () => <div data-testid="eye-icon">Eye Icon</div>,
}));

jest.mock('@heroicons/react/24/solid', () => ({
  CodeBracketIcon: () => <div data-testid="code-icon-solid">Code Icon Solid</div>,
  EyeIcon: () => <div data-testid="eye-icon-solid">Eye Icon Solid</div>,
}));

// Test component to consume the context
function TestConsumer() {
  const { activeSubTab, setActiveSubTab } = useArtifactSubTab();
  return (
    <div>
      <span data-testid="active-tab">{activeSubTab}</span>
      <button onClick={() => setActiveSubTab('preview')}>Switch to Preview</button>
    </div>
  );
}

describe('ArtifactSubTab Implementation', () => {
  describe('ArtifactSubTabContext', () => {
    it('provides default tab as code', () => {
      render(
        <ArtifactSubTabProvider>
          <TestConsumer />
        </ArtifactSubTabProvider>
      );

      expect(screen.getByTestId('active-tab')).toHaveTextContent('code');
    });

    it('allows tab switching', () => {
      render(
        <ArtifactSubTabProvider>
          <TestConsumer />
        </ArtifactSubTabProvider>
      );

      fireEvent.click(screen.getByText('Switch to Preview'));
      expect(screen.getByTestId('active-tab')).toHaveTextContent('preview');
    });

    it('accepts initial tab prop', () => {
      render(
        <ArtifactSubTabProvider initialTab="preview">
          <TestConsumer />
        </ArtifactSubTabProvider>
      );

      expect(screen.getByTestId('active-tab')).toHaveTextContent('preview');
    });

    it('throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useArtifactSubTab must be used within an ArtifactSubTabProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('ArtifactSubTabNavigation', () => {
    it('renders code and preview tabs', () => {
      render(
        <ArtifactSubTabProvider>
          <ArtifactSubTabNavigation />
        </ArtifactSubTabProvider>
      );

      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('shows correct active state', () => {
      render(
        <ArtifactSubTabProvider initialTab="preview">
          <ArtifactSubTabNavigation />
        </ArtifactSubTabProvider>
      );

      const previewTab = screen.getByText('Preview').closest('button');
      expect(previewTab).toHaveClass('text-blue-600', 'border-blue-500');
    });

    it('displays status indicators correctly', () => {
      render(
        <ArtifactSubTabProvider>
          <ArtifactSubTabNavigation compileStatus="success" runtimeErrors={0} />
        </ArtifactSubTabProvider>
      );

      // Should show green indicators for successful compilation
      const indicators = document.querySelectorAll('.bg-green-500');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('shows error indicators for runtime errors', () => {
      render(
        <ArtifactSubTabProvider>
          <ArtifactSubTabNavigation compileStatus="success" runtimeErrors={2} />
        </ArtifactSubTabProvider>
      );

      // Should show red indicator for preview tab due to runtime errors
      const errorIndicators = document.querySelectorAll('.bg-red-500');
      expect(errorIndicators.length).toBeGreaterThan(0);
    });
  });
});