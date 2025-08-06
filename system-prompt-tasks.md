# System Prompt Integration - ChatboxControls Tasks

## Core Implementation (Essential - 50 lines max)

### Task 1: Add System Prompt UI to ChatboxControls.tsx
- [ ] Insert system prompt section between API key input and debug panel
- [ ] Add template dropdown with 4 predefined options (Professional, Friendly, Technical, Custom)
- [ ] Create textarea with 50-2000 character validation and counter
- [ ] Use existing compact styling patterns for consistency
- [ ] Add reset button to restore default template

### Task 2: Extend Validation System
- [ ] Add `validateSystemPrompt(prompt: string)` to validation-utils.ts
- [ ] Extend `validateAnalysisConfig()` to include system prompt validation
- [ ] Implement character limits (50-2000) and basic content filtering
- [ ] Update validation state management in ChatboxControls

### Task 3: Update Settings Management
- [ ] Add system prompt template storage to settings-utils.ts
- [ ] Create `getSystemPromptTemplates()` and `saveCustomPrompt()` functions
- [ ] Implement template persistence using existing localStorage pattern
- [ ] Add last-used template preference storage

### Task 4: Create Template Constants
- [ ] Define 4 system prompt templates in ProfileAnalysisPrompts.ts:
  - Professional Analyst (default): "You are a professional career analyst..."
  - Friendly Coach: "You are a supportive career coach..."
  - Technical Expert: "You are a technical skills assessor..."
  - Custom: User-defined prompt
- [ ] Export template getter functions for UI consumption

### Task 5: Integrate with Analysis Provider
- [ ] Modify `generateProfilePrompt()` to accept custom system prompts
- [ ] Update ProfileAnalysisProvider.ts to use systemPrompt from config
- [ ] Ensure backward compatibility with existing customPrompt field
- [ ] Test analysis flow with different system prompt templates

### Task 6: Component State Integration
- [ ] Add system prompt state variables to ChatboxControls
- [ ] Implement template switching handlers with config updates
- [ ] Add character counting and real-time validation feedback
- [ ] Integrate with existing validation flow and touched state

### Task 7: UI Polish and Testing
- [ ] Match existing input field styling and responsive design
- [ ] Add proper accessibility attributes and keyboard navigation
- [ ] Implement loading states for template switching
- [ ] Write unit tests for validation functions and template management

## Acceptance Criteria
- ✅ System prompt textarea fits seamlessly in existing ChatboxControls layout
- ✅ Template dropdown provides 4 predefined options plus custom
- ✅ Character counter shows real-time validation (50-2000 chars)
- ✅ Prompts persist across sessions using existing settings system
- ✅ Analysis uses custom system prompts correctly
- ✅ No breaking changes to existing functionality
- ✅ Maintains current component performance and styling consistency