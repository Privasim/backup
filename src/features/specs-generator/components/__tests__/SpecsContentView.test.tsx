import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpecsContentView } from '../SpecsContentView';
import { SpecsStatus } from '../../types';

// Mock the useSpecsGenerator hook
jest.mock('../../../features/specs-generator/useSpecsGenerator', () => ({
  useSpecsGenerator: () => ({
    settings: {
      preset: 'web-app',
      sections: {
        requirements: true,
        api: true,
        dataModel: true,
        architecture: true,
        implementation: true,
        testing: true,
        deployment: true,
        maintenance: true
      },
      outlineStyle: 'numbered',
      audienceLevel: 'engineer',
      tone: 'detailed',
      language: 'English',
      maxTokens: 2000,
      systemPrompt: 'Generate a technical specification'
    }
  })
}));

// Mock the useSpecsDerivations hook
jest.mock('../../../features/specs-generator/hooks/useSpecsDerivations', () => ({
  useSpecsDerivations: () => ({
    outlinePreview: [
      '1. Requirements',
      '2. API Design',
      '3. Data Model'
    ],
    warnings: [
      'Implementation plan is missing detailed technical requirements',
      'No security considerations found in the plan'
    ]
  })
}));

describe('SpecsContentView', () => {
  const mockHandlers = {
    onGenerate: jest.fn(),
    onCancel: jest.fn(),
    onRegenerate: jest.fn(),
    onCopy: jest.fn(),
    onDownload: jest.fn(),
    onOpenInChat: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders idle state with outline preview and warnings', () => {
    render(
      <SpecsContentView
        status="idle"
        outlinePreview={['1. Requirements', '2. API Design', '3. Data Model']}
        warnings={['Implementation plan is missing detailed technical requirements']}
        {...mockHandlers}
      />
    );

    // Check for outline preview
    expect(screen.getByText('Preview Outline')).toBeInTheDocument();
    expect(screen.getByText('1. Requirements')).toBeInTheDocument();
    expect(screen.getByText('2. API Design')).toBeInTheDocument();
    expect(screen.getByText('3. Data Model')).toBeInTheDocument();

    // Check for warnings
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Implementation plan is missing detailed technical requirements')).toBeInTheDocument();

    // Check for generate button
    expect(screen.getByText('Generate Specification')).toBeInTheDocument();
  });

  it('renders idle state with no warnings when empty array is passed', () => {
    render(
      <SpecsContentView
        status="idle"
        outlinePreview={['1. Requirements', '2. API Design']}
        warnings={[]}
        {...mockHandlers}
      />
    );

    // Check for outline preview
    expect(screen.getByText('Preview Outline')).toBeInTheDocument();
    expect(screen.getByText('1. Requirements')).toBeInTheDocument();
    expect(screen.getByText('2. API Design')).toBeInTheDocument();

    // Check that no warnings are displayed
    expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
  });

  it('renders success state with generated specification and warnings', () => {
    const result = {
      markdown: '# Technical Specification\n\nThis is a sample specification.',
      raw: 'This is a sample specification.'
    };

    render(
      <SpecsContentView
        status="success"
        result={result}
        outlinePreview={[]}
        warnings={['Implementation plan is missing detailed technical requirements']}
        {...mockHandlers}
      />
    );

    // Check for warnings
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Implementation plan is missing detailed technical requirements')).toBeInTheDocument();

    // Check for generated specification
    expect(screen.getByText('Generated Specification')).toBeInTheDocument();
    expect(screen.getByText('# Technical Specification')).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Open in Chat')).toBeInTheDocument();
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
  });

  it('renders generating state with preview and warnings', () => {
    render(
      <SpecsContentView
        status="generating"
        preview="Generating technical specification..."
        outlinePreview={[]}
        warnings={['Implementation plan is missing detailed technical requirements']}
        {...mockHandlers}
      />
    );

    // Check for warnings
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Implementation plan is missing detailed technical requirements')).toBeInTheDocument();

    // Check for generating state
    expect(screen.getByText('Generating Specification')).toBeInTheDocument();
    expect(screen.getByText('Generating technical specification...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders error state with preview and warnings', () => {
    render(
      <SpecsContentView
        status="error"
        preview="Failed to generate specification"
        outlinePreview={[]}
        warnings={['Implementation plan is missing detailed technical requirements']}
        {...mockHandlers}
      />
    );

    // Check for warnings
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Implementation plan is missing detailed technical requirements')).toBeInTheDocument();

    // Check for error state
    expect(screen.getByText('Error generating specification')).toBeInTheDocument();
    expect(screen.getByText('Failed to generate specification')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders errors when provided', () => {
    const errors = [
      'No implementation plan found. Please generate an implementation plan first in the List tab.',
      'API key is missing. Please configure your API key in the Chatbox settings.'
    ];

    render(
      <SpecsContentView
        status="idle"
        errors={errors}
        outlinePreview={[]}
        warnings={[]}
        {...mockHandlers}
      />
    );

    // Check for errors
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText(errors[0])).toBeInTheDocument();
    expect(screen.getByText(errors[1])).toBeInTheDocument();

    // Check that other content is not displayed
    expect(screen.queryByText('Preview Outline')).not.toBeInTheDocument();
    expect(screen.queryByText('Generate Specification')).not.toBeInTheDocument();
  });
});
