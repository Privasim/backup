# SSR-safe localStorage Implementation

**Priority**: High
**Status**: Pending

## Problem
Components accessing `localStorage` during SSR cause `ReferenceError: localStorage is not defined`.

## Solution
1. Create `src/lib/ssr-safe-storage.ts`:
```typescript
export const safeLocalStorage = {
  getItem: (key: string) => 
    typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => 
    typeof window !== 'undefined' && localStorage.setItem(key, value)
};
```
2. Replace all `localStorage` references with `safeLocalStorage`.

## Affected Files
- `src/features/specs-generator/components/SpecsSettingsPanel.tsx`
- `src/app/businessidea/tabs/PromptBox.tsx`
- Business plan modules
