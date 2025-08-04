import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillsetSelector from '../components/profile-panel/SkillsetSelector';
import { EnhancedSkillset } from '../types/profile.types';

// Mock the ProfileContext
const mockUpdateSkillset = jest.fn();
const mockNextStep = jest.fn();
const mockPrevStep = jest.fn();

const mockSkillset: EnhancedSkillset = {
  technical: [],
  soft: [],
  languages: [],
  certifications: [],
  categories: [],
  certificationsDetailed: [],
  languageProficiency: []
};

const mockProfileFormData = {
  profile: { profileType: 'working_full_time' as const },
  experience: [],
  skillset: mockSkillset,
  metadata: {
    lastModified: new Date().toISOString(),
    version: '1.0.0',
    isDraft: true
  }
};

jest.mock('../context/ProfileContext', () => ({
  useProfile: () => ({
    profileFormData: mockProfileFormData,
    updateSkillset: mockUpdateSkillset,
    nextStep: mockNextStep,
    prevStep: mockPrevStep
  })
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <div data-testid="search-icon">🔍</div>,
  PlusIcon: () => <div data-testid="plus-icon">+</div>,
  StarIcon: () => <div data-testid="star-icon">⭐</div>,
  TrashIcon: () => <div data-testid="trash-icon">🗑️</div>
}));

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: () => <div data-testid="star-icon-solid">⭐</div>
}));

