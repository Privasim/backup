# Branching Profile Logic - Implementation Tasks

> **Important Implementation Notes**:
> - This implementation focuses on frontend functionality but is designed to be future-ready for:
>   - **LLM Integration**: Seamless connection with OpenRouter API (`@/lib/openrouter`)
>   - **Backend API**: Structured for REST/GraphQL endpoints
>   - **Database Schema**: Data models designed for easy database mapping
> - All data structures follow a normalized format for efficient storage and retrieval
> - API service layer is implemented with stubs for future backend integration
> - LLM prompt templates are structured but not connected in this phase

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Set up project structure with feature-based organization
- [ ] Implement TypeScript types for all data models
- [ ] Create form state management with React Context
- [ ] Set up validation schemas with Zod
- [ ] Implement routing between form steps

### Phase 2: Form Pages Implementation
- [ ] Page 1: User Profile (Basic Information)
- [ ] Page 2: Experience & Background
- [ ] Page 3: Skills & Qualifications
- [ ] Implement form persistence (local storage)
- [ ] Add form validation and error handling

### Phase 3: Integration Readiness
- [ ] Create API service stubs
- [ ] Design LLM prompt templates
- [ ] Implement data transformation utilities
- [ ] Add analytics events
- [ ] Set up error boundaries and logging

---

## 1. Core Architecture

### 1.1 Project Structure
```
src/
  app/
    businessidea/
      components/
        profile-wizard/               # Multi-step form wizard
          ├── steps/
          │   ├── ProfileStep/       # Page 1: User Profile
          │   │   ├── components/    # Reusable form components
          │   │   ├── hooks/         # Custom hooks
          │   │   ├── types.ts       # TypeScript types
          │   │   └── index.tsx      # Main component
          │   │
          │   ├── ExperienceStep/    # Page 2: Experience
          │   │   ├── components/
          │   │   ├── hooks/
          │   │   ├── types.ts
          │   │   └── index.tsx
          │   │
          │   └── SkillsStep/        # Page 3: Skillset
          │       ├── components/
          │       ├── hooks/
          │       ├── types.ts
          │       └── index.tsx
          │
          ├── shared/                # Shared components and utilities
          │   ├── form-fields/       # Reusable form fields
          │   ├── validation/        # Shared validation schemas
          │   └── utils/             # Helper functions
          │
          ├── context/               # Form state management
          │   ├── FormContext.tsx
          │   └── types.ts
          │
          └── services/              # API and service layer
              ├── api/               # API client and types
              ├── llm/               # LLM integration stubs
              └── storage/           # Local storage utilities
```

## 2. Data Model

### 2.1 TypeScript Interfaces
```typescript
// Core Types
export type ProfileType = 
  | 'student' 
  | 'working-fulltime' 
  | 'working-parttime' 
  | 'freelancer' 
  | 'entrepreneur' 
  | 'career-shifter' 
  | 'unemployed' 
  | 'other';

// Base interface with common fields
export interface BaseProfile {
  id: string;
  type: ProfileType;
  // Common personal info
  fullName?: string;
  email?: string;
  location?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  // Future integration
  externalId?: string; // For backend sync
  metadata?: Record<string, unknown>; // For extensibility
}

// Page 1: User Profile
export interface ProfileData {
  profileType: ProfileType;
  // Student-specific
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  // Professional-specific
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: number;
  // Entrepreneur-specific
  businessStage?: 'idea' | 'mvp' | 'launched' | 'profitable';
  teamSize?: number;
  // Career shifter
  previousCareer?: string;
  yearsInPreviousCareer?: number;
}

// Page 2: Experience
export interface ExperienceEntry {
  id: string;
  type: 'work' | 'education' | 'project' | 'volunteer';
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills?: string[];
  // Work-specific
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  companySize?: string;
  // Education-specific
  degree?: string;
  fieldOfStudy?: string;
  gpa?: string;
}

// Page 3: Skills & Qualifications
export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 1-5
  yearsOfExperience?: number;
  lastUsed?: number; // Year
  highlight: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// Complete Form State
export interface ProfileFormState {
  profile: ProfileData;
  experience: ExperienceEntry[];
  skills: SkillCategory[];
  certifications: Certification[];
  languages: LanguageProficiency[];
}
```

