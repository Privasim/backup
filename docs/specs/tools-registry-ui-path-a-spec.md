# Tools Registry UI Integration – Path A (Client Fetch + Dev Validation)

This document specifies the end-to-end architecture, UX, data contracts, and testing strategy to integrate the Tools Registry into `src/app/businessidea/tabs/ToolsContent.tsx` using only real, validated data from `public/data/tools.snapshot.v1.json`. UI is strictly contained within `src/app/businessidea/tabs/ToolsContent.tsx`.


1) Problem Analysis

- Requirements
  - Use the real snapshot at `public/data/tools.snapshot.v1.json` as the single source of truth; no mock data or fabricated fields.
  - Render all UI exclusively inside `src/app/businessidea/tabs/ToolsContent.tsx`.
  - Show only live categories derived from `snapshot.categories[slug].status === 'live'`.
  - Client runtime fetch of the snapshot; validate in development using `registrySchema` from `src/data/tools-registry/_meta/schemas/registry.schema.ts`.
  - Provide category browsing, multi-capability filtering (intersection), search (name/vendor/description), and sort (default: name A→Z; also: recent by lastVerifiedAt DESC; price asc/desc by pricing.minUSD with fallbacks).
  - Integrate with `useTab()` for tab awareness; optionally reset filters when leaving the `tools` tab.
  - Integrate actions with `useChatbox()` (open discussion seeded by tool context) and `useImplementationPlan()` (add tool to plan when an API to add resources exists).
  - Modern, App Store-like mobile-first UI: card list, pill filters, sticky category rail, responsive and accessible.

- Assumptions and dependencies
  - `zod` is available; `registrySchema` and `RegistrySnapshot` types exist and can be imported on the client.
  - Snapshot contains `indexes.byCategory`, `indexes.byCapability`, and `integrity` counts; IDs are unique and kebab-case; websites use HTTPS.
  - No new dependencies will be introduced (no SWR, no virtualization libs at this phase).

- Ambiguities to confirm
  - Keep default sort as name A→Z; enable recent, price asc, price desc as secondary sorts.
  - Draft categories visibility: default is live-only; optionally consider a developer toggle later (not in this scope).

- Solution paths considered
  - Path A (chosen): Client runtime fetch + dev-time Zod validation
    - Pros: latest snapshot without rebuild; honors no mock data; uses browser caching.
    - Cons: client validation CPU in dev; must handle fetch/validation errors in UI.
  - Path B: Static import + build-time validation
    - Pros: zero runtime fetch; less runtime work.
    - Cons: requires rebuild to refresh snapshot; larger JS bundle; less flexible.


2) Rationale

- Client fetch preserves decoupling from builds and aligns with real-data-only requirement.
- Dev-only validation catches schema regressions early with minimal production overhead.
- Keeping all UI in `ToolsContent.tsx` enforces encapsulation and lowers coupling to other app areas.
- Using snapshot-provided indexes enables efficient filtering and scaling to larger datasets.
- Reusing `useTab()`, `useChatbox()`, and `useImplementationPlan()` follows established app patterns and state boundaries.


3) Implementation Plan

- Scope boundary (non-negotiable rule)
  - All visual UI resides inside `src/app/businessidea/tabs/ToolsContent.tsx`.
  - Helper modules (types/utils) may live outside for organization but must have no UI concerns.

- Files to create (helpers only; no UI)
  - `src/features/tools-registry/types.ts`
    - Expose: RegistrySnapshot (re-export), ToolSummary, ToolsState, ToolsActions, ToolsDerived.
    - ToolSummary fields: id, name, vendor, category, website, description, pricing { model, minUSD?, maxUSD? }, capabilities[], compliance { gdpr?, soc2?, hipaa? }, lastVerifiedAt?.
    - ToolsState: snapshot?, isLoading, error?, selectedCategory?, query, sort ('name' | 'price-asc' | 'price-desc' | 'recent'), selectedCapabilities[].
    - ToolsActions: setCategory(slug?), setQuery(q), setSort(s), toggleCapability(c), clearFilters(), openInChat(toolId), addToPlan(toolId).
    - ToolsDerived: toolsByCategory Record<string, string[]>, toolsByCapability Record<string, string[]>, visibleTools ToolSummary[], liveCategories Array<{ slug, name, count }>.
  - `src/features/tools-registry/utils.ts`
    - normalizeTool(t) → ToolSummary (map metadata.lastVerifiedAt; ensure defensive defaults; never synthesize missing values).
    - buildLiveCategories(snapshot) → Array<{ slug, name, count }> computed from categories filtered by status='live' with counts from indexes (deduplicated).
    - getCategoryToolIds(snapshot, category?) → string[] (unique; if category undefined, all tool IDs).
    - getCapabilityToolIds(snapshot, capabilities[]) → string[] intersection across capabilities (unique).
    - filterAndSortTools({ snapshot, state }) → ToolSummary[] applying:
      - Category filter using indexes.byCategory.
      - Capability intersection using indexes.byCapability.
      - Search (case-insensitive) across name/vendor/description.
      - Sort by state.sort with deterministic tiebreakers (name ascending).

