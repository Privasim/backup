# useResearchData Hooks — Comprehensive Guide

This guide documents how to correctly and optimally use the hooks exported by `src/hooks/useResearchData.ts`. It covers initialization, API contracts, usage patterns, error handling, performance, testing, security, and troubleshooting.

- Source file: `src/hooks/useResearchData.ts`
- Backing service: `src/lib/research/service`
- Static knowledge base: `src/lib/research/data/ai_employment_risks.json`

> Principles enforced:
> - No mock data in examples; use real inputs from your app state (profile, user selections, etc.).
> - No secrets in docs or examples.
> - Validate and normalize input parameters.
> - Avoid race conditions; follow the concurrency guidance below.

---

## 1. Overview

`useResearchData` provides a family of React client hooks that lazily initialize a singleton Research Service and expose UI-friendly APIs with consistent state contracts for:

- Occupation risk retrieval
- Occupation search
- Visualization configuration retrieval
- Top-risk occupations listing
- Industry data retrieval
- Task automation data retrieval
- Service health monitoring

Each hook standardizes state as `{ isLoading, error, isInitialized }` and provides result data plus an imperative action (`refetch`, `search`, or `clearResults`).

---

## 2. Initialization Model

- The hooks call `ensureServiceInitialized()` internally before making any request.
- Initialization runs `initializeResearchService(ai_employment_risks.json)` once per module load using a module-level `serviceInitialized` flag.
- If initialization fails, hooks expose an error message and set `isInitialized: false`.

Caveats and Best Practices:
- Hot Module Reload (HMR): On dev HMR, a duplicate module instance may re-run init. Ensure `initializeResearchService` is idempotent.
- Concurrency: Multiple concurrent hook calls could attempt initialization at the same time. The current guard flips `serviceInitialized` only after `await` completes. Prefer to mount components that use these hooks in a stable order to avoid unnecessary concurrent first calls.
- Do not attempt to initialize the service manually; rely on the hooks.

### 2.1 Client-only and SSR Notes

- These hooks depend on React client runtime and a module-scoped flag. Use them only in Client Components (Next.js: files with `"use client"`).
- Do not call these hooks in Server Components, API routes, or during SSR. If server-side data is required, call the underlying service on the server and pass results to client components via props.
- If migrating logic to the server, initialize the service in server code separately and avoid sharing client-only singletons across the boundary.

---

## 3. Common State Contract

All hooks share the base state:

- `isLoading: boolean` — true while a fetch is in progress.
- `error: string | null` — user-friendly error message if the last operation failed.
- `isInitialized: boolean` — true once initialization and at least one successful call have completed for this hook instance.

## 4. API Reference

- `OccupationRisk`
- `OccupationMatch`
- `ChartConfig`
- `SearchFilters`

Where this file currently uses `any[]`, prefer to strengthen types at the service layer and re-export them here when available.

#### 4.0 Hook Signatures (TypeScript)

```ts
interface UseResearchDataState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

function useOccupationRisk(occupationIdentifier?: string): UseResearchDataState & {
  occupationRisk: OccupationRisk | null;
  refetch: () => Promise<void>;
};

function useOccupationSearch(): UseResearchDataState & {
  results: OccupationMatch[];
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
};

function useVisualization(chartType: string): UseResearchDataState & {
  chartConfig: ChartConfig | null;
  refetch: () => Promise<void>;
};

function useTopRiskOccupations(limit?: number): UseResearchDataState & {
  occupations: unknown[]; // strengthen type when available
  refetch: () => Promise<void>;
};

function useIndustryData(): UseResearchDataState & {
  industries: unknown[]; // strengthen type when available
  refetch: () => Promise<void>;
};

function useTaskAutomationData(): UseResearchDataState & {
  tasks: unknown[]; // strengthen type when available
  refetch: () => Promise<void>;
};

function useServiceHealth():
  | {
      status: 'healthy' | 'unhealthy';
      initialized: boolean;
      cache?: unknown;
      error?: string;
      timestamp: string;
    }
  | null;
```

### 4.1 useOccupationRisk(occupationIdentifier?: string)

Retrieves risk details for a specific occupation.

- Parameters:
  - `occupationIdentifier?: string` — A stable identifier (e.g., taxonomy code or canonical name). If falsy, the hook does not fetch.
- Returns:
  - `occupationRisk: OccupationRisk | null`
  - `refetch: () => Promise<void>`
  - plus common state
- Behavior:
  - Trims no input; pass a pre-validated identifier (non-empty string).
  - Calls `service.getOccupationRiskWithFallback(occupationIdentifier)`.
  - Errors are converted to message strings and clear `occupationRisk` to `null`.

