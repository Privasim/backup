# Business Plan System Prompt Enhancement - Tasks

## Core Implementation Tasks

### 1. Create Business Prompt Templates
**Time**: 2 hours
- [ ] Create `src/lib/business/prompt-templates.ts` with 5 templates
- [ ] Define `BusinessPromptTemplate` interface
- [ ] Add templates: Tech, Consulting, Creative, Retail, General

### 2. Enhance BusinessSuggestionPrompts
**Time**: 2 hours  
**Dependencies**: Task 1
- [ ] Modify `getSystemContext()` to accept custom prompts
- [ ] Update `buildBusinessSuggestionPrompt()` signature
- [ ] Maintain backward compatibility

### 3. Add System Prompt Section to Settings
**Time**: 3 hours  
**Dependencies**: Task 1
- [ ] Reuse existing `SystemPromptSection` pattern in `BusinessPlanSettings.tsx`
- [ ] Add collapsible system prompt section
- [ ] Integrate template selector and custom prompt editor
- [ ] Update settings state management

### 4. Update BusinessSuggestionService
**Time**: 2 hours  
**Dependencies**: Task 2, 3
- [ ] Modify `generateSuggestions()` to accept custom prompts
- [ ] Read custom prompts from settings
- [ ] Pass custom prompts to BusinessSuggestionPrompts

### 5. Settings Storage Enhancement
**Time**: 1 hour  
**Dependencies**: Task 3
- [ ] Update `BusinessPlanSettings` interface
- [ ] Add `systemPrompt` field to settings schema
- [ ] Implement settings migration for existing users

### 6. Integration Testing
**Time**: 1 hour  
**Dependencies**: All tasks
- [ ] Test end-to-end prompt customization flow
- [ ] Verify generated suggestions reflect custom prompts
- [ ] Test settings persistence across sessions

## Implementation Notes

- Reuse existing `SystemPromptSection` component patterns
- Leverage existing validation utilities from `system-prompt-utils.ts`
- Keep changes minimal - extend existing APIs rather than rewrite
- Focus on core functionality: template selection and custom prompt editing

## Acceptance Criteria

- [ ] 5 business prompt templates available
- [ ] Custom prompts modify AI suggestion generation
- [ ] Settings persist across browser sessions
- [ ] No breaking changes to existing functionality
- [ ] Generated suggestions reflect prompt customizations

**Total Estimated Time**: 11 hours