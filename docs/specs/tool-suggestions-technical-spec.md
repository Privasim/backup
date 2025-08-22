# Tool Suggestions Feature — Technical Specification

> IMPORTANT: ABSOLUTELY DO NOT USE ANY MOCK DATA.
>
> This feature must operate without external APIs/auth for derivation and must only display verified vendor data from an in-repo curated database. Chat-driven enrichment is optional and never auto-persisted without manual verification.

## 1) Problem Analysis

- **Requirements**
  - Context-aware tool suggestions in `src/app/businessidea/tabs/ToolsContent.tsx` using:
    - `useImplementationPlan()` / `useImplementationPlanContext()` from `src/features/implementation-plan/ImplementationPlanProvider.tsx`.
    - Optionally `ImplementationPlanChat` events from `src/features/implementation-plan/chat/ImplementationPlanChat.tsx` (e.g., after plan generated via `onPlanGenerated`).
  - Integrate with `src/components/chatbox/ChatboxControls.tsx` through `useChatbox()` actions: `openChatbox`, `createConversation`, `addMessageToConversation`, `openConversation`.
  - Display:
    - "Top 5 tools based on your plan" in a table (Name, Link, Pricing model, Starting price if verified, Benefits, Actions).
    - Category directory with ≥3 tools in each category.
    - Category "No-code coding apps" must include: `lovable.dev`, `base44`, `bolt.new` (official vendor URLs only).
  - Tab awareness via `useTab()` (`src/app/businessidea/tabs/TabContext.tsx`) to boost/filter relevance based on active tab.
  - Supabase integration-ready adapters (no runtime dependency) to persist selected tools and conversation metadata.
  - `ConversationsCard.tsx` integration via shared `useChatbox().conversations` — newly created conversations must show there.
  - No external APIs/auth for suggestions derivation; offline-first.

- **Constraints**
  - No mock data anywhere in runtime or code examples. Only verified catalog entries with official links.
  - Do not hardcode secrets. No automatic network calls for suggestions.
  - Strict TypeScript types. Functional/Declarative patterns.
  - UI must be accessible, responsive, and clean. Table format for top-5 tools.

- **Assumptions**
  - `useChatbox()` context provides `conversations` and methods required (verified in `src/components/chatbox/ChatboxProvider.tsx`).
  - `ConversationsCard.tsx` works as intended; parent view must pass conversations and handlers.
  - Plan has an identifiable `ideaId` (or equivalent) for caching keys (if not present, derive a signature/hash from plan title + goals).

- **Ambiguities (needs confirm)**
  - Whether `TabNavigation.tsx` should be rendered once at the top of `ToolsContent` or inside each tool card (the latter is unusual).
  - Initial category taxonomy beyond "No-code coding apps" (e.g., analytics, go-to-market, financials, product/design, legal, research, ops).
  - Show exact starting prices only when verified from official pricing pages; otherwise display `free`, `free-tier`, or `paid` label with no amounts.

- **Solution Paths**
  - A) In-repo curated database only (Recommended baseline): deterministic, offline, testable, compliant with no-mock rule. Requires ongoing curation.
  - B) Hybrid enrichment via Chatbox (user-triggered): does not affect displayed data unless manually curated/verified and added to the repo.

## 2) Rationale

- Curated in-repo database guarantees no external dependencies, deterministic behavior, and compliance with the no-mock rule.
- Rule-based mapping from `ImplementationPlan` ensures explainable, stable top-5 results.
- Leveraging `useChatbox` aligns with existing architecture and ensures new conversations appear in `ConversationsCard.tsx`.
- Supabase-ready adapters preserve offline-first design and enable optional persistence when configured.

## 3) Implementation Plan

This section details files to create/modify, contracts, flows, and performance considerations. This document is a guide; implementation will follow after approval. No code is provided here.

### 3.1 Files to Create

