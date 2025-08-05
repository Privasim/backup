# Profile Analysis Implementation Plan

## 1. New Chatbox Component Structure
- **New Files**:
  - `src/components/profile-analysis/ChatboxPanel.tsx` (Main container)
  - `src/components/profile-analysis/AnalysisSummary.tsx` (Summary display)
  - `src/components/profile-analysis/AnalysisControls.tsx` (Model selection + Analyze button)
- **Modify Files**:
  - `src/app/layout.tsx`: Add ChatboxPanel to main layout (right-side 20% width)
  - `src/app/businessidea/components/profile-panel/ReviewStep.tsx`: Add callback to trigger chatbox after save

## 2. API Key Management Integration
- **Reuse Existing**:
  - Adapt `src/components/quiz/ApiKeyInput.tsx` as `AnalysisControls.tsx`
- **Modifications**:
  - Add model selection dropdown (qwen, glm-4.5, kimi-k2)
  - Connect to OpenRouter client validation
  - Store API key in local storage (same as profile data)
- **New Logic**:
  - API key validation before enabling "Analyze Profile" button

## 3. Analysis Request Payload Design
```json
{
  "model": "selected-model",
  "messages": [
    {
      "role": "system",
      "content": "Analyze this career profile and provide a professional summary highlighting key strengths, potential career risks, and opportunities. Focus on: skills alignment, experience relevance, and market trends."
    },
    {
      "role": "user",
      "content": "PROFILE_DATA_JSON"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

## 4. OpenRouter Response Handling
- **New File**: `src/lib/analysis/responseFormatter.ts`
- **Functions**:
  - `extractAnalysisSummary()`: Parse OpenRouter response
  - `sanitizeContent()`: Remove markdown artifacts
  - `formatAsBulletPoints()`: Convert text to structured output
- **Error Handling**:
  - Network error fallbacks
  - Empty response detection
  - Rate limit warnings

## 5. Summary Display UI
- **Components**:
  - `AnalysisSummary.tsx`:
    - Header with "Profile Analysis" title
    - Loading spinner during processing
    - Read-only text area for summary
    - Expandable "Show Details" section
    - Error display area
- **Design Elements**:
  - Card-based layout (consistent with profile panel)
  - Success/error color coding
  - Copy-to-clipboard functionality
  - Responsive typography

## Implementation Sequence
1. Create chatbox component structure
2. Integrate API key management
3. Implement payload generation
4. Connect to OpenRouter client
5. Build response formatter
6. Create summary UI components
7. Add error handling
8. Implement analytics tracking

## Suggested Improvements
1. Add "Re-analyze" button for updated profiles
2. Include model performance metrics
3. Implement summary export (PDF/PNG)
4. Add "Insight Tags" feature for quick scanning
5. Include confidence scores for analysis
