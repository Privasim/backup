import { useReducer, useCallback, useEffect } from 'react';
import { QuizData, FormState, FormAction, FormErrors } from '@/lib/quiz/types';
import { validateField, validateForm, validateStep, isFormValid } from '@/lib/quiz/validation';

const initialFormData: QuizData = {
  jobDescription: '',
  experience: '',
  industry: '',
  location: '',
  salaryRange: '',
  skillSet: [],
  apiKey: ''
};

const initialState: FormState = {
  data: initialFormData,
  errors: {},
  touched: {},
  isValid: false,
  currentStep: 1,
  isSubmitting: false,
  submitAttempted: false,
  isAnalyzing: false,
  analysisComplete: false
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      const newData = {
        ...state.data,
        [action.field]: action.value
      };
      
      // Validate the field
      const fieldError = validateField(action.field, action.value);
      const newErrors = {
        ...state.errors,
        [action.field]: fieldError
      };

      return {
        ...state,
        data: newData,
        errors: newErrors,
        isValid: isFormValid(newErrors)
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };

    case 'SET_SUBMIT_ATTEMPTED':
      return {
        ...state,
        submitAttempted: action.attempted
      };

    case 'SET_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.isAnalyzing
      };

    case 'SET_ANALYSIS_COMPLETE':
      return {
        ...state,
        analysisComplete: action.complete
      };

    case 'VALIDATE_FORM':
      const formErrors = validateForm(state.data);
      return {
        ...state,
        errors: formErrors,
        isValid: isFormValid(formErrors)
      };

    case 'RESET_FORM':
      return initialState;

    case 'RESET_DEPENDENT_FIELDS':
      const resetData = {
        ...state.data,
        experience: '',
        industry: '',
        location: '',
        salaryRange: '',
        skillSet: [],
        apiKey: ''
      };
      
      // Clear errors for dependent fields
      const resetErrors = { ...state.errors };
      delete resetErrors.experience;
      delete resetErrors.industry;
      delete resetErrors.location;
      delete resetErrors.salaryRange;
      delete resetErrors.skillSet;
      delete resetErrors.apiKey;

      return {
        ...state,
        data: resetData,
        errors: resetErrors,
        currentStep: 2,
        isValid: isFormValid(resetErrors)
      };

    default:
      return state;
  }
};

export const useQuizForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field: keyof QuizData, value: string | string[]) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setTouched = useCallback((field: string) => {
    dispatch({ type: 'SET_TOUCHED', field });
  }, []);

  const setError = useCallback((field: string, error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  }, []);

  const setSubmitAttempted = useCallback((attempted: boolean) => {
    dispatch({ type: 'SET_SUBMIT_ATTEMPTED', attempted });
  }, []);

  const setAnalyzing = useCallback((isAnalyzing: boolean) => {
    dispatch({ type: 'SET_ANALYZING', isAnalyzing });
  }, []);

  const setAnalysisComplete = useCallback((complete: boolean) => {
    dispatch({ type: 'SET_ANALYSIS_COMPLETE', complete });
  }, []);

  const validateCurrentStep = useCallback(() => {
    const stepErrors = validateStep(state.data, state.currentStep);
    const hasStepErrors = Object.values(stepErrors).some(error => !!error);
    
    // Update errors for current step
    Object.keys(stepErrors).forEach(field => {
      dispatch({ type: 'SET_ERROR', field, error: stepErrors[field] });
    });

    return !hasStepErrors;
  }, [state.data, state.currentStep]);

  const validateFormAction = useCallback(() => {
    dispatch({ type: 'VALIDATE_FORM' });
  }, []);

  const validateForm = useCallback(() => {
    validateFormAction();
    return state.isValid;
  }, [state.isValid, validateFormAction]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const resetDependentFields = useCallback(() => {
    dispatch({ type: 'RESET_DEPENDENT_FIELDS' });
  }, []);

  const canProceedToNextStep = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const isStepComplete = useCallback((step: number) => {
    const stepErrors = validateStep(state.data, step);
    return Object.values(stepErrors).every(error => !error);
  }, [state.data]);

  // Auto-validate form when data changes
  useEffect(() => {
    if (state.submitAttempted) {
      dispatch({ type: 'VALIDATE_FORM' });
    }
  }, [state.data, state.submitAttempted]);

  return {
    state,
    actions: {
      setField,
      setTouched,
      setError,
      setStep,
      setSubmitting,
      setSubmitAttempted,
      setAnalyzing,
      setAnalysisComplete,
      validateCurrentStep,
      validateForm,
      resetForm,
      resetDependentFields,
      canProceedToNextStep,
      isStepComplete
    }
  };
};