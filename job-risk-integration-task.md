# Job Risk Analysis Integration - Implementation Plan

## 1. Overview

This document outlines the implementation plan for integrating the "Analyze Job Risk" feature into the existing profile review workflow. The integration will connect the ReviewStep component to the ChatboxControls and OpenRouter API, enabling JobRiskAnalysisTab to fetch and display real job risk analysis data from the research-data-service.

## 2. Files to Modify

### A. Add "Analyze Job Risk" Button
1. **`src/app/businessidea/components/profile-panel/ReviewStep.tsx`**
   - Add a new "Analyze Job Risk" button next to the existing ProfileAnalysisTrigger component
   - Connect button to a new handler function for job risk analysis

### B. Create Job Risk Analysis Controller Hook
2. **`src/app/businessidea/tabs/job-risk/hooks/useJobRiskController.ts`** (new file)
   - Create a controller hook to replace useJobRiskData
   - Connect to ResearchDataService for real data
   - Implement data transformation logic for D3 visualizations
   - Handle loading states and error handling

### C. Update Job Risk Analysis Tab
3. **`src/app/businessidea/tabs/job-risk/JobRiskAnalysisTab.tsx`**
   - Replace useJobRiskData with useJobRiskController
   - Update component to use real data from research-data-service
   - Implement responsive layout per visualization spec

### D. Extend Research Data Service
4. **`src/lib/research/service/research-data-service.ts`**
   - Add missing methods referenced in visualization spec:
     - `getTaskAutomationData()`
     - `getRiskMatrixData()`
     - `getIndustryData()`
     - `getSkillGapData()`
   - Implement data transformation for visualization components

### E. Create D3 Visualization Components
5. **`src/app/businessidea/tabs/job-risk/components/D3VelocityCutsChart.tsx`** (new file)
6. **`src/app/businessidea/tabs/job-risk/components/D3SkillAutomationBloom.tsx`** (new file)
7. **`src/app/businessidea/tabs/job-risk/components/D3ForecastFan.tsx`** (new file)

### F. Connect to ChatboxProvider
8. **`src/components/chatbox/hooks/useProfileIntegration.ts`**
   - Add support for job risk analysis type
   - Extend transformProfileData to include job risk data

9. **`src/components/chatbox/ChatboxProvider.tsx`**
   - Add job risk analysis type to supported analysis types

### G. Update Types
10. **`src/app/businessidea/tabs/job-risk/types.ts`**
    - Update types to match real data structure from research-data-service

## 3. Implementation Steps

### Phase 1: Setup and Infrastructure
1. **Extend Research Data Service**
   - Implement missing methods in research-data-service.ts
   - Add caching for job risk data
   - Add error handling for API calls

2. **Create Controller Hook**
   - Implement useJobRiskController hook
   - Connect to research-data-service
   - Add data transformation logic

### Phase 2: UI Components
3. **Create D3 Visualization Components**
   - Implement D3VelocityCutsChart
   - Implement D3SkillAutomationBloom
   - Implement D3ForecastFan
   - Add accessibility features
   - Implement responsive design

4. **Update JobRiskAnalysisTab**
   - Replace placeholder data with controller hook
   - Implement layout per visualization spec
   - Add loading and error states

### Phase 3: Integration
5. **Add "Analyze Job Risk" Button**
   - Add button to ReviewStep component
   - Implement handler function

6. **Connect to ChatboxProvider**
   - Update useProfileIntegration
   - Add job risk analysis type to ChatboxProvider

## 4. Detailed Technical Approach

### A. Controller Hook Design
The `useJobRiskController` hook will:
- Accept profile data as input
- Fetch occupation risk data from ResearchDataService
- Transform data for D3 visualizations
- Handle loading states and errors
- Return structured data for each visualization component

```typescript
// Conceptual structure (not actual code)
function useJobRiskController(profileData) {
  // Fetch data from ResearchDataService
  // Transform data for visualizations
  // Handle loading and errors
  
  return {
    velocity: { data: transformedCutSeries },
    skills: { impacts: transformedSkillImpacts, matrix: transformedMatrix },
    forecast: { history: transformedHistory, forecast: transformedForecast },
    insights: computedInsights,
    loading,
    error
  };
}
```

### B. D3 Component Design
Each D3 component will:
- Accept data via props
- Use D3 for rendering visualizations
- Support accessibility features
- Handle responsive design
- Follow the visualization spec guidelines

### C. Integration with ChatboxProvider
The integration will:
- Add a new analysis type for job risk
- Extend the profile transformation logic
- Connect the "Analyze Job Risk" button to the ChatboxProvider
- Handle analysis results and display them in JobRiskAnalysisTab

## 5. Fallback Strategy
- Implement graceful degradation if research-data-service fails
- Provide meaningful error messages
- Consider using placeholder data as fallback

## 6. Next Steps
1. Review and finalize the implementation plan
2. Begin with Phase 1: Setup and Infrastructure
3. Proceed to Phase 2: UI Components
4. Complete with Phase 3: Integration
5. Conduct thorough testing and refinement