describe('SkillsetSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock skillset
    mockProfileFormData.skillset = {
      technical: [],
      soft: [],
      languages: [],
      certifications: [],
      categories: [],
      certificationsDetailed: [],
      languageProficiency: []
    };
  });

  it('renders with default skills tab', () => {
    render(<SkillsetSelector />);
    
    expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
    expect(screen.getByText('0 skills')).toBeInTheDocument();
    expect(screen.getByText('🎯 Skills')).toBeInTheDocument();
    expect(screen.getByText('🏆 Certifications')).toBeInTheDocument();
    expect(screen.getByText('🌍 Languages')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Switch to certifications tab
    await user.click(screen.getByText('🏆 Certifications'));
    expect(screen.getByText('No certifications added yet')).toBeInTheDocument();
    
    // Switch to languages tab
    await user.click(screen.getByText('🌍 Languages'));
    expect(screen.getByText('No languages added yet')).toBeInTheDocument();
  });

  it('switches between technical and soft skills', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    expect(screen.getByText('💻 Technical')).toBeInTheDocument();
    expect(screen.getByText('🤝 Soft Skills')).toBeInTheDocument();
    
    // Switch to soft skills
    await user.click(screen.getByText('🤝 Soft Skills'));
    expect(screen.getByPlaceholderText('Search soft skills...')).toBeInTheDocument();
  });

  it('shows popular skill suggestions', () => {
    render(<SkillsetSelector />);
    
    expect(screen.getByText('Popular technical skills:')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('adds skill from suggestions', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Click on JavaScript suggestion
    await user.click(screen.getByText('JavaScript'));
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({
            name: 'technical',
            skills: expect.arrayContaining([
              expect.objectContaining({
                name: 'JavaScript',
                category: 'technical',
                proficiency: 3
              })
            ])
          })
        ])
      })
    );
  });

  it('adds custom skill via search', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    const searchInput = screen.getByPlaceholderText('Search technical skills...');
    await user.type(searchInput, 'Custom Skill');
    await user.keyboard('{Enter}');
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({
            name: 'technical',
            skills: expect.arrayContaining([
              expect.objectContaining({
                name: 'Custom Skill',
                category: 'technical'
              })
            ])
          })
        ])
      })
    );
  });

  it('displays existing skills correctly', () => {
    // Add mock skills
    mockProfileFormData.skillset.categories = [
      {
        id: '1',
        name: 'technical',
        skills: [
          {
            id: '1',
            name: 'JavaScript',
            category: 'technical',
            proficiency: 4,
            highlight: false,
            source: 'manual'
          },
          {
            id: '2',
            name: 'Python',
            category: 'technical',
            proficiency: 5,
            highlight: true,
            source: 'manual'
          }
        ]
      }
    ];

    render(<SkillsetSelector />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
    expect(screen.getByText('2 skills')).toBeInTheDocument();
  });

  it('toggles skill highlight', async () => {
    const user = userEvent.setup();
    
    // Add mock skill
    mockProfileFormData.skillset.categories = [
      {
        id: '1',
        name: 'technical',
        skills: [
          {
            id: '1',
            name: 'JavaScript',
            category: 'technical',
            proficiency: 4,
            highlight: false,
            source: 'manual'
          }
        ]
      }
    ];

    render(<SkillsetSelector />);
    
    // Click star icon to highlight
    const starButton = screen.getByTestId('star-icon');
    await user.click(starButton.parentElement!);
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({
            skills: expect.arrayContaining([
              expect.objectContaining({
                id: '1',
                highlight: true
              })
            ])
          })
        ])
      })
    );
  });

  it('updates skill proficiency', async () => {
    const user = userEvent.setup();
    
    // Add mock skill
    mockProfileFormData.skillset.categories = [
      {
        id: '1',
        name: 'technical',
        skills: [
          {
            id: '1',
            name: 'JavaScript',
            category: 'technical',
            proficiency: 3,
            highlight: false,
            source: 'manual'
          }
        ]
      }
    ];

    render(<SkillsetSelector />);
    
    // Change proficiency level
    const proficiencySelect = screen.getByDisplayValue('Intermediate');
    await user.selectOptions(proficiencySelect, '5');
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({
            skills: expect.arrayContaining([
              expect.objectContaining({
                id: '1',
                proficiency: 5
              })
            ])
          })
        ])
      })
    );
  });

  it('removes skill', async () => {
    const user = userEvent.setup();
    
    // Add mock skill
    mockProfileFormData.skillset.categories = [
      {
        id: '1',
        name: 'technical',
        skills: [
          {
            id: '1',
            name: 'JavaScript',
            category: 'technical',
            proficiency: 3,
            highlight: false,
            source: 'manual'
          }
        ]
      }
    ];

    render(<SkillsetSelector />);
    
    // Click remove button
    const removeButton = screen.getByTestId('trash-icon');
    await user.click(removeButton.parentElement!);
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: []
      })
    );
  });

  it('adds certification', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Switch to certifications tab
    await user.click(screen.getByText('🏆 Certifications'));
    
    // Click add certification
    await user.click(screen.getByText('Add Certification'));
    
    // Fill form
    await user.type(screen.getByPlaceholderText(/AWS Solutions Architect/), 'AWS Certified');
    await user.type(screen.getByPlaceholderText(/Amazon Web Services/), 'Amazon');
    await user.type(screen.getByDisplayValue(''), '2023-01');
    
    // Submit
    await user.click(screen.getByText('Add Certification'));
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        certificationsDetailed: expect.arrayContaining([
          expect.objectContaining({
            name: 'AWS Certified',
            issuer: 'Amazon',
            dateObtained: '2023-01'
          })
        ])
      })
    );
  });

  it('adds language', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Switch to languages tab
    await user.click(screen.getByText('🌍 Languages'));
    
    // Click add language
    await user.click(screen.getByText('Add Language'));
    
    // Fill form
    await user.type(screen.getByPlaceholderText(/Spanish, French/), 'Spanish');
    await user.selectOptions(screen.getByDisplayValue('Conversational'), 'fluent');
    
    // Submit
    await user.click(screen.getByText('Add Language'));
    
    expect(mockUpdateSkillset).toHaveBeenCalledWith(
      expect.objectContaining({
        languageProficiency: expect.arrayContaining([
          expect.objectContaining({
            language: 'Spanish',
            proficiency: 'fluent'
          })
        ])
      })
    );
  });

  it('navigates correctly', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Test back button
    await user.click(screen.getByText('Back'));
    expect(mockPrevStep).toHaveBeenCalled();
    
    // Test next button
    await user.click(screen.getByText('Next'));
    expect(mockNextStep).toHaveBeenCalled();
  });

  it('filters skills based on search', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    const searchInput = screen.getByPlaceholderText('Search technical skills...');
    await user.type(searchInput, 'java');
    
    // Should show JavaScript but not Python
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('shows language suggestions', async () => {
    const user = userEvent.setup();
    render(<SkillsetSelector />);
    
    // Switch to languages tab
    await user.click(screen.getByText('🌍 Languages'));
    await user.click(screen.getByText('Add Language'));
    
    // Type partial language name
    await user.type(screen.getByPlaceholderText(/Spanish, French/), 'spa');
    
    expect(screen.getByText('Suggestions:')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });
});