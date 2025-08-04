import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExperienceStep from '../components/profile-panel/ExperienceStep';
import SkillsetSelector from '../components/profile-panel/SkillsetSelector';
import ReviewStep from '../components/profile-panel/ReviewStep';
import ProfilePanel from '../components/profile-panel/ProfilePanel';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the ProfileContext
const mockProfileFormData = {
  profile: { profileType: 'working_full_time' as const },
  experience: [],
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
    updateExperience: jest.fn(),
    updateSkillset: jest.fn(),
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    saveProfile: jest.fn(),
    errors: [],
    getProfileStatus: () => 'draft',
    isProfileComplete: () => false
  }),
  ProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <div>+</div>,
  PencilIcon: () => <div>✏️</div>,
  TrashIcon: () => <div>🗑️</div>,
  MagnifyingGlassIcon: () => <div>🔍</div>,
  StarIcon: () => <div>⭐</div>,
  CheckCircleIcon: () => <div>✓</div>,
  ExclamationTriangleIcon: () => <div>⚠️</div>
}));

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: () => <div>⭐</div>
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => {
  return (importFunc: () => Promise<any>) => {
    const Component = React.lazy(importFunc);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  };
});

describe('Accessibility Tests', () => {
  it('ExperienceStep should not have accessibility violations', async () => {
    const { container } = render(<ExperienceStep />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SkillsetSelector should not have accessibility violations', async () => {
    const { container } = render(<SkillsetSelector />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ReviewStep should not have accessibility violations', async () => {
    const { container } = render(<ReviewStep />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProfilePanel should not have accessibility violations', async () => {
    const { container } = render(<ProfilePanel />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels on interactive elements', () => {
    const { container } = render(<ExperienceStep />);
    
    // Check for ARIA labels on buttons
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const hasAriaLabel = button.hasAttribute('aria-label') || 
                          button.hasAttribute('aria-labelledby') ||
                          button.textContent?.trim();
      expect(hasAriaLabel).toBeTruthy();
    });
  });

  it('should have proper form labels', () => {
    const { container } = render(<SkillsetSelector />);
    
    // Check that all inputs have associated labels
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.hasAttribute('aria-label') ||
                      input.hasAttribute('aria-labelledby') ||
                      container.querySelector(`label[for="${input.id}"]`);
      expect(hasLabel).toBeTruthy();
    });
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<ReviewStep />);
    
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      // Heading levels should not skip (e.g., h1 -> h3)
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = currentLevel;
    });
  });

  it('should have focus management for modals and dropdowns', () => {
    const { container } = render(<ProfilePanel />);
    
    // Check that interactive elements are focusable
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should have proper color contrast', () => {
    const { container } = render(<SkillsetSelector />);
    
    // Check for elements with proper contrast classes
    const textElements = container.querySelectorAll('[class*="text-"]');
    textElements.forEach(element => {
      const classes = element.className;
      // Ensure we're not using very light text on light backgrounds
      expect(classes).not.toMatch(/text-gray-100|text-gray-200/);
    });
  });

  it('should support keyboard navigation', () => {
    const { container } = render(<ExperienceStep />);
    
    // Check that all interactive elements are keyboard accessible
    const interactiveElements = container.querySelectorAll(
      'button, [role="button"], input, select, textarea, a'
    );
    
    interactiveElements.forEach(element => {
      // Elements should either be naturally focusable or have tabindex
      const isFocusable = element.tagName.match(/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/) ||
                         element.hasAttribute('tabindex');
      expect(isFocusable).toBeTruthy();
    });
  });

  it('should have proper error messaging', () => {
    // Mock errors
    const mockWithErrors = {
      ...mockProfileFormData,
      errors: [{ field: 'title', message: 'Title is required' }]
    };

    jest.doMock('../context/ProfileContext', () => ({
      useProfile: () => ({
        ...mockProfileFormData,
        errors: [{ field: 'title', message: 'Title is required' }]
      })
    }));

    const { container } = render(<ReviewStep />);
    
    // Check that error messages are properly associated with form fields
    const errorMessages = container.querySelectorAll('[role="alert"], .text-red-600');
    errorMessages.forEach(error => {
      expect(error.textContent).toBeTruthy();
    });
  });

  it('should have proper loading states', () => {
    const { container } = render(<ReviewStep />);
    
    // Check for loading indicators
    const loadingElements = container.querySelectorAll('[aria-busy="true"], .animate-spin');
    loadingElements.forEach(element => {
      // Loading elements should have proper ARIA attributes
      expect(element.hasAttribute('aria-busy') || 
             element.hasAttribute('aria-label') ||
             element.hasAttribute('aria-labelledby')).toBeTruthy();
    });
  });

  it('should have proper live regions for dynamic content', () => {
    const { container } = render(<SkillsetSelector />);
    
    // Check for ARIA live regions where content changes dynamically
    const liveRegions = container.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      const liveValue = region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(liveValue);
    });
  });

  it('should have proper semantic markup', () => {
    const { container } = render(<ReviewStep />);
    
    // Check for semantic HTML elements
    const semanticElements = container.querySelectorAll(
      'main, section, article, aside, nav, header, footer, h1, h2, h3, h4, h5, h6'
    );
    
    // Should have at least some semantic structure
    expect(semanticElements.length).toBeGreaterThan(0);
  });
});