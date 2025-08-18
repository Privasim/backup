import React from 'react';
import { DataDrivenInsights } from './DataDrivenInsights';

export function TestComponent() {
  return (
    <div>
      <h1>Test Component</h1>
      <DataDrivenInsights 
        insights={{
          summary: 'Test summary',
          riskScore: 50,
          threatDrivers: ['Test driver 1', 'Test driver 2'],
          automationExposure: [
            { task: 'Test task 1', exposure: 75 },
            { task: 'Test task 2', exposure: 25 }
          ],
          skillImpacts: [
            { skill: 'Test skill 1', impact: 'high', rationale: 'Test rationale' }
          ],
          mitigation: [
            { action: 'Test action 1', priority: 'high' }
          ],
          sources: [
            { title: 'Test source 1' }
          ]
        }}
      />
    </div>
  );
}
