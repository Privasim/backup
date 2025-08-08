# Spec-Driven UI Generation: Two-Stage Flow (Design Spec → Code Bundle)

This document defines an optimal, modular plan to implement a two-stage UI generation pipeline:

1) Design Spec generation (9–12 tasks + tokens + components + layout + interactions).
2) Code Bundle generation (Next.js + React + TS + Tailwind; optional curated libs). 

All previews are rendered safely via a controlled DSL; no runtime execution of generated TSX.

---

## Objectives

- Build a spec-first, safe, streaming UI generator that produces:
  - A validated Design Spec artifact (JSON), derived from a single user prompt.
  - A validated Code Bundle artifact (JSON) with files, dependencies, README, and a safe preview DSL.
- Maintain a premium minimalist, modern tech vibe:
  - Neutral slate palette, compact spacing, subtle shadows/rings, clean typography.
- Keep compatibility with current architecture:
  - React + Next.js App Router, Tailwind CSS, OpenRouter client.

---

## Current State Summary

- Wireframe-only generation:
  - `src/app/businessidea/tabs/ui-prompt/useUIGeneration.ts` streams JSON and validates a minimal DSL.
  - `src/app/businessidea/tabs/ui-prompt/UIWireframeRenderer.tsx` renders safe DSL primitives.
  - `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` provides prompt input + streaming console + rendering.
- Missing pieces:
  - Design Spec stage and schema.
  - Code Bundle stage and schema.
  - Zod validation for both.
  - A stepper/orchestration UI.

---

## High-Level Architecture

- Stage A (Design Spec):
  - Input: User prompt.
  - Output: `DesignSpec` JSON (9–12 tasks, tokens, components, layout, interactions, libraries, constraints).
  - UX: Streaming text console + validated spec panel with Approve/Regenerate.

- Stage B (Code Bundle):
  - Input: Approved `DesignSpec` JSON.
  - Output: `CodeBundle` JSON with files, suggested dependencies, README, and `previewDsl: WireframeScreen`.
  - UX: Tabs for Preview (safe DSL), Files, README, Deps. Export ZIP.

- Safety: Only render the DSL; never eval or compile generated TSX at runtime.

---

## Data Models

### DesignSpec (types.design.ts)

```ts
export interface DesignTask {
  id: string;              // stable key
  title: string;           // concise task description
  rationale: string;       // why this matters
  acceptanceCriteria: string[];
}

export interface DesignTokens {
  colors: {
    background: string;    // e.g., "#F9FAFB"
    surface: string;       // e.g., "#FFFFFF"
    border: string;        // e.g., "#E5E7EB"
    text: string;          // e.g., "#111827"
    mutedText: string;     // e.g., "#6B7280"
    primary: string;       // e.g., "#2563EB"
  };
  spacing: 'compact' | 'cozy';
  typography: {
    fontFamily: string;    // e.g., "Inter, system-ui, ..."
    baseSize: number;      // e.g., 14
    scale: 1.125 | 1.2;    // minor scales
  };
}

export interface ComponentSpec {
  name: string;            // e.g., "LoginForm"
  props?: { name: string; type: string; required?: boolean }[];
  states?: string[];       // e.g., ["loading", "error"]
  variants?: string[];     // e.g., ["primary", "ghost"]
}

export interface LayoutSection {
  id: string;
  title?: string;
  components: string[];    // names from ComponentSpec
}

export interface InteractionSpec {
  component: string;
  event: string;           // e.g., "onSubmit"
  behavior: string;        // e.g., "disable button and show spinner"
  accessibility?: string;  // e.g., ARIA notes
}

export interface DesignSpec {
  title: string;
  description: string;
  tasks: DesignTask[];            // 9–12 tasks minimum
  designTokens: DesignTokens;     // aligns to minimalist aesthetic
  components: ComponentSpec[];
  layout: { sections: LayoutSection[] };
  interactions: InteractionSpec[];
  libraries: {
    primary: 'tailwind';
    optional?: Array<'shadcn' | 'headlessui' | 'radix'>;
  };
  constraints: string[];          // e.g., safety, no runtime TSX execution
}
```

### CodeBundle (types.codegen.ts)

```ts
export interface CodeFile {
  path: string;            // e.g., "src/app/login/page.tsx"
  language: string;        // e.g., "tsx", "ts", "css"
  content: string;         // code text only
}

export interface CodeBundle {
  files: CodeFile[];       // minimal runnable Next.js App Router skeleton
  suggestedDependencies: Array<{ name: string; version?: string; reason: string }>;
  readme?: string;         // integration steps
  previewDsl?: WireframeScreen;  // for in-app safe preview
}
```

### Zod Validation (types.zod.ts)

- Provide strict Zod schemas matching the interfaces above.
- Reject extra fields by default (`strip: true`) or log unknowns for debugging.
- Defensive parsing for streamed JSON (recover from partials once balanced).

---

## Prompts (LLM)

### Stage A: Design Spec Prompt

- System:
  - "You are a senior product/UI designer. Output a single JSON matching the DesignSpec schema. No markdown or fences. Generate 9–12 tasks. Embrace a premium minimalist aesthetic: neutral slate palette, compact spacing, subtle shadows/rings, clean typography."
- User:
  - The original user prompt + constraints (safety, accessibility, libraries list).

### Stage B: Code Bundle Prompt

