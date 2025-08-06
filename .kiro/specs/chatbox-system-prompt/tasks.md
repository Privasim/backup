# Implementation Plan

- [x] 1. Create system prompt templates and utilities


  - Create predefined system prompt templates with categories (analysis style, focus areas)
  - Implement template management utilities for loading and validation
  - Add prompt validation functions (length, content safety)
  - _Requirements: 2.1, 2.2, 3.3_

- [x] 2. Extend settings management for system prompts


  - Add system prompt fields to ChatboxSettingsManager
  - Implement prompt persistence and retrieval methods
  - Add per-model prompt storage capability
  - Create migration utility for existing custom prompts
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Create SystemPromptSection component


  - Build expandable UI section with template selector and custom prompt textarea
  - Implement real-time validation with character count and status indicators
  - Add template preview and selection functionality
  - Create compact collapsed state with active prompt indicator
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 5.2, 5.3, 5.4_

- [x] 4. Integrate SystemPromptSection into ChatboxControls


  - Add SystemPromptSection to the expandable settings panel
  - Connect component to existing config update flow
  - Implement prompt status indicator in main controls area
  - Ensure responsive design and accessibility compliance
  - _Requirements: 1.1, 5.1, 5.2, 5.4_

- [x] 5. Update ProfileAnalysisProvider to use custom system prompts


  - Modify generateProfilePrompt to accept and use custom system prompts
  - Ensure custom prompts override template system prompts when provided
  - Maintain backward compatibility with existing customPrompt field
  - Add fallback behavior for invalid or missing prompts
  - _Requirements: 1.3, 1.4, 2.3_

- [x] 6. Add comprehensive testing


  - Write unit tests for SystemPromptSection component interactions
  - Create integration tests for prompt flow through analysis pipeline
  - Add settings persistence tests for prompt storage and retrieval
  - Implement accessibility tests for keyboard navigation and screen readers
  - _Requirements: 1.1, 1.3, 2.1, 4.1_

- [x] 7. Update validation and error handling



  - Integrate system prompt validation into existing ChatboxControls validation
  - Add error states for invalid prompts and template loading failures
  - Implement graceful degradation when custom prompts fail
  - Update touched state handling to include system prompt changes
  - _Requirements: 3.2, 3.3, 1.4_