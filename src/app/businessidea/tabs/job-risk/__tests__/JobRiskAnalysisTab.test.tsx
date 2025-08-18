import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobRiskAnalysisTab } from '../JobRiskAnalysisTab';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';
import { useProfileIntegration } from '@/components/chatbox/hooks/useProfileIntegration';
import { useJobRiskData } from '../hooks/useJobRiskData';
import { useOccupationRisk } from '@/hooks/useOccupationRisk';
import { useTaskAutomationData } from '@/hooks/useTaskAutomationData';

// Mock hooks
jest.mock('@/components/chatbox/ChatboxProvider');
jest.mock('@/components/chatbox/hooks/useProfileIntegration');
jest.mock('../hooks/useJobRiskData');
jest.mock('@/hooks/useOccupationRisk');
jest.mock('@/hooks/useTaskAutomationData');

describe('JobRiskAnalysisTab', () => {
  const mockUseChatbox = useChatbox as jest.MockedFunction<typeof useChatbox>;
  const mockUseProfileIntegration = useProfileIntegration as jest.MockedFunction<typeof useProfileIntegration>;
  const mockUseJobRiskData = useJobRiskData as jest.MockedFunction<typeof useJobRiskData>;
  const mockUseOccupationRisk = useOccupationRisk as jest.MockedFunction<typeof useOccupationRisk>;
  const mockUseTaskAutomationData = useTaskAutomationData as jest.MockedFunction<typeof useTaskAutomationData>;

  beforeEach(() => {
    mockUseChatbox.mockReturnValue({
      profileData: null,
      startAnalysis: jest.fn(),
    } as any);
    
    mockUseProfileIntegration.mockReturnValue({
      getAnalysisReadiness: jest.fn().mockReturnValue({
        ready: false,
        completionLevel: 0.5,
        missing: ['role', 'experience'],
        requirements: { minCompletion: 0.8, autoTrigger: false }
      })
    } as any);

    mockUseJobRiskData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    } as any);

    mockUseOccupationRisk.mockReturnValue({
      data: null,
      loading: false,
      error: null
    } as any);

    mockUseTaskAutomationData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    } as any);
  });

  it('renders job risk analysis header', () => {
    render(<JobRiskAnalysisTab />);
    expect(screen.getByText('Job Risk Analysis')).toBeInTheDocument();
  });

  it('shows profile completion warning when profile is incomplete', () => {
    render(<JobRiskAnalysisTab />);
    expect(screen.getByText(/Profile completion: 50%/)).toBeInTheDocument();
  });

  it('disables Generate Insights button when profile is incomplete', () => {
    render(<JobRiskAnalysisTab />);
    const button = screen.getByText('Generate Insights');
    expect(button).toBeDisabled();
  });

  it('enables Generate Insights button when profile is complete', () => {
    mockUseProfileIntegration.mockReturnValue({
      getAnalysisReadiness: jest.fn().mockReturnValue({
        ready: true,
        completionLevel: 0.9,
        missing: [],
        requirements: { minCompletion: 0.8, autoTrigger: false }
      })
    } as any);

    render(<JobRiskAnalysisTab />);
    const button = screen.getByText('Generate Insights');
    expect(button).toBeEnabled();
  });

  it('handles Generate Insights click with complete profile', async () => {
    const mockStartAnalysis = jest.fn().mockResolvedValue(undefined);
    mockUseChatbox.mockReturnValue({
      profileData: { /* mock profile data */ },
      startAnalysis: mockStartAnalysis,
    } as any);

    mockUseProfileIntegration.mockReturnValue({
      getAnalysisReadiness: jest.fn().mockReturnValue({
        ready: true,
        completionLevel: 0.9,
        missing: [],
        requirements: { minCompletion: 0.8, autoTrigger: false }
      })
    } as any);

    render(<JobRiskAnalysisTab />);
    
    const button = screen.getByText('Generate Insights');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockStartAnalysis).toHaveBeenCalled();
    });
  });

  it('displays loading state during insights generation', async () => {
    mockUseProfileIntegration.mockReturnValue({
      getAnalysisReadiness: jest.fn().mockReturnValue({
        ready: true,
        completionLevel: 0.9,
        missing: [],
        requirements: { minCompletion: 0.8, autoTrigger: false }
      })
    } as any);

    const mockStartAnalysis = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    mockUseChatbox.mockReturnValue({
      profileData: { /* mock profile data */ },
      startAnalysis: mockStartAnalysis,
    } as any);

    render(<JobRiskAnalysisTab />);
    
    const button = screen.getByText('Generate Insights');
    fireEvent.click(button);

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Generate Insights')).toBeInTheDocument();
    });
  });

  it('displays error messages when analysis fails', async () => {
    mockUseProfileIntegration.mockReturnValue({
      getAnalysisReadiness: jest.fn().mockReturnValue({
        ready: true,
        completionLevel: 0.9,
        missing: [],
        requirements: { minCompletion: 0.8, autoTrigger: false }
      })
    } as any);

    const mockStartAnalysis = jest.fn().mockRejectedValue(new Error('Analysis failed'));
    mockUseChatbox.mockReturnValue({
      profileData: { /* mock profile data */ },
      startAnalysis: mockStartAnalysis,
    } as any);

    render(<JobRiskAnalysisTab />);
    
    const button = screen.getByText('Generate Insights');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to generate insights')).toBeInTheDocument();
    });
  });
});
