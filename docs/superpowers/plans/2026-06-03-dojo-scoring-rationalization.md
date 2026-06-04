# Dojo Scoring Rationalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the simulated practice scoring more trustworthy by avoiding opening-message scoring, exposing score source, using multi-dimensional scoring, and showing real analysis text in the UI.

**Architecture:** Keep the existing `/api/simulator` data flow. Extend the existing `rightPanel` DTO with optional `scoreSource` and `scoreBreakdown`, map LLM results into the new structure, and provide a deterministic rule-based fallback with the same shape. The frontend remains backwards-compatible because added fields are optional.

**Tech Stack:** Next.js App Router, TypeScript, Zustand, Vitest, existing LLM provider adapters.

---

### Task 1: Add scoring contract and opening-state behavior

**Files:**
- Modify: `apps/web/types/dojo.ts`
- Modify: `apps/web/lib/backend/services/simulator-service.ts`
- Test: `apps/web/tests/backend/simulator-service-llm.test.ts`

- [ ] Write failing tests asserting `startSession('workplace')` returns `rightPanel.analysisScore === null`, `scoreSource === 'pending'`, and user turns return `scoreSource === 'ai'` when LLM succeeds.
- [ ] Run `npm exec vitest run tests/backend/simulator-service-llm.test.ts` and confirm failures.
- [ ] Update `RightPanel.analysisScore` to `number | null` and add optional `scoreSource: 'pending' | 'ai' | 'rule' | 'fallback'` plus `scoreBreakdown` fields.
- [ ] Update `startSession` to return a pending panel instead of scoring the antagonist opening.
- [ ] Update `mapLLMResult` to set `scoreSource: 'ai'`.
- [ ] Run the backend test and confirm it passes.

### Task 2: Add deterministic multi-dimensional fallback scoring

**Files:**
- Modify: `apps/web/lib/backend/services/simulator-service.ts`
- Test: `apps/web/tests/backend/simulator-service-llm.test.ts`

- [ ] Write failing tests for fallback scoring: a concise boundary reply should score higher than an over-explaining reply; fallback should include `scoreBreakdown` with neutrality, brevity, boundaryClarity, jadeAvoidance, and empathy.
- [ ] Run the backend test and confirm failures.
- [ ] Replace the current `analyzeEmotion` keyword score with a small deterministic rubric using weighted dimensions.
- [ ] Make LLM failure return `scoreSource: 'rule'` and the weighted breakdown.
- [ ] Run the backend test and confirm it passes.

### Task 3: Update LLM prompt and provider fallback shape

**Files:**
- Modify: `apps/web/lib/llm/index.ts`
- Modify: `apps/web/lib/llm/prompts.ts`
- Modify: `apps/web/lib/llm/nvidia.ts`
- Modify: `apps/web/lib/llm/zhipu.ts`
- Test: `apps/web/tests/backend/simulator-service-llm.test.ts`

- [ ] Write a failing test where mocked LLM returns a `scoreBreakdown`, and assert the service preserves it.
- [ ] Update `SimulatorResult` to include optional `coachFeedback.scoreBreakdown`.
- [ ] Update `SIMULATOR_SYSTEM` to request multi-dimensional JSON.
- [ ] Update NVIDIA/Zhipu parse fallback objects to include a neutral `scoreBreakdown`.
- [ ] Run backend test and confirm it passes.

### Task 4: Update frontend display to use real analysis and source labels

**Files:**
- Modify: `apps/web/components/dojo/EmotionScoreCard.tsx`
- Modify: `apps/web/lib/frontend/simulator-client.ts`
- Test: `apps/web/tests/frontend/dojo-scoring-ui.test.tsx`

- [ ] Write failing UI tests asserting pending state shows “等待你的第一句回应后开始评分”, AI source shows “AI 教练评分”, rule source shows “基础规则评分”, and `analysisSummary` text appears verbatim.
- [ ] Update client fallback panels to set `scoreSource: 'fallback'` and `scoreBreakdown` when needed.
- [ ] Update `EmotionScoreCard` to handle `null` score, show source label, show real summary, and optionally list dimensions.
- [ ] Run the UI test and confirm it passes.

### Task 5: Verify integration

**Files:**
- No new files.

- [ ] Run `npm exec vitest run tests/backend/simulator-service-llm.test.ts tests/frontend/simulator-client.test.ts tests/frontend/dojo-scoring-ui.test.tsx`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev` and manually verify `/dojo?scenarioId=relationship` shows pending score before the user replies, then source-labeled scoring after a reply.

---

## Self-Review

- Spec coverage: covers pending opening, source visibility, multi-dimensional scoring, real UI summary, and verification.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: `scoreSource` and `scoreBreakdown` names are consistent across tasks.
