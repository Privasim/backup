import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultGallery from '../ResultGallery';

describe('ResultGallery', () => {
  const mockImages = [
    'data:image/png;base64,image1',
    'data:image/png;base64,image2',
    'data:image/png;base64,image3'
  ];
  
  const defaultProps = {
    images: mockImages,
    selectedIndex: 0,
    onSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no images are provided', () => {
    render(<ResultGallery {...defaultProps} images={[]} />);
    
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
  });

  it('renders all images in the gallery', () => {
    render(<ResultGallery {...defaultProps} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    expect(images[0]).toHaveAttribute('src', mockImages[0]);
    expect(images[1]).toHaveAttribute('src', mockImages[1]);
    expect(images[2]).toHaveAttribute('src', mockImages[2]);
  });

  it('highlights the selected image', () => {
    render(<ResultGallery {...defaultProps} selectedIndex={1} />);
    
    const images = screen.getAllByRole('img');
    
    // Check that the container of the second image has the highlight class
    // This is a bit tricky since we need to check the parent element's classes
    const imageContainers = images.map(img => img.closest('div'));
    
    expect(imageContainers[0]).not.toHaveClass('border-indigo-500');
    expect(imageContainers[1]).toHaveClass('border-indigo-500');
    expect(imageContainers[2]).not.toHaveClass('border-indigo-500');
  });

  it('calls onSelect when clicking an image', () => {
    render(<ResultGallery {...defaultProps} />);
    
    const images = screen.getAllByRole('img');
    fireEvent.click(images[2]);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(2);
  });

  it('displays image numbers correctly', () => {
    render(<ResultGallery {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the heading correctly', () => {
    render(<ResultGallery {...defaultProps} />);
    
    expect(screen.getByText('Generated Images')).toBeInTheDocument();
  });
});
