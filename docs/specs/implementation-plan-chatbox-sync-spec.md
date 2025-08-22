# Implementation Spec: Chatbox → ListTab Stream Sync and Prompt Reduction

Author: Cascade
Date: 2025-08-22 21:55 (+08:00)
Status: Proposed (awaiting approval)

---

1) Problem Analysis

- Requirements
  - Reduce implementation plan generation (Chatbox path) to an initial concise 3–4 sentence overview.
  - Mirror the streamed output from Chatbox conversation into the List tab UI so users see the same content streaming without a second LLM request.
  - Preserve existing List tab behaviors (loading/error/preview; success view when a full JSON plan exists).
  - Avoid introducing new external dependencies.

- Current Flow (grounded in code)
  - Trigger
    - `src/components/business/SuggestionCard.tsx` → onClick calls `setActiveTab('list')` and `onCreatePlan(suggestion)`.
    - `src/app/businessidea/tabs/BusinessPlanContent.tsx` wires `onCreatePlan` to:
      - `useChatbox().createPlanConversation(suggestion)` then `openChatbox()`.
  - Chatbox generation and streaming
    - `src/components/chatbox/ChatboxProvider.tsx`
      - `generatePlanOutline(suggestion)` builds a JSON outline (phases, milestones, etc.).
      - `createPlanConversation(suggestion)` creates a conversation and calls `generateFullPlan(outline, onChunk)`.
      - `generateFullPlan(outline, onChunk)` currently prompts for a comprehensive, multi-section, emoji-rich markdown plan and streams via `appendToConversationMessage()`.
      - Chat messages are rendered in `src/components/chatbox/ChatboxPanel.tsx`.
  - List tab generation (decoupled pipeline)
    - `src/features/implementation-plan/useImplementationPlan.ts` builds prompts via `promptBuilder.ts`, streams via `generatePlanStream()`, parses JSON via `parsePlanFromString()`, and stores state in `ImplementationPlanProvider`.
    - `src/app/businessidea/tabs/ListTab.tsx` displays `rawStream` preview while streaming and a structured plan on success.

- Constraints & Dependencies
  - Uses OpenRouter via `OpenRouterClient` (Chatbox path and ImplementationPlan path).
  - `ImplementationPlanProvider` exposes: `appendRaw`, `clearRaw`, `setStatus`, `setError`, `setPlan`, `streamingState` updaters, and cache helpers.
  - `parsePlanFromString()` expects JSON present in the stream (not true for Chatbox markdown today).

- Ambiguities
  - Single source of truth for plan content: Chatbox vs ImplementationPlan context.
  - Whether to keep the outline step when only a short overview is needed.
  - How/when to transition List tab from streaming preview to "success" if content is only a short overview (no JSON plan).

- Solution Paths
  - Path A (Recommended): Keep Chatbox as the generation source; mirror Chatbox streaming content into `ImplementationPlanProvider` so `ListTab` displays the same stream. Do not trigger List tab LLM generation.
    - Pros: No duplicate LLM calls; minimal surface area change; preserves Chatbox UX.
    - Cons: `ListTab` may not reach success state unless we later introduce a minimal-JSON summary or a summary-only plan type.
  - Path B: Extend `createPlanConversation()` to accept `onChunk/onComplete` callbacks and write directly into `ImplementationPlanProvider` from Chatbox.
    - Pros: Single streaming loop with explicit bridge.
    - Cons: Tighter coupling; signature changes; provider ordering concerns.
  - Path C: Make `onCreatePlan` use the ImplementationPlan pipeline and have Chatbox only display/echo that stream.
    - Pros: One pipeline to maintain.
    - Cons: Larger refactor; Chatbox loses conversation-centric generation context.

2) Rationale

- Path A isolates synchronization as an optional, tab-scoped hook with no API changes to Chatbox. It:
  - Avoids double invocation of the LLM.
  - Minimizes risk by leaving both providers intact and loosely coupled.
  - Requires only prompt tightening in `generateFullPlan()` to achieve concise output.

3) Implementation Plan

- Files to Create
  - `src/features/implementation-plan/hooks/use-sync-plan-from-chatbox.ts`

- Files to Modify
  - `src/components/chatbox/ChatboxProvider.tsx`
    - Tighten `generateFullPlan()` prompt and reduce `max_tokens` to generate a concise 3–4 sentence overview (plain text, no heavy markdown/emojis).
  - `src/app/businessidea/tabs/ListTab.tsx`
    - Invoke the new sync hook so the List tab mirrors the active Chatbox conversation stream.
  - Optional: `src/app/businessidea/tabs/BusinessPlanContent.tsx`
    - Pass `openChatbox('business-suggestion')` to mark the analysis type explicitly.

