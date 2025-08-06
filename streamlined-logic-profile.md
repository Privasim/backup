# Streamlined Profile Logic Implementation

## Overview
This document outlines the streamlined profile logic for the business idea generator's profile panel. The implementation follows a modular, type-safe approach while maintaining all existing functionality.

## Profile Types

### 1. Student
- **Purpose**: Capture educational background and interests
- **Required Fields**:
  - `educationLevel`: High School, College, Graduate School
- **Optional Fields**:
  - `fieldOfStudy`: Free text (e.g., "Computer Science")
  - `yearLevel`: 1st, 2nd, 3rd, 4th, 5th+

### 2. Professional
- **Purpose**: Document work experience and skills
- **Required Fields**:
  - `industry`: Tag input with autocomplete
  - `employmentType`: Full-time, Part-time, Freelancer, Contract
  - `yearsOfExperience`: 0-1, 2-4, 5-9, 10+
- **Optional Fields**:
  - `toolsUsed`: Tag input (e.g., "Excel, Canva, Salesforce")
  - `topWorkActivities`: Free text (e.g., "Project management, Data analysis")

### 3. Business Owner
- **Purpose**: Understand business context and challenges
- **Required Fields**:
  - `businessType`: Free text (e.g., "E-commerce, Consulting")
  - `businessStatus`: Active, Paused, Closed
  - `teamSize`: Solo, 2-5, 6-20, 20+
- **Optional Fields**:
  - `salesChannels`: Multiselect (Facebook, Lazada, Shopify, In-person)
  - `biggestChallenge`: Select (Leads, Cost, Staffing, Customer Churn)

### 4. Unemployed
- **Purpose**: Support career transition planning
- **Required Fields**:
  - `previousRole`: Free text (e.g., "Marketing Manager")
  - `targetIndustry`: Tag input with autocomplete
  - `goal`: Find job, Start business, Undecided
- **Optional Fields**:
  - `toolsPreviouslyUsed`: Tag input
  - `enjoyedTasks`: Free text (e.g., "Data analysis, Team collaboration")

## Implementation Details

### Field Types
1. **Text Input**
   - Single line text entry
   - Used for: fieldOfStudy, businessType, previousRole

2. **Select**
   - Single selection dropdown
   - Used for: educationLevel, employmentType, businessStatus, goal

3. **Tag Input**
   - Multiple values with autocomplete
   - Used for: industry, toolsUsed, targetIndustry, toolsPreviouslyUsed

4. **Multiselect**
   - Multiple selection from predefined options
   - Used for: salesChannels

5. **Textarea**
   - Multi-line text entry
   - Used for: topWorkActivities, enjoyedTasks

### Validation Rules
- Required fields must be non-empty
- Email format validation where applicable
- Numeric ranges for years of experience
- Maximum length constraints for text fields

### Progressive Disclosure
1. Show only required fields initially
2. Reveal optional fields via "Show more options"
3. Conditional fields appear based on previous selections

## Component Structure

```
ProfilePanel/
├── ProfileTypeSelector.tsx  # Step 1: Profile type selection
├── ConditionalFieldsStep/
│   ├── index.tsx            # Main container
│   ├── fields/
│   │   ├── TextField.tsx
│   │   ├── SelectField.tsx
│   │   ├── TagInputField.tsx
│   │   └── TextareaField.tsx
│   └── config.ts            # Field configurations
└── utils/
    ├── validation.ts        # Validation schemas
    └── formatters.ts        # Data formatting utilities
```

## State Management
- Uses React Context for global state
- Form state is persisted in localStorage
- Validation state is managed per field

## Accessibility
- ARIA labels for all form controls
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)

## Performance Considerations
- Lazy loading of field components
- Memoization of expensive computations
- Debounced form validation
- Optimized re-renders with React.memo

## Testing Strategy
1. Unit tests for field validation
2. Integration tests for form workflows
3. E2E tests for complete user journeys
4. Visual regression testing for UI components

## Future Enhancements
1. Rich text editor for longer responses
2. File upload for resumes/portfolios
3. Integration with professional networks (LinkedIn, etc.)
4. AI-powered field suggestions

## Dependencies
- React 18+
- TypeScript 4.9+
- React Hook Form
- Zod for validation
- Framer Motion for animations
- Tailwind CSS for styling
