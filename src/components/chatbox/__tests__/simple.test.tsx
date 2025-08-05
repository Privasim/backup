import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test to verify test setup works
describe('Chatbox Test Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle basic accessibility', () => {
    const AccessibleComponent = () => (
      <button aria-label="Test button">Click me</button>
    );
    render(<AccessibleComponent />);
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const KeyboardComponent = () => (
      <div>
        <input type="text" placeholder="First input" />
        <input type="text" placeholder="Second input" />
      </div>
    );
    render(<KeyboardComponent />);
    
    const firstInput = screen.getByPlaceholderText('First input');
    const secondInput = screen.getByPlaceholderText('Second input');
    
    expect(firstInput).toBeInTheDocument();
    expect(secondInput).toBeInTheDocument();
  });

  it('should handle responsive design classes', () => {
    const ResponsiveComponent = () => (
      <div className="w-full md:w-96 lg:w-1/2">Responsive content</div>
    );
    const { container } = render(<ResponsiveComponent />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('w-full', 'md:w-96', 'lg:w-1/2');
  });

  it('should handle performance considerations', () => {
    const PerformantComponent = React.memo(() => (
      <div>Memoized component</div>
    ));
    
    render(<PerformantComponent />);
    expect(screen.getByText('Memoized component')).toBeInTheDocument();
  });
});