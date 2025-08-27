import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabNavigation from '../TabNavigation';
import { TabProvider } from '../TabContext';

// Mock the tab context
const MockTabProvider = ({ children, initialTab = 'businessplan' }: { children: React.ReactNode; initialTab?: string }) => (
  <TabProvider initialTab={initialTab}>
    {children}
  </TabProvider>
);

describe('TabNavigation', () => {
  it('renders all tab buttons including implementation-plan', () => {
    render(
      <MockTabProvider>
        <TabNavigation />
      </MockTabProvider>
    );

    // Check that the implementation-plan tab is rendered
    const planTab = screen.getByLabelText('Plan');
    expect(planTab).toBeInTheDocument();
    
    // Check other tabs are still there
    expect(screen.getByLabelText('List')).toBeInTheDocument();
    expect(screen.getByLabelText('Financials')).toBeInTheDocument();
    expect(screen.getByLabelText('Tools')).toBeInTheDocument();
    expect(screen.getByLabelText('Visualization')).toBeInTheDocument();
    expect(screen.getByLabelText('Go-to-Market')).toBeInTheDocument();
    expect(screen.getByLabelText('Specs')).toBeInTheDocument();
  });

  it('shows active state for implementation-plan tab when selected', () => {
    render(
      <MockTabProvider initialTab="implementation-plan">
        <TabNavigation />
      </MockTabProvider>
    );

    const planTab = screen.getByLabelText('Plan');
    expect(planTab).toHaveClass('text-indigo-600');
  });

  it('allows clicking on implementation-plan tab', () => {
    render(
      <MockTabProvider>
        <TabNavigation />
      </MockTabProvider>
    );

    const planTab = screen.getByLabelText('Plan');
    fireEvent.click(planTab);

    // The tab should be clickable (no errors thrown)
    expect(planTab).toBeInTheDocument();
  });

  it('shows hover state for implementation-plan tab', () => {
    render(
      <MockTabProvider>
        <TabNavigation />
      </MockTabProvider>
    );

    const planTab = screen.getByLabelText('Plan');
    
    fireEvent.mouseEnter(planTab);
    // Should have hover classes applied
    expect(planTab).toHaveClass('hover:text-gray-700', 'hover:bg-gray-50');
    
    fireEvent.mouseLeave(planTab);
  });

  it('displays correct icon for implementation-plan tab', () => {
    render(
      <MockTabProvider>
        <TabNavigation />
      </MockTabProvider>
    );

    const planTab = screen.getByLabelText('Plan');
    // Check that the ClipboardDocumentCheckIcon is rendered (by checking for SVG)
    const icon = planTab.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});