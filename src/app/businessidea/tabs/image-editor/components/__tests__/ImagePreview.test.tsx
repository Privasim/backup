import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImagePreview from '../ImagePreview';

describe('ImagePreview', () => {
  const defaultProps = {
    imageSrc: 'data:image/png;base64,testimage',
    onDownload: jest.fn(),
    onCopy: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no image is provided', () => {
    render(<ImagePreview {...defaultProps} imageSrc={null} />);
    
    expect(screen.getByText('No image selected')).toBeInTheDocument();
    expect(screen.getByText('Generate an image to preview it here')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the image when provided', () => {
    render(<ImagePreview {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.imageSrc);
    expect(image).toHaveAttribute('alt', 'Generated image preview');
  });

  it('renders download and copy buttons', () => {
    render(<ImagePreview {...defaultProps} />);
    
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('calls onDownload when clicking the download button', () => {
    render(<ImagePreview {...defaultProps} />);
    
    const downloadButton = screen.getByText('Download').closest('button');
    fireEvent.click(downloadButton!);
    
    expect(defaultProps.onDownload).toHaveBeenCalled();
  });

  it('calls onCopy when clicking the copy button', () => {
    render(<ImagePreview {...defaultProps} />);
    
    const copyButton = screen.getByText('Copy').closest('button');
    fireEvent.click(copyButton!);
    
    expect(defaultProps.onCopy).toHaveBeenCalled();
  });

  it('shows copied state after successful copy', async () => {
    render(<ImagePreview {...defaultProps} />);
    
    const copyButton = screen.getByText('Copy').closest('button');
    fireEvent.click(copyButton!);
    
    // Wait for state update
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.getByText('Copied')).toHaveClass('text-green-500');
  });

  it('does not show buttons when no image is provided', () => {
    render(<ImagePreview {...defaultProps} imageSrc={null} />);
    
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('has accessible labels on buttons', () => {
    render(<ImagePreview {...defaultProps} />);
    
    const downloadButton = screen.getByLabelText('Download image');
    const copyButton = screen.getByLabelText('Copy image to clipboard');
    
    expect(downloadButton).toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();
  });
});
