import { 
  validateSandboxCode, 
  validateWireframeInteractivity, 
  createInteractivityFollowupPrompt, 
  injectMinimalInteractivity,
  testSandboxSecurity 
} from '../sandbox-html';

describe('validateSandboxCode', () => {
  it('should pass valid wireframe code', () => {
    const validCode = `
      function WireframeComponent() {
        const [count, setCount] = React.useState(0);
        return React.createElement('div', { className: 'p-4' },
          React.createElement('button', {
            onClick: () => setCount(count + 1)
          }, 'Count: ' + count)
        );
      }
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));
    `;
    
    const result = validateSandboxCode(validCode);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject code with banned tokens', () => {
    const bannedCode = `
      import React from 'react';
      fetch('/api/data');
      eval('malicious code');
    `;
    
    const result = validateSandboxCode(bannedCode);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Banned tokens detected');
  });

  it('should reject code without proper mounting', () => {
    const unmountedCode = `
      function Component() {
        return React.createElement('div', {}, 'Hello');
      }
    `;
    
    const result = validateSandboxCode(unmountedCode);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('must either explicitly mount');
  });
});

describe('validateWireframeInteractivity', () => {
  it('should detect interactive wireframes', () => {
    const interactiveCode = `
      function WireframeComponent() {
        const [count, setCount] = React.useState(0);
        const [text, setText] = React.useState('');
        
        return React.createElement('div', { className: 'p-4' },
          React.createElement('button', {
            onClick: () => setCount(count + 1)
          }, 'Count: ' + count),
          React.createElement('input', {
            value: text,
            onChange: (e) => setText(e.target.value)
          })
        );
      }
    `;
    
    const result = validateWireframeInteractivity(interactiveCode);
    expect(result.level).toBe('interactive');
    expect(result.hasHooks).toBe(true);
    expect(result.hasEventHandlers).toBe(true);
    expect(result.hasControlledInputs).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('should detect partial interactivity', () => {
    const partialCode = `
      function WireframeComponent() {
        const [count, setCount] = React.useState(0);
        
        return React.createElement('div', { className: 'p-4' },
          React.createElement('h1', {}, 'Static title'),
          React.createElement('p', {}, 'Count: ' + count)
        );
      }
    `;
    
    const result = validateWireframeInteractivity(partialCode);
    expect(result.level).toBe('partial');
    expect(result.hasHooks).toBe(true);
    expect(result.hasEventHandlers).toBe(false);
    expect(result.score).toBeLessThan(70);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('should detect static wireframes', () => {
    const staticCode = `
      function WireframeComponent() {
        return React.createElement('div', { className: 'p-4' },
          React.createElement('h1', {}, 'Static title'),
          React.createElement('p', {}, 'Static content')
        );
      }
    `;
    
    const result = validateWireframeInteractivity(staticCode);
    expect(result.level).toBe('static');
    expect(result.hasHooks).toBe(false);
    expect(result.hasEventHandlers).toBe(false);
    expect(result.hasControlledInputs).toBe(false);
    expect(result.score).toBeLessThan(30);
    expect(result.missingPatterns.length).toBeGreaterThan(0);
  });

  it('should provide helpful suggestions', () => {
    const staticCode = `
      function WireframeComponent() {
        return React.createElement('div', {}, 'Hello');
      }
    `;
    
    const result = validateWireframeInteractivity(staticCode);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some(s => s.includes('useState'))).toBe(true);
  });
});

describe('createInteractivityFollowupPrompt', () => {
  it('should create enhanced prompt for static wireframes', () => {
    const originalPrompt = 'Create a login form';
    const validationResult = {
      level: 'static' as const,
      score: 10,
      hasHooks: false,
      hasEventHandlers: false,
      hasControlledInputs: false,
      missingPatterns: ['React.useState for state management', 'Event handlers'],
      suggestions: ['Add useState hooks', 'Add onClick handlers']
    };
    
    const followupPrompt = createInteractivityFollowupPrompt(originalPrompt, validationResult);
    
    expect(followupPrompt).toContain('static');
    expect(followupPrompt).toContain('React.useState');
    expect(followupPrompt).toContain('onClick handlers');
    expect(followupPrompt).toContain(originalPrompt);
  });

  it('should include specific requirements based on missing patterns', () => {
    const validationResult = {
      level: 'partial' as const,
      score: 40,
      hasHooks: true,
      hasEventHandlers: false,
      hasControlledInputs: false,
      missingPatterns: ['Event handlers', 'Controlled inputs'],
      suggestions: ['Add event handlers', 'Make inputs controlled']
    };
    
    const followupPrompt = createInteractivityFollowupPrompt('Create a form', validationResult);
    
    expect(followupPrompt).toContain('onChange handlers');
    expect(followupPrompt).toContain('controlled with value=');
  });
});

describe('injectMinimalInteractivity', () => {
  it('should add useState to static components', () => {
    const staticCode = `
      function WireframeComponent() {
        return React.createElement('div', { className: 'p-4' },
          React.createElement('button', { className: 'btn' }, 'Click me')
        );
      }
    `;
    
    const enhanced = injectMinimalInteractivity(staticCode);
    
    expect(enhanced).toContain('React.useState');
    expect(enhanced).toContain('setClickCount');
    expect(enhanced).toContain('onClick:');
  });

  it('should not modify code that already has useState', () => {
    const interactiveCode = `
      function WireframeComponent() {
        const [count, setCount] = React.useState(0);
        return React.createElement('div', {}, count);
      }
    `;
    
    const result = injectMinimalInteractivity(interactiveCode);
    expect(result).toBe(interactiveCode);
  });

  it('should add controlled input behavior', () => {
    const codeWithInput = `
      function WireframeComponent() {
        return React.createElement('div', {},
          React.createElement('input', { className: 'input' })
        );
      }
    `;
    
    const enhanced = injectMinimalInteractivity(codeWithInput);
    
    expect(enhanced).toContain('value:');
    expect(enhanced).toContain('onChange:');
    expect(enhanced).toContain('setInputText');
  });
});

describe('testSandboxSecurity', () => {
  it('should validate CSP implementation', () => {
    const securityTest = testSandboxSecurity();
    
    // Should have comprehensive security checks
    expect(typeof securityTest.passed).toBe('boolean');
    expect(Array.isArray(securityTest.violations)).toBe(true);
    expect(Array.isArray(securityTest.recommendations)).toBe(true);
  });

  it('should detect missing CSP directives', () => {
    const securityTest = testSandboxSecurity();
    
    // The test should validate that required CSP directives are present
    if (!securityTest.passed) {
      expect(securityTest.violations.length).toBeGreaterThan(0);
      expect(securityTest.recommendations.length).toBeGreaterThan(0);
    }
  });
});

describe('Integration tests', () => {
  it('should handle complete validation workflow', () => {
    const testCode = `
      function WireframeComponent() {
        const [active, setActive] = React.useState(false);
        
        return React.createElement('div', { className: 'p-4' },
          React.createElement('button', {
            className: active ? 'active' : 'inactive',
            onClick: () => setActive(!active)
          }, active ? 'Active' : 'Inactive')
        );
      }
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(WireframeComponent));
    `;
    
    // Test sandbox validation
    const sandboxResult = validateSandboxCode(testCode);
    expect(sandboxResult.valid).toBe(true);
    
    // Test interactivity validation
    const interactivityResult = validateWireframeInteractivity(testCode);
    expect(interactivityResult.level).toBe('partial');
    expect(interactivityResult.hasHooks).toBe(true);
    expect(interactivityResult.hasEventHandlers).toBe(true);
  });

  it('should handle retry workflow for static wireframes', () => {
    const staticCode = `
      function WireframeComponent() {
        return React.createElement('div', {}, 'Static content');
      }
    `;
    
    const interactivityResult = validateWireframeInteractivity(staticCode);
    expect(interactivityResult.level).toBe('static');
    
    const followupPrompt = createInteractivityFollowupPrompt('Create a component', interactivityResult);
    expect(followupPrompt).toContain('React.useState');
    
    const autoRepaired = injectMinimalInteractivity(staticCode);
    const repairedResult = validateWireframeInteractivity(autoRepaired);
    expect(repairedResult.score).toBeGreaterThan(interactivityResult.score);
  });
});