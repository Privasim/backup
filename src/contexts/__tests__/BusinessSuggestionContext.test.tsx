import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BusinessSuggestionProvider, useBusinessSuggestion } from '../BusinessSuggestionContext';
import * as TemplateService from '../../services/TemplateService';

// Mock the TemplateService
jest.mock('../../services/TemplateService', () => ({
  getTemplates: jest.fn(),
  saveTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  getTemplateById: jest.fn(),
  interpolateTemplate: jest.fn()
}));

// Mock the BusinessSuggestionServiceAdapter
jest.mock('../../lib/chatbox/BusinessSuggestionServiceAdapter', () => ({
  businessSuggestionServiceAdapter: {
    generateSuggestions: jest.fn()
  }
}));

// Mock the ChatboxProvider
jest.mock('../../components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    currentAnalysis: { content: 'Test analysis', model: 'test-model', type: 'test', timestamp: Date.now() },
    config: { model: 'test-model', apiKey: 'test-key' },
    profileData: { profile: { industry: 'technology' }, experience: [], skillset: { technical: [] }, metadata: {} }
  })
}));

// Test component that uses the context
const TestComponent = () => {
  const { 
    businessType, 
    setBusinessType, 
    templates, 
    addTemplate, 
    removeTemplate,
    isGenerating,
    generateSuggestions,
    suggestions,
    error
  } = useBusinessSuggestion();

  return (
    <div>
      <div data-testid="business-type">{businessType}</div>
      <div data-testid="templates-count">{templates.length}</div>
      <div data-testid="is-generating">{isGenerating ? 'true' : 'false'}</div>
      <div data-testid="suggestions-count">{suggestions.length}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      
      <button 
        data-testid="set-type-button" 
        onClick={() => setBusinessType('retail')}
      >
        Set Type
      </button>
      
      <button 
        data-testid="add-template-button" 
        onClick={() => addTemplate({ name: 'Test Template', prompt: 'Test prompt', variables: ['test'] })}
      >
        Add Template
      </button>
      
      <button 
        data-testid="remove-template-button" 
        onClick={() => removeTemplate('template-1')}
      >
        Remove Template
      </button>
      
      <button 
        data-testid="generate-button" 
        onClick={() => generateSuggestions()}
      >
        Generate
      </button>
    </div>
  );
};

describe('BusinessSuggestionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    (TemplateService.getTemplates as jest.Mock).mockResolvedValue([
      { id: 'template-1', name: 'Template 1', prompt: 'Prompt 1', variables: ['var1'], createdAt: Date.now() }
    ]);
    
    (TemplateService.saveTemplate as jest.Mock).mockImplementation(
      (template) => Promise.resolve({ ...template, id: 'new-template', createdAt: Date.now() })
    );
    
    const { businessSuggestionServiceAdapter } = require('../../lib/chatbox/BusinessSuggestionServiceAdapter');
    businessSuggestionServiceAdapter.generateSuggestions.mockResolvedValue([
      { 
        id: 'suggestion-1', 
        title: 'Test Suggestion', 
        description: 'Description', 
        category: 'Test', 
        viabilityScore: 80,
        keyFeatures: ['Feature 1'],
        targetMarket: 'Test Market',
        estimatedStartupCost: '$1000'
      }
    ]);
  });

  it('provides the default business type', () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    expect(screen.getByTestId('business-type').textContent).toBe('saas');
  });

  it('allows changing the business type', () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    fireEvent.click(screen.getByTestId('set-type-button'));
    expect(screen.getByTestId('business-type').textContent).toBe('retail');
  });

  it('loads templates on mount', async () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    await waitFor(() => {
      expect(TemplateService.getTemplates).toHaveBeenCalled();
      expect(screen.getByTestId('templates-count').textContent).toBe('1');
    });
  });

  it('adds a new template', async () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('templates-count').textContent).toBe('1');
    });
    
    fireEvent.click(screen.getByTestId('add-template-button'));
    
    await waitFor(() => {
      expect(TemplateService.saveTemplate).toHaveBeenCalledWith({
        name: 'Test Template',
        prompt: 'Test prompt',
        variables: ['test']
      });
      expect(screen.getByTestId('templates-count').textContent).toBe('2');
    });
  });

  it('removes a template', async () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('templates-count').textContent).toBe('1');
    });
    
    fireEvent.click(screen.getByTestId('remove-template-button'));
    
    await waitFor(() => {
      expect(TemplateService.deleteTemplate).toHaveBeenCalledWith('template-1');
      expect(screen.getByTestId('templates-count').textContent).toBe('0');
    });
  });

  it('generates suggestions', async () => {
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    expect(screen.getByTestId('is-generating').textContent).toBe('false');
    expect(screen.getByTestId('suggestions-count').textContent).toBe('0');
    
    fireEvent.click(screen.getByTestId('generate-button'));
    
    expect(screen.getByTestId('is-generating').textContent).toBe('true');
    
    await waitFor(() => {
      const { businessSuggestionServiceAdapter } = require('../../lib/chatbox/BusinessSuggestionServiceAdapter');
      expect(businessSuggestionServiceAdapter.generateSuggestions).toHaveBeenCalled();
      expect(screen.getByTestId('is-generating').textContent).toBe('false');
      expect(screen.getByTestId('suggestions-count').textContent).toBe('1');
    });
  });

  it('handles generation errors', async () => {
    const { businessSuggestionServiceAdapter } = require('../../lib/chatbox/BusinessSuggestionServiceAdapter');
    businessSuggestionServiceAdapter.generateSuggestions.mockRejectedValue(new Error('Test error'));
    
    render(
      <BusinessSuggestionProvider>
        <TestComponent />
      </BusinessSuggestionProvider>
    );
    
    fireEvent.click(screen.getByTestId('generate-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-generating').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('Test error');
    });
  });
});
