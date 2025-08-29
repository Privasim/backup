# Technical Specification: Modular Branching Role Details Step

## Executive Summary
This document details the implementation of a new modular branching step 2 that replaces both existing steps 2 and 3, consolidating the user flow into 3 steps: Role → Details → Review. The implementation features conditional branching based on role selection and collects 7 specific data points in a defined order.

## Architecture Overview

### User Flow Transformation
```
Current: Role → RoleDetails → IndustryLocation → Review (4 steps)
New:     Role → RoleBasedDetails → Review (3 steps)
```

### Core Design Principles
1. **Pure Branching Logic**: Dedicated form implementations per role
2. **Modular Components**: Atomic field controllers reusable across roles
3. **Zero Existing Components**: All new implementations from scratch
4. **Data Centralization**: Unified flow through UserProfileContext
5. **Type Safety**: Comprehensive TypeScript coverage

## Data Model Extensions

### New Type Definitions
```typescript
// Core field data structures
interface IncomeCurrency {
  range: string;
  currency: string;
}

interface EducationTraining {
  level: string;
  field?: string;
  completion?: string;
}

interface ExperienceData {
  type: string;
  duration: string;
  details?: string;
}

interface ChallengeGoal {
  current: string[];
  desired: string[];
}
```

### Data Storage Strategy
- **Industry**: Top-level `profileData.industry`
- **Location**: Top-level `profileData.location`
- **Income/Currency**: Role-specific in `roleDetails`
- **Skills**: Top-level `profileData.skills`
- **Experience**: Role-specific in `roleDetails`
- **Education**: Role-specific in `roleDetails`
- **Goals**: Role-specific in `roleDetails.goals`

## Component Architecture

### File Structure
```
src/app/businessidea/tabs/user-profile/
├── steps/
│   ├── NewBranchingDetailsStep.tsx
├── components/
│   ├── role-forms/ [4 role-specific forms]
│   ├── fields/ [7 field controllers]
│   └── utils/ [option/validation managers]
├── hooks/
│   ├── useRoleFormConfig.ts
│   ├── useFieldOptions.ts
│   └── useFormValidation.ts
└── types/
    └── role-form.types.ts
```

### Component Specifications
1. **NewBranchingDetailsStep.tsx** - Main orchestrator
2. **Role-Specific Forms** - 4 forms (Student, Professional, etc.)
3. **Field Controllers** - 7 atomic components:
   - IndustryField.tsx
   - LocationField.tsx
   - IncomeCurrencyField.tsx
   - SkillsField.tsx
   - ExperienceField.tsx
   - EducationField.tsx
   - ChallengesGoalsField.tsx

## Integration Points
1. **UserProfileContext Extension** - New state additions
2. **Step Completion Logic** - Strict criteria for all 7 fields
3. **Review Step Integration** - Display new fields in role-specific sections
4. **Navigation Updates** - Remove old steps, update labels

## Implementation Phases
1. **Foundation** (Week 1): Types, option management, base components
2. **Role Forms** (Week 2): Implement role-specific forms and validation
3. **Integration** (Week 3): Context updates, review step integration
4. **Polish** (Week 4): Accessibility, performance, final testing

## Testing Strategy
- **Unit Tests**: Field controllers, validation, state management
- **Integration Tests**: Role workflows, data persistence
- **Manual Tests**: All role paths, field dependencies

## Performance Considerations
- Lazy loading of role forms
- Memoization of field options
- Debounced context updates
- Virtual scrolling for large lists

## Accessibility Requirements
- Full keyboard navigation
- Screen reader support
- Clear focus management
- Accessible error messaging

## Migration Strategy
1. Build new components alongside existing
2. Gradual migration with feature flags
3. Comprehensive testing before final switch
4. Remove old components after migration

## Success Criteria
- [ ] 3-step flow implemented
- [ ] All 7 fields collected per role
- [ ] Data flows correctly to Review
- [ ] 100% new components
- [ ] Full TypeScript coverage
- [ ] Accessibility compliance
- [ ] Performance benchmarks met