- File to modify (UI only)
  - `src/app/businessidea/tabs/ToolsContent.tsx`
    - Data loading
      - On mount: fetch `/data/tools.snapshot.v1.json` with cache policy default; handle network errors.
      - Development-only validation: `registrySchema.parseAsync(snapshot)`; on validation error, display developer-focused details and block rendering of the list.
      - Maintain local state `ToolsState`; compute derived data via helper functions; memoize derived results.
      - Respect `useTab()`; if `activeTab !== 'tools'`, avoid recomputation or heavy effects; optionally reset state on tab exit.
    - UI composition (all inside this file)
      - Category rail (sticky on desktop; collapsible header on mobile) listing live categories with counts.
      - Header with Search (rounded input, icon) and Sort (segmented control: Name, Recent, $↑, $↓).
      - Capability pills row (scrollable horizontally on mobile). Multi-select with clear-all.
      - Tool list as cards (vertical list on mobile; responsive grid on larger screens).
        - Card content: tool name, vendor, category pill, capability chips (truncate +X overflow), price range, compliance chips (GDPR/SOC2/HIPAA), last verified date.
        - Card actions: Discuss (opens chat seeded with tool context via `useChatbox()`), Add to Plan (calls `useImplementationPlan()` add-resource when available; otherwise show non-blocking note and direct to List tab).
      - States: loading skeleton (card shimmer), empty state (reset filters CTA), error state (retry button; show technical details in dev only).
    - Accessibility & theming
      - Semantic roles, ARIA labels, focus outlines; minimum 44px tap targets.
      - Dark mode support; consistent spacing, contrast, and hierarchy.
      - Keyboard navigation for search, pills, cards, and actions.
    - Performance & resilience
      - Memoize derived datasets; debounce search input; avoid heavy work off-tab.
      - Use indexes for O(1) lookups; dedupe tool IDs robustly.
      - Optional manual refresh (cache-busting query) if needed by users.

- Integration points
  - `useTab()` from `src/app/businessidea/tabs/TabContext.tsx` with `TabId` 'tools'.
  - `useChatbox()` to open a conversation seeded with exact tool fields; if API key missing, show inline notice and CTA to configure in Chatbox Controls.
  - `useImplementationPlan()` for add-to-plan when an add-resource function becomes available; otherwise show a guided note (no mock actions).

- Execution flow
  - Tools tab becomes active → fetch snapshot → dev-validate → compute live categories and initial visible tools.
  - User changes category/capabilities/query/sort → recompute visible tools via helpers → render cards.
  - User clicks Discuss/Add-to-Plan → trigger respective integrations; never fabricate tool content.


4) Architecture Diagram (Mermaid)

flowchart TD
  TabNavigation -- selects --> TabContext[(useTab)]
  TabContext -- activeTab=tools --> ToolsContent

  subgraph ToolsContent.tsx [ToolsContent.tsx (UI only)]
    direction TB
    FetchSnapshot[[fetch /data/tools.snapshot.v1.json]]
    DevValidate[Dev-only registrySchema validation]
    LocalState[(ToolsState)]
    Derived[Derived: liveCategories, visibleTools]

    CategoryRail[Category List (live only)]
    Header[Search + Sort]
    CapPills[Capability Pills]
    ToolList[Tool Cards List]
    ToolCard[Card: name/vendor/price/chips]
  end

  FetchSnapshot --> DevValidate --> LocalState --> Derived
  Derived --> CategoryRail
  Derived --> ToolList
  LocalState --> Header
  LocalState --> CapPills

  ToolCard -- Discuss --> useChatbox
  ToolCard -- Add to Plan --> useImplementationPlan

  PublicData[(public/data/tools.snapshot.v1.json)] --> FetchSnapshot


5) Testing Plan

- Principles
  - Use only the real snapshot content from `public/data/tools.snapshot.v1.json` in tests; no mock data.
  - Prefer deterministic assertions on ordering and filtering.

- Unit tests
  - `utils.filterAndSortTools` for category filter, capability intersection, query matching, and each sort variant with tiebreakers.
  - `utils.buildLiveCategories` ensures live-only and accurate counts from indexes; de-duplicates.
  - `utils.normalizeTool` maps metadata.lastVerifiedAt and pricing shape consistently.

- Integration tests (component-level for `ToolsContent.tsx`)
  - Loads snapshot, renders live categories with correct counts.
  - Category selection narrows list; capability multi-select applies intersection; search matches name/vendor/description; sorts behave deterministically.
  - Loading skeleton then resolved content; empty state on no results; error UI on fetch failure; dev-only validation failure messaging.
  - Accessibility pass with keyboard navigation and basic axe checks.

- Acceptance criteria
  - All UI resides within `src/app/businessidea/tabs/ToolsContent.tsx`.
  - Only live categories displayed; counts match snapshot indexes.
  - No mock data used anywhere; all data originates from the snapshot.
  - Discuss and Add-to-Plan actions present on each card; behavior consistent with app contexts.


6) Security & Compliance

- External links use target=_blank with rel=noopener noreferrer.
- Escape and sanitize search input; never render untrusted HTML from snapshot fields.
- Do not log secrets; surface missing Chatbox API key via user-facing notice.
- Dev-only validation ensures schema adherence; production handles JSON errors gracefully.


7) Final Checklist

- Confirm default sort set and live-only visibility rule.
- Implement fetch with dev-time Zod validation and robust loading/error/empty states.
- Implement the full UI (category rail, search, sort, capability pills, tool cards) entirely inside `src/app/businessidea/tabs/ToolsContent.tsx`.
- Wire actions to `useChatbox()` and `useImplementationPlan()` (feature-flag Add-to-Plan until API exists).
- Verify responsiveness and dark mode; run tests; conduct manual a11y review.


8) Suggested Enhancements (Optional)

- Persist filters/search to URL query scoped to the tools tab (opt-in).
- Category and capability badges with counts; clear-all controls.
- Comparison tray for selected tools (contained within the tab).
- Virtualized list if dataset grows substantially (defer dependency until necessary).
- Vendor logos where available; fallback avatars with initials.
