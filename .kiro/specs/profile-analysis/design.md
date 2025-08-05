# Profile Analysis Design

## Overview

The Profile Analysis feature integrates AI-powered career insights directly into the existing profile workflow. It leverages the current OpenRouter infrastructure and modern design system to provide a seamless analysis experience within the application's right-side panel.

## Architecture

### Component Hierarchy
```
ProfileAnalysisPanel (Main Container)
├── AnalysisControls (Model Selection + API Key)
├── AnalysisTrigger (Analyze Button)
├── AnalysisProgress (Loading States)
└── AnalysisSummary (Results Display)
```

### Data Flow
```
Profile Data → Analysis Request → OpenRouter API → Response Processing → UI Display
     ↑              ↑                 ↑               ↑                ↑
ProfileContext → PayloadBuilder → OpenRouterClient → ResponseFormatter → AnalysisSummary
```

## Components and Interfaces

### ProfileAnalysisPanel
**Purpose**: Main container component that orchestrates the analysis workflow
**Location**: `src/components/profile-analysis/ProfileAnalysisPanel.tsx`

```typescript
interface ProfileAnalysisPanelProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: ProfileFormData;
}

interface AnalysisState {
  status: 'idle' | 'configuring' | 'analyzing' | 'completed' | 'error';
  selectedModel: string;
  apiKey: string;
  results: string | null;
  error: string | null;
}
```

### AnalysisControls
**Purpose**: Handles model selection and API key input with validation
**Location**: `src/components/profile-analysis/AnalysisControls.tsx`
**Reuses**: Existing `ApiKeyInput.tsx` component with modifications

```typescript
interface AnalysisControlsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isValid: boolean;
  onValidationChange: (valid: boolean) => void;
}
```

### AnalysisSummary
**Purpose**: Displays formatted analysis results with copy/export functionality
**Location**: `src/components/profile-analysis/AnalysisSummary.tsx`

```typescript
interface AnalysisSummaryProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCopy: () => void;
}
```

## Data Models

### Analysis Request Payload
```typescript
interface AnalysisRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature: 0.7;
  max_tokens: 800;
}

interface ProfileAnalysisPayload {
  profileType: string;
  experience: ExperienceEntry[];
  skills: SkillCategory[];
  certifications: Certification[];
  languages: LanguageProficiency[];
  metadata: {
    completionPercentage: number;
    totalExperience: number;
    skillCount: number;
  };
}
```

### Analysis Response
```typescript
interface AnalysisResponse {
  summary: string;
  keyStrengths: string[];
  potentialRisks: string[];
  opportunities: string[];
  recommendations: string[];
  confidenceScore?: number;
}
```

## Integration Points

### Profile Context Integration
- Access profile data through existing `useProfile()` hook
- Trigger analysis from `ReviewStep.tsx` after successful profile save
- Maintain profile state consistency during analysis

### OpenRouter Client Integration
- Reuse existing `OpenRouterClient` class
- Leverage current API key validation logic
- Utilize existing error handling patterns

### Layout Integration
- Add analysis panel to main application layout
- Position as slide-out panel from right side (similar to debug console)
- Maintain responsive behavior across breakpoints

## Error Handling

### API Key Validation
- Real-time format validation using existing patterns
- Connection testing before analysis
- Clear error messaging for invalid keys

### Analysis Request Errors
- Network timeout handling (30 second limit)
- Rate limit detection and user feedback
- Model availability checking
- Graceful degradation for API failures

### Response Processing Errors
- Malformed response handling
- Empty response detection
- Content sanitization for display

## Testing Strategy

### Unit Tests
- Component rendering and state management
- API payload generation accuracy
- Response formatting logic
- Error handling scenarios

### Integration Tests
- End-to-end analysis workflow
- Profile data integration accuracy
- OpenRouter client interaction
- Local storage persistence

### User Experience Tests
- Analysis trigger from profile completion
- Model selection and API key workflow
- Results display and interaction
- Error recovery scenarios

## Performance Considerations

### Lazy Loading
- Load analysis components only when needed
- Defer heavy processing until user interaction
- Optimize bundle size impact

### Caching Strategy
- Cache API keys in localStorage (existing pattern)
- Store recent analysis results temporarily
- Implement request deduplication

### Response Handling
- Stream processing for real-time feedback
- Progressive result display
- Efficient DOM updates during streaming

## Security Considerations

### API Key Management
- Local storage only (no server transmission)
- Clear security messaging to users
- Automatic key validation before use

### Data Privacy
- Profile data sent only to user-selected AI service
- No server-side storage of analysis results
- Clear data usage disclosure

### Content Sanitization
- Sanitize AI responses before display
- Prevent XSS through proper escaping
- Validate response format integrity

## Accessibility

### Keyboard Navigation
- Full keyboard accessibility for all controls
- Proper tab order through analysis workflow
- Screen reader compatible labels

### Visual Design
- High contrast for all text elements
- Clear focus indicators
- Responsive text sizing

### Assistive Technology
- ARIA labels for dynamic content
- Status announcements for analysis progress
- Alternative text for visual indicators