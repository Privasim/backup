# Tools Registry Frontend Integration — Path A (Runtime Fetch + Dev-time Validation)

Last updated: 2025-08-23 11:59 (+08:00)
Scope: `src/app/businessidea/tabs/ToolsContent.tsx` and related UI/integration
Single Source of Truth: `public/data/tools.snapshot.v1.json` (no mock data)


1) Problem Analysis

• Requirements
  - Display the validated Tools Registry in `src/app/businessidea/tabs/ToolsContent.tsx`.
  - Use the public snapshot at `/data/tools.snapshot.v1.json` as the only data source.
  - Show only live categories derived from `snapshot.categories[slug].status === 'live'`.
  - Provide category browsing, search, multi-capability filter, and sorting.
  - Modern, App Store–style mobile-first UI: card grid/list, large visuals, clear hierarchy, tap targets, smooth transitions, dark mode.
  - Integrate with tab state via `useTab()`; tab id: `tools`.
  - Link actions to `useChatbox()` (discuss tool) and `useImplementationPlan()` (add tool to plan) without mock data.
  - Validate snapshot against `registrySchema` from `src/data/tools-registry/_meta/schemas/registry.schema.ts` (dev only).

• Constraints
  - No mock data. No new dependencies unless strictly required.
  - Client-side fetch; handle offline/error states gracefully.
  - Maintain performance (memoization, index usage, avoid unnecessary re-renders).

• Assumptions and dependencies
  - Zod is available (`zod` in `package.json`).
  - Snapshot contains: versioning, categories, tools[], indexes.byCategory, indexes.byCapability, integrity.
  - `useImplementationPlan` will expose a method to record an added tool (resource); if not available, action must no-op with explicit user feedback (no placeholder data persisted).

• Ambiguities (clarification requested)
  - Default sort beyond name (A→Z): include price and recency? Proposed: name (default), price-asc, price-desc, recent.
  - Virtualization required now? Proposed: not initially; dataset currently manageable; revisit if tools > 200.
  - Display draft categories: proposed to hide by default and optionally show a separate “Draft” section toggle later.

• Solution paths considered
  - Path A (chosen): Client runtime fetch + dev validation. Pros: freshest data, honors no-mock, browser caching. Cons: runtime error handling and minor CPU for validation.
  - Path B: Static import at build time. Not chosen due to coupling with builds and bundle bloat.


2) Rationale

• Data integrity: Dev-time validation with `registrySchema` detects regressions early without impacting production performance.
• Freshness: Runtime fetch decouples UI from build cycles; snapshot can be updated independently.
• Performance: Use `snapshot.indexes.byCategory` and `indexes.byCapability` for O(1) id lookups; memoize derived lists.
• Modularity: A dedicated `ToolsProvider` context encapsulates fetch/validate/cache and exposes a small, typed surface API.
• UX: Mobile-first App Store–like UI improves discoverability and scanning; card layout aligns with short tool summaries and primary actions.


3) Implementation Plan

• Files to create
  - `src/features/tools-registry/types.ts`
    • Expose RegistrySnapshot import from `registry.schema.ts`.
    • Define ToolSummary, ToolsState, ToolsActions, ToolsContextValue.
  - `src/features/tools-registry/utils.ts`
    • normalizeTool, buildLiveCategories, filterAndSortTools, getCategoryToolIds, getCapabilityToolIds.
  - `src/features/tools-registry/ToolsProvider.tsx`
    • React provider: fetch, dev-validate, cache, derive, actions.
  - `src/features/tools-registry/useToolsRegistry.ts`
    • Thin hook; re-exports `useTools()`.
  - `src/app/businessidea/tabs/tools/CategorySidebar.tsx`
  - `src/app/businessidea/tabs/tools/FiltersPanel.tsx`
  - `src/app/businessidea/tabs/tools/SearchBar.tsx`
  - `src/app/businessidea/tabs/tools/SortMenu.tsx`
  - `src/app/businessidea/tabs/tools/ToolCard.tsx`
  - `src/app/businessidea/tabs/tools/ToolList.tsx`

• Files to modify
  - `src/app/businessidea/tabs/ToolsContent.tsx` — REPLACE static section with provider + composed UI.
  - `src/app/businessidea/TabNavigation.tsx` — Verify `tools` tab present; optional badge later.

• Data contracts (TypeScript intentions; no code here)
  - ToolSummary: { id, name, vendor, category, website, description, pricing: { model, minUSD?, maxUSD? }?, capabilities: string[], compliance: { gdpr?, soc2?, hipaa? }?, lastVerifiedAt? }
  - ToolsState: { snapshot?, isLoading, error?, selectedCategory?, query, sort: one of [name, price-asc, price-desc, recent], selectedCapabilities: string[] }
  - ToolsActions: { setCategory(slug?), setQuery(q), setSort(s), toggleCapability(c), clearFilters(), openInChat(toolId), addToPlan(toolId) }
  - ToolsContextValue: ToolsState + ToolsActions + { toolsByCategory: Record<string, string[]>, toolsByCapability: Record<string, string[]>, visibleTools: ToolSummary[], liveCategories: Array<{ slug, name, count }> }

