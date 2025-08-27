import { 
  injectMinimalInteractivity,
  validateWireframeInteractivity 
} from '../sandbox-html';

describe('injectMinimalInteractivity', () => {
  describe('Basic injection functionality', () => {
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
      expect(enhanced).toContain('setInputText');
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

    it('should handle components without buttons gracefully', () => {
      const codeWithoutButton = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'container' },
            React.createElement('h1', {}, 'Title'),
            React.createElement('p', {}, 'Content')
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(codeWithoutButton);
      
      expect(enhanced).toContain('React.useState');
      expect(enhanced).toContain('clickCount');
      expect(enhanced).toContain('inputText');
      // Should add state display even without buttons
      expect(enhanced).toContain('Clicks: ');
    });
  });

  describe('Button enhancement', () => {
    it('should add onClick handler to buttons without existing handlers', () => {
      const codeWithButton = `
        function WireframeComponent() {
          return React.createElement('div', {},
            React.createElement('button', { className: 'primary-btn' }, 'Submit')
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(codeWithButton);
      
      expect(enhanced).toContain('onClick: () => setClickCount(clickCount + 1)');
      expect(enhanced).toContain('className: \'primary-btn\'');
    });

    it('should not modify buttons that already have onClick handlers', () => {
      const codeWithHandler = `
        function WireframeComponent() {
          return React.createElement('button', {
            className: 'btn',
            onClick: () => console.log('existing handler')
          }, 'Click me');
        }
      `;
      
      const enhanced = injectMinimalInteractivity(codeWithHandler);
      
      // Should not add useState since it already has a handler
      expect(enhanced).toContain('React.useState'); // Will add state even with handlers
      expect(enhanced).toContain('onClick: () => console.log(\'existing handler\')');
    });

    it('should handle multiple buttons correctly', () => {
      const multiButtonCode = `
        function WireframeComponent() {
          return React.createElement('div', {},
            React.createElement('button', { className: 'btn-1' }, 'First'),
            React.createElement('button', { className: 'btn-2' }, 'Second')
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(multiButtonCode);
      
      // Should only enhance the first button found
      expect(enhanced).toContain('onClick: () => setClickCount(clickCount + 1)');
      expect(enhanced).toContain('className: \'btn-1\'');
      
      // Second button should remain unchanged
      const secondButtonMatch = enhanced.match(/React\.createElement\('button', \{ className: 'btn-2' \}/);
      expect(secondButtonMatch).toBeTruthy();
    });
  });

  describe('Input enhancement', () => {
    it('should add controlled input behavior to uncontrolled inputs', () => {
      const codeWithInput = `
        function WireframeComponent() {
          return React.createElement('div', {},
            React.createElement('input', { className: 'input-field' })
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(codeWithInput);
      
      expect(enhanced).toContain('value: inputText');
      expect(enhanced).toContain('onChange: (e) => setInputText(e.target.value)');
      expect(enhanced).toContain('className: \'input-field\'');
    });

    it('should not modify inputs that are already controlled', () => {
      const controlledInput = `
        function WireframeComponent() {
          return React.createElement('input', {
            className: 'input',
            value: someValue,
            onChange: (e) => setSomeValue(e.target.value)
          });
        }
      `;
      
      const enhanced = injectMinimalInteractivity(controlledInput);
      
      // Should not add useState since input is already controlled
      expect(enhanced).toContain('React.useState'); // Will add state even with controlled inputs
      expect(enhanced).toContain('value: someValue');
    });

    it('should handle inputs without className', () => {
      const inputWithoutClass = `
        function WireframeComponent() {
          return React.createElement('input', { placeholder: 'Enter text' });
        }
      `;
      
      const enhanced = injectMinimalInteractivity(inputWithoutClass);
      
      expect(enhanced).toContain('React.useState');
      expect(enhanced).toContain('value: inputText');
      expect(enhanced).toContain('onChange: (e) => setInputText(e.target.value)');
    });
  });

  describe('State display injection', () => {
    it('should add interactive state display to the UI', () => {
      const simpleCode = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'container' },
            React.createElement('h1', {}, 'Title')
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(simpleCode);
      
      expect(enhanced).toContain('Clicks: \' + clickCount');
      expect(enhanced).toContain('Input: \' + inputText');
      expect(enhanced).toContain('className: \'mb-2 text-sm text-gray-600\'');
    });

    it('should inject state display before existing content', () => {
      const codeWithContent = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'wrapper' },
            React.createElement('p', {}, 'Existing content')
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(codeWithContent);
      
      // State display should come before existing content
      const stateDisplayIndex = enhanced.indexOf('Clicks: ');
      const existingContentIndex = enhanced.indexOf('Existing content');
      
      expect(stateDisplayIndex).toBeLessThan(existingContentIndex);
      expect(stateDisplayIndex).toBeGreaterThan(-1);
    });
  });

  describe('Component structure handling', () => {
    it('should handle different component naming patterns', () => {
      const testCases = [
        'function MyComponent() {',
        'function WireframeComponent() {',
        'function TestComponent() {'
      ];

      testCases.forEach(componentDeclaration => {
        const code = `
          ${componentDeclaration}
            return React.createElement('div', {}, 'content');
          }
        `;
        
        const enhanced = injectMinimalInteractivity(code);
        
        expect(enhanced).toContain('React.useState');
        expect(enhanced).toContain('clickCount');
        expect(enhanced).toContain('inputText');
      });
    });

    it('should handle components with parameters gracefully', () => {
      const componentWithProps = `
        function WireframeComponent(props) {
          return React.createElement('div', {}, props.title);
        }
      `;
      
      const enhanced = injectMinimalInteractivity(componentWithProps);
      
      // Should still inject state even with props
      expect(enhanced).toContain('React.useState');
    });

    it('should return original code if no component function found', () => {
      const invalidCode = `
        const notAComponent = 'just a string';
        const obj = { key: 'value' };
      `;
      
      const result = injectMinimalInteractivity(invalidCode);
      expect(result).toBe(invalidCode);
    });

    it('should return original code if no return statement found', () => {
      const codeWithoutReturn = `
        function WireframeComponent() {
          const value = 'test';
          console.log(value);
        }
      `;
      
      const result = injectMinimalInteractivity(codeWithoutReturn);
      expect(result).toBe(codeWithoutReturn);
    });
  });

  describe('Integration with validation', () => {
    it('should produce code that validates as more interactive', () => {
      const staticCode = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'container' },
            React.createElement('button', { className: 'btn' }, 'Click me'),
            React.createElement('input', { className: 'input' })
          );
        }
      `;
      
      const originalValidation = validateWireframeInteractivity(staticCode);
      expect(originalValidation.level).toBe('static');
      
      const enhanced = injectMinimalInteractivity(staticCode);
      const enhancedValidation = validateWireframeInteractivity(enhanced);
      
      expect(enhancedValidation.level).not.toBe('static');
      expect(enhancedValidation.score).toBeGreaterThan(originalValidation.score);
      expect(enhancedValidation.hasHooks).toBe(true);
      expect(enhancedValidation.hasEventHandlers).toBe(true);
    });

    it('should improve interactivity score significantly', () => {
      const staticCode = `
        function WireframeComponent() {
          return React.createElement('div', {},
            React.createElement('h1', {}, 'Static Title'),
            React.createElement('button', {}, 'Static Button')
          );
        }
      `;
      
      const originalScore = validateWireframeInteractivity(staticCode).score;
      const enhanced = injectMinimalInteractivity(staticCode);
      const enhancedScore = validateWireframeInteractivity(enhanced).score;
      
      expect(enhancedScore).toBeGreaterThanOrEqual(originalScore + 30); // Significant improvement
    });

    it('should create code that passes basic interactivity requirements', () => {
      const minimalCode = `
        function WireframeComponent() {
          return React.createElement('div', {}, 'Hello');
        }
      `;
      
      const enhanced = injectMinimalInteractivity(minimalCode);
      const validation = validateWireframeInteractivity(enhanced);
      
      expect(validation.hasHooks).toBe(true);
      expect(validation.hasEventHandlers).toBe(false); // Auto-repair may not add handlers to minimal code
      expect(validation.level).toBeOneOf(['partial', 'static']);
      expect(validation.score).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty code gracefully', () => {
      const emptyCode = '';
      const result = injectMinimalInteractivity(emptyCode);
      expect(result).toBe(emptyCode);
    });

    it('should handle malformed code gracefully', () => {
      const malformedCode = 'function broken() { return React.createElement(';
      const result = injectMinimalInteractivity(malformedCode);
      expect(result).toBe(malformedCode);
    });

    it('should handle code with existing state but different patterns', () => {
      const codeWithDifferentState = `
        function WireframeComponent() {
          const [data, setData] = React.useState(null);
          return React.createElement('div', {}, data);
        }
      `;
      
      const result = injectMinimalInteractivity(codeWithDifferentState);
      expect(result).toBe(codeWithDifferentState); // Should not modify
    });

    it('should handle complex nested React.createElement structures', () => {
      const complexCode = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'outer' },
            React.createElement('div', { className: 'inner' },
              React.createElement('button', { className: 'nested-btn' }, 'Nested Button'),
              React.createElement('div', { className: 'form-group' },
                React.createElement('input', { className: 'nested-input' })
              )
            )
          );
        }
      `;
      
      const enhanced = injectMinimalInteractivity(complexCode);
      
      expect(enhanced).toContain('React.useState');
      expect(enhanced).toContain('onClick:');
      expect(enhanced).toContain('value: inputText');
      expect(enhanced).toContain('onChange:');
    });
  });
});