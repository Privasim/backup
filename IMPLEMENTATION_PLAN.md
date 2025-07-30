# OpenRouter Function Calling Implementation Plan

## Implementation Rules

1. **Strict Requirements**
   - ❌ ABSOLUTELY NO MOCK DATA in production code
   - ❌ NO NEW FILES - modify existing files only
   - ✅ PRESERVE debug panel functionality
   - ✅ ENHANCE error visibility in debug panel
   - ✅ USE TypeScript interfaces for all API contracts
   - ✅ IMPLEMENT proper error boundaries
   - ✅ DOCUMENT all API interactions

2. **Code Quality Standards**
   - TypeScript strict mode
   - No `any` types allowed
   - Error handling for all API calls
   - Input validation for all external data
   - Proper error boundaries in React components
   - Meaningful error messages in UI

## Overview
This document outlines the implementation plan for replacing the mock data implementation with real OpenRouter function calling in the quiz application. The goal is to ensure accurate, transparent, and efficient job risk assessments using AI.

## Files to Modify/Add

### Modified Files
1. `src/lib/assessment/prompt-builder.ts`
   - **Purpose**: Extend to include function schema for structured output.
   - **Changes**:
     - Add `buildFunctionSchema` to define the expected JSON structure.
     - Update `buildJobRiskAssessmentPrompt` to include the function schema.
     - Add JSDoc comments for all functions
     - Export interfaces for function schemas

2. `src/components/quiz/QuizForm.tsx`
   - **Purpose**: Update to use the real analyzer while maintaining debug mode.
   - **Changes**:
     - Add error boundary component for the analysis section
     - Enhance debug panel to show:
       - Raw API request/response
       - Validation errors
       - Progress tracking
       - Function call details
     - Add retry logic for failed API calls
     - Implement proper loading states

3. `src/lib/openrouter/client.ts`
   - **Purpose**: Ensure the client supports function calling.
   - **Changes**:
     - Update `chatWithWebSearch` to accept a `functions` parameter
     - Add request/response interceptors for debugging
     - Implement retry logic for rate limits
     - Add detailed error classes (NetworkError, APIError, ValidationError)
     - Export types for function calling

## Implementation Steps

### Pre-Implementation Checks
1. Verify OpenRouter API key is configured
2. Ensure all team members have necessary access
3. Review rate limits and quotas
4. Set up error tracking (Sentry/LogRocket)

### Development Workflow
1. Work in feature branch: `feat/openrouter-function-calling`
2. Make atomic commits with clear messages
3. Reference issue numbers in commits
4. No direct pushes to main branch

### Phase 1: Core Function Calling (2 days)
1. **Enhance `prompt-builder.ts`**
   - Add `buildFunctionSchema` with TypeScript interface
   - Update `buildJobRiskAssessmentPrompt` to include function schema
   - Add input validation for all parameters
   - Write unit tests for all exported functions

2. **Update `OpenRouterClient`**
   - Add function calling support to `chatWithWebSearch`
   - Implement request/response interceptors
   - Add proper error types and handling
   - Document all public methods with JSDoc

3. **Modify `QuizForm.tsx`**
   - Add error boundary component
   - Implement real API integration
   - Add loading/error states
   - Preserve debug panel functionality
   - Add retry logic for failed requests

### Phase 2: Error Handling & Validation (1.5 days)
1. **Response Validation**
   - Implement schema validation using Zod
   - Add type guards for API responses
   - Create custom error types for validation failures
   - Log validation errors to debug panel

2. **Error Handling**
   - Implement global error boundary
   - Add error recovery options
   - Log detailed errors to monitoring service
   - Show user-friendly error messages
   - Add error reporting UI in debug panel

### Phase 3: Progress & Debugging (1.5 days)
1. **Progress Tracking**
   - Map API events to progress states
   - Add progress indicators in UI
   - Implement cancellation support
   - Add progress details to debug panel

2. **Debug Panel Enhancements**
   - Show raw request/response data
   - Display validation results
   - Add copy-to-clipboard for debug info
   - Toggle between raw/parsed view
   - Add search/filter for debug logs

## Testing Strategy

### Automated Testing
1. **Unit Tests**
   - Test all utility functions
   - Test API client methods
   - Test validation logic
   - Test error handling

2. **Integration Tests**
   - Test full analysis flow
   - Test error scenarios
   - Test debug panel functionality
   - Test progress tracking

3. **E2E Tests**
   - Test happy path
   - Test error recovery
   - Test debug panel interactions

### Manual Testing
1. **Test Cases**
   - Happy path with valid data
   - Invalid API key
   - Network failures
   - Rate limiting
   - Large responses
   - Slow network conditions

### Unit Tests
1. **`analyzer.ts`**
   - Test `createJobRiskAnalyzer` with mock API responses.
   - Verify `validateResponse` correctly identifies valid and invalid responses.

2. **`prompt-builder.ts`**
   - Ensure `buildFunctionSchema` generates the correct schema.
   - Verify `buildJobRiskAssessmentPrompt` includes the function schema.

### Integration Tests
1. **Full Flow Test**
   - Test the entire flow from form submission to result display.
   - Mock the OpenRouter API to simulate different scenarios (success, error, malformed response).

### Manual Testing
1. **Debug Mode**
   - Verify the application works correctly with `USE_MOCK_DATA=true`.

2. **Real API Mode**
   - Test with a valid OpenRouter API key.
   - Verify the progress updates and final results are displayed correctly.

## Rollback Plan

### Criteria for Rollback
- Critical errors in production
- Performance degradation
- Data integrity issues
- Security vulnerabilities

### Rollback Steps
1. Revert feature branch
2. Run full test suite
3. Deploy previous version
4. Verify functionality
5. Document the rollback

### Post-Rollback
1. Root cause analysis
2. Fix identified issues
3. Update test cases
4. Schedule re-deployment

### Steps to Revert
1. **Revert Code Changes**
   - Checkout the previous commit before the implementation.
   - Or, manually revert changes to the modified files.

2. **Verify Debug Mode**
   - Ensure the application runs correctly in debug mode.
   - Verify all tests pass.

### Fallback Mechanism
- The debug mode (`USE_MOCK_DATA=true`) will remain as a fallback.
- Document the environment variable in the README for easy toggling.

## Timeline
1. **Phase 1**: 2 days
2. **Phase 2**: 1 day
3. **Phase 3**: 1 day
4. **Testing**: 1 day
5. **Documentation**: 0.5 day

**Total Estimated Time**: 5.5 days

## Dependencies
- OpenRouter API access with a valid API key.
- Node.js v14+ and npm/yarn for development.
- Testing frameworks: Jest, React Testing Library.

## Risks and Mitigations
1. **API Rate Limiting**
   - **Risk**: Hitting API rate limits during testing.
   - **Mitigation**: Use mock data for development and testing where possible.

2. **Response Validation Failures**
   - **Risk**: API returns unexpected data structure.
   - **Mitigation**: Implement robust validation and fallback to error messages.

3. **Performance Issues**
   - **Risk**: Real API calls may be slower than mock data.
   - **Mitigation**: Optimize API calls and implement loading states.

## Success Criteria
1. The application successfully retrieves and displays job risk assessments using the OpenRouter API.
2. The UI provides clear feedback during the analysis process.
3. All existing functionality remains intact when using debug mode.
4. The code is well-documented and tested.

## Next Steps
1. Review and approve this implementation plan.
2. Begin implementation starting with Phase 1.
3. Regularly test and validate each phase before proceeding to the next.