Usage tips:
- Derive `occupationIdentifier` from your profile or selection state.
- Re-render on identifier change automatically triggers a new fetch.
- Avoid rapid churn of identifiers; debounce upstream if necessary.

### 4.2 useOccupationSearch()

Searches occupations by query with optional filters.

- Methods:
  - `search(query: string, filters?: SearchFilters): Promise<void>`
    - If `query.trim()` is empty, results are cleared and no request is made.
  - `clearResults(): void` — Clears current results and error.
- Returns:
  - `results: OccupationMatch[]`
  - plus common state
- Behavior:
  - Calls `service.searchOccupations(query, filters)`.

Usage tips:
- Normalize query by trimming before calling `search`.
- Debounce `search` at the UI layer for typeahead experiences.
- Persist `filters` in component state to keep calls stable.

### 4.3 useVisualization(chartType: string)

Retrieves a chart configuration by type.

- Parameters:
  - `chartType: string` — Non-empty string key. If falsy, hook skips fetch.
- Returns:
  - `chartConfig: ChartConfig | null`
  - `refetch: () => Promise<void>`
  - plus common state
- Behavior:
  - Calls `service.getVisualizationConfig(chartType)`.

Usage tips:
- Keep `chartType` stable via memoization if derived from props.
- Validate `chartType` against known options.

### 4.4 useTopRiskOccupations(limit: number = 10)

Fetches a list of top-risk occupations.

- Parameters:
  - `limit: number` — Positive integer; defaults to 10.
- Returns:
  - `occupations: any[]` (consider strengthening type later)
  - `refetch: () => Promise<void>`
  - plus common state
- Behavior:
  - Calls `service.getTopRiskOccupations(limit)`.

Usage tips:
- Validate `limit` (>= 1 and reasonably bounded) before passing.

### 4.5 useIndustryData()

Gets industry-level data.

- Returns:
  - `industries: any[]`
  - `refetch: () => Promise<void>`
  - plus common state
- Behavior:
  - Calls `service.getIndustryData()`.

Usage tips:
- If you require strong typing, extend the service to return a typed shape and update this hook accordingly.

### 4.6 useTaskAutomationData()

Gets task-level automation data.

- Returns:
  - `tasks: any[]`
  - `refetch: () => Promise<void>`
  - plus common state
- Behavior:
  - Calls `service.getTaskAutomationData()`.

Usage tips:
- Combine with occupation selection to display task-level detail panels.

### 4.7 useServiceHealth()

Monitors service health and cache stats.

- Returns:
  - `health: {
      status: 'healthy' | 'unhealthy',
      initialized: boolean,
      cache?: unknown,
      error?: string,
      timestamp: string
    } | null`
- Behavior:
  - On mount, ensures initialization and reads `service.getCacheStats()`.
  - Updates every 30s; cleans up interval on unmount.

Usage tips:
- Display in a non-blocking diagnostics widget; do not gate the main UI on this.

---

## 4A. Decision Guide: useResearchData vs useRiskInsights

- __Prefer useRiskInsights for Job Risk UI__: If building Job Risk visualizations, use the Risk Insights pipeline (normalizes 0–100 units, handles precedence, integrates with profile state).
- __Use useResearchData for generic reads__: Use for search, catalogs, raw task automation, visualization configs outside Risk Insights.
- __Do not mix sources for the same widget__ unless you define precedence and normalization.

---

## 5. Architecture Diagram

```mermaid
flowchart TD
  UI[React Components] --> Hooks

  subgraph Hooks[useResearchData.ts]
    A[useOccupationRisk]
    B[useOccupationSearch]
    C[useVisualization]
    D[useTopRiskOccupations]
    E[useIndustryData]
    F[useTaskAutomationData]
    G[useServiceHealth]
    H[ensureServiceInitialized]
  end

  H -->|initializeResearchService(ai_employment_risks.json)| S[ResearchService (singleton)]
  A -->|getOccupationRiskWithFallback| S
  B -->|searchOccupations| S
  C -->|getVisualizationConfig| S
  D -->|getTopRiskOccupations| S
  E -->|getIndustryData| S
  F -->|getTaskAutomationData| S
  G -->|getCacheStats| S
```

---

## 6. Usage Patterns and Guidance

- Input Validation:
  - `occupationIdentifier`: require a non-empty string; sanitize at source.
  - `query`: trim and ensure length > 0 before calling `search`.
  - `limit`: positive integer; cap to a reasonable maximum.
  - `chartType`: validate against a known set of strings.

