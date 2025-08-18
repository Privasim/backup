import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataDrivenInsights } from '../DataDrivenInsights';
import { DataDrivenInsightsModel } from '../types';

const mockInsights: DataDrivenInsightsModel = {
  summary: 'High automation risk detected for administrative roles',
  threatDrivers: ['AI automation', 'Remote work trends'],
  automationExposure: [
    { task: 'Data entry', exposure: 85 },
    { task: 'Report generation', exposure: 65 }
  ],
  skillImpacts: [
    { skill: 'Data analysis', impact: 'high', rationale: 'AI tools increasingly capable' },
    { skill: 'Communication', impact: 'medium', rationale: 'Human interaction still valued' }
  ],
  mitigation: [
    { action: 'Learn AI tools', priority: 'high' },
    { action: 'Develop creative skills', priority: 'medium' }
  ],
  sources: [
    { title: 'McKinsey Global Institute' },
    { title: 'World Economic Forum' }
  ]
};

describe('DataDrivenInsights', () => {
  it('renders loading state', () => {
    render(<DataDrivenInsights loading={true} />);
    expect(screen.getByText('Analyzing job risk data...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<DataDrivenInsights errors={['Failed to load data']} />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<DataDrivenInsights />);
    expect(screen.getByText('No insights available')).toBeInTheDocument();
  });

  it('renders insights with all sections', () => {
    render(<DataDrivenInsights insights={mockInsights} />);
    
    expect(screen.getByText('High automation risk detected for administrative roles')).toBeInTheDocument();
    expect(screen.getByText('Threat Drivers')).toBeInTheDocument();
    expect(screen.getByText('AI automation')).toBeInTheDocument();
    expect(screen.getByText('Automation Exposure')).toBeInTheDocument();
    expect(screen.getByText('Data entry')).toBeInTheDocument();
    expect(screen.getByText('Skill Impacts')).toBeInTheDocument();
    expect(screen.getByText('Data analysis')).toBeInTheDocument();
    expect(screen.getByText('Mitigation Strategies')).toBeInTheDocument();
    expect(screen.getByText('Learn AI tools')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
  });

  it('renders custom slots', () => {
    render(
      <DataDrivenInsights 
        insights={mockInsights} 
        slots={{
          headerRight: <div>Custom header</div>
        }}
      />
    );
    
    expect(screen.getByText('Custom header')).toBeInTheDocument();
  });

  it('renders risk score with proper color coding', () => {
    render(<DataDrivenInsights insights={mockInsights} />);
    
    const riskScore = screen.getByText('85');
    expect(riskScore).toHaveClass('text-red-600');
  });

  it('renders priority badges correctly', () => {
    render(<DataDrivenInsights insights={mockInsights} />);
    
    const highPriority = screen.getByText('High');
    expect(highPriority).toHaveClass('bg-red-100');
  });
});
