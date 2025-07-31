export interface QuizData {
  jobDescription: string;
  experience: string;
  industry: string;
  location: string;
  salaryRange: string;
  skillSet: string[];
  apiKey?: string;
  model?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface JobContext {
  jobDescription: string;
  experiences: string[];
  industries: string[];
  locations: string[];
  salaryRanges: string[];
  skillSets: string[];
  skillCategories?: SkillCategory[];
}

export interface QuizContextData {
  [key: string]: JobContext;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface FormState {
  data: QuizData;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  currentStep: number;
  isSubmitting: boolean;
  submitAttempted: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
}

export type FormAction = 
  | { type: 'SET_FIELD'; field: keyof QuizData; value: string | string[] }
  | { type: 'SET_ERROR'; field: string; error: string | undefined }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_SUBMIT_ATTEMPTED'; attempted: boolean }
  | { type: 'SET_ANALYZING'; isAnalyzing: boolean }
  | { type: 'SET_ANALYSIS_COMPLETE'; complete: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'RESET_DEPENDENT_FIELDS' }
  | { type: 'VALIDATE_FORM' };

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
}

export interface EnhancedDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
  searchable?: boolean;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  groupBy?: (option: DropdownOption) => string;
}