• Provider behavior (ToolsProvider)
  - On mount: fetch `/data/tools.snapshot.v1.json` with `cache: force-cache` (default).
  - In development: validate via `registrySchema.parseAsync`; on failure, set error state and prevent UI rendering of corrupted data.
  - Derivations (memoized):
    • liveCategories from `snapshot.categories` filtered by status=live and count via `indexes.byCategory[slug].length` intersected with actual tool ids.
    • toolsByCategory and toolsByCapability from `snapshot.indexes`.
    • visibleTools from `filterAndSortTools` using selected filters and search.
  - Actions:
    • openInChat(toolId): uses `useChatbox()` to open a new chat seeded with the selected tool’s data (no mock content; derive strictly from snapshot fields).
    • addToPlan(toolId): if `useImplementationPlan` exposes a method to add a resource/tool, call it with normalized tool fields; otherwise, render an inline non-blocking notice that the feature is unavailable.

• Filtering, search, sorting
  - Category: single-select. “All” shows union of live categories.
  - Capabilities: multi-select; intersection semantics (tool must include all selected capabilities).
  - Search query: case-insensitive match on name, vendor, description; trim and collapse whitespace.
  - Sorting modes:
    • name: ascending by `name` (default).
    • price-asc: by `pricing.minUSD` then `pricing.maxUSD` with undefined last.
    • price-desc: reverse of above.
    • recent: descending by `metadata.lastVerifiedAt` when present; fallback to name.

• UI composition (ToolsContent)
  - Layout: two-column on desktop, single-column on mobile.
    • Left: `CategorySidebar` (sticky on larger screens; horizontal scroll chips on mobile).
    • Top: `SearchBar` + `SortMenu` (mobile: toolbar; desktop: row).
    • Main: `FiltersPanel` (capability chips) above `ToolList`.
  - App Store–style cards (`ToolCard`):
    • Prominent name/vendor, concise description, capability chips (overflow collapsed), price pill, compliance icons, lastVerified date.
    • Primary actions: Discuss, Add to Plan. Secondary: Open Website (external), Copy Link.
  - States:
    • Loading skeletons (cards and chips).
    • Error banner with retry.
    • Empty-state with clear reset filters option.

• Accessibility and theming
  - Keyboard navigable: focus rings, roving tab index for chips, ESC to clear search.
  - ARIA roles for lists and controls; labels on inputs.
  - Dark mode via existing theme; ensure adequate contrast; prefers-reduced-motion respects.

• Performance considerations
  - Memoize computed arrays; stable callbacks.
  - Avoid rendering more than needed; paginate or virtualize later if list grows.
  - Use `indexes` to avoid full scans where possible.

• Error handling
  - Fetch errors: show actionable message and Retry control.
  - Validation errors (dev only): show diagnostic message including top-level schema path; do not render corrupted data.

• Integration points
  - `useTab()` from `src/app/businessidea/tabs/TabContext.tsx`: reset filters on tab change away from `tools` (optional), or preserve per UX decision.
  - `useChatbox()` from `src/components/chatbox/ChatboxProvider`: open conversation seeded with selected tool’s structured details.
  - `useImplementationPlan()` from `src/features/implementation-plan/useImplementationPlan.ts`: attempt to add tool as resource; if API missing, surface non-blocking notice.


4) Architecture Diagram (Mermaid-ready outline)

Nodes:
- TabNavigation -> TabContext(useTab) -> ToolsContent(tab=tools)
- ToolsContent -> ToolsProvider -> fetch(/data/tools.snapshot.v1.json)
- ToolsProvider -> registrySchema (validate in dev)
- ToolsProvider -> utils(normalizeTool, buildLiveCategories, filterAndSortTools)
- ToolsContent -> CategorySidebar, SearchBar, SortMenu, FiltersPanel, ToolList -> ToolCard
- ToolCard -> useChatbox (Discuss)
- ToolCard -> useImplementationPlan (Add to Plan)
- ListTab <-> useImplementationPlan (shared plan state)

Edges:
- State flows from ToolsProvider to UI components via context.
- Actions flow up from UI components to ToolsProvider actions and external hooks.


5) Testing Plan

• Unit tests
  - ToolsProvider: successful fetch exposes snapshot; dev validation failure shows error; loading and retry paths.
  - utils: deterministic filtering, search normalization, sorting comparators, category/capability id resolution.
  - Components: CategorySidebar selection, FiltersPanel toggle semantics (intersection), SearchBar input, SortMenu selection, ToolCard actions fire callbacks with correct ids.

• Integration tests
  - End-to-end user flows: select live category, toggle multiple capabilities, search, sort recent, execute actions (Discuss opens chat; Add to Plan triggers plan API when available).

• Acceptance criteria
  - No mock data: tests load the real file content from `public/data/tools.snapshot.v1.json` through the fetch layer or fs in test environment.
  - All states covered: loading, error, empty, populated.
  - A11y checks pass for focus order, labels, and contrast.


6) Security & Compliance

• External links use target=_blank with rel=noopener noreferrer.
• User input (search) sanitized; no HTML injection from snapshot.
• Do not log secrets; interactions with `useChatbox` rely on previously configured API keys.
• Graceful degradation: if snapshot unavailable, show error with retry; if plan API absent, show non-disruptive notice.


7) Final Checklist

1. Confirm default sort (name) and whether to persist filters across tab switches.
2. Implement `ToolsProvider`, hook, utils, and UI components.
3. Replace `ToolsContent.tsx` body with provider-composed UI.
4. Wire Discuss and Add to Plan actions; confirm plan API availability.
5. Add tests and run `npm test`.
6. Manual QA on desktop and mobile; verify dark mode and a11y.


8) Suggested Enhancements (Optional)

• Show live category counts as badges in `CategorySidebar`.
• Persist filters in URL query for shareable state.
• Add comparison view to select multiple tools and compare features.
• Introduce virtualization if list grows beyond performance thresholds.
