# Conditional Role Skillset Step (Option E1) — Technical Spec

Date: 2025-08-29
Owner: UserProfile Feature
Status: Draft (Implementation-ready)


1) Problem Analysis
- Requirements
  - Replace current step 2 with a new, modular step integrating:
    - Role-conditional Skillset selection (no free text).
    - Context & Compensation: Industry, Location, Income + Currency (dropdown-only).
    - Experience and Education/Training (dropdown-only), role-conditional.
    - Goals/Challenges (dropdown-only), role-conditional.
  - Final user flow: Step 1 Role → Step 2 Skillset + Context & Compensation → Step 3 Review.
  - Do not reuse existing components inside Step 2. Build new UI primitives (selects, segmented, multi-pills) with Tailwind and accessibility.
  - Use predefined options/enums in `src/app/businessidea/tabs/user-profile/types.ts` only. No mock or free-text.
  - Persist via `UserProfileContext`. Review step must reflect Step 2 data.

- Dependencies and existing context
  - `src/app/businessidea/tabs/user-profile/steps/CompactRoleStep.tsx` provides `role` and resets role-related data upon change.
  - `src/app/businessidea/tabs/user-profile/steps/CompactReviewStep.tsx` shows review summary; will be updated to new fields.
  - `UserProfileContext` persists `profileData` to session storage. Existing top-level fields include `industry`, `location`, `skills`, `workPreference`, etc.
  - `types.ts` defines roles, industries, locations, education levels/fields, experience ranges, goals, and skills per role/industry.

- Constraints
  - No third-party dependencies beyond project defaults.
  - No free-text inputs; only selects/segmented/multi-select.
  - Maintain strict TypeScript (no any), functional style, and accessibility.

- Ambiguities resolved
  - Option E1 chosen: include Industry, Location, and Income + Currency in Step 2 under a “Context & Compensation” group.
  - Completion criteria are defined below (per role + universal requirements).

- Solution paths considered
  - Minimal vs Extended. We proceed with Extended (E1) to merge context/compensation with skillset in Step 2 while removing the old industry/location step from the flow.


2) Rationale
- Consolidating context and compensation into Step 2 reduces steps while preserving completeness in Review.
- Role-conditional configuration centralizes branching logic and reduces conditional JSX in panels.
- New UI primitives isolate Step 2 from legacy components, supporting tighter control over UX, a11y, and performance.
- Writing to top-level fields in `UserProfileContext` simplifies the Review and downstream consumers (e.g., chat integration).


3) Implementation Plan
- Files to create
  - Step 2 orchestrator
    - `src/app/businessidea/tabs/user-profile/steps2/ConditionalRoleSkillsetStep.tsx`
      - Responsibilities: read role/context; resolve role-config; render role-specific panel and shared groups; write normalized data to `UserProfileContext`.
  - Role-conditional configuration and hook
    - `src/app/businessidea/tabs/user-profile/steps2/config/skillset-role-config.ts`
      - Exports per-role config: categories, goals, education (levels/fields), experience ranges, and context/compensation ranges/currencies. All sourced/refined from `types.ts` constants.
    - `src/app/businessidea/tabs/user-profile/steps2/hooks/useSkillsetConfig.ts`
      - Resolves effective config by role; provides derived lists and helper guards.
  - New UI primitives (no reuse)
    - `src/app/businessidea/tabs/user-profile/steps2/ui/NewSelect.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/ui/NewSegmented.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/ui/NewMultiPill.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/ui/a11y.ts` (ARIA utils, keyboard handlers)
  - Role panels (pure, declarative, small)
    - `src/app/businessidea/tabs/user-profile/steps2/panels/StudentPanel.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/panels/ProfessionalPanel.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/panels/BusinessOwnerPanel.tsx`
    - `src/app/businessidea/tabs/user-profile/steps2/panels/CareerShifterPanel.tsx`

- Files to modify
  - `src/app/businessidea/tabs/user-profile/CompactUserProfileTab.tsx`
    - Replace existing step 2 with `ConditionalRoleSkillsetStep`.
    - Remove previous industry/location step from the flow.
    - Update `isStepComplete()` for the new Step 2 completion rules.
  - `src/app/businessidea/tabs/user-profile/steps/CompactReviewStep.tsx`
    - Add rendering for Step 2 data: skills, goals, experience, education/field of study, industry, location, income range and currency.
    - Remove/adjust sections that referenced the removed step.
  - `src/app/businessidea/tabs/user-profile/UserProfileContext.tsx` (if needed)
    - Ensure shape supports Step 2 fields (see Data Model). Strict types. Backward compatibility.

- Data Model (top-level in `profileData`)
  - `role: Role | undefined` — from Step 1.
  - `skills: string[]` — multi-select result across categories; deduped; normalized.
  - `goals?: string[]` — role-specific challenge/goal selections.
  - `experience?: string` — selected range string from predefined options.
  - `educationLevel?: string` — from predefined education levels.
  - `fieldOfStudy?: string` — constrained by `educationLevel` lists.
  - `industry?: string` — from predefined `INDUSTRY_OPTIONS`.
  - `location?: string` — from predefined `LOCATION_OPTIONS`.
  - `income?: { rangeId: string; currency: string }` — chosen from allowed `INCOME_RANGES_*` + `CURRENCY_OPTIONS` in config.
  - Notes
    - Keep `roleDetails` intact to avoid breaking older code. Step 2 writes to top-level fields only.
    - All arrays deduped; all selected values validated against config.

