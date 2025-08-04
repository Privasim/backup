# Branching Profile Logic - Requirements

## Overview
Enhance the existing profile system to implement dynamic branching form logic that adapts questions based on user selections. The system will collect structured, non-PII profile data for future LLM-powered personalized recommendations.

## Goals
1. **Expand Profile Types**: Extend from 6 to 8 profile categories with conditional branching
2. **Dynamic Form Logic**: Implement rule-based field display based on user selections
3. **Enhanced Data Collection**: Capture skills, experience, and qualifications systematically
4. **LLM Integration Ready**: Structure data and create service stubs for future AI recommendations
5. **Privacy-First**: Maintain anonymous, client-side data storage approach

## User Flow
1. User selects profile type from expanded dropdown
2. Conditional questions appear based on selection
3. Multi-step form guides through profile, experience, and skills
4. Form validates and stores data locally
5. Post-submission panel shows placeholder action buttons for future LLM features

## Core Requirements

### Profile Types (Expanded)
- Working Full-Time
- Working Part-Time  
- Freelancer
- Student
- Unemployed (Actively Searching)
- Career Shifter
- Entrepreneur
- Other (with text input)

### Conditional Branching Logic
- **Student**: Major, graduation year, skills, interested industries
- **Working Full-Time**: Industry, role, experience years, skills, technologies
- **Entrepreneur**: Business stage, industry, team size, no-code familiarity
- **Career Shifter**: Previous career, years in previous role, target industry
- **Others**: Relevant contextual fields based on selection

### Data Structure
```typescript
interface ProfileFormData {
  profile: ProfileData;
  experience: ExperienceEntry[];
  skills: SkillCategory[];
  certifications: Certification[];
  languages: LanguageProficiency[];
}
```

### Post-Submission Actions (Placeholders)
- Create a Backup Plan
- Suggest a Startup Idea  
- Explore Industry Fit
- Generate Personal Learning Path

## Technical Requirements

### Frontend
- React + TypeScript with existing component patterns
- Zod validation schemas for form data
- Local storage for data persistence
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance

### Integration Readiness
- OpenRouter client integration stubs
- Structured prompt templates for LLM analysis
- API service layer with placeholder endpoints
- Data transformation utilities for backend sync

### Non-Functional Requirements
- No PII collection or storage
- Client-side data storage only
- Anonymous usage patterns
- Maximum 3 levels of branching depth
- Form completion under 5 minutes

## Success Criteria
- [ ] All 8 profile types implemented with conditional logic
- [ ] Form validation prevents invalid submissions
- [ ] Data persists across browser sessions
- [ ] Mobile experience matches desktop functionality
- [ ] LLM integration stubs ready for future activation
- [ ] Zero PII data collection verified