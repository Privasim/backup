# Task: Add Vertical Action Buttons to SuggestionCard for Tab Navigation

## Objective
Add two vertically stacked action buttons to each `SuggestionCard` that switch the active tab in the Business Idea workspace:
- Create Implementation Plan → navigates to `ListTab` (tab id: `list`)
- Visualize App → navigates to `MobileTab` (tab id: `mobile`)

This should match the premium minimalist, modern tech vibe across the app and maintain accessibility and responsiveness.

## Scope
- Modify the UI of `SuggestionCard` to include an “Actions” section at the bottom of the card.
- Use existing tab system (`TabProvider`/`useTab`) for navigation.
- No routing changes.

## Files Modified
- `src/components/business/SuggestionCard.tsx`
  - Import `useTab` from `src/app/businessidea/tabs/TabContext` (alias: `@/app/businessidea/tabs/TabContext`).
  - Add a new “Actions” block at the bottom of the card containing two vertically stacked buttons.
  - Wire click handlers to `setActiveTab('list')` and `setActiveTab('mobile')`.
  - Ensure accessibility (ARIA labels, focus rings) and consistent Tailwind styling.

## Files Reviewed (no change expected)
- `src/app/businessidea/tabs/TabContext.tsx` (source of `useTab` and valid tab ids)
- `src/app/businessidea/tabs/TabContainer.tsx` (tab mapping includes `list` and `mobile`)
- `src/app/businessidea/tabs/ListTab.tsx` (target view)
- `src/app/businessidea/tabs/MobileTab.tsx` (target view)
- `src/app/businessidea/tabs/BusinessPlanContent.tsx` (renders `SuggestionCard` within `TabProvider`)

## UX & Design Requirements
- Premium minimalist style with compact spacing, neutral slate palette, subtle shadows, and clean typography.
- Buttons stacked vertically with `space-y-2`, full width.
- Primary/secondary distinction:
  - Primary (Visualize App): solid indigo/blue with subtle gradient hover.
  - Secondary (Create Implementation Plan): outline with slate border; hover to slate bg.
- Responsive: layouts should adapt gracefully; buttons remain full-width on all sizes.
- Accessibility:
  - Keyboard navigable
  - Visible focus rings
  - `aria-label` for each button
- Keep existing card structure intact (header, description, features, details grid, footer).

## Technical Approach
1. Import `useTab` in `SuggestionCard`:
   - `import { useTab } from '@/app/businessidea/tabs/TabContext';`
2. Get `setActiveTab` from context inside the component.
3. Add a new block under the existing footer (visually separated via `pt-4 border-t border-gray-100`).
4. Render two buttons in a `div` with `flex flex-col space-y-2`:
   - Button A: "Create Implementation Plan" → `onClick={() => setActiveTab('list')}`
   - Button B: "Visualize App" → `onClick={() => setActiveTab('mobile')}`
5. Tailwind styles for visual consistency:
   - Common: `w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all`
   - Secondary: `border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300`
   - Primary: `bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-300`
6. Add `aria-label`s and optional leading icons (e.g., clipboard-list, device phone) from Heroicons outline set for visual cue.

## Edge Cases & Considerations
- SuggestionCard outside TabProvider: `useTab()` would throw by design. Current usage is inside `BusinessPlanContent` → `TabContainer` → `TabProvider`, so it is safe.
  - Optional future-proofing (not required now): accept optional `onCreatePlan` and `onVisualize` props; if provided, use those; else use `useTab()`.
- If target tabs need context of which suggestion was clicked, consider extending a shared context to store `selectedSuggestionId` before switching tabs. Not in scope for this task.

## Implementation Steps
1. Open `src/components/business/SuggestionCard.tsx`.
2. Add import: `useTab` from `@/app/businessidea/tabs/TabContext`.
3. Inside `SuggestionCard`, call `const { setActiveTab } = useTab();`.
4. After the current footer block, add an "Actions" section with two vertically stacked full-width buttons.
5. Wire the click handlers to call `setActiveTab('list')` and `setActiveTab('mobile')`.
6. Apply Tailwind classes for primary/secondary styling, focus rings, and hover transitions.
7. Verify no TypeScript errors; ensure import alias `@/` resolves to project root (`tsconfig` already supports this).

## Testing Checklist
- Rendering:
  - `SuggestionCard` renders with the new action section.
  - Buttons are full width and stacked vertically.
- Interaction:
  - Clicking “Create Implementation Plan” sets active tab to `list` and shows `ListTab`.
  - Clicking “Visualize App” sets active tab to `mobile` and shows `MobileTab`.
  - Keyboard navigation works (Tab to each button, Enter/Space triggers click).
  - Focus ring visible on both buttons.
- Visual:
  - Primary/secondary styles match brand aesthetic.
  - Spacing and borders align to 8px grid.
- Non-regression:
  - Existing SuggestionCard content unaffected.
  - BusinessPlanContent scroll/height behavior remains intact.

## Acceptance Criteria
- Two new buttons render at the bottom of each `SuggestionCard`, stacked vertically.
- Clicking each button switches the active tab correctly without page reload or routing.
- Styles match the premium minimalist look-and-feel and are accessible.
- No TypeScript or lint errors introduced.

## Risks & Mitigation
- Risk: Future reuse of `SuggestionCard` outside `TabProvider` could throw.
  - Mitigation: Document expectation; optionally add fallback props in a later task.
- Risk: Visual clutter in card.
  - Mitigation: Maintain compact spacing and clear hierarchy with a subtle divider.

## Rollback Plan
- Revert changes in `src/components/business/SuggestionCard.tsx`.
- No data migrations or external dependencies involved.

## Effort Estimate
- Development: 30–45 minutes
- QA: 15–20 minutes

## Future Enhancements (Out of Scope)
- Pass `selectedSuggestionId` to the target tab for contextual rendering.
- Deep-linking via query params or URL hash to open a specific tab.
- A/B test button order or prominence based on usage analytics.