- System:
  - "You are a senior React engineer. Output a single JSON matching the CodeBundle schema. Use Next.js App Router + React + TypeScript + Tailwind. Respect the DesignSpec tokens. If libraries include `shadcn`, integrate with proper import patterns. Include a concise README and suggestedDependencies. Provide `previewDsl` for safe in-app rendering. No markdown or fences."
- User:
  - The approved DesignSpec JSON (verbatim).

---

## Streaming and Parsing Strategy

- Use the proven approach from `useUIGeneration.ts`:
  - Stream text chunks from OpenRouter.
  - Append to a buffer and run `extractBalancedJson(buffer)` to detect the first complete JSON object.
  - Try parse → validate with Zod → update UI progressively.
- On stream end:
  - Final parse attempt; if invalid, perform single-shot non-streaming fallback.
- Metrics:
  - Track `startedAt`, `lastChunkAt`, `tokenCount`, `bytes` for telemetry.

---

## New Files to Add

- Hooks
  - `src/app/businessidea/tabs/ui-prompt/useDesignSpec.ts` (Stage A, streaming + validation)
  - `src/app/businessidea/tabs/ui-prompt/useCodeGeneration.ts` (Stage B, streaming + validation)

- Types & Schemas
  - `src/app/businessidea/tabs/ui-prompt/types.design.ts`
  - `src/app/businessidea/tabs/ui-prompt/types.codegen.ts`
  - `src/app/businessidea/tabs/ui-prompt/types.zod.ts`

- UI Panels
  - `src/app/businessidea/tabs/ui-prompt/DesignSpecPanel.tsx`
  - `src/app/businessidea/tabs/ui-prompt/CodePreviewPanel.tsx`

- Orchestration
  - Update `src/app/businessidea/tabs/ui-prompt/UIPromptBox.tsx` to a stepper: Prompt → Spec → Code.

---

## Orchestration Flow (UIPromptBox)

1) User enters prompt and clicks Generate Spec.
2) `useDesignSpec` streams JSON; show Live JSON console + Spec preview.
3) User approves or regenerates.
4) Generate Code from approved Spec via `useCodeGeneration`.
5) Show Code Preview tabs: Preview (DSL), Files (with copy), README, Deps.
6) Provide Export ZIP; allow rerun with adjusted prompt or spec edits.

---

## UI/UX Guidelines

- Aesthetic:
  - Tailwind utility classes; slate neutrals; subtle dividers and shadows.
  - Compact spacing; clear typographic hierarchy.
- Accessibility:
  - Keyboard focus states (`focus:ring-2`), ARIA where appropriate.
- Components:
  - `DesignSpecPanel`: List (tasks), tokens, components, layout, interactions, libraries.
  - `CodePreviewPanel`: Tabs (Preview, Files, README, Deps) + Export.
- Stability:
  - In `UIWireframeRenderer`, avoid `Math.random()` for keys; use indices or ids.

---

## Safety Model

- Never execute generated TS/TSX/JS at runtime.
- Only render the `previewDsl` via `UIWireframeRenderer`.
- Sanitize strings for display; no HTML injection.
- Zod validation gates all streamed JSON.

---

## Dependencies & Integration

- Existing:
  - Next.js App Router, React, TypeScript, Tailwind, OpenRouter client.
- Optional (suggested by spec):
  - `shadcn/ui` (Tailwind-based components) for higher-fidelity code output.
  - `@headlessui/react` or `@radix-ui/react-*` primitives as needed.
- API Keys / Models:
  - Normalize reading `openrouter-api-key` and `openrouter_api_key`; persist selected model under `ui-prompt:selected-model`.

---

## Testing Strategy

- Unit:
  - Zod schemas (valid/invalid payloads).
  - JSON extraction (balanced braces, partials).
- Integration:
  - Stage A: Prompt → Spec → Approve.
  - Stage B: Spec → Code Bundle → Export.
  - Error paths: invalid key/model; malformed JSON; network errors; fallback non-streaming.
- Visual:
  - Snapshot test for `UIWireframeRenderer` with extended nodes.

---

## Implementation Steps (Milestones)

1) Types & Zod schemas for `DesignSpec` and `CodeBundle`.
2) Implement `useDesignSpec` (stream + validate + persist).
3) Implement `DesignSpecPanel` (approve/regenerate).
4) Implement `useCodeGeneration` (stream + validate + persist).
5) Implement `CodePreviewPanel` (tabs + export ZIP).
6) Convert `UIPromptBox` into a stepper; integrate both stages.
7) Improve `UIWireframeRenderer` keys and optionally extend nodes.
8) QA: end-to-end tests; UX polish for minimalist vibe.

---

## Risks & Mitigations

- LLM non-compliance with JSON-only output → strict system prompt + fenced-content stripping + balanced-JSON extraction + fallback non-stream.
- Oversized responses → token limits + streaming parse + early validation.
- Low-fidelity previews → include `previewDsl` tailored to renderer; add a handful of new nodes if needed.
- Dependency sprawl → confine to `suggestedDependencies` list; manual install step in README.

---

## Open Questions

- Should we default to including `shadcn/ui` in suggestions, or only when spec requires richer components?
- Do we want a history panel for previous Specs/Bundles?
- ZIP export format preferences (flat vs. repo-structured)?

---

## Acceptance Criteria

- After entering a single prompt:
  - A Design Spec with 9–12 tasks is generated, validated, displayed, and can be approved.
  - A Code Bundle is generated from the approved spec, validated, and displayed.
  - A safe visual preview is shown via DSL; no runtime TSX execution occurs.
  - Users can export all generated code as ZIP and view suggested dependencies.
