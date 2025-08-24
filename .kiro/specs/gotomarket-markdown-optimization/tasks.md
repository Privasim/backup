# Implementation Plan

- [ ] 1. Add content length types and configuration
  - Add ContentLength type and ContentLengthConfig interface to types.ts
  - Create content length configuration with sentence ranges and section limits
  - Update GenerationOptions to include contentLength property
  - _Requirements: 2.1, 2.2, 4.1_

- [ ] 2. Create markdown prompt builder
  - Create MarkdownPromptBuilder class with length-aware prompt generation
  - Implement brief, standard, and detailed prompt templates
  - Add sentence count guidance and section structure instructions
  - Replace JSON format requests with Markdown format in prompts
  - _Requirements: 1.1, 2.3, 2.4_

- [ ] 3. Implement markdown strategy processor
  - Create MarkdownStrategyProcessor to parse AI markdown responses
  - Implement section extraction using regex patterns for headers
  - Add content validation and structure verification
  - Create conversion utilities for backward compatibility
  - _Requirements: 1.2, 3.1, 6.1_

- [ ] 4. Update service layer for markdown generation
  - Modify GoToMarketV2Service to use markdown prompts
  - Update response processing to handle markdown instead of JSON
  - Implement streaming markdown processing with progressive display
  - Add error handling for malformed markdown content
  - _Requirements: 1.3, 5.1, 5.4_

- [ ] 5. Create content length selector component
  - Build ContentLengthSelector UI component with three options
  - Add descriptions and estimated read times for each length
  - Implement selection persistence in local storage
  - Integrate selector into generation options panel
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 6. Update strategy display for markdown
  - Modify StrategyDisplay to render markdown content directly
  - Replace complex card components with markdown sections
  - Add inline editing capabilities for markdown content
  - Implement section-based completion tracking
  - _Requirements: 3.2, 3.3, 1.3_

- [ ] 7. Implement markdown caching system
  - Update useStrategyPersistence to handle markdown format
  - Add content length as cache key parameter
  - Implement cache invalidation based on length changes
  - Create migration utilities for existing JSON cache
  - _Requirements: 4.3, 6.2, 5.2_

- [ ] 8. Add legacy JSON conversion support
  - Create LegacyStrategyConverter for JSON to markdown conversion
  - Update import functionality to handle both formats
  - Add conversion validation and error handling
  - Implement graceful fallback for conversion failures
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 9. Update export utilities for markdown-first approach
  - Modify export-utils to prioritize markdown format
  - Update JSON export to convert from markdown base
  - Add content length metadata to exported files
  - Implement markdown-specific export optimizations
  - _Requirements: 1.5, 6.2_

- [ ] 10. Enhance progress indicator for markdown streaming
  - Update ProgressIndicator to show markdown content preview
  - Add section-based progress tracking (Marketing, Sales, etc.)
  - Implement real-time word count and estimated completion
  - Add content length progress validation
  - _Requirements: 5.5, 1.4_

- [ ] 11. Add content length validation and feedback
  - Create ContentLengthValidator for sentence counting
  - Implement real-time feedback on content length compliance
  - Add suggestions for content that doesn't meet length requirements
  - Create user notifications for length preference changes
  - _Requirements: 2.5, 5.3_

- [ ] 12. Update tests for markdown processing
  - Create unit tests for MarkdownPromptBuilder with different lengths
  - Add tests for MarkdownStrategyProcessor parsing accuracy
  - Test content length validation across all three levels
  - Add integration tests for markdown generation flow
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 13. Performance optimization and error handling
  - Implement streaming markdown parser for better performance
  - Add graceful degradation for partial markdown content
  - Optimize regex patterns for section extraction
  - Add comprehensive error boundaries for markdown processing
  - _Requirements: 5.1, 5.4, 1.4_

- [ ] 14. Final integration and user experience polish
  - Integrate content length selector into main generation flow
  - Add tooltips and help text for content length options
  - Implement smooth transitions between different content lengths
  - Add accessibility features for markdown content display
  - Test end-to-end markdown generation with all length options
  - _Requirements: 4.1, 4.2, 3.2_