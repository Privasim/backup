# Wireframe Artifact Studio Implementation Tasks

## Core System Implementation

- [ ] 1. Create wireframe prompt engineering module
  - Implement `extractFirstCodeBlock` function for parsing AI responses
  - Create `DESIGN_SYSTEM_PROMPT` with React UMD constraints (no JSX, no imports)
  - Build `createWireframePrompt` function for proper message construction
  - _Requirements: 1.1, 1.6, 5.2_

- [ ] 2. Implement wireframe validation system
  - Create `validateWireframeInteractivity` with React hooks and event handler detection
  - Build `createInteractivityFollowupPrompt` for retry scenarios
  - Add `injectMinimalInteractivity` auto-repair function
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Build AI wireframe generation service
  - Implement `askAIToGenerateWireframe` with retry logic and validation
  - Create AI client adapter for OpenRouter integration
  - Add basic caching to avoid redundant API calls
  - _Requirements: 1.1, 2.2, 5.4, 6.1_

- [ ] 4. Create wireframe generation hook
  - Replace `useArtifactGeneration` with `useWireframeGeneration`
  - Integrate validation and retry system
  - Add progress tracking and error state management
  - _Requirements: 1.1, 2.1, 7.1_

## UI Components

- [ ] 5. Build WireframeModal component
  - Create modal with prompt input and wireframe preview
  - Add progress indicators and generation controls
  - Implement fullscreen toggle and modal management
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Implement WireframeDisplay component
  - Create interactivity status badges (Interactive/Partial/Static)
  - Add regenerate button for non-interactive wireframes
  - Build error display and recovery options
  - _Requirements: 2.4, 2.5, 7.2_

- [ ] 7. Fix existing SandboxFrame component
  - Update system prompt in `useArtifactGeneration` to generate plain JS instead of TSX
  - Ensure generated code uses React UMD globals and ReactDOM.createRoot
  - Fix validation to work with the new wireframe requirements
  - _Requirements: 3.1, 3.2, 1.6_

## Integration

- [ ] 8. Update artifact studio main component
  - Replace existing generation logic with wireframe system
  - Integrate WireframeModal as primary interface
  - Update navigation to support wireframe-focused workflow
  - _Requirements: 4.1, 4.5_

- [ ] 9. Fix AI prompt engineering
  - Update system prompt to generate React UMD compatible code
  - Remove TSX/JSX generation and enforce React.createElement usage
  - Add interactivity requirements to prompt
  - _Requirements: 1.1, 1.6, 5.2_

- [ ] 10. Test and validate end-to-end flow
  - Test wireframe generation with real AI responses
  - Validate sandbox security and execution
  - Ensure interactivity validation works correctly
  - _Requirements: 1.1, 2.1, 3.1_