# Wireframe Artifact Studio Implementation Tasks

## Backend Process Fixes (Priority 1 - Core Issues)

- [ ] 1. Fix AI prompt engineering for wireframe generation
  - Update system prompt in `useArtifactGeneration.ts` to generate plain JavaScript instead of TSX
  - Enforce React UMD globals usage (React, ReactDOM) with no imports/exports
  - Add explicit ReactDOM.createRoot(...).render(...) requirement to prompt
  - Include interactivity requirements (useState, event handlers, controlled inputs)
  - _Requirements: 1.1, 1.6, 5.2_

- [ ] 2. Create wireframe validation system
  - Implement `validateWireframeInteractivity` function in existing `sandbox-html.ts`
  - Add detection for React hooks (useState, useEffect), event handlers, and component structure
  - Create `createInteractivityFollowupPrompt` for retry scenarios when validation fails
  - Add `injectMinimalInteractivity` auto-repair function as fallback
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Enhance existing useArtifactGeneration hook
  - Add wireframe-specific validation after code generation
  - Implement retry logic with enhanced prompts when validation fails (max 2 retries)
  - Add auto-repair injection on final retry attempt
  - Integrate caching for successful wireframe results
  - _Requirements: 1.1, 2.2, 6.1_

- [ ] 4. Update code processing pipeline
  - Modify existing code processing in `index.tsx` to use wireframe validation
  - Skip TSX transpilation for valid wireframe code (Path A implementation)
  - Add interactivity status tracking and badge display logic
  - Ensure proper error handling for validation failures
  - _Requirements: 3.1, 3.2, 1.6_

## UI Enhancements (Priority 2 - User Experience)

- [ ] 5. Add interactivity status indicators
  - Enhance existing UI to show wireframe interactivity badges (Interactive/Partial/Static)
  - Add missing patterns display when wireframe is not fully interactive
  - Implement regenerate button for non-interactive wireframes
  - Update progress indicators to show validation and retry phases
  - _Requirements: 2.4, 2.5, 4.2_

- [ ] 6. Improve error handling and recovery
  - Enhance existing error display to show specific validation failures
  - Add actionable error messages with suggested prompt improvements
  - Implement retry mechanisms with exponential backoff for network issues
  - Add clear feedback during validation and retry processes
  - _Requirements: 7.1, 7.2, 7.4_

## Security and Performance (Priority 3 - Optimization)

- [ ] 7. Enhance sandbox security
  - Verify existing CSP implementation blocks external network access
  - Ensure banned token validation catches all security risks
  - Add runtime error reporting from sandbox to parent
  - Test iframe isolation and postMessage security
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Implement result caching
  - Add simple in-memory cache for successful wireframe results
  - Cache key based on prompt + model combination
  - Implement cache eviction strategy (LRU with 50 entry limit)
  - Add cache hit indicators in UI for user feedback
  - _Requirements: 6.1, 6.2, 6.3_

## Testing and Validation (Priority 4 - Quality Assurance)

- [ ] 9. Create wireframe validation tests
  - Test validation logic with various code samples (interactive, partial, static)
  - Verify retry logic works correctly with failed validations
  - Test auto-repair injection produces valid interactive wireframes
  - Validate caching behavior and cache key generation
  - _Requirements: 1.1, 2.1, 6.1_

- [ ] 10. End-to-end integration testing
  - Test complete wireframe generation flow with real AI responses
  - Verify sandbox execution with generated wireframes
  - Test error handling scenarios (network failures, invalid responses)
  - Validate UI updates correctly reflect generation status and results
  - _Requirements: 1.1, 2.1, 3.1, 4.1_