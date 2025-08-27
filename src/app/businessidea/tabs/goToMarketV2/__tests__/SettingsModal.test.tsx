import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';
import { DEFAULT_SETTINGS } from '../types';

describe('SettingsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly when open', () => {
    render(
      <SettingsModal 
        isOpen={true}
        onClose={mockOnClose}
        settings={DEFAULT_SETTINGS}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Strategy Settings')).toBeInTheDocument();
    expect(screen.getByText('Detail Level')).toBeInTheDocument();
    expect(screen.getByText('Distribution Channels')).toBeInTheDocument();
    expect(screen.getByText('Pricing Model')).toBeInTheDocument();
    expect(screen.getByText('Sales Approach')).toBeInTheDocument();
    expect(screen.getByText('Include Timeline')).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    render(
      <SettingsModal 
        isOpen={false}
        onClose={mockOnClose}
        settings={DEFAULT_SETTINGS}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('Strategy Settings')).not.toBeInTheDocument();
  });
  
  it('calls onClose when cancel button is clicked', () => {
    render(
      <SettingsModal 
        isOpen={true}
        onClose={mockOnClose}
        settings={DEFAULT_SETTINGS}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSave with updated settings when apply button is clicked', () => {
    render(
      <SettingsModal 
        isOpen={true}
        onClose={mockOnClose}
        settings={DEFAULT_SETTINGS}
        onSave={mockOnSave}
      />
    );
    
    // Change detail level
    const detailLevelSlider = screen.getByRole('slider');
    fireEvent.change(detailLevelSlider, { target: { value: '5' } });
    
    // Toggle timeline inclusion
    const timelineToggle = screen.getByRole('checkbox', { name: /include timeline/i });
    fireEvent.click(timelineToggle);
    
    // Apply changes
    fireEvent.click(screen.getByText('Apply'));
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      detailLevel: 5,
      includeTimeline: !DEFAULT_SETTINGS.includeTimeline
    }));
  });
  
  it('resets to default settings when reset button is clicked', () => {
    render(
      <SettingsModal 
        isOpen={true}
        onClose={mockOnClose}
        settings={{
          ...DEFAULT_SETTINGS,
          detailLevel: 5,
          includeTimeline: !DEFAULT_SETTINGS.includeTimeline
        }}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Reset to Defaults'));
    fireEvent.click(screen.getByText('Apply'));
    
    expect(mockOnSave).toHaveBeenCalledWith(DEFAULT_SETTINGS);
  });
});
