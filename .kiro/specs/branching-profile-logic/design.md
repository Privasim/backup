# Branching Profile Logic - Design Document

## Architecture Overview

### Component Hierarchy
```
ProfilePanel (Enhanced)
├── ProfileWizard
│   ├── ProfileTypeStep
│   ├── ConditionalFieldsStep  
│   ├── ExperienceStep
│   └── SkillsStep
├── PostSubmissionPanel
└── ActionButtonsPanel (Placeholder)
```

### Data Flow
1. **Form State**: React Context manages multi-step form state
2. **Validation**: Zod schemas validate each step before progression
3. **Persistence**: Local storage saves draft and completed profiles
4. **Integration**: Service layer transforms data for future API calls

## Enhanced Data Models

### Core Types
```typescript
export type ProfileType = 
  | 'working-fulltime' 
  | 'working-parttime'
  | 'freelancer'
  | 'student' 
  | 'unemployed'
  | 'career-shifter'
  | 'entrepreneur'
  | 'other';

export interface ProfileData {
  profileType: ProfileType;
  // Student fields
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  interestedIndustries?: string[];
  // Professional fields  
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: number;
  technologies?: string[];
  // Entrepreneur fields
  businessStage?: 'idea' | 'mvp' | 'launched' | 'profitable';
  teamSize?: number;
  noCodeFamiliarity?: boolean;
  // Career shifter fields
  previousCareer?: string;
  yearsInPreviousCareer?: number;
  targetIndustry?: string;
  // Other
  customDescription?: string;
}
```

### Experience & Skills
```typescript
export interface ExperienceEntry {
  id: string;
  type: 'work' | 'education' | 'project' | 'volunteer';
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience?: number;
  highlight: boolean;
}
```

## Conditional Logic Engine

### Branching Rules
```typescript
const CONDITIONAL_FIELDS = {
  student: ['educationLevel', 'fieldOfStudy', 'graduationYear', 'interestedIndustries'],
  'working-fulltime': ['currentRole', 'industry', 'yearsOfExperience', 'technologies'],
  'working-parttime': ['currentRole', 'industry', 'yearsOfExperience', 'technologies'],
  freelancer: ['services', 'clientTypes', 'yearsOfExperience', 'technologies'],
  entrepreneur: ['businessStage', 'industry', 'teamSize', 'noCodeFamiliarity'],
  'career-shifter': ['previousCareer', 'yearsInPreviousCareer', 'targetIndustry'],
  unemployed: ['lastRole', 'targetIndustry', 'jobSearchDuration'],
  other: ['customDescription']
};
```

### Field Validation
```typescript
const getValidationSchema = (profileType: ProfileType) => {
  const baseSchema = z.object({
    profileType: z.enum(PROFILE_TYPES)
  });
  
  switch (profileType) {
    case 'student':
      return baseSchema.extend({
        educationLevel: z.string().min(1, 'Education level required'),
        fieldOfStudy: z.string().optional(),
        graduationYear: z.number().min(2020).max(2030).optional()
      });
    // ... other cases
  }
};
```

## Component Design

### ProfileWizard
- **Purpose**: Orchestrates multi-step form flow
- **State**: Current step, form data, validation errors
- **Navigation**: Step progression with validation gates
- **Persistence**: Auto-save to localStorage on field changes

### ConditionalFieldsStep  
- **Purpose**: Renders fields based on profile type selection
- **Logic**: Dynamic field rendering using conditional rules
- **Validation**: Real-time validation with error display
- **UX**: Smooth transitions between field sets

### PostSubmissionPanel
- **Purpose**: Shows completion state and next actions
- **Content**: Success message, data summary, action buttons
- **Actions**: Placeholder buttons for future LLM features
- **State**: Profile ready indicator, action availability

## LLM Integration Architecture

### Service Layer
```typescript
export class ProfileAnalysisService {
  constructor(private openRouterClient: OpenRouterClient) {}
  
  async generateBackupPlan(profile: ProfileFormData): Promise<BackupPlanResult> {
    const prompt = this.buildBackupPlanPrompt(profile);
    // Implementation stub
  }
  
  async suggestBusinessIdea(profile: ProfileFormData): Promise<BusinessIdeaResult> {
    const prompt = this.buildBusinessIdeaPrompt(profile);
    // Implementation stub  
  }
}
```

### Prompt Templates
```typescript
const PROMPT_TEMPLATES = {
  backupPlan: (profile: ProfileFormData) => `
    Based on this professional profile, suggest 3 backup career plans:
    Profile Type: ${profile.profile.profileType}
    Skills: ${profile.skills.map(s => s.name).join(', ')}
    Experience: ${profile.experience.length} positions
    
    Provide practical, actionable backup plans considering current market trends.
  `,
  // ... other templates
};
```

## UI/UX Design

### Visual Hierarchy
- **Header**: "Tell us about yourself" with privacy notice
- **Progress**: Step indicator (1/3, 2/3, 3/3)
- **Form**: Clean, spacious field layout with clear labels
- **Actions**: Primary/secondary button styling for navigation

### Responsive Design
- **Mobile**: Single column, touch-friendly controls
- **Tablet**: Optimized spacing, larger touch targets  
- **Desktop**: Multi-column where appropriate, keyboard shortcuts

### Accessibility
- **ARIA**: Proper labels, roles, and live regions
- **Keyboard**: Full keyboard navigation support
- **Screen Reader**: Descriptive text and state announcements
- **Focus**: Clear focus indicators and logical tab order

## Error Handling

### Validation Errors
- **Field Level**: Inline error messages below fields
- **Form Level**: Summary of errors at top of form
- **Step Level**: Prevent progression with invalid data

### System Errors
- **Network**: Graceful degradation for offline scenarios
- **Storage**: Fallback when localStorage unavailable
- **API**: Clear error messages for integration failures

## Performance Considerations

### Code Splitting
- Lazy load form steps to reduce initial bundle
- Dynamic imports for heavy validation libraries
- Separate chunks for LLM integration features

### State Management
- Debounced auto-save to prevent excessive localStorage writes
- Memoized validation to avoid unnecessary re-computation
- Optimized re-renders with React.memo and useCallback

### Bundle Optimization
- Tree-shake unused Zod validators
- Minimize third-party dependencies
- Compress and cache static assets