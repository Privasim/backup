// File: src/features/implementation-plan/__tests__/promptBuilder.spec.ts
import { buildTextPrompts } from '@/features/implementation-plan/promptBuilder';

describe('promptBuilder system prompt enforcement', () => {
  function makeSystemPrompt(lengthPreset: 'brief' | 'standard' | 'long' = 'long') {
    const { systemPrompt } = buildTextPrompts({
      suggestion: {},
      lengthPreset,
    } as any);
    return systemPrompt;
  }

  test('enforces exact three phase names and order', () => {
    const p = makeSystemPrompt();
    expect(p).toContain('• Phase 1 - Building');
    expect(p).toContain('• Phase 2 - Marketing');
    expect(p).toContain('• Phase 3 - Feedback and Iteration');
    expect(p).toMatch(/Produce EXACTLY 3 phases/i);
    expect(p).toMatch(/Never rename, reorder, add, or remove phases/i);
  });

  test('fixes timelines per phase', () => {
    const p = makeSystemPrompt();
    expect(p).toMatch(/Phase 1 - Building[\s\S]*Timeline MUST be 7-14 days/i);
    expect(p).toMatch(/Phase 2 - Marketing.*Timeline MUST be 14-30 days/i);
    expect(p).toMatch(/Phase 3 - Feedback and Iteration.*Timeline MUST be 30-60 days/i);
  });

  test('phase 1 description requires product description, PRD and Tech Specs', () => {
    const p = makeSystemPrompt();
    expect(p).toMatch(/3–4 sentence product description/i);
    expect(p).toMatch(/PRD \(concise bullets\): Problem, Target users, Core features\/scope, Success metrics/i);
    expect(p).toMatch(/Tech Specs \(concise bullets\): stack, high-level architecture, data model, APIs, infra\/deployment/i);
    expect(p).toMatch(/Keep PRD and Tech Specs inside the Description section/i);
  });

  test('no mock data rule is present', () => {
    const p = makeSystemPrompt();
    expect(p).toMatch(/No mock data/i);
    expect(p).toMatch(/If information is unknown, write "TBD"/i);
  });

  test('example template uses exact names and correct timelines', () => {
    const p = makeSystemPrompt();
    expect(p).toMatch(/Phase 1 - Building[\s\S]*Timeline: 7-14 days/i);
    expect(p).toMatch(/Phase 2 - Marketing[\s\S]*Timeline: 14-30 days/i);
    expect(p).toMatch(/Phase 3 - Feedback and Iteration[\s\S]*Timeline: 30-60 days/i);
  });

  test('brief length preset still enforces phase 1 minimum and fixed timelines', () => {
    const p = makeSystemPrompt('brief');
    expect(p).toMatch(/Minimum 3 sentences for product description/i);
    expect(p).toMatch(/Timelines are FIXED per phase/i);
  });
});