- Concurrency and Race Conditions:
  - Avoid triggering multiple simultaneous `refetch` calls for the same hook instance.
  - Debounce calls that originate from fast-changing inputs (e.g., text typing for search).
  - Keep dependency arrays stable (memoize derived values) to prevent unnecessary re-fetches.

- Error Handling:
  - Display `error` messages in non-blocking banners/toasts.
  - Provide retry via `refetch` or `search` actions.
  - Clear errors on successful subsequent calls.

- Performance:
  - Use `useMemo` for derived data to avoid re-computation on each render.
  - For lists (search results/top risks), virtualize rendering if large.

- Accessibility:
  - Announce loading states (`aria-busy`) and errors (`aria-live="polite"`).

---

## 6A. Caching & Refetch Semantics

- __Service-level caching__: The Research Service may cache results; inspect `useServiceHealth()` → `cache` and `getCacheStats()` for insights.
- __Hook state vs service cache__: `refetch()` refreshes the hook's state; whether network is hit depends on service policy.
- __Staleness__: If your UI requires freshness guarantees, add a timestamp check and call `refetch()` explicitly.
- __Idempotency__: Ensure upstream inputs (e.g., identifiers, filters) are stable to leverage memoization and caching effectively.

---

## 7. Testing Guidance

- Unit Tests (mock `src/lib/research/service`):
  - Initialization runs once; subsequent calls skip re-init.
  - Success paths set data and `isInitialized: true`; error paths set `error` and clear data.
  - `useOccupationRisk`: skips when identifier is missing; `refetch` triggers call.
  - `useOccupationSearch`: empty query clears results; filters passed through; `clearResults` empties and clears error.
  - `useVisualization`, `useTopRiskOccupations`, `useIndustryData`, `useTaskAutomationData`: verify loading transitions and `refetch`.
  - `useServiceHealth`: produces healthy snapshot; interval created and cleaned up.

- Integration Tests:
  - Mount minimal components using each hook and assert user-visible transitions.
  - Debounce logic (if added) can be tested with fake timers.

- Edge Cases:
  - Initialization failure and subsequent recovery on retry.
  - Rapid prop changes (identifier/chartType) and correct latest-result handling.

---

## 8. Security & Compliance

- No secrets handled by these hooks; static JSON knowledge base used for init.
- Validate and normalize all inputs before invoking calls.
- Prevent race conditions by avoiding concurrent repeated calls and stabilizing dependencies.
- Graceful degradation: On errors, hooks return empty/null data and an error message—UI should remain usable.

---

## 9A. Pitfalls & FAQ

- __Nothing happens during SSR__ → These are client-only hooks; fetch on client or call the service on the server and pass props.
- __Empty search__ → Blank/whitespace queries are ignored by design; trim before search.
- __Multiple initializations in dev__ → HMR may reload modules; keep `initializeResearchService` idempotent.
- __Rapid prop changes__ → Debounce/throttle in UI to avoid flicker and redundant calls.
- __Stale updates after unmount__ → If adding custom async work, cancel on unmount to prevent state updates on unmounted components.

---

## 9. Troubleshooting

- "Failed to initialize research service":
  - Verify `ai_employment_risks.json` is present and readable.
  - Ensure no runtime import path issues to `src/lib/research/service`.
- Blank search results:
  - Ensure `search` query is non-empty after trimming.
- No occupation risk:
  - Confirm `occupationIdentifier` is not empty and matches your data catalog.

---

## 10. Versioning / Change Log

- v1.1 — Added client-only/SSR guidance, TypeScript hook signatures, decision guide vs useRiskInsights, caching/refetch semantics, Pitfalls & FAQ, and usage examples.
- v1.0 — Initial documentation for `useResearchData` hooks.

---

## 11. Quick Reference

- File path: `src/hooks/useResearchData.ts`
- Exports:
  - `useOccupationRisk(occupationIdentifier?: string)`

