/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatboxProvider } from '../ChatboxProvider';
import { ProfileAnalysisTrigger } from '../ProfileAnalysisTrigger';
import { transformUserProfileToAnalysisData, validateProfileReadiness } from '../utils/profile-transformation';
import { UserProfileData, Role } from '@/app/businessidea/tabs/user-profile/types';

// Mock the OpenRouter client
jest.mock('@/lib/openrouter/client', () => ({
  OpenRouterClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mock analysis result' } }],
      usage: { total_tokens: 100 }
    })
  }))
}));

// Mock the analysis service
jest.mock('@/lib/chatbox/AnalysisService', () => ({
  analysisService: {
    findProviderForModel: jest.fn().mockReturnValue({
      id: 'test-provider',
      analyze: jest.fn().mockResolvedValue({
        id: 'test-analysis',
        type: 'profile',
        status: 'success',
        content: 'Mock analysis result',
        timestamp: new Date().toISOString(),
        model: 'test-model'
      }),
      analyzeStreaming: jest.fn().mockImplementation(async (config, data, onChunk) => {
        onChunk('Mock ');
        onChunk('streaming ');
        onChunk('result');
        return {
          id: 'test-streaming-analysis',
          type: 'profile',
          status: 'success',
          content: 'Mock streaming result',
          timestamp: new Date().toISOString(),
          model: 'test-model'
        };
      })
    })
  }
}));

