# Chatbox System Prompt Integration Specification

## Overview
Add system prompt functionality to the existing ChatboxControls.tsx component, allowing users to customize AI behavior while maintaining the current compact, collapsible design.

## Current Component Analysis

### Existing Structure
- **Compact Design**: Model selection, API key input, and action bar in minimal space
- **Validation System**: Real-time validation with visual feedback
- **Settings Integration**: Uses `useChatboxSettings` for persistence
- **State Management**: Local state with `useChatbox` provider integration
- **Debug Mode**: Development-only debug information panel

### Integration Points
- **Config Object**: `AnalysisConfig` already supports `customPrompt` field
- **Validation**: `validateAnalysisConfig` can be extended for prompt validation
- **Settings**: `useChatboxSettings` can store prompt templates
- **UI Space**: Can fit between API key input and debug panel

## Requirements

### Functional Requirements
1. **System Prompt Input**: Textarea for custom AI behavior instructions
2. **Template Dropdown**: Quick selection of predefined prompt templates
3. **Character Limit**: 50-2000 character validation with counter
4. **Persistence**: Save custom prompts and last used template
5. **Integration**: Seamless integration with existing validation flow

### UI Requirements
- **Compact Design**: Fits existing component layout without expansion
- **Consistent Styling**: Matches current input field styling
- **Responsive**: Works within existing responsive design
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

## Design

### UI Layout (Insert after API Key, before Debug Panel)
```
┌─ System Prompt ────────────────────────────┐
│ Template: [Dropdown ▼] [Reset]            │
│ ┌────────────────────────────────────────┐ │
│ │ Custom prompt textarea...              │ │
│ │                                        │ │
│ └────────────────────────────────────────┘ │
│ 150/2000 characters                       │
└────────────────────────────────────────────┘
```

### Data Structure Extensions
```typescript
// Extend existing AnalysisConfig (already has customPrompt)
interface AnalysisConfig {
  // existing fields...
  systemPrompt?: string;        // NEW: replaces customPrompt usage
  systemPromptTemplate?: string; // NEW: template ID
}

// New template interface
interface SystemPromptTemplate {
  id: string;
  name: string;
  prompt: string;
  isDefault?: boolean;
}
```

### Predefined Templates
1. **Professional Analyst** (default): "You are a professional career analyst..."
2. **Friendly Coach**: "You are a supportive career coach..."
3. **Technical Expert**: "You are a technical skills assessor..."
4. **Executive Advisor**: "You are an executive leadership consultant..."
5. **Custom**: User-defined prompt

## Implementation Plan

### Phase 1: Core Integration
1. Add system prompt UI components to ChatboxControls.tsx
2. Extend validation-utils.ts with prompt validation
3. Update settings-utils.ts for template storage
4. Modify ProfileAnalysisProvider.ts to use system prompts

### Phase 2: Template System
1. Create predefined template constants
2. Add template dropdown functionality
3. Implement template switching logic
4. Add reset to default functionality

## Technical Details

### Component State Extensions
```typescript
// Add to existing ChatboxControls state
const [systemPrompt, setSystemPrompt] = useState('');
const [selectedTemplate, setSelectedTemplate] = useState('professional');
const [promptCharCount, setPromptCharCount] = useState(0);
```

### Validation Extensions
```typescript
// Add to validation-utils.ts
export const validateSystemPrompt = (prompt: string): ValidationResult => {
  if (prompt.length < 50) return { isValid: false, error: 'Minimum 50 characters' };
  if (prompt.length > 2000) return { isValid: false, error: 'Maximum 2000 characters' };
  return { isValid: true };
};
```

### Settings Extensions
```typescript
// Add to settings-utils.ts
export const getSystemPromptTemplates = (): SystemPromptTemplate[] => { /* ... */ };
export const saveCustomPrompt = (prompt: string): void => { /* ... */ };
export const getLastUsedPrompt = (): string => { /* ... */ };
```

## Success Criteria
- System prompt textarea integrates seamlessly into existing UI
- Template dropdown provides 4-5 predefined options
- Character counter shows real-time validation (50-2000 chars)
- Prompts persist across sessions using existing settings system
- Analysis uses custom system prompts correctly
- No breaking changes to existing functionality
- Maintains current component performance and responsiveness

## Risk Mitigation
- **UI Overflow**: Use existing compact styling patterns
- **Validation Conflicts**: Extend existing validation without breaking changes
- **Storage Limits**: Implement character limits and compression
- **Performance**: Debounce validation and lazy load templates

## Testing Strategy
- Unit tests for new validation functions
- Integration tests for prompt processing
- UI tests for template switching
- Regression tests for existing functionality