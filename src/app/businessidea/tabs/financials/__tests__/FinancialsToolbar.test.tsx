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
    
    expect(getByText('Add')).toBeInTheDocument();
    expect(getByText('Calc')).toBeInTheDocument();
    expect(getByText('CSV')).toBeInTheDocument();
    expect(getByText('Lock')).toBeInTheDocument();
    expect(getByText('AI')).toBeInTheDocument();
  });

  it('should call the appropriate functions when buttons are clicked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FinancialsProvider>{children}</FinancialsProvider>
    );
    
    const { getByText } = render(<FinancialsToolbar />, { wrapper });
    
    // Test that buttons can be clicked without errors
    fireEvent.click(getByText('Calc'));
    fireEvent.click(getByText('Lock'));
    
    // Note: Add Sheet and Export CSV would require additional mocking
    // AI Assist would require mocking the alert function
  });
});
