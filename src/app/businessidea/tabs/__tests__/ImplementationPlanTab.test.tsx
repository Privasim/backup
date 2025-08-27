import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImplementationPlanTab from '../ImplementationPlanTab';
import { usePlanSync } from '../utils/plan-sync';

// Mock the plan sync hook
jest.mock('../utils/plan-sync');
const mockUsePlanSync = usePlanSync as jest.MockedFunction<typeof usePlanSync>;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ImplementationPlanTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no plan content exists', () => {
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: null,
      planGenerationStatus: 'idle',
      getActivePlanConversation: jest.fn(() => null),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    render(<ImplementationPlanTab />);

    expect(screen.getByText('No Implementation Plan')).toBeInTheDocument();
    expect(screen.getByText(/Generate an implementation plan by clicking/)).toBeInTheDocument();
  });

  it('renders loading state when plan is generating', () => {
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: null,
      planGenerationStatus: 'generating',
      getActivePlanConversation: jest.fn(() => null),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    render(<ImplementationPlanTab />);

    expect(screen.getByText('Generating Plan')).toBeInTheDocument();
    expect(screen.getByText('Your implementation plan is being generated...')).toBeInTheDocument();
  });

  it('renders error state when plan generation fails', () => {
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: null,
      planGenerationStatus: 'error',
      getActivePlanConversation: jest.fn(() => null),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    render(<ImplementationPlanTab />);

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders plan content when available', () => {
    const mockContent = '# Test Plan\n\nThis is a test implementation plan.';
    
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: mockContent,
      planGenerationStatus: 'completed',
      getActivePlanConversation: jest.fn(() => ({
        id: 'test-conv',
        title: 'Test Plan',
        messages: [],
        unread: 0
      })),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    render(<ImplementationPlanTab />);

    expect(screen.getByText('Implementation Plan')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
  });

  it('copies content to clipboard when copy button is clicked', async () => {
    const mockContent = '# Test Plan\n\nThis is a test implementation plan.';
    
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: mockContent,
      planGenerationStatus: 'completed',
      getActivePlanConversation: jest.fn(() => ({
        id: 'test-conv',
        title: 'Test Plan',
        messages: [],
        unread: 0
      })),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    render(<ImplementationPlanTab />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent);
    });
  });

  it('downloads content when download button is clicked', async () => {
    const mockContent = '# Test Plan\n\nThis is a test implementation plan.';
    
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: mockContent,
      planGenerationStatus: 'completed',
      getActivePlanConversation: jest.fn(() => ({
        id: 'test-conv',
        title: 'Test Plan',
        messages: [],
        unread: 0
      })),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    // Mock document.createElement
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

    render(<ImplementationPlanTab />);

    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockAnchor.download).toBe('implementation-plan.md');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    mockUsePlanSync.mockReturnValue({
      currentPlanContent: null,
      planGenerationStatus: 'idle',
      getActivePlanConversation: jest.fn(() => null),
      subscribeToPlanUpdates: jest.fn(() => () => {}),
      planConversations: []
    });

    const { container } = render(<ImplementationPlanTab className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});