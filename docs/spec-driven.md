# Spec-Driven UI Generation (Two-Stage) — Implementation Plan

This plan streamlines UI generation to two stages:
1) From a single prompt, generate an 8–12 item Design Spec list.
2) Generate a modern, aesthetic frontend preview following the spec.

No runtime execution of generated TSX. Safe DSL rendering only. Streaming-first with strict validation.

---

## Objectives
- Produce a modern, aesthetic mobile-first frontend from one prompt via a minimal two-call pipeline.
- Keep implementation surface small, reliable, and testable.
- Maintain existing patterns: API key via `ChatboxControls`, model selection local to `UIPromptBox`.

## Scope
- Mobile-first preview using a safe JSON DSL rendered by React (no eval).
- Two artifacts only:
  - Design Spec (8–12 bullet items)
  - Wireframe Screen + optional exportable TSX string (not executed)
- Streaming responses with incremental JSON parsing and concise retry logic.

## Non-goals
- No multi-step stepper/provider UI.
- No broad component catalog beyond a curated whitelist.
- No server-side storage or execution of generated code.

---

## Architecture Overview
- UI: Single panel experience in `MobileTab` with `UIPromptBox` controlling the flow. Two collapsibles inside:
  - Design Spec (streamed bullets)
  - Preview (rendered DSL) + Export TSX button
- Hooks:
  - `useDesignSpec()` — Stage A: prompt → Design Spec
  - `useUIGeneration()` — Stage B: (prompt + spec) → Wireframe DSL (+ TSX string)
- Rendering:
  - `UIWireframeRenderer.tsx` renders JSON DSL (safe component whitelist)
- Validation: Zod schemas for Spec and DSL
- Caching: localStorage by prompt hash for Spec (and optionally DSL)
- Telemetry: minimal timings + token counts

---

## Data Contracts (TS types + Zod schemas)

- DesignSpecItem
  - id: string (slug)
  - statement: string (≤ 160 chars)
  - rationale: string (≤ 160 chars)
  - ui_hint: enum ['layout','typography','color','components','spacing','motion','state','navigation']
  - priority: 1|2|3

- DesignSpec
  - items: DesignSpecItem[] (8–12 exactly)

- WireframeScreen (extends current minimal DSL in `types.ts`)
  - title?: string
  - padding?: 'none'|'sm'|'md'|'lg'
  - design_tokens?: {
      primary?: string,
      radius_scale?: 'sm'|'md'|'lg',
      spacing_scale?: 'sm'|'md'|'lg',
      font_scale?: 'sm'|'md'|'lg'
    }
  - children: WireframeNode[] (whitelist: 'Screen','Header','Text','Button','List','Card','Form')

- GeneratedCode
  - wireframe: WireframeScreen
  - tsx_export?: string (export-only; not executed)

---

## Prompting Strategy (High-level)

- Stage A (Design Spec):
  - Instruct to output strictly 8–12 bullet items, each with: id, statement, rationale, ui_hint, priority.
  - Style anchors: modern, aesthetic, mobile-first, concise phrasing.
  - Enforce short sentences and max lengths.

- Stage B (Code):
  - Input: original user prompt + the validated Design Spec items.
  - Output: WireframeScreen DSL + optional TSX string.
  - Emphasize whitelist components, mobile spacing, semantic structure, minimal text, safe values.
  - No images, no external assets, no HTML injection.

---

## Error Handling & Retries
- Stage A: If schema invalid → retry once non-streaming with stricter format note; else show guidance to user.
- Stage B: If DSL invalid → retry once non-streaming; else show minimal fallback screen with error badge.
- All errors actionable and concise; surface in `UIPromptBox` console area.

## Streaming & Performance
- Use brace-balanced incremental parsing.
- Throttle UI updates to 100–200ms.
- Abort support via cancel action.
- Targets: TTFB(spec) ≤ 3s, TTFB(preview) ≤ 5s (typical).

## Caching
- Cache Design Spec by stable key: `spec:<sha256(prompt)>`.
- Optional: Cache DSL by `dsl:<sha256(prompt + specHash)>`.
- Provide "Regenerate Spec" to bypass cache.

## Security
- Never execute TSX at runtime; export as text only.
- Sanitize all text and guard against unexpected node types.
- Restrict renderer to whitelist components and safe props.

## Observability
- Metrics per stage: `ttfb_ms`, `total_ms`, `tokens_in`, `tokens_out`, `retries`.
- Log validation failures (redacted content).

---

## File/Module Plan

- Existing
  - `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx`
  - `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts`
  - `src/app/businessidea/tabs/ui-prompt/UIWireframeRenderer.tsx`
  - `src/app/businessidea/tabs/ui-prompt/types.ts`
  - `src/components/chatbox/ChatboxControls.tsx` (API key)

