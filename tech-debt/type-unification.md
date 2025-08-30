# Type System Unification

**Priority**: Medium
**Status**: Pending

## Problem
Type conflicts between:
- `@/lib/rss/types`
- `@/types/jobloss`
Specifically `AnalysisResult` has incompatible definitions.

## Solution
1. Merge types into `@/types/rss.ts`:
```typescript
export interface RSSArticle { /* unified */ }
export interface AnalysisResult {
  id: string;
  summary: string;
  jobLossCount: number;
  timestamp: Date;
  // ... other fields
}
```
2. Update all imports to use unified types.

## Affected Files
- `src/hooks/useJobLossTracker.ts`
- `src/pages/joblosstracker.tsx`
- `src/components/jobloss/*`
