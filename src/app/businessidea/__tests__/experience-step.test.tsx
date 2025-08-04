import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExperienceStep from '../components/profile-panel/ExperienceStep';
import { ProfileProvider } from '../context/ProfileContext';
import { ExperienceEntry } from '../types/profile.types';

// Mock the ProfileContext
const mockUpdateExperience = jest.fn();
const mockNextStep = jest.fn();
const mockPrevStep = jest.fn();

const mockProfileFormData = {
  profile: { profileType: 'working_full_time' as const },
  experience: [] as ExperienceEntry[],
  skillset: {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
    categories: [],
    certificationsDetailed: [],
    languageProficiency: []
  },
  metadata: {
    lastModified: new Date().toISOString(),
    version: '1.0.0',
    isDraft: true
  }
};

jest.mock('../context/ProfileContext', () => ({
  useProfile: () => ({
    profileFormData: mockProfileFormData,
    updateExperience: mockUpdateExperience,
    nextStep: mockNextStep,
    prevStep: mockPrevStep
  }),
  ProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div data-testid="plus-icon">+</div>,
  PencilIcon: () => <div data-testid="pencil-icon">✏️</div>,
  TrashIcon: () => <div data-testid="trash-icon">🗑️</div>
}));

describe('ExperienceStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', () => {
    render(<ExperienceStep />);
    
    expect(screen.getByText('Your Experience')).toBeInTheDocument();
    expect(screen.getByText('0 entries')).toBeInTheDocument();
    expect(screen.getByText('No experience entries yet')).toBeInTheDocument();
    expect(screen.getByText('Add Experience')).toBeInTheDocument();
  });

  it('shows add form when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExperienceStep />);
    
    const addButton = screen.getByText('Add Experience');
    await user.click(addButton);
    
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Title *')).toBeInTheDocument();
    expect(screen.getByText('Organization *')).toBeInTheDocument();
  });

  it('validates required fields in add form', async () => {
    const user = userEvent.setup();
    render(<ExperienceStep />);
    
    // Open add form
    await user.click(screen.getByText('Add Experience'));
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Add Experience');
    await user.click(submitButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Organization is required')).toBeInTheDocument();
  });

  it('adds new experience entry successfully', async () => {
    const user = userEvent.setup();
    render(<ExperienceStep />);
    
    // Open add form
    await user.click(screen.getByText('Add Experience'));
    
    // Fill form
    await user.type(screen.getByPlaceholderText(/Software Engineer/), 'Senior Developer');
    await user.type(screen.getByPlaceholderText(/Company Name/), 'Tech Corp');
    await user.type(screen.getByDisplayValue(''), '2023-01');
    
    // Submit form
    await user.click(screen.getByText('Add Experience'));
    
    expect(mockUpdateExperience).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Senior Developer',
        organization: 'Tech Corp',
        startDate: '2023-01',
        type: 'work'
      })
    ]);
  });

  it('handles current position checkbox correctly', async () => {
    const user = userEvent.setup();
    render(<ExperienceStep />);
    
    // Open add form
    await user.click(screen.getByText('Add Experience'));
    
    // Fill required fields
    await user.type(screen.getByPlaceholderText(/Software Engineer/), 'Current Job');
    await user.type(screen.getByPlaceholderText(/Company Name/), 'Current Company');
    await user.type(screen.getByDisplayValue(''), '2023-01');
    
    // Check current position
    const currentCheckbox = screen.getByLabelText('I currently work here');
    await user.click(currentCheckbox);
    
    // End date input should be disabled
    const endDateInput = screen.getByDisplayValue('');
    expect(endDateInput).toBeDisabled();
  });

  it('displays existing experience entries', () => {
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Software Engineer',
        organization: 'Tech Company',
        startDate: '2022-01',
        endDate: '2023-12',
        current: false,
        description: 'Developed web applications'
      }
    ];

    // Update mock data
    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('handles edit experience entry', async () => {
    const user = userEvent.setup();
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Software Engineer',
        organization: 'Tech Company',
        startDate: '2022-01',
        endDate: '2023-12',
        current: false
      }
    ];

    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    // Click edit button
    const editButton = screen.getByTestId('pencil-icon');
    await user.click(editButton.parentElement!);
    
    // Form should be pre-filled
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tech Company')).toBeInTheDocument();
  });

  it('handles delete experience entry', async () => {
    const user = userEvent.setup();
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Software Engineer',
        organization: 'Tech Company',
        startDate: '2022-01',
        current: false
      }
    ];

    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    // Click delete button
    const deleteButton = screen.getByTestId('trash-icon');
    await user.click(deleteButton.parentElement!);
    
    expect(mockUpdateExperience).toHaveBeenCalledWith([]);
  });

  it('navigates correctly', async () => {
    const user = userEvent.setup();
    render(<ExperienceStep />);
    
    // Test back button
    await user.click(screen.getByText('Back'));
    expect(mockPrevStep).toHaveBeenCalled();
    
    // Test next button
    await user.click(screen.getByText('Next'));
    expect(mockNextStep).toHaveBeenCalled();
  });

  it('formats dates correctly', () => {
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Software Engineer',
        organization: 'Tech Company',
        startDate: '2022-01',
        endDate: '2023-12',
        current: false
      }
    ];

    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    expect(screen.getByText(/Jan 2022 - Dec 2023/)).toBeInTheDocument();
  });

  it('shows current position correctly', () => {
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Current Job',
        organization: 'Current Company',
        startDate: '2023-01',
        current: true
      }
    ];

    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    expect(screen.getByText(/Jan 2023 - Present/)).toBeInTheDocument();
  });

  it('displays different experience types with correct icons', () => {
    const mockExperience: ExperienceEntry[] = [
      {
        id: '1',
        type: 'work',
        title: 'Job',
        organization: 'Company',
        startDate: '2023-01',
        current: false
      },
      {
        id: '2',
        type: 'education',
        title: 'Degree',
        organization: 'University',
        startDate: '2020-01',
        current: false
      }
    ];

    (mockProfileFormData as any).experience = mockExperience;

    render(<ExperienceStep />);
    
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });
});