- Step 2 UI structure (orchestrator)
  - Header: role badge + short description of the step.
  - Role Panel: shows one or more Skill categories (at least 2 blocks), using `NewMultiPill`.
  - Shared Groups:
    - Education & Training: `NewSelect` for `educationLevel`, `fieldOfStudy` (dependent).
    - Experience: `NewSelect` for `experience`.
    - Context & Compensation: `NewSelect` for `industry`, `location`, `income.rangeId`, `income.currency`.
    - Goals/Challenges: `NewMultiPill` for `goals`.
  - Footer: completion hint (% optional) and Next button enablement handled by parent stepper logic.

- Role-conditional branching
  - Implement via `skillset-role-config.ts` using data imported from `types.ts` only.
  - Student
    - Min skills: 3
    - Required: `educationLevel`, `fieldOfStudy`, `industry`, `location`, `income.rangeId`, `income.currency`
  - Professional
    - Min skills: 5
    - Required: `experience`, `industry`, `location`, `income.rangeId`, `income.currency`
  - Business Owner
    - Min skills: 5
    - Required: `industry`, `location`, `income.rangeId`, `income.currency`
  - Career Shifter
    - Min skills: 4
    - Required: `industry`, `location`, `income.rangeId`, `income.currency`

- Step completion logic (in `CompactUserProfileTab.tsx`)
  - General checks
    - `role` selected.
    - `skills.length >= minSkills(role)`.
    - Required fields per role satisfied (see above).
  - Optional: if currency not role-dependent, default to `USD` but still require explicit selection to pass completion.

- State management & normalization
  - All onChange events write immediately to `UserProfileContext` via `setProfileData(partial)`.
  - Normalize arrays: `skills`, `goals` -> unique, non-empty strings.
  - Dependent pruning:
    - When `educationLevel` changes, if current `fieldOfStudy` not in new list, clear `fieldOfStudy`.
  - Validation guard before `Next` handled by `isStepComplete()`.

- Accessibility & UX
  - Keyboard navigation: arrow keys and Enter/Space to toggle pills; Tab order logical.
  - ARIA roles/labels for selects and groups; announce changes via aria-live where needed.
  - Responsive: grid columns collapse on small screens; large hit targets for pills.
  - No free-text inputs; placeholders guide selection.

- Performance
  - `useMemo` for derived option lists (e.g., fields by education level).
  - Keep panels light; avoid large render trees by splitting into role panels.


4) Architecture Diagram (Mermaid)
```mermaid
flowchart TD
  A[CompactRoleStep] --> B[ConditionalRole Skillset & Context Step]
  subgraph B [Step 2 Orchestrator]
    B1[useSkillsetConfig(role)]
    B2[Role Panel: Student/Professional/BusinessOwner/CareerShifter]
    B3[Shared: Education & Training]
    B4[Shared: Experience]
    B5[Shared: Context & Compensation]
    B6[Shared: Goals/Challenges]
    B7[NewSelect / NewSegmented / NewMultiPill]
  end
  B -->|setProfileData| C[(UserProfileContext)]
  C --> D[CompactReviewStep]
```


5) Testing Plan
- Unit tests
  - `useSkillsetConfig` produces correct categories, goals, education fields per role using only `types.ts` sources.
  - Dependent pruning: changing `educationLevel` drops invalid `fieldOfStudy`.
  - Array normalization: dedupe skills/goals; reject invalid items.
- Integration tests
  - Switching roles resets incompatible Step 2 selections (skills count and dependent fields).
  - `isStepComplete()` per role:
    - Student: minSkills 3 + required fields present.
    - Professional: minSkills 5 + experience + context/compensation present.
    - Business Owner: minSkills 5 + context/compensation present.
    - Career Shifter: minSkills 4 + context/compensation present.
  - Review renders Step 2 values (skills, goals, experience, education, industry, location, income, currency).
- Accessibility tests
  - Keyboard-only flows for pills and selects.
  - ARIA attributes verified via testing-library queries.

- Acceptance criteria
  - Three-step flow functional.
  - No free-text inputs in Step 2.
  - Only options from `types.ts` and derived config.
  - Review reflects all Step 2 data accurately.


6) Security & Compliance
- Client-side only; no external API calls.
- No secrets; no PII beyond selected categories.
- Input validation ensures only predefined enumerations are stored; prevents injection via free text.


7) Final Checklist
- Update `CompactUserProfileTab.tsx` to 3-step flow and completion rules.
- Add Step 2 orchestrator, role panels, UI primitives, and config/hook.
- Modify `CompactReviewStep.tsx` to display new fields and remove legacy step references.
- Ensure `UserProfileContext` supports new `income` object and top-level fields.
- Implement a11y and keyboard support.
- Add unit/integration tests.
- Manual QA across roles for completion gating and Review content.


8) Suggested Enhancements (Optional)
- Auto-suggest skills based on selected industry.
- Allow saving user-defined presets (still option-based) for faster selection.
- Dynamic currency default based on selected location (kept explicit for completion).