- `src/features/tools-suggestions/types.ts`
  - Data contracts (no implementation):
    - `ToolSuggestion`
      - `id: string`
      - `name: string`
      - `url: string` (official vendor URL only)
      - `category: string` (e.g., `no-code`, `analytics`, `financials`, `gotomarket`, `product`, `legal`, `research`, `ops`)
      - `tags: string[]`
      - `benefits: string[]` (concise marketing-neutral statements)
      - `pricing: { model: 'free' | 'paid' | 'free-tier'; starting?: { amount: number; currency: 'USD' | 'EUR' | 'GBP'; period?: 'mo' | 'yr' | 'one-time' } }`
      - `verifiedAt: string` (ISO timestamp of last verification)
      - `derivedFrom: { goals?: string[]; phases?: string[]; tasks?: string[]; kpis?: string[] }`
      - `relevanceScore: number` (computed)
      - `provenance: 'catalog' | 'chat-enriched'`
    - `ToolSuggestionFilters`
      - `categories?: string[]`
      - `tags?: string[]`
      - `maxMonthly?: number` (apply only when `starting` exists and is monthly)
      - `freeOnly?: boolean`
    - `ToolSuggestionState`
      - `status: 'idle' | 'deriving' | 'success' | 'error'`
      - `error?: string`
      - `suggestions: ToolSuggestion[]`
      - `filters: ToolSuggestionFilters`

- `src/features/tools-suggestions/catalog/registry.ts`
  - In-repo curated database (exported data structure) of real tools only.
  - Each entry must include official `url`, accurate `pricing.model`, optional `starting` only when verified, and `verifiedAt`.
  - Categories include ≥3 tools each. MUST include in `no-code` category: `lovable.dev`, `base44`, `bolt.new`.
  - Include `sourceOfTruth` notes per entry (e.g., official pricing/docs URLs) as comments or fields to aid verification.
  - Curation policy comment at top (see §3.6).

- `src/features/tools-suggestions/rules.ts`
  - Pure, deterministic mapping utilities (no side effects):
    - `getKeywordsFromPlan(plan) -> string[]`
    - `scoreToolAgainstKeywords(tool, keywords, activeTab?) -> number`
    - `mapPlanToTools(plan, catalog, activeTab?) -> ToolSuggestion[]`
    - `applyFilters(suggestions, filters) -> ToolSuggestion[]`
    - `selectTopFive(suggestions) -> ToolSuggestion[]`
  - Behavior:
    - Extract keywords from `plan.overview.goals`, `phases[].name/objectives`, `tasks[].title/description`, `kpis[]`.
    - Apply tab-aware boosts using `activeTab`.
    - Never fabricate fields; use only catalog-verified data.

- `src/features/tools-suggestions/storage.ts`
  - Local cache helpers (SSR-safe; no external storage):
    - `getCacheKey(ideaId: string, planSignature: string) -> string`
    - `loadSuggestions(cacheKey) -> ToolSuggestion[] | null`
    - `saveSuggestions(cacheKey, suggestions) -> void`

- `src/features/tools-suggestions/useToolSuggestions.ts`
  - Hook (derivation + filters + caching + optional enrichment):
    - Returns an object with:
      - `state: ToolSuggestionState`
      - `setFilters(next: Partial<ToolSuggestionFilters>): void`
      - `refresh(): void`
      - `topFive: ToolSuggestion[]` (highest relevance after filters)
      - `categories: Record<string, ToolSuggestion[]>` (grouped for directory view)
      - `enrichWithAI(): Promise<void>` (opens chat, seeds prompt; outputs must be curated manually before inclusion)
  - Consumes `useImplementationPlan()` / `useImplementationPlanContext()` and `useTab()`.
  - Uses `registry.ts` + `rules.ts` to compute results; caches via `storage.ts`.

- `src/features/tools-suggestions/supabase.ts`
  - Supabase-ready adapter signatures (no-op unless configured via env):
    - `upsertSelectedTool(projectId: string, tool: ToolSuggestion, ctx: { ideaId: string }): Promise<void>`
    - `listSelectedTools(ideaId: string): Promise<ToolSuggestion[]>`
    - `syncConversations(conversations: Conversation[], userId: string): Promise<void>`
  - Follow patterns from existing Supabase usage in financials/visualization tabs.

