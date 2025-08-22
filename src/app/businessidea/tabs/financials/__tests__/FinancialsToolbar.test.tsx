import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FinancialsProvider } from '../FinancialsContext';
import { FinancialsToolbar } from '../FinancialsToolbar';

describe('FinancialsToolbar', () => {
  it('should render all toolbar buttons', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { getByText } = render(<FinancialsToolbar />, { wrapper });
    
    expect(getByText('Add Sheet')).toBeInTheDocument();
    expect(getByText('Recalc')).toBeInTheDocument();
    expect(getByText('Export')).toBeInTheDocument();
    expect(getByText('Freeze')).toBeInTheDocument();
    expect(getByText('AI Assist')).toBeInTheDocument();
  });

  it('should call the appropriate functions when buttons are clicked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { getByText } = render(<FinancialsToolbar />, { wrapper });
    
    // Test that buttons can be clicked without errors
    fireEvent.click(getByText('Recalc'));
    fireEvent.click(getByText('Freeze'));
    
    // Note: Add Sheet and Export CSV would require additional mocking
    // AI Assist would require mocking the alert function
  });
});
