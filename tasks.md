# OpenRouter Function Calling Implementation

## CRITICAL: Remove ALL Mock Data - Use Real OpenRouter API Only

### Phase 1: Add Function Calling Support (2 days)
- [ ] 1. **Update OpenRouter Client** (`src/lib/openrouter/client.ts`)
  - Add `functions?: FunctionDefinition[]` to `OpenRouterRequest` interface
  - Add `function_call?: 'auto' | 'none' | { name: string }` parameter
  - Update `chatWithWebSearch()` to accept functions parameter
  - Handle function call responses in addition to regular content

- [ ] 2. **Add Function Schema Builder** (`src/lib/assessment/prompt-builder.ts`)
  - Create `buildFunctionSchema()` returning structured JSON schema
  - Define `FunctionDefinition` interface for OpenRouter function calling
  - Update `buildJobRiskAssessmentPrompt()` to include function schema
  - Export all function calling types and interfaces

- [ ] 3. **Switch to Production Analyzer** (`src/components/quiz/QuizForm.tsx`)
  - Replace `createDebugJobRiskAnalyzer` with `createJobRiskAnalyzer`
  - Update import from `debug-analyzer` to `analyzer`
  - Add error boundary component around analysis section
  - Preserve debug panel functionality for logging

### Phase 2: Remove Mock Data Fallbacks (1 day)
- [ ] 4. **Remove Mock Data Generation** (`src/app/assessment/page.tsx`)
  - Delete `generateMockResult()` function entirely (lines 89-120)
  - Remove fallback mock result calls (lines 55, 61)
  - Ensure assessment page only uses real analysis results
  - Add proper error handling when no analysis results exist

- [ ] 5. **Update Result Processor** (`src/lib/assessment/result-processor.ts`)
  - Add `processFunctionCallResponse()` method
  - Handle both function call and regular content responses
  - Enhance validation for function call structured output
  - Remove any mock data generation in chart components

### Phase 3: Enhanced Error Handling (1 day)
- [ ] 6. **Implement Function Call Validation**
  - Validate function call arguments match expected schema
  - Add specific error messages for function calling failures
  - Log function call details to debug panel
  - Implement retry logic for malformed function responses

- [ ] 7. **Production Testing & Cleanup**
  - Test with real OpenRouter API key and various models
  - Verify no mock data remains in any component
  - Ensure debug panel shows function call details
  - Document function calling implementation

### Success Criteria:
✅ Zero mock data in production code  
✅ All analysis uses OpenRouter function calling  
✅ Debug panel preserved for development  
✅ Error handling maintains user experience  
✅ Function calling works with all supported models