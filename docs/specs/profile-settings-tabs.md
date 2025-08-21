# Profile Settings Tabs – Technical Specification

Status: Draft (Ready to implement)
Owner: FE Platform
Last Updated: 2025-08-21 10:08 (+08:00)

---

## 1) Problem Analysis

- **Requirements**
  - Extract three tabs from the global navigation (`src/app/businessidea/tabs/TabNavigation.tsx`): `userprofile`, `jobrisk`, `businessplan`.
  - Create a dedicated, modular tab navigation in `src/app/businessidea/profile-settings/` called `ProfileSettingsTabs` for these three tabs.
  - Keep the global tab system unchanged (`TabNavigation.tsx`, `TabContainer.tsx`).
  - Ensure existing components continue to work: `UserProfileTab`, `JobRiskAnalysisTab`, `BusinessPlanContent`.
  - Maintain providers/contexts these tabs depend on (e.g., `ImplementationPlanProvider`, internal research providers in Job Risk).
  - Future-ready for Supabase integration (auth, storage, optional edge functions).

- **Constraints**
  - Do not refactor existing tab IDs or global `TabContext` (`src/app/businessidea/tabs/TabContext.tsx`).
  - Avoid large files; keep components small and focused.
  - No new dependencies without justification.

- **Assumptions**
  - `TabProvider` and `TabId` come from `src/app/businessidea/tabs/TabContext.tsx` and are reused.
  - `UserProfileTab` exports index from `src/app/businessidea/tabs/user-profile/index.ts` and uses `useTab()` internally.
  - `JobRiskAnalysisTab` wraps its own providers; no additional wrappers needed here.
  - `BusinessPlanContent` expects `ImplementationPlanProvider` up the tree (per `TabContainer.tsx`).

- **Confirmed decisions**
  - Route path: `/businessidea/profile-settings` via `page.tsx`.
  - Default initial tab: `userprofile`.
  - Nav style: mirror existing icon/label style (accessibility enhancements can be added later).

- **Solution Paths**
  - __Path A (Recommended)__: Reuse existing `TabProvider` in the new module.
    - Pros: zero refactor of existing tabs; `ReviewStep.tsx` continues to navigate using `useTab().setActiveTab('jobrisk')` seamlessly; minimal risk.
    - Cons: `validTabs` contains global IDs; dedicated nav must guard against non-local tabs.
  - __Path B__: Create a new dedicated context limited to three tabs.
    - Pros: stricter typing, fully decoupled from global nav.
    - Cons: invasive refactors to `UserProfileTab`/`ReviewStep` imports; higher risk and scope.


## 2) Rationale

- Reusing `TabProvider` safely preserves current behavior and allows internal tab navigation in `UserProfileTab` to function without code changes.
- Wrapping with `ImplementationPlanProvider` ensures `BusinessPlanContent` continues to work outside the global container.
- Dedicated navigation component isolates UI and keeps files small and maintainable.
- Add optional dynamic imports for heavier tabs (e.g., Job Risk) to reduce bundle size.


## 3) Implementation Plan

- **Files to Create**
  1. `src/app/businessidea/profile-settings/page.tsx` – route entry for `/businessidea/profile-settings`.
  2. `src/app/businessidea/profile-settings/ProfileSettingsTabs.tsx` – small orchestrator.
  3. `src/app/businessidea/profile-settings/ProfileSettingsNav.tsx` – 3-tab local nav.
  4. `src/app/businessidea/profile-settings/ProfileSettingsContent.tsx` – tab switcher.

- **Files to Modify**
  - None. Do not change `TabContainer.tsx` or `TabNavigation.tsx`.

- **Data Contracts & Types**
  - `ProfileTab` (local union): `'userprofile' | 'jobrisk' | 'businessplan'`.
  - `ProfileSettingsTabsProps`: `{ initialTab?: ProfileTab }`.

- **Component Signatures**
  - `ProfileSettingsTabs(props?: ProfileSettingsTabsProps): JSX.Element`
  - `ProfileSettingsNav(): JSX.Element`
  - `ProfileSettingsContent(): JSX.Element`

