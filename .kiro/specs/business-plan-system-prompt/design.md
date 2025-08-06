# Business Plan System Prompt Enhancement - Design

## Architecture

### Component Structure
```
BusinessPlanSettings
├── SystemPromptSection (reuse existing pattern)
├── ExistingSettings
└── SettingsActions
```

### Data Flow
```
User Input → Validation → Storage → BusinessSuggestionPrompts → AI Generation
```

## Core Components

### BusinessPlanSystemPromptSection
Reuse existing `SystemPromptSection` pattern with business-specific templates and validation.

### Template System
```typescript
interface BusinessPromptTemplate {
  id: string;
  name: string;
  category: 'technology' | 'consulting' | 'creative' | 'retail' | 'general';
  prompt: string;
  description: string;
}

// 5 core templates
const TEMPLATES = [
  { id: 'tech', name: 'Tech & SaaS', category: 'technology', prompt: '...' },
  { id: 'consulting', name: 'Consulting', category: 'consulting', prompt: '...' },
  { id: 'creative', name: 'Creative Services', category: 'creative', prompt: '...' },
  { id: 'retail', name: 'Retail & E-commerce', category: 'retail', prompt: '...' },
  { id: 'general', name: 'General Business', category: 'general', prompt: '...' }
];
```

## Integration Points

### BusinessSuggestionPrompts Enhancement
```typescript
class BusinessSuggestionPrompts {
  private static getSystemContext(customPrompt?: string): string {
    const baseContext = `You are an expert business consultant...`;
    return customPrompt ? `${customPrompt}\n\n${baseContext}` : baseContext;
  }
  
  static buildBusinessSuggestionPrompt(
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData,
    customSystemPrompt?: string
  ): string {
    const systemContext = this.getSystemContext(customSystemPrompt);
    // ... rest of existing logic
  }
}
```

### BusinessSuggestionService Integration
```typescript
class BusinessSuggestionService {
  async generateSuggestions(
    config: AnalysisConfig,
    analysisResult: AnalysisResult,
    profileData?: ProfileFormData,
    customSystemPrompt?: string
  ): Promise<BusinessSuggestion[]> {
    const prompt = this.buildBusinessSuggestionPrompt(analysisResult, profileData, customSystemPrompt);
    // ... rest of existing logic
  }
}
```

### Settings Schema
```typescript
interface BusinessPlanSettings {
  // Existing settings...
  systemPrompt?: {
    enabled: boolean;
    templateId?: string;
    customPrompt?: string;
  };
}
```

## Implementation Strategy

### Minimal Changes
1. Add system prompt section to BusinessPlanSettings modal
2. Create 5 business prompt templates
3. Extend BusinessSuggestionPrompts.getSystemContext() to accept custom prompts
4. Update BusinessSuggestionService to pass custom prompts from settings
5. Reuse existing validation utilities from system-prompt-utils

### UI Layout
Add collapsible "System Prompt" section after existing settings, following the same pattern as SystemPromptSection component.