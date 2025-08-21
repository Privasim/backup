# Profile Settings Tabs — Implementation Spec

## 1) Problem Analysis
- **Objective**
  - Isolate three tabs — `userprofile`, `jobrisk`, `businessplan` — into a dedicated Profile Settings Tabs system.
  - Keep the global tab system intact for remaining tabs, with per-conversation scoping.
- **Decisions (Final)**
  - **Hide in Global UI, Keep Routable**: Remove the three tabs from global navigation UI but keep them in the global `tabComponents` mapping for backward-compatible routing.
  - **Dedicated Route**: New route `/businessidea/profile-settings` renders the three local tabs.
  - **Hybrid Persistence**: Local-first persistence with optional Supabase sync when configured; fallback gracefully to local.
- **Constraints**
  - Do not break existing global tabs or their routing.
  - Reuse existing providers correctly:
    - `BusinessPlanContent` must be wrapped by `ImplementationPlanProvider`.
    - `JobRiskAnalysisTab` wraps its own providers; avoid double wrapping.
  - Avoid new dependencies unless strictly necessary.
- **Assumptions**
  - `ChatboxProvider` manages conversations and exposes `activeConversationId`.
  - Next.js App Router under `src/app/businessidea/`.
  - Client-side storage is available; SSR guards are needed.

## 2) Rationale
- **Separation of Concerns**: Localize profile-related workflows away from global nav to prevent cross-context interference.
- **Backward Compatibility**: Keep tabs routable to preserve existing deep links and programmatic navigation.
- **State Isolation**: Per-conversation instance of global `TabProvider` avoids tab-state leakage between chats.
- **Future-Ready Persistence**: Adapter pattern enables Supabase without changing call sites.

## 3) Implementation Plan

### 3.1 Files to Create
- **`src/app/businessidea/tabs/ConversationTabs.tsx`**
  - Role: Conversation-scoped wrapper for the global tabs.
  - Props: `{ conversationId?: string }`.
  - Behavior:
    - If `conversationId` is present: mount `TabContainer` keyed by ID; hydrate initial active tab from persistence; persist on change.
    - If absent: render a friendly empty state (no conversation selected).

- **`src/app/businessidea/profile-settings/ProfileSettingsTabs.tsx`**
  - Role: Local three-tab system (`userprofile`, `jobrisk`, `businessplan`).
  - Behavior:
    - Own `TabProvider` scoped to these three tabs only.
    - Local navigation UI renders only these three tabs.
    - Content mapping:
      - `UserProfileTab` (no extra provider).
      - `JobRiskAnalysisTab` (self-wrapped with its providers internally).
      - `BusinessPlanContent` wrapped by `ImplementationPlanProvider` locally.
    - Default/guard: if active tab is outside local set, force to `userprofile`.
    - Persist active local tab via adapter.

- **`src/app/businessidea/profile-settings/page.tsx`**
  - Role: Route entry point for Profile Settings.
  - Behavior:
    - Client-only component; hydrate initial tab from `?tab=userprofile|jobrisk|businessplan` or persistence.
    - Persist on changes via adapter; guard storage access for SSR.

- **`src/app/businessidea/tabs/utils/tab-state.ts`**
  - Role: Persistence adapter (local-first, optional Supabase).
  - API (conceptual):
    - `getConversationTabState(conversationId)` → `{ globalActiveTab?: string, profileActiveTab?: 'userprofile'|'jobrisk'|'businessplan' }`.
    - `setConversationTabState(conversationId, patch)` → `void`.
    - `getProfileSettingsTab()` → `'userprofile'|'jobrisk'|'businessplan'|undefined`.
    - `setProfileSettingsTab(tab)` → `void`.
  - Behavior:
    - Try localStorage; catch and ignore errors (return undefined).
    - If Supabase env is configured, sync reads/writes with Supabase; on error, fall back to local.

### 3.2 Files to Modify
- **`src/app/businessidea/page.tsx`**
  - Replace direct `<TabContainer />` with `<ConversationTabs conversationId={activeConversationId} />`.
  - Obtain `activeConversationId` from `ChatboxProvider`.

- **`src/app/businessidea/profile-settings/ProfileSidebar.tsx`**
  - Add a clear CTA (button/link) to open `/businessidea/profile-settings`.
  - Avoid rendering large tab content in the narrow sidebar.

- **`src/app/businessidea/tabs/TabNavigation.tsx`**
  - Remove buttons for `userprofile`, `jobrisk`, `businessplan` from the UI.
  - Keep accessibility/keyboard behavior for remaining tabs.