- New/Updated
  - `src/app/businessidea/tabs/ui-prompt/hooks/useDesignSpec.ts` — Stage A streaming hook
  - `src/app/businessidea/tabs/ui-prompt/types.ts` — extend with DesignSpec types + tokens
  - `src/app/businessidea/tabs/ui-prompt/types.zod.ts` — Zod schemas for DesignSpec and Wireframe
  - `src/app/businessidea/tabs/ui-prompt/utils/stream.ts` — brace-balanced parsing, throttling helpers
  - `src/app/businessidea/tabs/ui-prompt/utils/cache.ts` — prompt hashing, get/set cache
  - `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` — integrate two-stage flow (Spec + Preview collapsibles)

---

## Modular Task List (with DoD)

### M1 — Design Spec Generation (Stage A)
- [ ] Define `DesignSpecItem`, `DesignSpec` in `types.ts`
- [ ] Implement Zod schemas in `types.zod.ts`
- [ ] Create `useDesignSpec.ts`
  - [ ] Streaming with incremental JSON assembly
  - [ ] Validation on-the-fly and at end
  - [ ] Abort/cancel support
  - [ ] Retry once non-streaming on invalid
  - [ ] Metrics capture
- [ ] Implement caching in `utils/cache.ts`
  - [ ] SHA-256 helper
  - [ ] get/set with TTL (optional) and size guard
  - [ ] Wire cache into `useDesignSpec`
- [ ] Update `UIPromptBox.tsx`
  - [ ] Add Spec section (collapsible) with streamed bullets
  - [ ] States: idle → generating → ready → error, with concise UI
- DoD:
  - [ ] From a prompt, obtain and display 8–12 valid spec items within 3s TTFB (typical)
  - [ ] Spec passes Zod validation; cached by prompt hash

### M2 — Code Generation to DSL (Stage B)
- [ ] Extend `WireframeScreen` in `types.ts` with `design_tokens`
- [ ] Implement Zod schema for DSL in `types.zod.ts`
- [ ] Adapt `useUIGeneration.ts`
  - [ ] Accept (prompt + spec) as inputs
  - [ ] Streaming DSL with incremental parse
  - [ ] Throttled updates; abort support; retry once non-streaming
  - [ ] Metrics capture
- [ ] Update `UIPromptBox.tsx`
  - [ ] Add Preview section (collapsible) rendering via `UIWireframeRenderer`
  - [ ] Small footer telemetry (TTFB, retries)
- DoD:
  - [ ] Render live preview from streamed DSL within 5s TTFB (typical)
  - [ ] DSL passes Zod validation; unknown nodes safely ignored/boxed

### M3 — Export & Polish
- [ ] Provide Export TSX (text-only) from Stage B output
- [ ] Copy-to-clipboard and file-download affordances
- [ ] Improve error copy with short, actionable tips
- [ ] Basic empty/error states for both sections
- DoD:
  - [ ] TSX export available without any runtime execution
  - [ ] Error/empty states UX complete

### M4 — Tests & Observability
- [ ] Unit tests
  - [ ] Parsing helpers (brace balance, chunk assembly)
  - [ ] Zod schemas (valid/invalid cases)
  - [ ] Cache helpers (hashing, capacity)
- [ ] Integration tests (happy path + retries)
  - [ ] Prompt → Spec → DSL
- [ ] Snapshot tests for typical wireframes
- [ ] Metrics logging and minimal dashboard in dev tools panel or console
- DoD:
  - [ ] CI suite validates schemas and core flows
  - [ ] Key wireframes stable by snapshot

---

## Acceptance Criteria
- From a single prompt:
  - A valid Design Spec of 8–12 items is produced and cached.
  - A modern, aesthetic mobile-first preview renders from the DSL and adheres to the spec.
- No runtime code execution of generated TSX.
- Streaming-first with abort and a single retry fallback.
- Zod validation for both artifacts; clear, actionable errors.
- Meets performance targets (TTFB spec ≤ 3s, TTFB preview ≤ 5s typical).

## Risks & Mitigations
- Under-specified prompts → Require style anchors in Stage A; provide example prompts.
- Verbose outputs → Enforce length limits; trim streaming buffer.
- Inconsistent aesthetics → Derive token defaults; constrain component set.

## Rollback Strategy
- If streaming proves unstable, temporarily disable streaming for Stage B and keep Stage A cached responses to limit user cost.

## Operational Notes
- API key management remains in `ChatboxControls`; model selection local to `UIPromptBox` (persisted via localStorage).
- Keep renderer whitelist small initially; expand only when tests and schemas exist.
- Document prompt templates inline in hooks for traceability.
