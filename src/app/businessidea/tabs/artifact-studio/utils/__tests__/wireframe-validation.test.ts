import { 
  validateWireframeInteractivity, 
  createInteractivityFollowupPrompt, 
  injectMinimalInteractivity,
  WireframeInteractivityResult 
} from '../sandbox-html';

describe('validateWireframeInteractivity', () => {
  describe('Interactive wireframes', () => {
    it('should detect fully interactive wireframes with hooks and handlers', () => {
      const interactiveCode = `
        function WireframeComponent() {
          const [count, setCount] = React.useState(0);
          const [text, setText] = React.useState('');
          const [isActive, setIsActive] = React.useState(false);
          
          return React.createElement('div', { className: 'p-4' },
            React.createElement('button', {
              onClick: () => setCount(count + 1)
            }, 'Count: ' + count),
            React.createElement('input', {
              value: text,
              onChange: (e) => setText(e.target.value)
            }),
            React.createElement('button', {
              onClick: () => setIsActive(!isActive)
            }, isActive ? 'Active' : 'Inactive')
          );
        }
      `;
      
      const result = validateWireframeInteractivity(interactiveCode);
      
      expect(result.level).toBe('interactive');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
      expect(result.hasControlledInputs).toBe(true);
      expect(result.missingPatterns).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should detect interactive wireframes with useEffect', () => {
      const codeWithEffect = `
        function WireframeComponent() {
          const [data, setData] = React.useState(null);
          
          React.useEffect(() => {
            setData('loaded');
          }, []);
          
          return React.createElement('div', {
            onClick: () => setData('clicked')
          }, data || 'loading');
        }
      `;
      
      const result = validateWireframeInteractivity(codeWithEffect);
      
      expect(result.level).toBe('partial');
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });

    it('should detect interactive wireframes with multiple event handlers', () => {
      const multiHandlerCode = `
        function WireframeComponent() {
          const [value, setValue] = React.useState('');
          
          return React.createElement('form', {
            onSubmit: (e) => { e.preventDefault(); setValue('submitted'); }
          },
            React.createElement('input', {
              value: value,
              onChange: (e) => setValue(e.target.value),
              onFocus: () => console.log('focused'),
              onBlur: () => console.log('blurred')
            }),
            React.createElement('button', {
              onMouseOver: () => console.log('hover'),
              onClick: () => setValue('clicked')
            }, 'Submit')
          );
        }
      `;
      
      const result = validateWireframeInteractivity(multiHandlerCode);
      
      expect(result.level).toBe('interactive');
      expect(result.hasEventHandlers).toBe(true);
      expect(result.hasControlledInputs).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Partially interactive wireframes', () => {
    it('should detect partial interactivity with hooks but no handlers', () => {
      const partialCode = `
        function WireframeComponent() {
          const [count, setCount] = React.useState(0);
          const [text, setText] = React.useState('hello');
          
          return React.createElement('div', { className: 'p-4' },
            React.createElement('h1', {}, 'Count: ' + count),
            React.createElement('p', {}, 'Text: ' + text)
          );
        }
      `;
      
      const result = validateWireframeInteractivity(partialCode);
      
      expect(result.level).toBe('partial');
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.score).toBeLessThan(70);
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(false);
      expect(result.missingPatterns).toContain('Event handlers (onClick, onChange, etc.)');
      expect(result.suggestions).toContain('Add event handlers to make elements interactive');
    });

    it('should detect partial interactivity with handlers but no hooks', () => {
      const partialCode = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'p-4' },
            React.createElement('button', {
              onClick: () => alert('clicked')
            }, 'Click me'),
            React.createElement('input', {
              onChange: (e) => console.log(e.target.value)
            })
          );
        }
      `;
      
      const result = validateWireframeInteractivity(partialCode);
      
      expect(result.level).toBe('static');
      expect(result.hasHooks).toBe(false);
      expect(result.hasEventHandlers).toBe(true);
      expect(result.missingPatterns).toContain('React.useState for state management');
      expect(result.suggestions).toContain('Add useState hooks to manage component state');
    });

    it('should detect uncontrolled inputs as partial', () => {
      const uncontrolledCode = `
        function WireframeComponent() {
          const [count, setCount] = React.useState(0);
          
          return React.createElement('div', {},
            React.createElement('input', {
              onChange: (e) => console.log(e.target.value)
            }),
            React.createElement('button', {
              onClick: () => setCount(count + 1)
            }, 'Count: ' + count)
          );
        }
      `;
      
      const result = validateWireframeInteractivity(uncontrolledCode);
      
      expect(result.level).toBe('partial');
      expect(result.hasControlledInputs).toBe(false);
      expect(result.missingPatterns).toContain('Controlled inputs with value and onChange');
      expect(result.suggestions).toContain('Make inputs controlled by binding value to state and handling onChange');
    });
  });

  describe('Static wireframes', () => {
    it('should detect static wireframes with no interactivity', () => {
      const staticCode = `
        function WireframeComponent() {
          return React.createElement('div', { className: 'p-4' },
            React.createElement('h1', {}, 'Static Title'),
            React.createElement('p', {}, 'This is static content'),
            React.createElement('button', {}, 'Static Button')
          );
        }
      `;
      
      const result = validateWireframeInteractivity(staticCode);
      
      expect(result.level).toBe('static');
      expect(result.score).toBeLessThan(30);
      expect(result.hasHooks).toBe(false);
      expect(result.hasEventHandlers).toBe(false);
      expect(result.hasControlledInputs).toBe(false);
      expect(result.missingPatterns.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should provide helpful suggestions for static wireframes', () => {
      const staticCode = `
        function WireframeComponent() {
          return React.createElement('div', {}, 'Hello World');
        }
      `;
      
      const result = validateWireframeInteractivity(staticCode);
      
      expect(result.suggestions).toContain('Consider adding buttons, forms, or interactive elements');
      expect(result.suggestions).toContain('Use React.useState to manage component state');
      expect(result.missingPatterns).toContain('React.useState for state management');
      expect(result.missingPatterns).toContain('Event handlers (onClick, onChange, etc.)');
    });

    it('should handle empty or minimal code', () => {
      const minimalCode = `function Component() { return null; }`;
      
      const result = validateWireframeInteractivity(minimalCode);
      
      expect(result.level).toBe('static');
      expect(result.score).toBe(0);
      expect(result.hasHooks).toBe(false);
      expect(result.hasEventHandlers).toBe(false);
      expect(result.hasControlledInputs).toBe(false);
    });
  });

  describe('Edge cases and complex patterns', () => {
    it('should handle multiple useState hooks correctly', () => {
      const multiStateCode = `
        function WireframeComponent() {
          const [name, setName] = React.useState('');
          const [email, setEmail] = React.useState('');
          const [age, setAge] = React.useState(0);
          const [isSubmitted, setIsSubmitted] = React.useState(false);
          
          return React.createElement('form', {
            onSubmit: (e) => { e.preventDefault(); setIsSubmitted(true); }
          },
            React.createElement('input', {
              value: name,
              onChange: (e) => setName(e.target.value)
            }),
            React.createElement('input', {
              value: email,
              onChange: (e) => setEmail(e.target.value)
            })
          );
        }
      `;
      
      const result = validateWireframeInteractivity(multiStateCode);
      
      expect(result.level).toBe('interactive');
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
      expect(result.hasControlledInputs).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('should detect advanced React hooks', () => {
      const advancedHooksCode = `
        function WireframeComponent() {
          const [count, setCount] = React.useState(0);
          const memoizedValue = React.useMemo(() => count * 2, [count]);
          const callback = React.useCallback(() => setCount(c => c + 1), []);
          const ref = React.useRef(null);
          
          return React.createElement('div', {
            ref: ref,
            onClick: callback
          }, 'Value: ' + memoizedValue);
        }
      `;
      
      const result = validateWireframeInteractivity(advancedHooksCode);
      
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
      expect(result.level).toBe('partial');
    });

    it('should handle template literals with state variables', () => {
      const templateLiteralCode = `
        function WireframeComponent() {
          const [user, setUser] = React.useState({ name: 'John', age: 30 });
          
          return React.createElement('div', {
            onClick: () => setUser({ ...user, age: user.age + 1 })
          }, \`Hello \${user.name}, you are \${user.age} years old\`);
        }
      `;
      
      const result = validateWireframeInteractivity(templateLiteralCode);
      
      expect(result.level).toBe('interactive');
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
    });

    it('should handle JSX-style state interpolation', () => {
      const jsxStyleCode = `
        function WireframeComponent() {
          const [items, setItems] = React.useState(['item1', 'item2']);
          
          return React.createElement('div', {},
            React.createElement('p', {}, 'Items: ' + items.length),
            React.createElement('button', {
              onClick: () => setItems([...items, 'new item'])
            }, 'Add Item')
          );
        }
      `;
      
      const result = validateWireframeInteractivity(jsxStyleCode);
      
      expect(result.level).toBe('interactive');
      expect(result.hasHooks).toBe(true);
      expect(result.hasEventHandlers).toBe(true);
    });
  });

  describe('Scoring system', () => {
    it('should assign correct scores for different interactivity levels', () => {
      const testCases = [
        {
          code: `function C() { return React.createElement('div', {}, 'static'); }`,
          expectedLevel: 'static',
          expectedScoreRange: [0, 30]
        },
        {
          code: `function C() { const [s] = React.useState(0); return React.createElement('div', {}, s); }`,
          expectedLevel: 'partial',
          expectedScoreRange: [35, 70]
        },
        {
          code: `function C() { const [s, setS] = React.useState(0); return React.createElement('button', { onClick: () => setS(s + 1) }, s); }`,
          expectedLevel: 'partial',
          expectedScoreRange: [50, 100]
        }
      ];

      testCases.forEach(({ code, expectedLevel, expectedScoreRange }) => {
        const result = validateWireframeInteractivity(code);
        expect(result.level).toBe(expectedLevel);
        expect(result.score).toBeGreaterThanOrEqual(expectedScoreRange[0]);
        expect(result.score).toBeLessThanOrEqual(expectedScoreRange[1]);
      });
    });

    it('should give higher scores for more interactive patterns', () => {
      const basicInteractive = `
        function C() {
          const [count, setCount] = React.useState(0);
          return React.createElement('button', { onClick: () => setCount(count + 1) }, count);
        }
      `;

      const advancedInteractive = `
        function C() {
          const [count, setCount] = React.useState(0);
          const [text, setText] = React.useState('');
          const [active, setActive] = React.useState(false);
          
          React.useEffect(() => {}, [count]);
          
          return React.createElement('div', {},
            React.createElement('button', { onClick: () => setCount(count + 1) }, count),
            React.createElement('input', { value: text, onChange: (e) => setText(e.target.value) }),
            React.createElement('button', { onClick: () => setActive(!active) }, active ? 'On' : 'Off')
          );
        }
      `;

      const basicResult = validateWireframeInteractivity(basicInteractive);
      const advancedResult = validateWireframeInteractivity(advancedInteractive);

      expect(advancedResult.score).toBeGreaterThan(basicResult.score);
    });
  });
});