- **`src/app/businessidea/tabs/TabContainer.tsx`**
  - Keep `tabComponents` mapping unchanged to retain routability of all tabs, including the three hidden ones.
  - No provider changes here; `BusinessPlanContent` remains present for routability.

### 3.3 Data Contracts (Conceptual)
- **ConversationTabState**: `{ globalActiveTab?: string; profileActiveTab?: 'userprofile'|'jobrisk'|'businessplan' }`.
- **Query Param**: `tab=userprofile|jobrisk|businessplan` for `/businessidea/profile-settings`.

### 3.4 Execution Flow
- ConversationsCard calls `openConversation(id)` → `ChatboxProvider.activeConversationId` updates.
- `page.tsx` renders `<ConversationTabs conversationId={id} />`.
- `ConversationTabs` hydrates the last global tab for that conversation; persists on changes.
- `ProfileSidebar` CTA navigates to `/businessidea/profile-settings`.
- `ProfileSettingsTabs` renders local three tabs; hydrates from query or persistence; persists on changes.
- `ReviewStep` within `UserProfileTab` uses the nearest local `TabProvider` to switch to `'jobrisk'`.

### 3.5 Error Handling & Fallbacks
- Storage unavailable or SSR:
  - Adapter returns `undefined`; use safe defaults (`userprofile` for local; an existing default for global).
- Missing/invalid tab values:
  - Coerce to allowed sets; ignore invalid values.
- Supabase errors:
  - Fall back to local; surface non-sensitive logs in dev only.

### 3.6 Accessibility & UX
- Both navs use proper ARIA roles (tablist, tab) and keyboard support.
- Maintain visual focus states and dark-mode compatibility.

### 3.7 Performance
- Key `ConversationTabs` by `conversationId` to isolate state.
- Optional: lazy-load heavy content within Profile Settings to improve route TTI.

## 4) Architecture Diagram (Mermaid)
```mermaid
flowchart TD
  PS[ProfileSidebar] --> CTA[CTA: /businessidea/profile-settings]
  route[/businessidea/profile-settings] --> PST[ProfileSettingsTabs (local TabProvider)]
  PST --> UPT[UserProfileTab]
  PST --> JRT[JobRiskAnalysisTab]
  PST --> BPC[BusinessPlanContent]
  BPC --> IP[ImplementationPlanProvider]

  CC[ConversationsCard] -->|openConversation(id)| CBP[ChatboxProvider.activeConversationId]
  Page[page.tsx] -->|reads activeConversationId| CT[ConversationTabs]
  CT --> TC[TabContainer]
  TC --> TP[TabProvider (global per conversation)]
  TP --> TN[TabNavigation (hidden: userprofile, jobrisk, businessplan)]

  subgraph Persistence
    LS[localStorage]
    SB[Supabase (optional)]
    CT <--> LS
    CT <--> SB
    PST <--> LS
    PST <--> SB
  end
```

## 5) Testing Plan
- **Unit**
  - ConversationTabs: hydrate/persist per `conversationId`; empty state when no ID.
  - TabNavigation: buttons for the three tabs are hidden; remaining tabs work.
  - ProfileSettingsTabs: only three tabs render/switch; `BusinessPlanContent` is under `ImplementationPlanProvider`; persistence of active tab.
- **Integration**
  - Switching between two conversations preserves each one’s global active tab.
  - Deep-link `/businessidea/profile-settings?tab=jobrisk` opens Job Risk.
  - `ReviewStep` switching to `'jobrisk'` affects local tabs only.
  - With Supabase configured, adapter reads/writes to Supabase; without it, falls back to local.
- **Edge Cases**
  - Storage blocked/unavailable; SSR access; invalid query params; uninitialized conversations.

## 6) Security & Compliance
- No secrets in client code. Optional Supabase gated by `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Future Supabase table (conceptual): `conversation_tabs(user_id uuid, conversation_id text, global_active_tab text, profile_active_tab text, updated_at timestamptz)` with RLS `user_id = auth.uid()`.
- Data isolation: keys include `conversationId` and user context.

## 7) Final Checklist
- Hide `userprofile`, `jobrisk`, `businessplan` in global `TabNavigation` UI.
- Keep the three tabs in `TabContainer` mapping for routability.
- Create `ConversationTabs` and wire it in `page.tsx` using `activeConversationId`.
- Add route `/businessidea/profile-settings` rendering `ProfileSettingsTabs`.
- Implement persistence adapter (`tab-state.ts`) with local-first and optional Supabase sync; add SSR/storage guards.
- Verify provider boundaries: local `ImplementationPlanProvider` for `BusinessPlanContent`; no double-wrap of `JobRiskAnalysisTab`.
- Add unit and integration tests per plan; verify accessibility and dark mode.
