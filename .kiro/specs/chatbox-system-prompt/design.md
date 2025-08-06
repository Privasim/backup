# Design Document

## Overview

The system prompt feature extends the existing chatbox architecture by adding customizable system prompt functionality to ChatboxControls.tsx. This design leverages the existing `AnalysisConfig.customPrompt` field and integrates with the current settings management system while maintaining the compact, expandable UI pattern.

## Architecture

### Component Integration

The system prompt functionality integrates into the existing chatbox architecture at these key points:

1. **ChatboxControls.tsx** - New UI section for system prompt configuration
2. **ChatboxSettingsManager** - Extended to handle system prompt persistence
3. **ProfileAnalysisProvider.ts** - Modified to use custom system prompts when provided
4. **AnalysisConfig** - Already contains `customPrompt` field, will be utilized

### Data Flow

```
User Input → ChatboxControls → ChatboxProvider → AnalysisConfig → ProfileAnalysisProvider → OpenRouter API
```

The system prompt flows through the existing configuration pipeline without requiring architectural changes.

## Components and Interfaces

### SystemPromptSection Component

A new component within ChatboxControls that provides:

```typescript
interface SystemPromptSectionProps {
  config: AnalysisConfig;
  onConfigUpdate: (update: Partial<AnalysisConfig>) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}
```

### Extended Settings Manager

```typescript
interface SystemPromptSettings {
  customSystemPrompt?: string;
  selectedTemplate?: string;
  perModelPrompts?: Record<string, string>;
  lastUsedPrompt?: string;
}
```

### Prompt Templates

```typescript
interface SystemPromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'analysis' | 'tone' | 'focus';
}
```

## Data Models

### System Prompt Configuration

```typescript
interface SystemPromptConfig {
  enabled: boolean;
  prompt: string;
  templateId?: string;
  isCustom: boolean;
  lastModified: string;
}
```

### Template Categories

1. **Analysis Style Templates**
   - Professional & Formal
   - Conversational & Friendly
   - Technical & Detailed
   - Concise & Action-Oriented

2. **Focus Area Templates**
   - Career Transition Focus
   - Skills Development Focus
   - Market Analysis Focus
   - Risk Assessment Focus

## Error Handling

### Validation Rules

1. **Prompt Length**: Maximum 2000 characters to prevent API limits
2. **Content Validation**: Check for potentially harmful or inappropriate content
3. **Template Integrity**: Ensure templates maintain required analysis structure
4. **Fallback Behavior**: Gracefully degrade to default prompts on errors

### Error States

- Invalid prompt format
- Prompt too long
- Template loading failure
- Storage persistence errors

## Testing Strategy

### Unit Tests

1. **SystemPromptSection Component**
   - Rendering with different states
   - User interactions (expand/collapse, template selection)
   - Validation feedback display

2. **Settings Manager Extensions**
   - Prompt persistence and retrieval
   - Template management
   - Migration from existing settings

3. **Prompt Integration**
   - Custom prompt application in analysis
   - Template rendering with user data
   - Fallback to default behavior

### Integration Tests

1. **End-to-End Analysis Flow**
   - Custom prompt → Analysis → Result verification
   - Template selection → Analysis → Expected output style
   - Error scenarios → Graceful degradation

2. **Settings Persistence**
   - Save custom prompt → Reload page → Verify restoration
   - Switch models → Verify per-model prompt handling

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab through prompt controls
   - Screen reader compatibility
   - Focus management in expandable sections

2. **Visual Indicators**
   - Clear prompt status indication
   - Validation error visibility
   - Template selection feedback

## UI Design Specifications

### Layout Integration

The system prompt section integrates into the existing ChatboxControls expandable settings panel:

```
[Model Selection]
[API Key Input]
[System Prompt Section] ← New expandable section
[Mock Data Toggle]
[Analyze Button]
```

### Visual Design

- **Collapsed State**: Single line with prompt status indicator
- **Expanded State**: Template selector + custom prompt textarea + validation feedback
- **Active Indicator**: Subtle badge showing "Custom Prompt" when active
- **Validation**: Real-time character count and validation status

### Responsive Behavior

- Maintains compact design on smaller screens
- Textarea auto-resizes within reasonable limits
- Template dropdown adapts to available space

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Templates loaded only when section is expanded
2. **Debounced Validation**: Prevent excessive validation calls during typing
3. **Efficient Storage**: Compress prompts for localStorage efficiency
4. **Memoization**: Cache rendered templates and validation results

### Memory Management

- Clean up event listeners on component unmount
- Limit template cache size
- Efficient string operations for prompt processing

## Security Considerations

### Input Sanitization

- Validate prompt content for potential injection attacks
- Limit prompt length to prevent abuse
- Sanitize template content before rendering

### Data Privacy

- Store prompts locally only (no server transmission except to AI API)
- Clear prompts on explicit user request
- No logging of sensitive prompt content

## Migration Strategy

### Backward Compatibility

- Existing `customPrompt` field in AnalysisConfig remains functional
- Default behavior unchanged when no custom prompt is set
- Graceful handling of missing or corrupted prompt data

### Data Migration

- Detect existing custom prompts in configuration
- Migrate to new storage format if needed
- Preserve user preferences during updates