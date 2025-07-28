import { QuizData, ValidationSchema, FormErrors } from './types';

export const validationSchema: ValidationSchema = {
  jobDescription: {
    required: true,
    message: 'Please select your job role'
  },
  experience: {
    required: true,
    message: 'Experience level is required'
  },
  industry: {
    required: true,
    message: 'Please select your industry'
  },
  location: {
    required: true,
    message: 'Please select your location'
  },
  salaryRange: {
    required: true,
    message: 'Please select your salary range'
  },
  skillSet: {
    required: true,
    minLength: 1,
    message: 'Please select at least one skill'
  },
  apiKey: {
    required: true,
    minLength: 10,
    pattern: /^sk-or-v1-[a-f0-9]{32,}$/,
    message: 'Please enter a valid OpenRouter API key (sk-or-v1-...)'
  }
};

export const validateField = (field: keyof QuizData, value: any): string | undefined => {
  const rule = validationSchema[field];
  if (!rule) return undefined;

  // Required validation
  if (rule.required) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return rule.message;
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }
  }

  // Array length validation
  if (Array.isArray(value)) {
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message;
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return undefined;
};

export const validateForm = (data: QuizData): FormErrors => {
  const errors: FormErrors = {};

  Object.keys(validationSchema).forEach((field) => {
    const error = validateField(field as keyof QuizData, data[field as keyof QuizData]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const isFormValid = (errors: FormErrors): boolean => {
  return Object.values(errors).every(error => !error);
};

export const getFieldsForStep = (step: number): (keyof QuizData)[] => {
  switch (step) {
    case 1:
      return ['jobDescription'];
    case 2:
      return ['experience', 'industry', 'location', 'salaryRange', 'skillSet'];
    case 3:
      return ['apiKey'];
    default:
      return [];
  }
};

export const validateStep = (data: QuizData, step: number): FormErrors => {
  const fieldsToValidate = getFieldsForStep(step);
  const errors: FormErrors = {};

  fieldsToValidate.forEach((field) => {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};