```typescript
useOccupationRisk(occupationIdentifier?: string): {
  occupationRisk: any
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 11.2 useOccupationSearch

```typescript
useOccupationSearch(): {
  results: any[]
  isLoading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  clearResults: () => void
}
```

### 11.3 useVisualization

```typescript
useVisualization(chartType: string): {
  chartConfig: any
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 11.4 useTopRiskOccupations

```typescript
useTopRiskOccupations(limit?: number): {
  occupations: any[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 11.5 useIndustryData

```typescript
useIndustryData(): {
  industries: any[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 11.6 useTaskAutomationData

```typescript
useTaskAutomationData(): {
  tasks: any[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 11.7 useServiceHealth

```typescript
useServiceHealth(): {
  health: {
    status: 'healthy' | 'unhealthy'
    initialized: boolean
    cache?: unknown
    error?: string
    timestamp: string
  } | null
}
```

---

## 12. Usage Examples

All examples are Client Components and derive inputs from props/state. No mock data or secrets.

### 12.1 useOccupationRisk

```tsx
'use client'
import { useOccupationRisk } from '@/hooks/useResearchData'

export function OccupationRiskPanel({ occupationId }: { occupationId: string }) {
  const { occupationRisk, isLoading, error, refetch } = useOccupationRisk(occupationId)

  if (!occupationId) return null
  if (isLoading) return <div aria-busy>Loading risk…</div>
  if (error) return <div role="alert">{error} <button onClick={refetch}>Retry</button></div>
  if (!occupationRisk) return <div>No data.</div>

  return (
    <section>
      <h3>Risk</h3>
      <pre>{JSON.stringify(occupationRisk, null, 2)}</pre>
      <button onClick={refetch}>Refresh</button>
    </section>
  )
}
```

### 12.2 useOccupationSearch

```tsx
'use client'
import { useOccupationSearch } from '@/hooks/useResearchData'
import { useState } from 'react'

export function OccupationSearchBox() {
  const { results, isLoading, error, search, clearResults } = useOccupationSearch()
  const [query, setQuery] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      clearResults()
      return
    }
    await search(q)
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={query} onChange={e => setQuery(e.target.value)} aria-label="Search occupations" />
        <button type="submit" disabled={isLoading}>Search</button>
        <button type="button" onClick={clearResults}>Clear</button>
      </form>
      {error && <div role="alert">{error}</div>}
      <ul aria-busy={isLoading || undefined}>
        {results.map((m, i) => (
          <li key={i}>{/* render fields from OccupationMatch */}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 12.3 useVisualization

```tsx
'use client'
import { useVisualization } from '@/hooks/useResearchData'

export function ChartContainer({ chartType }: { chartType: string }) {
  const { chartConfig, isLoading, error, refetch } = useVisualization(chartType)
  if (!chartType) return null
  if (isLoading) return <div aria-busy>Loading chart…</div>
  if (error) return <div role="alert">{error} <button onClick={refetch}>Retry</button></div>
  if (!chartConfig) return null
  return <pre>{JSON.stringify(chartConfig, null, 2)}</pre>
}
```

### 12.4 useTopRiskOccupations

```tsx
'use client'
import { useTopRiskOccupations } from '@/hooks/useResearchData'
import { useState } from 'react'

export function TopRisks() {
  const [limit, setLimit] = useState(10)
  const { occupations, isLoading, error, refetch } = useTopRiskOccupations(limit)

  function onChangeLimit(n: number) {
    if (Number.isInteger(n) && n >= 1 && n <= 100) setLimit(n)
  }

  return (
    <section>
      <label>Limit: <input type="number" min={1} max={100} value={limit} onChange={e => onChangeLimit(Number(e.target.value))} /></label>
      {error && <div role="alert">{error}</div>}
      <button onClick={refetch} disabled={isLoading}>Refresh</button>
      <ul aria-busy={isLoading || undefined}>
        {occupations.map((o, i) => (<li key={i}>{/* render occupation item */}</li>))}
      </ul>
    </section>
  )
}
```

### 12.5 useIndustryData

```tsx
'use client'
import { useIndustryData } from '@/hooks/useResearchData'

export function IndustryList() {
  const { industries, isLoading, error, refetch } = useIndustryData()
  if (isLoading) return <div aria-busy>Loading industries…</div>
  if (error) return <div role="alert">{error} <button onClick={refetch}>Retry</button></div>
  return (
    <ul>
      {industries.map((ind, i) => (<li key={i}>{/* render industry */}</li>))}
    </ul>
  )
}
```

### 12.6 useTaskAutomationData

```tsx
'use client'
import { useTaskAutomationData } from '@/hooks/useResearchData'

export function TaskAutomationPanel() {
  const { tasks, isLoading, error, refetch } = useTaskAutomationData()
  if (isLoading) return <div aria-busy>Loading tasks…</div>
  if (error) return <div role="alert">{error} <button onClick={refetch}>Retry</button></div>
  return <pre>{JSON.stringify(tasks, null, 2)}</pre>
}
```

### 12.7 useServiceHealth

```tsx
'use client'
import { useServiceHealth } from '@/hooks/useResearchData'

export function ServiceDiagnostics() {
  const health = useServiceHealth()
  if (!health) return null
  return (
    <aside>
      <div>Status: {health.status}</div>
      <div>Initialized: {String(health.initialized)}</div>
      {health.error && <div role="alert">{health.error}</div>}
      <div>Timestamp: {health.timestamp}</div>
    </aside>
  )
}
```
