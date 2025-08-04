# Branching Profile Logic - Design Document

## Frontend-First Architecture Overview

### Component Hierarchy
```
ProfilePanel (Enhanced)
├── ProfileWizard
│   ├── ProfileTypeStep (Enhanced)
│   ├── ConditionalFieldsStep (New)
│   ├── ExperienceStep (Enhanced)
│   └── SkillsStep (Enhanced)
├── PostSubmissionPanel (New)
└── FutureActionsPanel (Placeholder UI)
```

### Frontend Data Flow
1. **Form State**: Enhanced React Context with multi-step wizard state
2. **Client-Side Validation**: Zod schemas with conditional validation rules
3. **Local Persistence**: localStorage with draft auto-save and completion tracking
4. **Future Integration Layer**: Service interfaces and data transformation utilities (no implementation)

## Frontend Data Models

### Enhanced Profile Types (Extending Current Implementation)
```typescript
export type ProfileType = 
  | 'working-fulltime' 
  | 'working-parttime'
  | 'freelancer'
  | 'student' 
  | 'unemployed'
  | 'career-shifter'  // New
  | 'entrepreneur'    // New
  | 'other';          // New

export interface ProfileData {
  profileType: ProfileType;
  completedAt?: string;
  
  // Student-specific fields
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  interestedIndustries?: string[];
  
  // Professional fields (working-fulltime, working-parttime)
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: number;
  technologies?: string[];
  
  // Freelancer fields
  services?: string[];
  clientTypes?: string[];
  hourlyRate?: number;
  
  // Entrepreneur fields
  businessStage?: 'idea' | 'mvp' | 'launched' | 'profitable';
  teamSize?: number;
  noCodeFamiliarity?: boolean;
  fundingStage?: string;
  
  // Career shifter fields
  previousCareer?: string;
  yearsInPreviousCareer?: number;
  targetIndustry?: string;
  transitionReason?: string;
  
  // Unemployed fields
  lastRole?: string;
  targetIndustry?: string;
  jobSearchDuration?: number;
  
  // Other
  customDescription?: string;
}
```

### Enhanced Experience & Skills (Building on Current Skillset)
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
  achievements?: string[];
}