### 2.2 Form Validation Schemas
```typescript
import { z } from 'zod';

// Reusable validators
const urlValidator = z.string().url('Invalid URL').or(z.literal(''));
const dateValidator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');

// Profile Step Schema
export const profileSchema = z.object({
  profileType: z.enum(['student', 'working-fulltime', 'working-parttime', 'freelancer', 'entrepreneur', 'career-shifter', 'unemployed', 'other']),
  // Student fields
  educationLevel: z.string().optional().when('profileType', {
    is: 'student',
    then: (schema) => schema.min(1, 'Education level is required for students')
  }),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().min(1900).max(2100).optional(),
  
  // Professional fields
  currentRole: z.string().optional().when('profileType', {
    is: (type: string) => ['working-fulltime', 'working-parttime', 'freelancer'].includes(type),
    then: (schema) => schema.min(1, 'Current role is required')
  }),
  industry: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  
  // Entrepreneur fields
  businessStage: z.enum(['idea', 'mvp', 'launched', 'profitable']).optional(),
  teamSize: z.number().min(0).optional(),
  
  // Career shifter fields
  previousCareer: z.string().optional(),
  yearsInPreviousCareer: z.number().min(0).optional()
});

// Experience Entry Schema
export const experienceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['work', 'education', 'project', 'volunteer']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  location: z.string().optional(),
  startDate: dateValidator,
  endDate: dateValidator.optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  
  // Work-specific fields
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional(),
  companySize: z.string().optional(),
  
  // Education-specific fields
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  gpa: z.string().optional()
});

// Skills Schema
export const skillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.number().min(1).max(5),
  yearsOfExperience: z.number().min(0).optional(),
  lastUsed: z.number().min(1900).max(new Date().getFullYear()).optional(),
  highlight: z.boolean().default(false)
});

// Complete Form State Schema
export const formSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema),
  skills: z.array(skillSchema),
  certifications: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Certification name is required'),
    issuingOrganization: z.string().min(1, 'Issuing organization is required'),
    issueDate: dateValidator,
    expirationDate: dateValidator.optional(),
    credentialId: z.string().optional(),
    credentialUrl: urlValidator.optional()
  })),
  languages: z.array(z.object({
    id: z.string().uuid(),
    language: z.string().min(1, 'Language is required'),
    proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']),
    certification: z.string().optional()
  }))
});

export type ProfileFormData = z.infer<typeof formSchema>;

## 3. Form Components

### 3.1 ProfileStep Component
```tsx
// components/profile-wizard/steps/ProfileStep/index.tsx
const ProfileStep = () => {
  const { formState, updateField, errors } = useFormContext();
  
  const profileTypes = [
    { value: 'student', label: 'Student' },
    { value: 'working-fulltime', label: 'Working Full-time' },
    { value: 'working-parttime', label: 'Working Part-time' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'career-shifter', label: 'Career Shifter' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile Information</h2>
        <p className="text-sm text-gray-500">
          Tell us about yourself to get personalized recommendations
        </p>
      </div>

      <FormField
        label="Profile Type"
        required
        error={errors?.profile?.profileType}
      >
        <Select
          value={formState.profile.profileType}
          onChange={(value) => updateField('profile.profileType', value)}
          options={profileTypes}
        />
      </FormField>

      {/* Conditional fields based on profile type */}
      {formState.profile.profileType === 'student' && (
        <div className="space-y-4">
          <FormField
            label="Education Level"
            required
            error={errors?.profile?.educationLevel}
          >
            <Select
              value={formState.profile.educationLevel}
              onChange={(value) => updateField('profile.educationLevel', value)}
              options={[
                'High School',
                'Associate Degree',
                'Bachelor\'s Degree',
                'Master\'s Degree',
                'Doctorate',
                'Other'
              ]}
            />
          </FormField>
          
          <FormField
            label="Field of Study"
            error={errors?.profile?.fieldOfStudy}
          >
            <Input
              value={formState.profile.fieldOfStudy || ''}
              onChange={(e) => updateField('profile.fieldOfStudy', e.target.value)}
              placeholder="e.g., Computer Science"
            />
          </FormField>
        </div>
      )}

      {/* Add more conditional fields for other profile types */}
    </div>
  );
};
```

### 3.2 ExperienceStep Component
```tsx
// components/profile-wizard/steps/ExperienceStep/index.tsx
const ExperienceStep = () => {
  const { formState, updateField, updateForm } = useFormContext();
  
  const handleAddExperience = () => {
    const newExperience: ExperienceEntry = {
      id: uuidv4(),
      type: 'work',
      title: '',
      organization: '',
      startDate: '',
      current: false,
    };
    
    updateForm({
      experience: [...formState.experience, newExperience]
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Work & Education</h2>
        <p className="text-sm text-gray-500">
          Add your professional experience and education history
        </p>
      </div>

      <div className="space-y-4">
        {formState.experience.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            onChange={(updated) => {
              const updatedExp = [...formState.experience];
              updatedExp[index] = { ...updatedExp[index], ...updated };
              updateField('experience', updatedExp);
            }}
            onRemove={() => {
              updateField('experience', 
                formState.experience.filter((_, i) => i !== index)
              );
            }}
          />
        ))}
        
        <Button
          variant="outline"
          onClick={handleAddExperience}
          className="w-full"
        >
          + Add Experience
        </Button>
      </div>
    </div>
  );
};
```

### 3.3 SkillsStep Component
```tsx
// components/profile-wizard/steps/SkillsStep/index.tsx
const SkillsStep = () => {
  const { formState, updateField } = useFormContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAddSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: uuidv4(),
    };
    
    updateField('skills', [...formState.skills, newSkill]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Skills & Qualifications</h2>
        <p className="text-sm text-gray-500">
          Add your skills, certifications, and languages
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Skills</h3>
          <SkillInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSelectSkill={handleAddSkill}
          />
          
          <div className="mt-4 space-y-2">
            {formState.skills.map((skill) => (
              <SkillChip
                key={skill.id}
                skill={skill}
                onRemove={() => {
                  updateField('skills', 
                    formState.skills.filter(s => s.id !== skill.id)
                  );
                }}
                onUpdate={(updated) => {
                  updateField('skills', formState.skills.map(s => 
                    s.id === skill.id ? { ...s, ...updated } : s
                  ));
                }}
              />
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="font-medium mb-2">Certifications</h3>
          <CertificationForm
            certifications={formState.certifications}
            onAdd={(cert) => {
              updateField('certifications', [
                ...formState.certifications,
                { ...cert, id: uuidv4() }
              ]);
            }}
            onRemove={(id) => {
              updateField('certifications',
                formState.certifications.filter(c => c.id !== id)
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
```

## 4. Integration with OpenRouter (LLM)

### 4.1 LLM Service
```typescript
// services/llm/openRouterService.ts
import { OpenRouterClient } from '@/lib/openrouter/client';

export class ProfileAnalysisService {
  private client: OpenRouterClient;

  constructor(apiKey: string) {
    this.client = new OpenRouterClient(apiKey);
  }

  async analyzeCareerPath(profile: ProfileFormData): Promise<CareerPathAnalysis> {
    const prompt = this.buildCareerPathPrompt(profile);
    const response = await this.client.chat({
      messages: [
        {
          role: 'system',
          content: 'You are a career counselor helping users understand their career potential.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'openai/gpt-4'
    });

    return this.parseCareerPathResponse(response);
  }

  private buildCareerPathPrompt(profile: ProfileFormData): string {
    // Build a detailed prompt based on the user's profile
    return `
      Analyze this professional profile and provide career path suggestions:
      
      Profile Type: ${profile.profile.profileType}
      Experience: ${profile.experience.length} positions
      Skills: ${profile.skills.length} skills
      
      Please provide:
      1. Career strengths and opportunities
      2. Recommended career paths
      3. Skill gaps to address
      4. Learning recommendations
    `;
  }

  private parseCareerPathResponse(response: any): CareerPathAnalysis {
    // Parse and validate the LLM response
    // Implementation depends on the expected response format
    return {
      // Parsed response data
    };
  }
}
```

### 4.2 API Service Layer
```typescript
// services/api/profileService.ts
import { ProfileFormData } from '../types';

export class ProfileService {
  private baseUrl = '/api/profile';

  async saveProfile(profile: ProfileFormData): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to save profile');
    }

    return response.json();
  }

  async analyzeProfile(profileId: string): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/${profileId}/analyze`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to analyze profile');
    }

    return response.json();
  }
}
```

## 5. State Management

### 5.1 Form Context
```typescript
// context/FormContext.tsx
interface FormContextType {
  formState: ProfileFormData;
  updateField: <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => void;
  updateForm: (updates: Partial<ProfileFormData>) => void;
  errors: Record<string, string>;
  validateCurrentStep: () => boolean;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<ProfileFormData>(initialFormState);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateForm = (updates: Partial<ProfileFormData>) => {
    setFormState(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const validateCurrentStep = (): boolean => {
    // Implementation depends on the current step
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      // Implementation for form submission
      console.log('Submitting form:', formState);
      // await profileService.saveProfile(formState);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        updateField,
        updateForm,
        errors,
        validateCurrentStep,
        currentStep,
        nextStep,
        prevStep,
        isSubmitting,
        submitForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
```

## 6. Testing Strategy

### 6.1 Unit Tests
- [ ] Form validation schemas
- [ ] Utility functions
- [ ] Service layer mocks

### 6.2 Component Tests
- [ ] Form field components
- [ ] Conditional rendering
- [ ] User interactions

### 6.3 Integration Tests
- [ ] Multi-step form flow
- [ ] Form persistence
- [ ] Error handling

## 7. Future Enhancements

### 7.1 LLM Integration
- [ ] Real-time suggestions as user types
- [ ] Career path recommendations
- [ ] Skill gap analysis

### 7.2 Advanced Features
- [ ] Resume/CV import
- [ ] LinkedIn integration
- [ ] Job market insights
```

## 2. Data Model

### 2.1 TypeScript Interfaces
- [ ] Define base profile interface with common fields
- [ ] Create discriminated unions for each profile type
- [ ] Define skill and experience types
- [ ] Create API response/request types

### 2.2 Form Schemas
- [ ] Implement base validation schema with Zod
- [ ] Create conditional schemas for each profile type
- [ ] Add custom validation rules
- [ ] Implement error message templates

## 3. Core Components

### 3.1 Profile Type Selection
- [ ] Create profile type cards with icons
- [ ] Implement responsive grid layout
- [ ] Add selection state management
- [ ] Include "Other" option with text input

### 3.2 Dynamic Form System
- [ ] Build form field registry
- [ ] Implement conditional field rendering
- [ ] Create form step management
- [ ] Add progress indicators

### 3.3 Skillset Management
- [ ] Enhance skills input with suggestions
- [ ] Implement skill categorization
- [ ] Add proficiency levels
- [ ] Create skill chip components

### 3.4 Experience Section
- [ ] Work history timeline
- [ ] Education history
- [ ] Project/portfolio items
- [ ] Certification tracking

## 4. User Experience

### 4.1 Form Navigation
- [ ] Implement step-based navigation
- [ ] Add back/next button logic
- [ ] Create form progress tracker
- [ ] Add save/draft functionality

### 4.2 Validation & Feedback
- [ ] Field-level validation
- [ ] Form-level validation
- [ ] Error message display
- [ ] Success/error toasts

### 4.3 Accessibility
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

## 5. Future Integration Points

### 5.1 API Integration
- [ ] Create API service stubs
- [ ] Define request/response types
- [ ] Implement error handling
- [ ] Add loading states

### 5.2 LLM Readiness
- [ ] Design prompt templates
- [ ] Create response parsers
- [ ] Implement streaming support
- [ ] Add error boundaries

### 5.3 Analytics Events
- [ ] Define tracking events
- [ ] Implement analytics service
- [ ] Add privacy controls

## 6. Testing Strategy

### 6.1 Unit Tests
- [ ] Form validation
- [ ] State management
- [ ] Utility functions

### 6.2 Component Tests
- [ ] Form field components
- [ ] Conditional rendering
- [ ] User interactions

### 6.3 Integration Tests
- [ ] Form submission flow
- [ ] Navigation between steps
- [ ] State persistence

## 7. Documentation

### 7.1 Developer Docs
- [ ] Component API documentation
- [ ] State management guide
- [ ] Form architecture overview

### 7.2 User Guide
- [ ] Form field descriptions
- [ ] Common workflows
- [ ] FAQ section

## 8. Performance Optimization

### 8.1 Code Splitting
- [ ] Dynamic imports for form steps
- [ ] Lazy loading of heavy components

### 8.2 Memoization
- [ ] React.memo for expensive components
- [ ] useMemo/useCallback for derived state

### 8.3 Bundle Optimization
- [ ] Tree shaking
- [ ] Dependency optimization

## 9. Quality Assurance

### 9.1 Code Quality
- [ ] ESLint configuration
- [ ] Prettier setup
- [ ] TypeScript strict mode

### 9.2 Browser Compatibility
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Touch device support

## 10. Deployment

### 10.1 Build Configuration
- [ ] Environment variables
- [ ] Feature flags
- [ ] Build optimizations

### 10.2 Monitoring
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Usage analytics
