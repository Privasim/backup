import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatboxProgress } from '../ChatboxProgress';
import { ChatboxStatus } from '../types';

describe('ChatboxProgress', () => {
  it('should not render when status is idle', () => {
    const { container } = render(<ChatboxProgress status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render analyzing status with progress bar', () => {
    render(<ChatboxProgress status="analyzing" progress={45} />);

    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Analyzing your profile data')).toBeInTheDocument();
    expect(screen.getByText('45% complete')).toBeInTheDocument();
  });

  it('should render completed status', () => {
    render(<ChatboxProgress status="completed" />);

    expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    expect(screen.getByText('Your analysis is ready')).toBeInTheDocument();
    expect(screen.getByText('Analysis completed successfully!')).toBeInTheDocument();
  });

  it('should render error status with error message', () => {
    const errorMessage = 'API connection failed';
    render(<ChatboxProgress status="error" error={errorMessage} />);

    expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show custom message when provided', () => {
    const customMessage = 'Custom processing message';
    render(<ChatboxProgress status="analyzing" message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should display estimated time remaining', () => {
    render(<ChatboxProgress status="analyzing" estimatedTime={120} />);

    expect(screen.getByText('~2m 0s remaining')).toBeInTheDocument();
  });

  it('should format time correctly for different durations', () => {
    // Test seconds only
    const { rerender } = render(<ChatboxProgress status="analyzing" estimatedTime={45} />);
    expect(screen.getByText('~45s remaining')).toBeInTheDocument();

    // Test minutes and seconds
    rerender(<ChatboxProgress status="analyzing" estimatedTime={135} />);
    expect(screen.getByText('~2m 15s remaining')).toBeInTheDocument();
  });

  it('should show current stage based on progress', () => {
    // Test different progress stages
    const { rerender } = render(<ChatboxProgress status="analyzing" progress={5} />);
    expect(screen.getByText('Configuring')).toBeInTheDocument();

    rerender(<ChatboxProgress status="analyzing" progress={15} />);
    expect(screen.getByText('Connecting')).toBeInTheDocument();

    rerender(<ChatboxProgress status="analyzing" progress={50} />);
    expect(screen.getByText('Processing')).toBeInTheDocument();

    rerender(<ChatboxProgress status="analyzing" progress={80} />);
    expect(screen.getByText('Generating')).toBeInTheDocument();

    rerender(<ChatboxProgress status="analyzing" progress={95} />);
    expect(screen.getByText('Finalizing')).toBeInTheDocument();
  });

  it('should show custom current stage when provided', () => {
    render(<ChatboxProgress status="analyzing" currentStage="connecting" />);

    expect(screen.getByText('Connecting')).toBeInTheDocument();
    expect(screen.getByText('Establishing connection to AI service')).toBeInTheDocument();
  });

  it('should display stage timeline when showDetails is true', () => {
    render(<ChatboxProgress status="analyzing" currentStage="processing" showDetails={true} />);

    expect(screen.getByText('Analysis Stages')).toBeInTheDocument();
    expect(screen.getByText('Configuring')).toBeInTheDocument();
    expect(screen.getByText('Connecting')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Generating')).toBeInTheDocument();
    expect(screen.getByText('Finalizing')).toBeInTheDocument();
  });

  it('should not display stage timeline when showDetails is false', () => {
    render(<ChatboxProgress status="analyzing" showDetails={false} />);

    expect(screen.queryByText('Analysis Stages')).not.toBeInTheDocument();
  });

  it('should show progress bar with correct color for different statuses', () => {
    const { container, rerender } = render(<ChatboxProgress status="analyzing" progress={50} />);
    
    let progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-blue-500', 'to-indigo-600');

    rerender(<ChatboxProgress status="completed" progress={100} />);
    progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-green-500', 'to-emerald-600');

    rerender(<ChatboxProgress status="error" progress={30} />);
    progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-red-500', 'to-red-600');
  });

  it('should apply minimum progress width', () => {
    const { container } = render(<ChatboxProgress status="analyzing" progress={0} />);
    
    const progressBar = container.querySelector('.h-2.rounded-full');
    expect(progressBar).toHaveStyle('width: 5%');
  });

  it('should handle configuring status', () => {
    render(<ChatboxProgress status="configuring" />);

    expect(screen.getByText('Configuring')).toBeInTheDocument();
    expect(screen.getByText('Preparing analysis')).toBeInTheDocument();
  });

  it('should show stage completion status in timeline', () => {
    render(<ChatboxProgress status="analyzing" currentStage="generating" showDetails={true} />);

    // Previous stages should show as completed
    const stageElements = screen.getAllByText('✓');
    expect(stageElements.length).toBeGreaterThan(0);
  });

  it('should animate current stage icon', () => {
    render(<ChatboxProgress status="analyzing" currentStage="processing" />);

    const stageIcon = screen.getByText('🧠');
    expect(stageIcon).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    const { container } = render(<ChatboxProgress status="analyzing" className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<ChatboxProgress status="analyzing" progress={50} />);

    // Progress should be announced to screen readers
    const progressText = screen.getByText('45% complete');
    expect(progressText).toBeInTheDocument();
  });

  it('should handle edge cases for progress values', () => {
    // Test negative progress
    const { rerender } = render(<ChatboxProgress status="analyzing" progress={-10} />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();

    // Test progress over 100
    rerender(<ChatboxProgress status="analyzing" progress={150} />);
    expect(screen.getByText('150% complete')).toBeInTheDocument();
  });

  it('should show appropriate status colors', () => {
    const { rerender } = render(<ChatboxProgress status="analyzing" />);
    
    let statusElement = screen.getByText('Processing');
    expect(statusElement).toHaveClass('text-blue-600');

    rerender(<ChatboxProgress status="completed" />);
    statusElement = screen.getByText('Analysis Complete');
    expect(statusElement).toHaveClass('text-green-600');

    rerender(<ChatboxProgress status="error" />);
    statusElement = screen.getByText('Analysis Failed');
    expect(statusElement).toHaveClass('text-red-600');
  });

  it('should handle missing estimatedTime gracefully', () => {
    render(<ChatboxProgress status="analyzing" estimatedTime={0} />);

    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it('should show processing indicator during analysis', () => {
    render(<ChatboxProgress status="analyzing" />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});