### 3.2 Files to Modify

- `src/app/businessidea/tabs/ToolsContent.tsx`
  - Integrate `useToolSuggestions()`.
  - Render `TabNavigation` at top (confirm placement preference).
  - Controls: category multi-select, `freeOnly` toggle, search, optional price cap.
  - Top-5 table (columns): Name, Link (official), Pricing (free/paid/free-tier), Starting price (if verified), Benefits, Actions (Discuss, Select, Open link).
  - Category directory: show ≥3 tools each; include `lovable.dev`, `base44`, `bolt.new` in `no-code`.
  - Actions:
    - Discuss: `useChatbox().openChatbox()` → `createConversation('Tools: <plan-title>')` → `addMessageToConversation(...)` with seeded prompt containing tool + plan context.
    - Select: persist locally; if Supabase configured, call `upsertSelectedTool`.

- `src/app/businessidea/profile-settings/ConversationsCard.tsx`
  - No structural changes. Ensure parent passes `useChatbox().conversations`, `onNewChat`, and `onOpenConversation`.

- `src/components/chatbox/ChatboxControls.tsx`
  - No structural changes required. Optional: add a "Tools" analysis type later if desired.

- `src/app/businessidea/tabs/TabNavigation.tsx`
  - No functional changes; confirm consistent presence in `ToolsContent`.

### 3.3 Execution Flow

1. `plan.status === 'success'` → `useToolSuggestions` derives keywords and scores catalog; caches results keyed by `ideaId + planSignature`.
2. Apply active tab boost via `useTab().activeTab`; apply UI filters.
3. Show Top-5 table and category directory.
4. User interactions:
   - Discuss → opens chat, creates/opens conversation, posts seeded message; conversation appears in `ConversationsCard` via shared chatbox state.
   - Select → marks selection; if Supabase configured, upserts selection; otherwise stored locally.
5. Optional `enrichWithAI()` opens chat; enrichment outputs are not auto-shown unless curated and added to registry.

### 3.4 Data Contracts (Summarized)

- `ToolSuggestion` fields (see §3.1). All fields must be derived from verified catalog entries; `derivedFrom` holds plan-context trace; `relevanceScore` is computed only.
- `ToolSuggestionFilters` and `ToolSuggestionState` define UI filter state and hook status.

### 3.5 UI/UX Spec

- **Top-5 Table**
  - Columns: Name (with favicon if available via official domain), Link (external, `rel="noopener noreferrer"`), Pricing (free/paid/free-tier), Starting price (if verified), Benefits (list of up to 3), Actions: Discuss | Select | Open.
  - Empty states: if no plan → CTA to generate in `List` tab; if no matches → show filter reset.
- **Category Directory**
  - Group tools by `category`; show at least 3 per category (if present in registry).
  - `no-code` must include `lovable.dev`, `base44`, `bolt.new`.
- **Accessibility**
  - Keyboard navigable table, focus styles, aria labels on buttons.
- **Performance**
  - `useMemo` on plan signature, activeTab, filters. Local caching. No network for derivation.

### 3.6 Curation Plan (In-Repo Database)

- **Policy**
  - Only add tools with official vendor URLs and clearly documented pricing model.
  - Record `verifiedAt` and `sourceOfTruth` (pricing/docs URL).
  - Do not guess or fabricate starting prices. Only include amounts if explicitly verified.
- **Governance**
  - Use PRs with a checklist: URL valid, SSL valid, pricing page reviewed, category assigned, tags/benefits neutral and concise.
  - Add unit tests that validate every registry entry for required fields and URL format.
- **Update cadence**
  - Monthly review, plus ad-hoc updates on request.
- **Deprecation**
  - Mark deprecated tools with a field `deprecatedAt` and exclude from suggestions while keeping history.

### 3.7 Error Handling & Edge Cases

