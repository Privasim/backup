# Profile Analysis Adapter

Minimal facade that unifies profile data and exposes readiness helpers.

## Purpose
- Provide a single, reusable interface for converting `UserProfileData`, `ProfileFormData`, or already-normalized `ProfileAnalysisData` into the format required by the AI provider.
- Expose readiness information (completion level, missing fields) for UI gating.
- Keep existing transformation utilities (`profile-transformation.ts`) and Chatbox provider unchanged.

## Usage
```ts
import { toAnalysisData, getReadiness } from '@/lib/profile-analysis';
import { UserProfileData } from '@/app/businessidea/tabs/user-profile/types';

const data: UserProfileData = { ... };
const analysisData = toAnalysisData(data);
const readiness = getReadiness(data);
```

## Data Flow
- `ReviewStep.tsx` → `useProfileIntegration().getAnalysisReadiness(data)` → readiness UI.
- `ProfileAnalysisTrigger` → `useProfileIntegration().triggerProfileAnalysis(data)` → Chatbox provider → AI provider.

## Boundaries
- API key and model selection remain in `ChatboxControls.tsx` and prompt UI respectively.
- No breaking changes to existing Chatbox or research modules.