- Function Signatures & Contracts
  - New hook: `useSyncPlanFromChatbox(): void`
    - Inputs: none (reads `useChatbox()` and `useImplementationPlanContext()`).
    - Behavior:
      - When `ChatboxProvider` status is `analyzing` or `completed`, and the active conversation's last assistant message has `analysisType === 'business-suggestion'`, mirror incremental content into ImplementationPlan state.
      - Delta strategy: track previous length; append only the new slice to `appendRaw`.
      - State wiring in `ImplementationPlanProvider`:
        - On first detection, set `status` → `streaming`, `clearRaw()`, and initialize `streamingState` (`isProcessing: true`).
        - While streaming, call `updateStreamingProgress` conservatively (or keep simple and only update `rawContent`).
        - On Chatbox completion, set `streamingState` to complete. Attempt `parsePlanFromString(raw)`; if a plan is parsed, set `plan` and `status: success`; otherwise leave as `streaming` (Stage 1) or set a new `status: summary` (Stage 2 enhancement).
      - Cancellation: if Chatbox status becomes `error`, propagate `setStatus('error')` and `setError`.

- Code Blocks (Proposed; copy-paste ready)

  - New: `src/features/implementation-plan/hooks/use-sync-plan-from-chatbox.ts`

  ```ts
  // File: src/features/implementation-plan/hooks/use-sync-plan-from-chatbox.ts
  "use client";

  import { useEffect, useRef } from "react";
  import { useChatbox } from "@/components/chatbox/ChatboxProvider";
  import { useImplementationPlanContext } from "@/features/implementation-plan/ImplementationPlanProvider";
  import { parsePlanFromString } from "@/features/implementation-plan/streamingParser";

  export function useSyncPlanFromChatbox(): void {
    const chat = useChatbox();
    const ctx = useImplementationPlanContext();
    const prevLenRef = useRef<number>(0);
    const syncingRef = useRef<boolean>(false);

    useEffect(() => {
      const activeId = chat.activeConversationId;
      const conv = chat.conversations.find(c => c.id === activeId);
      if (!conv) return;

      // Take the last assistant message for business-suggestion streams
      const lastAssistant = [...conv.messages].reverse().find(m => m.type === 'assistant' && m.analysisType === 'business-suggestion');
      const content = lastAssistant?.content || '';

      // Determine if we should sync: only when Chatbox is actively generating or just completed
      const shouldSync = chat.status === 'analyzing' || chat.status === 'completed';
      if (!shouldSync || !content) return;

      // Initialize syncing session
      if (!syncingRef.current) {
        syncingRef.current = true;
        prevLenRef.current = 0;
        ctx.setError(undefined);
        ctx.setPlan(undefined);
        ctx.clearRaw();
        ctx.setStatus('streaming');
        ctx.setStreamingState({ isProcessing: true, currentPhase: 'initializing', progress: 0 });
      }

      // Append only the new slice
      const nextLen = content.length;
      if (nextLen > prevLenRef.current) {
        const slice = content.slice(prevLenRef.current);
        ctx.appendRaw(slice);
        prevLenRef.current = nextLen;
      }

      // If Chatbox reports completion, finalize
      if (chat.status === 'completed') {
        const raw = ctx.rawStream || content;
        const plan = parsePlanFromString(raw, undefined);
        if (plan) {
          ctx.setPlan(plan);
          ctx.setStatus('success');
        }
        ctx.setStreamingState({ isProcessing: false, currentPhase: 'complete', progress: 100 });
        // Keep syncing session active for now; will reset when analysis restarts
      }
    }, [chat.activeConversationId, chat.conversations, chat.status]);

    // Reset session if Chatbox errors or returns to idle
    useEffect(() => {
      if (chat.status === 'error') {
        ctx.setStatus('error');
        ctx.setError(chat.error || 'Chatbox generation failed');
        ctx.setStreamingState({ isProcessing: false });
        syncingRef.current = false;
        prevLenRef.current = 0;
      }
      if (chat.status === 'idle') {
        syncingRef.current = false;
        prevLenRef.current = 0;
      }
    }, [chat.status]);
  }
  ```

  - Modify: `src/app/businessidea/tabs/ListTab.tsx` (invoke the hook)

  ```tsx
  // File: src/app/businessidea/tabs/ListTab.tsx
  // INSERT BELOW: add import
  import { useSyncPlanFromChatbox } from '@/features/implementation-plan/hooks/use-sync-plan-from-chatbox';

  // INSERT BELOW: inside component, before return
  useSyncPlanFromChatbox();
  ```

  - Modify prompt: `src/components/chatbox/ChatboxProvider.tsx` → `generateFullPlan()`

  ```ts
  // File: src/components/chatbox/ChatboxProvider.tsx
  // REPLACE prompt with concise 3–4 sentence overview, and simplify system message
  const prompt = `Based on this outline, produce a concise overview of the implementation plan.

Outline:
- Title: ${outline.title}
- Overview: ${outline.overview}
- Key Phases: ${outline.keyPhases.join(', ')}
- Timeline: ${outline.estimatedTimeline}
- Milestones: ${outline.majorMilestones.join(', ')}
- Resources: ${outline.resourceRequirements.join(', ')}