describe('Profile Integration', () => {
  const mockUserProfile: UserProfileData = {
    role: Role.Professional,
    roleDetails: {
      role: Role.Professional,
      professional: {
        yearsExperience: '5-7',
        jobFunction: 'Software Engineering',
        seniority: 'Senior'
      }
    },
    industry: 'Technology',
    location: 'United States',
    workPreference: 'Remote',
    skills: ['JavaScript', 'React', 'TypeScript']
  };

  describe('Data Transformation', () => {
    it('should transform UserProfileData to ProfileAnalysisData correctly', () => {
      const result = transformUserProfileToAnalysisData(mockUserProfile);

      expect(result).toEqual({
        profileType: Role.Professional,
        experience: expect.arrayContaining([
          expect.objectContaining({
            title: 'Software Engineering',
            company: 'Current Organization',
            duration: '5-7 years of experience',
            description: 'Senior level professional'
          })
        ]),
        skills: {
          technical: ['JavaScript', 'React', 'TypeScript'],
          soft: [],
          languages: [],
          certifications: []
        },
        metadata: {
          completionLevel: 100,
          lastModified: expect.any(String)
        }
      });
    });

    it('should handle incomplete profile data gracefully', () => {
      const incompleteProfile: UserProfileData = {
        role: Role.Student,
        skills: []
      };

      const result = transformUserProfileToAnalysisData(incompleteProfile);

      expect(result.profileType).toBe(Role.Student);
      expect(result.metadata.completionLevel).toBeLessThan(100);
    });

    it('should throw error for null profile data', () => {
      expect(() => transformUserProfileToAnalysisData(null as any)).toThrow('No user profile data provided');
    });
  });

  describe('Profile Readiness Validation', () => {
    it('should validate complete profile as ready', () => {
      const result = validateProfileReadiness(mockUserProfile);

      expect(result.ready).toBe(true);
      expect(result.completionLevel).toBe(100);
      expect(result.missing).toHaveLength(0);
    });

    it('should identify missing fields in incomplete profile', () => {
      const incompleteProfile: UserProfileData = {
        role: Role.Student,
        skills: []
      };

      const result = validateProfileReadiness(incompleteProfile);

      expect(result.ready).toBe(false);
      expect(result.missing).toContain('role details');
      expect(result.missing).toContain('industry');
      expect(result.missing).toContain('location');
      expect(result.missing).toContain('work preference');
      expect(result.missing).toContain('skills');
    });
  });

  describe('ProfileAnalysisTrigger Component', () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatboxProvider>{children}</ChatboxProvider>
    );

    it('should render enabled trigger for complete profile', () => {
      render(
        <TestWrapper>
          <ProfileAnalysisTrigger profileData={mockUserProfile} variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Analyze Profile');
    });

    it('should render disabled trigger for incomplete profile', () => {
      const incompleteProfile: UserProfileData = {
        role: Role.Student,
        skills: []
      };

      render(
        <TestWrapper>
          <ProfileAnalysisTrigger profileData={incompleteProfile} variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Complete Profile First');
    });

    it('should render card variant with progress indicator', () => {
      render(
        <TestWrapper>
          <ProfileAnalysisTrigger profileData={mockUserProfile} variant="card" />
        </TestWrapper>
      );

      expect(screen.getByText('Profile Analysis Ready')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    });

    it('should show completion percentage for incomplete profile', () => {
      const incompleteProfile: UserProfileData = {
        role: Role.Student,
        skills: []
      };

      render(
        <TestWrapper>
          <ProfileAnalysisTrigger profileData={incompleteProfile} variant="card" />
        </TestWrapper>
      );

      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });
  });

  describe('ChatboxProvider Integration', () => {
    it('should accept optional parameters in startAnalysis', async () => {
      const TestComponent = () => {
        const { startAnalysis } = require('../ChatboxProvider').useChatbox();
        
        return (
          <button onClick={() => startAnalysis(true, mockUserProfile)}>
            Test Analysis
          </button>
        );
      };

      render(
        <ChatboxProvider>
          <TestComponent />
        </ChatboxProvider>
      );

      const button = screen.getByText('Test Analysis');
      fireEvent.click(button);

      // Should not throw error
      await waitFor(() => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle transformation errors gracefully', () => {
      const invalidProfile = { invalid: 'data' } as any;

      expect(() => transformUserProfileToAnalysisData(invalidProfile)).not.toThrow();
    });

    it('should handle analysis trigger failures', async () => {
      const TestComponent = () => {
        const { triggerProfileAnalysis } = require('../hooks/useProfileIntegration').useProfileIntegration();
        
        return (
          <button onClick={() => triggerProfileAnalysis(null)}>
            Test Error
          </button>
        );
      };

      render(
        <ChatboxProvider>
          <TestComponent />
        </ChatboxProvider>
      );

      const button = screen.getByText('Test Error');
      fireEvent.click(button);

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Role-Specific Transformations', () => {
    it('should handle Student role correctly', () => {
      const studentProfile: UserProfileData = {
        role: Role.Student,
        roleDetails: {
          role: Role.Student,
          student: {
            educationLevel: "Bachelor's Degree",
            fieldOfStudy: 'Computer Science',
            graduationYear: '2025',
            status: 'Full-time'
          }
        },
        industry: 'Technology',
        location: 'United States',
        workPreference: 'Remote',
        skills: ['Python', 'Java']
      };

      const result = transformUserProfileToAnalysisData(studentProfile);

      expect(result.experience[0]).toEqual({
        title: "Bachelor's Degree in Computer Science",
        company: 'Educational Institution',
        duration: 'Expected graduation: 2025',
        description: 'Full-time student'
      });
    });

    it('should handle BusinessOwner role correctly', () => {
      const businessProfile: UserProfileData = {
        role: Role.BusinessOwner,
        roleDetails: {
          role: Role.BusinessOwner,
          business: {
            companySize: '11-50',
            sector: 'Technology',
            stage: 'Growing',
            teamSize: '6-10'
          }
        },
        industry: 'Technology',
        location: 'United States',
        workPreference: 'Hybrid',
        skills: ['Leadership', 'Strategy']
      };

      const result = transformUserProfileToAnalysisData(businessProfile);

      expect(result.experience[0]).toEqual({
        title: 'Business Owner',
        company: 'Technology Company',
        duration: 'Company size: 11-50',
        description: 'Growing stage business with 6-10 team members'
      });
    });

    it('should handle CareerShifter role correctly', () => {
      const shifterProfile: UserProfileData = {
        role: Role.CareerShifter,
        roleDetails: {
          role: Role.CareerShifter,
          shifter: {
            previousField: 'Retail',
            desiredField: 'Technology',
            timeline: '6–12 months',
            workPreference: 'Remote'
          }
        },
        industry: 'Technology',
        location: 'United States',
        workPreference: 'Remote',
        skills: ['Communication', 'Problem Solving']
      };

      const result = transformUserProfileToAnalysisData(shifterProfile);

      expect(result.experience).toHaveLength(2);
      expect(result.experience[0].description).toContain('Previous field: Retail');
      expect(result.experience[1].description).toContain('Desired field: Technology');
    });
  });
});