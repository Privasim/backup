# Implementation Plan

- [ ] 1. Create JobRiskAnalysisTrigger component
  - Build red-themed trigger button for ReviewStep with disabled/enabled states
  - Add profile readiness validation and missing requirements display
  - Integrate with existing ProfileAnalysisTrigger patterns for consistency
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Implement ProfileOccupationMapper service
  - Create mapping logic for Professional, Student, BusinessOwner, and CareerShifter roles
  - Build search query generation using jobFunction, industry, skills, and role-specific fields
  - Add confidence scoring and relevance calculation for occupation matches
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Build JobRiskAnalysisProvider for chatbox system
  - Extend AnalysisProvider interface with job-risk-analysis type
  - Integrate ProfileOccupationMapper for profile-to-occupation conversion
  - Query ResearchDataService methods (getOccupationRisk, getIndustryData, getTaskAutomationData)
  - Generate AI-powered analysis reports using OpenRouter integration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Enhance ChatboxProvider with job risk analysis support
  - Add triggerJobRiskAnalysis method to ChatboxContextType interface
  - Register JobRiskAnalysisProvider in chatbox initialization
  - Extend AnalysisType union to include 'job-risk-analysis'
  - _Requirements: 3.1, 8.1, 8.2, 8.3_

- [ ] 5. Create JobRiskAnalysisResult data structures
  - Define JobRiskAnalysisResult interface extending AnalysisResult
  - Add OccupationMapping, RiskAssessment, and SkillAnalysis types
  - Create profile hashing utility for change detection and caching
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Enhance useJobRiskData hook with real data integration
  - Add analysisResult, isRealData, and profileHash properties to hook interface
  - Implement data priority logic: real results → cached results → placeholder data
  - Add refreshAnalysis method and analysis result subscription
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Update JobRiskAnalysisTab for real data consumption
  - Modify component to accept userProfile prop and check for analysis results
  - Replace placeholder data with real ResearchDataService data when available
  - Add analysis prompt UI when no data exists with trigger to run analysis
  - Implement automatic data refresh when new analysis completes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Integrate JobRiskAnalysisTrigger in ReviewStep
  - Add JobRiskAnalysisTrigger component alongside existing ProfileAnalysisTrigger
  - Connect trigger to ChatboxProvider.triggerJobRiskAnalysis method
  - Handle analysis completion with navigation/highlighting of JobRiskAnalysisTab
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 9. Implement comprehensive error handling and fallbacks
  - Add graceful degradation for ResearchDataService unavailability
  - Create fallback mechanisms for occupation mapping failures
  - Implement retry logic for network errors and partial data scenarios
  - Add confidence indicators and error state UI components
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Add caching and performance optimizations
  - Implement JobRiskCache with profile mappings, analysis results, and occupation data
  - Add profile hashing for change detection and cache invalidation
  - Create background refresh mechanism for stale data
  - Optimize ResearchDataService query batching and lazy loading
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.5_

- [ ] 11. Create analysis result storage and state management
  - Store JobRiskAnalysisResult in chatbox analysis history with profile metadata
  - Implement result retrieval and profile version linking
  - Add outdated analysis detection when profile changes significantly
  - Create access to previous results through analysis history interface
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Build extensible architecture for future enhancements
  - Design modular interfaces supporting multiple data sources
  - Create provider pattern extensions for new analysis types
  - Implement consistent error handling and caching strategies across services
  - Add concurrent analysis request support and result caching architecture
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_