- Missing plan: show CTA to generate plan in `List` tab.
- Empty derivation: show guidance and allow users to adjust filters or run optional enrichment.
- Invalid URLs: filter out and log validation errors.
- Supabase not configured: silently skip persistence with a non-blocking toast.

### 3.8 Maintainability

- Pure functions in `rules.ts` and small hook surface area.
- Centralized data contracts in `types.ts`.
- Clear boundaries between derivation (registry + rules), state (hook), UI (ToolsContent), and integrations (chatbox, supabase adapter).

## 4) Architecture Diagram (Mermaid)

```mermaid
flowchart TD
  subgraph Plan
    A[useImplementationPlan / useImplementationPlanContext\nplan,status,error]
    A2[ImplementationPlanChat\nonPlanGenerated]
  end
  subgraph Tabs
    B[useTab\nactiveTab,setActiveTab]
  end
  subgraph Chatbox
    C[useChatbox\nopenChatbox, createConversation,\naddMessageToConversation, conversations]
  end
  subgraph Tools
    D[catalog/registry.ts\nCurated, verified tools]
    E[rules.ts\nkeywords, scoring,\nfilters, tab boost]
    F[storage.ts\ncache by ideaId+signature]
    G[supabase.ts\n(upsert, list, sync) optional]
    H[useToolSuggestions\nstate, filters, topFive, enrichWithAI]
  end
  I[ToolsContent.tsx\nTable Top-5 + Categories + Actions]
  J[ConversationsCard.tsx\nProfile settings list]

  A --> H
  A2 --> H
  B --> H
  D --> E --> H
  H --> F
  H --> I
  I -- Discuss --> C
  C -- conversations --> J
  I -- Select Tool --> G
```

## 5) Testing Plan

- **Unit tests** (no mock data; use real catalog entries from `registry.ts`)
  - `rules.ts`: keyword extraction, scoring with tab boosts, filters, `selectTopFive` deterministic ordering.
  - `storage.ts`: SSR safety, read/write behavior.
  - Registry validation: every tool entry has required fields; URL validity.

- **Integration tests**
  - `useToolSuggestions`: with a real plan fixture captured from the app (persisted JSON from actual generation), verify derivation, caching, `topFive` selection, and reordering on activeTab changes.
  - `ToolsContent`: table renders verified fields only; Discuss creates conversation via `useChatbox`; Select calls Supabase adapter when configured.

- **Acceptance criteria**
  - No mock data anywhere.
  - Top 5 visible and stable for a given plan and filters.
  - Each category shows ≥3 tools (registry-backed); `no-code` includes `lovable.dev`, `base44`, `bolt.new`.
  - Conversations created from ToolsContent appear in `ConversationsCard` (via shared chatbox state in parent).

## 6) Security & Compliance

- Only render plain text from our registry; no untrusted HTML.
- Validate/sanitize external links; open with `rel="noopener noreferrer"`.
- No secrets; Supabase adapter gated by env presence.
- Offline-first; no external API calls for derivation.

## 7) Final Checklist

1. Approve taxonomy and `TabNavigation` placement in `ToolsContent`.
2. Implement `types.ts`, `rules.ts`, `storage.ts`, `useToolSuggestions.ts`.
3. Create `catalog/registry.ts` with real, verified entries (include lovable.dev, base44, bolt.new in `no-code`).
4. Integrate `ToolsContent.tsx` UI: Top-5 table + category directory + actions.
5. Wire Chatbox actions; verify conversations appear in `ConversationsCard`.
6. Add Supabase-ready adapter and gates.
7. Add unit/integration tests; add registry validation tests.
8. Accessibility review (keyboard, ARIA), performance pass.

## 8) Suggested Enhancements (Optional)

- "Selected Tools" side panel with CSV/JSON export and monthly cost estimation (only from verified prices).
- Admin curation dashboard (in-app) to propose new tools, generating a PR into `registry.ts`.
- Tool comparison view (feature matrix) with side-by-side verified attributes.