- **Integration Points**
  - Reuse `TabProvider` from `src/app/businessidea/tabs/TabContext.tsx`.
  - Wrap with `ImplementationPlanProvider` for `BusinessPlanContent`.
  - Import existing tab content components:
    - `UserProfileTab` from `tabs/user-profile`
    - `JobRiskAnalysisTab` from `tabs/job-risk`
    - `BusinessPlanContent` from `tabs/BusinessPlanContent`

- **Minimal, Copy-Paste-Ready Implementations**

  // File: `src/app/businessidea/profile-settings/page.tsx`
  ```tsx
  import React from 'react';
  import dynamic from 'next/dynamic';

  const ProfileSettingsTabs = dynamic(() => import('./ProfileSettingsTabs'), { ssr: false });

  export default function ProfileSettingsPage() {
    return <ProfileSettingsTabs initialTab="userprofile" />;
  }
  ```

  // File: `src/app/businessidea/profile-settings/ProfileSettingsTabs.tsx`
  ```tsx
  'use client';

  import React from 'react';
  import { TabProvider } from '@/app/businessidea/tabs/TabContext';
  import { ImplementationPlanProvider } from '@/features/implementation-plan/ImplementationPlanProvider';
  import ProfileSettingsNav from './ProfileSettingsNav';
  import ProfileSettingsContent from './ProfileSettingsContent';

  export type ProfileTab = 'userprofile' | 'jobrisk' | 'businessplan';

  export interface ProfileSettingsTabsProps { initialTab?: ProfileTab }

  export default function ProfileSettingsTabs({ initialTab = 'userprofile' }: ProfileSettingsTabsProps) {
    return (
      <TabProvider initialTab={initialTab}>
        <ImplementationPlanProvider>
          <div className="space-y-4">
            <ProfileSettingsNav />
            <ProfileSettingsContent />
          </div>
        </ImplementationPlanProvider>
      </TabProvider>
    );
  }
  ```

  // File: `src/app/businessidea/profile-settings/ProfileSettingsNav.tsx`
  ```tsx
  'use client';

  import React from 'react';
  import { useTab } from '@/app/businessidea/tabs/TabContext';
  import { UserCircleIcon, PresentationChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
  import { UserCircleIcon as SolidUserCircleIcon, PresentationChartBarIcon as SolidPresentationChartBarIcon, DocumentTextIcon as SolidDocumentTextIcon } from '@heroicons/react/24/solid';

  const TABS = [
    { id: 'userprofile', label: 'User Profile', outline: UserCircleIcon, solid: SolidUserCircleIcon },
    { id: 'jobrisk', label: 'Job Risk', outline: PresentationChartBarIcon, solid: SolidPresentationChartBarIcon },
    { id: 'businessplan', label: 'Business Plan', outline: DocumentTextIcon, solid: SolidDocumentTextIcon },
  ] as const;

  export default function ProfileSettingsNav() {
    const { activeTab, setActiveTab } = useTab();

    return (
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center h-14 px-1 min-w-max">
            {TABS.map(({ id, label, outline: Outline, solid: Solid }) => {
              const isActive = activeTab === id;
              const Icon = isActive ? Solid : Outline;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`relative flex flex-col items-center justify-center w-full h-12 rounded-lg transition-all duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={label}
                >
                  <div className="p-1.5 rounded-lg transition-transform duration-200">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  </div>
                  <span className={`text-[10px] font-medium mt-1 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-0 absolute'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  ```

  // File: `src/app/businessidea/profile-settings/ProfileSettingsContent.tsx`
  ```tsx
  'use client';

  import React, { useMemo } from 'react';
  import { useTab } from '@/app/businessidea/tabs/TabContext';
  import dynamic from 'next/dynamic';

  const UserProfileTab = dynamic(() => import('@/app/businessidea/tabs/user-profile'));
  const JobRiskAnalysisTab = dynamic(() => import('@/app/businessidea/tabs/job-risk'));
  const BusinessPlanContent = dynamic(() => import('@/app/businessidea/tabs/BusinessPlanContent'));

  export default function ProfileSettingsContent() {
    const { activeTab } = useTab();

    const Active = useMemo(() => {
      switch (activeTab) {
        case 'userprofile':
          return UserProfileTab;
        case 'jobrisk':
          return JobRiskAnalysisTab;
        case 'businessplan':
          return BusinessPlanContent;
        default:
          return UserProfileTab;
      }
    }, [activeTab]);

    return (
      <div className="max-w-4xl mx-auto h-[500px] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
          <Active />
        </div>
      </div>
    );
  }
  ```

- **Execution Flow**
  - `/businessidea/profile-settings` → `ProfileSettingsTabs` → `TabProvider` → `ProfileSettingsNav` + `ProfileSettingsContent`.
  - `ProfileSettingsContent` lazy-loads tab contents to keep bundles small.
  - `ReviewStep.tsx` navigations via `useTab().setActiveTab()` operate within this local `TabProvider`.

- **Performance**
  - Dynamic imports for heavier tabs; only render active tab.
  - Small, focused files for nav and content.

- **Error Handling**
  - Unknown `activeTab` falls back to `userprofile` (prevents crashes).

- **Maintainability**
  - Strict separation: nav vs content vs orchestrator.
  - Reuses existing contexts; minimal surface area.


## 4) Architecture Diagram (Mermaid)

```mermaid
flowchart TD
  A[Route: /businessidea/profile-settings (page.tsx)] --> B[ProfileSettingsTabs]
  B --> C[TabProvider (reuse tabs/TabContext)]
  B --> D[ImplementationPlanProvider]
  C --> E[ProfileSettingsNav]
  C --> F[ProfileSettingsContent]
  F --> G[UserProfileTab]
  F --> H[JobRiskAnalysisTab]
  F --> I[BusinessPlanContent]
  G -->|useTab.setActiveTab('jobrisk')| C
  I -->|Depends on ImplementationPlanProvider| D
```


## 5) Testing Plan

- **Unit Tests (React Testing Library + Jest)**
  - Nav rendering: three buttons with correct labels and aria-labels.
  - Tab switching: clicking Job Risk renders `JobRiskAnalysisTab`.
  - Fallback: invalid initial tab falls back to `userprofile`.

- **Integration Tests**
  - In `UserProfileTab` → `ReviewStep.tsx`, clicking "Analyze Job Risk" updates active tab to `jobrisk` inside local `TabProvider`.
  - `BusinessPlanContent` features available with `ImplementationPlanProvider` present.

- **Edge Cases**
  - Rendering without JS SSR: page uses `dynamic(..., { ssr: false })` for client-only tab logic.
  - Small viewport: sticky nav + scrollable content layout.

- **Acceptance Criteria**
  - `/businessidea/profile-settings` loads, shows three-tab nav, and switches correctly with no regressions to global nav.


## 6) Security & Compliance

- **Supabase readiness**
  - Use anon key only on client; service key must never ship to client.
  - Prepare a data layer interface for future Supabase usage (see below) to centralize access and enable RLS.

- **Environment**
  - Read keys from environment (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - No secrets in code; validate presence before initializing clients.

- **RLS & Access Control (future)**
  - Enable RLS on profile and risk tables.
  - Edge Functions for privileged operations; call from client with JWT.


## 7) Final Checklist

1. Create four files under `src/app/businessidea/profile-settings/` as specified.
2. Verify route `/businessidea/profile-settings` resolves and renders three tabs.
3. Confirm `ReviewStep` navigation to `jobrisk` works locally.
4. Confirm `BusinessPlanContent` consumes `ImplementationPlanProvider` without issues.
5. Run unit/integration tests; fix any path or type issues.
6. Confirm no changes in `TabContainer.tsx` and `TabNavigation.tsx`.


## 8) Suggested Enhancements (Optional)

- **Deep-Linking**: Sync active tab to query param `?tab=jobrisk` and hydrate into `TabProvider initialTab`.
- **Accessibility**: ARIA roles (`tablist`, `tab`, `aria-selected`), keyboard navigation (Left/Right).
- **Analytics**: Track tab switches via an analytics hook (deferred, no new deps).
- **Supabase Data Layer (Future)**
  - Interface-first design to keep components decoupled:

  ```ts
  // src/services/profile-settings-repo.ts
  export interface ProfileSettingsRepo {
    getUserProfile(userId: string): Promise<unknown>;
    saveUserProfile(userId: string, data: unknown): Promise<void>;
    getRiskInsights(profileId: string): Promise<unknown>; // could be edge-function backed
  }

  // Later, implement SupabaseProfileSettingsRepo using @supabase/supabase-js
  ```

- **Performance**: Memoize heavy subtrees; consider virtualization if tab content grows.
