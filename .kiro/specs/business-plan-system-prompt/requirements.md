# Business Plan System Prompt Enhancement - Requirements

## Overview
Add system prompt customization to BusinessPlanSettings, allowing users to modify AI business suggestion generation through templates and custom prompts.

## Core Requirements

### System Prompt Integration
- Add collapsible "System Prompt" section to BusinessPlanSettings modal
- Support template selection and custom prompt editing
- Integrate with existing BusinessSuggestionPrompts class
- Persist settings in localStorage

### Template System
- Provide 5 pre-built business prompt templates (Tech, Consulting, Creative, Retail, General)
- Template selection with preview functionality
- Template customization capability

### Custom Prompt Editor
- Textarea with real-time validation (2000 char limit)
- Character count display with visual indicators
- Clear button and error/warning messages

### Integration Points
- Modify BusinessSuggestionPrompts.getSystemContext() to accept custom prompts
- Update BusinessSuggestionService to pass custom prompts
- Maintain backward compatibility

## Acceptance Criteria
- [ ] System prompt section integrates seamlessly into existing modal
- [ ] Templates modify business suggestion generation behavior
- [ ] Custom prompts are validated and persist across sessions
- [ ] Generated suggestions reflect prompt customizations
- [ ] Fallback to default behavior when no custom prompt

## Technical Constraints
- Reuse existing SystemPromptSection patterns and utilities
- Must not break existing BusinessSuggestionPrompts API
- Settings must persist in localStorage with migration support
- Input sanitization to prevent prompt injection