Requirements:
- Return only 3–4 full sentences (approximately 80–120 words total).
- Plain text only. No lists, no headers, no emojis, no markdown.
- Be specific and actionable at a high level.
- Emphasize immediate next steps and critical dependencies.`;

// In messages, simplify the system role and reduce max_tokens
await client.chat({
  model: state.config.model,
  messages: [
    { role: 'system', content: 'You are a precise business planning assistant. Respond with plain text, concise (3–4 sentences).' },
    { role: 'user', content: prompt }
  ],
  temperature: Math.min(state.config.temperature || 0.7, 0.7),
  max_tokens: 300
}, {
  stream: true,
  onChunk: (chunk: string) => {
    accumulatedContent += chunk;
    onChunk(chunk);
  }
});
  ```

  - Optional: `src/app/businessidea/tabs/BusinessPlanContent.tsx` to explicitly tag the analysis type

  ```tsx
  // File: src/app/businessidea/tabs/BusinessPlanContent.tsx
  // REPLACE inside onCreatePlan handler
  onCreatePlan={(suggestion) => {
    createPlanConversation(suggestion);
    openChatbox('business-suggestion');
  }}
  ```

- Execution Flow & Integration Points
  - Button click → `setActiveTab('list')` and `createPlanConversation()`.
  - Chatbox starts outline then full plan streaming; assistant message grows.
  - `ListTab` mounts; `useSyncPlanFromChatbox()` detects active conversation and mirrors chunks into `ImplementationPlanProvider` (`appendRaw`, `setStatus('streaming')`).
  - `ListTab` shows the same preview stream. On Chatbox completion, hook finalizes streaming; if JSON detected, it sets `plan` and `status: success`.

- Performance, Error Handling, Maintainability
  - Delta appends avoid reprocessing the entire content.
  - Errors in Chatbox propagate to List tab state.
  - Hook is self-contained and tab-scoped; no provider API changes.

4) Architecture Diagram (Mermaid)

```mermaid
flowchart TD
  A[SuggestionCard onClick] --> B[useTab.setActiveTab('list')]
  A --> C[useChatbox.createPlanConversation]
  C --> D[generatePlanOutline]
  D --> E[generateFullPlan (concise overview)]
  E -->|onChunk| F[appendToConversationMessage]
  F --> G[ChatboxPanel renders]

  B --> H[ListTab]
  H --> I[useSyncPlanFromChatbox]
  I --> J[ImplementationPlanProvider.appendRaw/streamingState]
  J --> H
```

5) Testing Plan

- Unit Tests
  - Hook: given simulated Chatbox state with a growing assistant message, verify `appendRaw` receives only deltas; on completion, `streamingState` becomes complete and, if JSON present, `plan` is set.
  - Prompt change: verify `generateFullPlan()` caps `max_tokens` at ≤300 and system message enforces plain text. Snapshot tests on prompt string.

- Integration Tests
  - Click-through: clicking “Create Implementation Plan” shows streaming preview in `ChatboxPanel` and the same preview in `ListTab` without calling `useImplementationPlan.generate()`.
  - Error propagation: simulate Chatbox error → `ListTab` shows error state with retry disabled (since Chatbox owns generation).
  - Rapid clicks: multiple conversations created; hook mirrors only the active conversation.

- Edge Cases
  - Missing API key/model: Chatbox `status='error'` → `ListTab` reflects error and stops syncing.
  - Very short outputs: ensure no infinite loops when content length doesn’t change.
  - User navigates away from List tab: hook unmounts; no leaks.

- Acceptance Criteria
  - Chatbox output becomes a concise 3–4 sentence overview (no headers/emojis/lists).
  - List tab shows the exact same stream in near real time without initiating its own LLM request.
  - No regressions in existing List tab success rendering when a JSON plan exists.

6) Security & Compliance

- No secrets in code; rely on Chatbox config for OpenRouter API key/model.
- Reduced `max_tokens` lowers cost exposure.
- No new external dependencies introduced.

7) Final Checklist

- [ ] Update `generateFullPlan()` prompt and `max_tokens`.
- [ ] Add `use-sync-plan-from-chatbox.ts` hook.
- [ ] Import and call the hook in `ListTab.tsx`.
- [ ] Optional: call `openChatbox('business-suggestion')` in `BusinessPlanContent.tsx`.
- [ ] Manual test the end-to-end flow (streaming mirror, errors, tab switching).
- [ ] Add unit/integration tests.

8) Suggested Enhancements (Optional)

- Summary-only status: extend `PlanStatus` with `summary` so ListTab can show a polished summary view when no JSON plan is present.
- Structured fence: update Chatbox prompt to append a tiny JSON object (e.g., `{ "summary": "..." }`) after the plain-text overview to allow deterministic parsing and `success` state without a full plan.
- Cache linking: when Chatbox completes, write a cache entry keyed by `ideaId` so revisiting List tab can rehydrate preview without re-streaming.
