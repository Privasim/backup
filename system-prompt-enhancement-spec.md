# System Prompt Enhancement Specification

## Overview
Add customizable system prompt functionality to the chatbox controls, allowing users to define how the AI assistant behaves and responds during profile analysis.

## Current Architecture Analysis

### Key Components
- **ChatboxControls.tsx**: Main UI for configuration (model, API key, analysis controls)
- **ChatboxProvider.tsx**: State management and analysis orchestration
- **AnalysisConfig**: Configuration interface with `customPrompt?: string` field (already exists)
- **ProfileAnalysisProvider.ts**: Handles prompt generation and API calls
- **ProfileAnalysisPrompts.ts**: Template system for different analysis types

### Current Prompt System
- Template-based prompts with variable substitution
- Three predefined templates: default-profile, career-transition, skills-assessment
- System prompt + user prompt structure
- Custom prompt support exists but not exposed in UI

## Requirements

### Functional Requirements
1. **System Prompt Input**: Text area for users to define AI behavior and response style
2. **Prompt Templates**: Dropdown with predefined system prompts for common use cases
3. **Template Management**: Save, load, and delete custom templates
4. **Validation**: Ensure prompts are reasonable length and format
5. **Preview**: Show how the prompt will be used in analysis
6. **Persistence**: Save user's custom prompts across sessions

### Non-Functional Requirements
- Minimal UI footprint (fits within existing collapsible settings)
- Fast template switching
- Secure storage of custom prompts
- Backward compatibility with existing analysis flow

## Design

### UI Components
```
Settings Panel (Expandable)
├── Model Selection (existing)
├── API Key Input (existing)
├── System Prompt Section (NEW)
│   ├── Template Dropdown
│   ├── Custom Prompt Textarea
│   ├── Character Counter
│   └── Preview Toggle
└── Action Bar (existing)
```

### Data Structure
```typescript
interface SystemPromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isCustom: boolean;
  createdAt: string;
}

interface AnalysisConfig {
  // existing fields...
  systemPrompt?: string;
  systemPromptTemplate?: string;
}
```

### Storage Schema
```typescript
interface ChatboxStorage {
  // existing fields...
  systemPromptTemplates: SystemPromptTemplate[];
  lastUsedSystemPrompt?: string;
}
```

## Implementation Plan

### Phase 1: Core System Prompt UI (Primary)
1. Add system prompt textarea to ChatboxControls
2. Integrate with existing AnalysisConfig.customPrompt
3. Update validation to include prompt length limits
4. Modify ProfileAnalysisProvider to use system prompts

### Phase 2: Template System (Secondary)
1. Create predefined system prompt templates
2. Add template dropdown to UI
3. Implement template switching logic
4. Add custom template save/load functionality

### Phase 3: Enhanced Features (Optional)
1. Prompt preview functionality
2. Template sharing/export
3. Advanced prompt validation
4. Usage analytics

## Technical Implementation

### Files to Modify
1. `src/components/chatbox/ChatboxControls.tsx` - Add UI components
2. `src/components/chatbox/types.ts` - Extend interfaces
3. `src/components/chatbox/utils/validation-utils.ts` - Add prompt validation
4. `src/components/chatbox/utils/settings-utils.ts` - Add template storage
5. `src/lib/chatbox/ProfileAnalysisProvider.ts` - Use system prompts

### Key Functions
```typescript
// Validation
validateSystemPrompt(prompt: string): ValidationResult

// Template Management
getSystemPromptTemplates(): SystemPromptTemplate[]
saveSystemPromptTemplate(template: SystemPromptTemplate): void
deleteSystemPromptTemplate(id: string): void

// Prompt Processing
processSystemPrompt(prompt: string, context: AnalysisConfig): string
```

## Success Criteria
- Users can input custom system prompts
- Prompts are validated and stored securely
- Analysis uses custom system prompts correctly
- UI remains clean and intuitive
- No breaking changes to existing functionality

## Risk Mitigation
- **Prompt Injection**: Validate and sanitize user inputs
- **Storage Limits**: Implement prompt length limits (max 2000 chars)
- **Performance**: Lazy load templates, efficient storage
- **Compatibility**: Graceful fallback to default prompts

## Testing Strategy
- Unit tests for validation functions
- Integration tests for prompt processing
- UI tests for template switching
- E2E tests for complete analysis flow

## Rollout Plan
1. **Development**: Implement Phase 1 features
2. **Internal Testing**: Validate with predefined prompts
3. **Beta Release**: Limited user testing with feedback
4. **Production**: Full rollout with monitoring

## Future Enhancements
- Prompt marketplace/sharing
- AI-assisted prompt optimization
- Multi-language prompt support
- Advanced prompt analytics