import { 
  createInteractivityFollowupPrompt,
  WireframeInteractivityResult 
} from '../sandbox-html';

describe('createInteractivityFollowupPrompt', () => {
  describe('Static wireframe prompts', () => {
    it('should create enhanced prompt for static wireframes', () => {
      const originalPrompt = 'Create a login form';
      const validationResult: WireframeInteractivityResult = {
        level: 'static',
        score: 10,
        hasHooks: false,
        hasEventHandlers: false,
        hasControlledInputs: false,
        missingPatterns: ['React.useState for state management', 'Event handlers (onClick, onChange, etc.)'],
        suggestions: ['Add useState hooks', 'Add onClick handlers']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt(originalPrompt, validationResult);
      
      expect(followupPrompt).toContain('static');
      expect(followupPrompt).toContain('React.useState');
      expect(followupPrompt).toContain('onClick handlers');
      expect(followupPrompt).toContain(originalPrompt);
      expect(followupPrompt).toContain('manage at least 2 different state variables');
    });

    it('should include specific requirements for missing hooks', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'static',
        score: 5,
        hasHooks: false,
        hasEventHandlers: false,
        hasControlledInputs: false,
        missingPatterns: ['React.useState for state management'],
        suggestions: ['Add useState hooks']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a counter', validationResult);
      
      expect(followupPrompt).toContain('Use React.useState to manage at least 2 different state variables');
      expect(followupPrompt).toContain('Add onClick handlers to buttons that update state');
      expect(followupPrompt).toContain('Include visual feedback when users interact');
    });

    it('should include form-specific requirements when original prompt mentions forms', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'static',
        score: 0,
        hasHooks: false,
        hasEventHandlers: false,
        hasControlledInputs: false,
        missingPatterns: ['React.useState for state management', 'Event handlers', 'Controlled inputs'],
        suggestions: ['Add state management', 'Add event handlers', 'Make inputs controlled']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a contact form', validationResult);
      
      expect(followupPrompt).toContain('Make all inputs controlled with value={state} and onChange handlers');
      expect(followupPrompt).toContain('Include onChange handlers for form inputs');
    });
  });

  describe('Partial wireframe prompts', () => {
    it('should create targeted prompt for partial wireframes missing handlers', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'partial',
        score: 40,
        hasHooks: true,
        hasEventHandlers: false,
        hasControlledInputs: false,
        missingPatterns: ['Event handlers', 'Controlled inputs'],
        suggestions: ['Add event handlers', 'Make inputs controlled']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a todo app', validationResult);
      
      expect(followupPrompt).toContain('partial but needs to be more interactive');
      expect(followupPrompt).toContain('Add onClick handlers to buttons that update state');
      expect(followupPrompt).toContain('Include onChange handlers for form inputs');
      expect(followupPrompt).not.toContain('Use React.useState'); // Already has hooks
    });

    it('should create targeted prompt for partial wireframes missing hooks', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'partial',
        score: 35,
        hasHooks: false,
        hasEventHandlers: true,
        hasControlledInputs: false,
        missingPatterns: ['React.useState for state management', 'Controlled inputs'],
        suggestions: ['Add useState hooks', 'Make inputs controlled']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a calculator', validationResult);
      
      expect(followupPrompt).toContain('Use React.useState to manage at least 2 different state variables');
      expect(followupPrompt).not.toContain('Add onClick handlers'); // Already has handlers
    });

    it('should handle partial wireframes with controlled inputs missing', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'partial',
        score: 50,
        hasHooks: true,
        hasEventHandlers: true,
        hasControlledInputs: false,
        missingPatterns: ['Controlled inputs'],
        suggestions: ['Make inputs controlled']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a search form', validationResult);
      
      expect(followupPrompt).toContain('controlled with value=');
      expect(followupPrompt).toContain('onChange handlers');
    });
  });

  describe('Prompt structure and formatting', () => {
    it('should include all required sections', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'static',
        score: 0,
        hasHooks: false,
        hasEventHandlers: false,
        hasControlledInputs: false,
        missingPatterns: ['React.useState', 'Event handlers'],
        suggestions: ['Add hooks', 'Add handlers']
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a widget', validationResult);
      
      // Should contain explanation of the issue
      expect(followupPrompt).toContain('static but needs to be more interactive');
      
      // Should contain missing patterns
      expect(followupPrompt).toContain('Missing patterns:');
      
      // Should contain specific requirements
      expect(followupPrompt).toContain('Please regenerate the wireframe with these improvements:');
      
      // Should contain original request
      expect(followupPrompt).toContain('Original request: Create a widget');
      
      // Should contain bullet points for requirements
      expect(followupPrompt).toMatch(/- .+/);
    });

    it('should always include core interactivity requirements', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'partial',
        score: 60,
        hasHooks: true,
        hasEventHandlers: true,
        hasControlledInputs: true,
        missingPatterns: [],
        suggestions: []
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create something', validationResult);
      
      // Even for partial wireframes, should include these core requirements
      expect(followupPrompt).toContain('Include visual feedback when users interact');
      expect(followupPrompt).toContain('Show dynamic content that changes based on user actions');
      expect(followupPrompt).toContain('Add at least one counter, toggle, or form that demonstrates state changes');
    });

    it('should handle empty missing patterns gracefully', () => {
      const validationResult: WireframeInteractivityResult = {
        level: 'partial',
        score: 45,
        hasHooks: true,
        hasEventHandlers: false,
        hasControlledInputs: true,
        missingPatterns: [],
        suggestions: []
      };
      
      const followupPrompt = createInteractivityFollowupPrompt('Create a component', validationResult);
      
      expect(followupPrompt).toContain('partial but needs to be more interactive');
      expect(followupPrompt).toContain('Please regenerate the wireframe');
      expect(followupPrompt).not.toContain('Missing patterns: '); // Should not show empty patterns
    });
  });

  describe('Context-aware requirements', () => {
    it('should detect form context and add form-specific requirements', () => {
      const formPrompts = [
        'Create a login form',
        'Build a registration form',
        'Make a contact form',
        'Design a form for user input',
        'Create an input form'
      ];

      formPrompts.forEach(prompt => {
        const validationResult: WireframeInteractivityResult = {
          level: 'static',
          score: 0,
          hasHooks: false,
          hasEventHandlers: false,
          hasControlledInputs: false,
          missingPatterns: ['Controlled inputs'],
          suggestions: []
        };
        
        const followupPrompt = createInteractivityFollowupPrompt(prompt, validationResult);
        
        expect(followupPrompt).toContain('Make all inputs controlled with value={state} and onChange handlers');
      });
    });

    it('should detect input context and add input-specific requirements', () => {
      const inputPrompts = [
        'Create a search input',
        'Build an input field',
        'Make a text input',
        'Design input components'
      ];

      inputPrompts.forEach(prompt => {
        const validationResult: WireframeInteractivityResult = {
          level: 'partial',
          score: 30,
          hasHooks: false,
          hasEventHandlers: false,
          hasControlledInputs: false,
          missingPatterns: ['Controlled inputs'],
          suggestions: []
        };
        
        const followupPrompt = createInteractivityFollowupPrompt(prompt, validationResult);
        
        expect(followupPrompt).toContain('Make all inputs controlled with value={state} and onChange handlers');
      });
    });

    it('should not add form requirements for non-form prompts', () => {
      const nonFormPrompts = [
        'Create a button',
        'Build a navigation menu',
        'Make a dashboard',
        'Design a card component'
      ];

      nonFormPrompts.forEach(prompt => {
        const validationResult: WireframeInteractivityResult = {
          level: 'static',
          score: 0,
          hasHooks: false,
          hasEventHandlers: false,
          hasControlledInputs: false,
          missingPatterns: [],
          suggestions: []
        };
        
        const followupPrompt = createInteractivityFollowupPrompt(prompt, validationResult);
        
        // Should not contain form-specific requirements for non-form prompts
        expect(followupPrompt).not.toContain('Make all inputs controlled');
      });
    });
  });
});