export interface EnhancedSkillset extends Skillset {
  categories: SkillCategory[];
  certifications: Certification[];
  languages: LanguageProficiency[];
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
  source: 'manual' | 'experience' | 'education';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface LanguageProficiency {
  id: string;
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}
```

## Frontend Conditional Logic Engine

### Client-Side Branching Rules
```typescript
const CONDITIONAL_FIELD_CONFIG = {
  student: {
    required: ['educationLevel'],
    optional: ['fieldOfStudy', 'graduationYear', 'interestedIndustries'],
    nextSteps: ['experience', 'skills']
  },
  'working-fulltime': {
    required: ['currentRole', 'industry'],
    optional: ['yearsOfExperience', 'technologies'],
    nextSteps: ['experience', 'skills']
  },
  'working-parttime': {
    required: ['currentRole'],
    optional: ['industry', 'yearsOfExperience', 'technologies'],
    nextSteps: ['experience', 'skills']
  },
  freelancer: {
    required: ['services'],
    optional: ['clientTypes', 'yearsOfExperience', 'technologies', 'hourlyRate'],
    nextSteps: ['experience', 'skills']
  },
  entrepreneur: {
    required: ['businessStage'],
    optional: ['industry', 'teamSize', 'noCodeFamiliarity', 'fundingStage'],
    nextSteps: ['experience', 'skills']
  },
  'career-shifter': {
    required: ['previousCareer', 'targetIndustry'],
    optional: ['yearsInPreviousCareer', 'transitionReason'],
    nextSteps: ['experience', 'skills']
  },
  unemployed: {
    required: ['targetIndustry'],
    optional: ['lastRole', 'jobSearchDuration'],
    nextSteps: ['experience', 'skills']
  },
  other: {
    required: ['customDescription'],
    optional: [],
    nextSteps: ['experience', 'skills']
  }
};
```

### Dynamic Validation Schemas
```typescript
const createValidationSchema = (profileType: ProfileType) => {
  const config = CONDITIONAL_FIELD_CONFIG[profileType];
  const baseSchema = z.object({
    profileType: z.enum(PROFILE_TYPES)
  });
  
  // Build schema dynamically based on field configuration
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  config.required.forEach(field => {
    schemaFields[field] = getFieldValidator(field, true);
  });
  
  config.optional.forEach(field => {
    schemaFields[field] = getFieldValidator(field, false);
  });
  
  return baseSchema.extend(schemaFields);
};
```

## Frontend Component Architecture

### Enhanced ProfileWizard (Extending Current ProfileContext)
- **Purpose**: Orchestrates enhanced multi-step form flow with conditional branching
- **State Management**: Extended ProfileContext with wizard state, validation, and persistence
- **Navigation**: Smart step progression with conditional validation gates
- **Auto-Save**: Debounced localStorage persistence with draft/complete states
- **Error Handling**: Comprehensive client-side error boundary and validation feedback

### ConditionalFieldsStep (New Component)
- **Purpose**: Dynamic field rendering engine based on profile type selection
- **Logic**: Rule-based field display using CONDITIONAL_FIELD_CONFIG
- **Validation**: Real-time Zod validation with immediate user feedback
- **UX**: Smooth animated transitions between field sets
- **Accessibility**: Full ARIA support and keyboard navigation

### Enhanced ExperienceStep (Building on Current)
- **Purpose**: Structured experience collection with multiple entry types
- **Features**: Work, education, project, and volunteer experience tracking
- **UI**: Add/edit/remove experience entries with rich form controls
- **Validation**: Date validation, required field checking, skill extraction

### Enhanced SkillsStep (Building on Current SkillsetSelector)
- **Purpose**: Comprehensive skill assessment with categories and proficiency
- **Features**: Skill categories, proficiency levels, certification tracking
- **UI**: Interactive skill selection with search and filtering
- **Integration**: Auto-populate skills from experience entries

### PostSubmissionPanel (New Component)
- **Purpose**: Profile completion confirmation and future action preparation
- **Content**: Success message, profile summary, completion timestamp
- **Actions**: Placeholder buttons for future LLM-powered features
- **State**: Profile completion indicator, data export capabilities

## Future Backend Integration Architecture (Interface Only)

### Service Layer Interfaces (No Implementation)
```typescript
// Service interfaces for future LLM integration
export interface ProfileAnalysisService {
  generateBackupPlan(profile: ProfileFormData): Promise<BackupPlanResult>;
  suggestBusinessIdea(profile: ProfileFormData): Promise<BusinessIdeaResult>;
  analyzeIndustryFit(profile: ProfileFormData): Promise<IndustryFitResult>;
  createLearningPath(profile: ProfileFormData): Promise<LearningPathResult>;
}

// Data transformation utilities for future API integration
export interface ProfileDataTransformer {
  toApiFormat(profile: ProfileFormData): ApiProfileData;
  fromApiFormat(apiData: ApiProfileData): ProfileFormData;
  sanitizeForAnalysis(profile: ProfileFormData): AnalysisProfileData;
}

// Future API client interfaces
export interface ProfileApiClient {
  saveProfile(profile: ApiProfileData): Promise<SaveProfileResponse>;
  getProfile(id: string): Promise<ApiProfileData>;
  deleteProfile(id: string): Promise<void>;
}
```

### Future Integration Data Contracts
```typescript
// Structured data format for future LLM analysis
export interface AnalysisProfileData {
  profileType: ProfileType;
  skillSummary: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  experienceSummary: {
    totalYears: number;
    industries: string[];
    roles: string[];
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    industries: string[];
  };
}

// Placeholder result types for future LLM responses
export interface BackupPlanResult {
  plans: Array<{
    title: string;
    description: string;
    steps: string[];
    timeframe: string;
    difficulty: 'low' | 'medium' | 'high';
  }>;
}
```
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

## Frontend Performance Optimization

### Code Splitting Strategy
- Lazy load form steps with React.lazy() to reduce initial bundle
- Dynamic imports for conditional field components based on profile type
- Separate chunks for validation schemas and heavy form libraries
- Progressive loading of skill data and industry lists

### State Management Optimization
- Debounced auto-save (500ms) to prevent excessive localStorage writes
- Memoized validation functions with useMemo and useCallback
- Optimized re-renders with React.memo for form components
- Selective context updates to prevent unnecessary re-renders

### Client-Side Performance
- Virtual scrolling for large skill/industry lists
- Optimistic UI updates for better perceived performance
- Local caching of validation results and field configurations
- Efficient form field registration and unregistration

### Bundle Size Management
- Tree-shake unused Zod validators and form utilities
- Minimize third-party dependencies (prefer native solutions)
- Compress and cache static form data (industries, skills, etc.)
- Use dynamic imports for profile-type-specific components