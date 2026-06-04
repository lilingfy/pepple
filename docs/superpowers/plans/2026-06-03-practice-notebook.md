# Practice Notebook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first-version practice notebook: translator saves complete decode cases, `/me/practice` lists and filters saved cases, and users can view, favorite, and archive entries.

**Architecture:** Keep the existing `practice_entries` table and `contentJsonb` storage. Extend shared/frontend types and practice client contracts, then add focused notebook UI components under `components/practice` and a route at `app/(main)/me/practice/page.tsx`.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Zustand user-center store, existing REST API routes, Vitest + Testing Library.

---

## File Structure

- Modify `apps/web/types/translator.ts`: extend `PracticeRequest` content shape with `surfaceMeaning`, `emotionStatus`, `relationId`, and `relationName`.
- Modify `apps/web/lib/frontend/practice-client.ts`: return created entries, add list/get/update helpers.
- Modify `apps/web/app/api/practice/route.ts`: preserve new decode fields when creating entries.
- Modify `apps/web/lib/backend/services/practice-service.ts`: accept and persist the complete decode content.
- Modify `apps/web/app/(main)/translator/page.tsx`: send complete decode content and current relation metadata; show a “查看” link after saving.
- Create `apps/web/components/practice/PracticeEntryCard.tsx`: polished list card.
- Create `apps/web/components/practice/PracticeFilterBar.tsx`: top filter controls.
- Create `apps/web/components/practice/PracticeEntryDrawer.tsx`: accessible detail drawer.
- Create `apps/web/components/practice/PracticeStates.tsx`: empty/loading/error states.
- Create `apps/web/app/(main)/me/practice/page.tsx`: route-level page and local state.
- Modify `apps/web/app/(main)/me/page.tsx`: add notebook entry point alongside feature shortcuts.
- Tests: add/update `practice-client`, `bottom-action-buttons`/translator save, notebook page/component tests.

## Task 1: Practice Types and Client Contracts

**Files:**
- Modify: `apps/web/types/translator.ts`
- Modify: `apps/web/lib/frontend/practice-client.ts`
- Test: `apps/web/tests/frontend/practice-client.test.ts`

- [ ] **Step 1: Write failing client tests**

Add tests that assert `savePractice()` returns the created entry and list/update/get helpers call the expected endpoints.

- [ ] **Step 2: Run failing tests**

Run: `npm exec vitest run tests/frontend/practice-client.test.ts`
Expected: failures for missing return value and missing helper exports.

- [ ] **Step 3: Extend types**

Update `PracticeRequest.content` in `apps/web/types/translator.ts` so decode content supports:

```ts
surfaceMeaning?: string;
analysis?: {
  attackType?: string;
  scenario?: string;
  subtext?: string;
  emotionScore?: number;
  neutralityScore?: number;
  emotionStatus?: string;
};
relationId?: string;
relationName?: string;
```

- [ ] **Step 4: Implement practice client helpers**

`savePractice(request)` should parse `{ success, data }` and return the created entry. Add `listPracticeEntries(filters)`, `getPracticeEntry(id)`, and `updatePracticeEntry(id, updates)` using the existing API shape.

- [ ] **Step 5: Verify**

Run: `npm exec vitest run tests/frontend/practice-client.test.ts`
Expected: all practice client tests pass.

## Task 2: Backend Decode Practice Persistence

**Files:**
- Modify: `apps/web/app/api/practice/route.ts`
- Modify: `apps/web/lib/backend/services/practice-service.ts`
- Test: `apps/web/tests/backend/practice.test.ts`

- [ ] **Step 1: Write failing backend tests**

Add a POST decode test that sends `surfaceMeaning`, `analysis.emotionStatus`, `relationId`, and `relationName`, then asserts the created entry content preserves those exact fields and `primaryReply` equals the selected reply content.

- [ ] **Step 2: Run failing backend tests**

Run: `npm exec vitest run tests/backend/practice.test.ts`
Expected: missing fields in saved content.

- [ ] **Step 3: Preserve decode fields in route/service**

Pass `surfaceMeaning`, `selectedReplyId`, `relationId`, `relationName`, and `analysis.emotionStatus` through `createFromDecode()`. Persist `selectedReplyId` at the root of `contentJsonb`.

- [ ] **Step 4: Verify**

Run: `npm exec vitest run tests/backend/practice.test.ts`
Expected: backend practice tests pass.

## Task 3: Translator Save Payload and “查看” Link

**Files:**
- Modify: `apps/web/app/(main)/translator/page.tsx`
- Test: existing translator/bottom action tests or add `apps/web/tests/frontend/translator-save-practice.test.tsx`

- [ ] **Step 1: Write failing frontend save test**

Mock a selected relation in `useUserCenterStore`, perform save after choosing a reply, and assert `savePractice` receives `surfaceMeaning`, `analysis.emotionStatus`, `relationId`, and `relationName`.

- [ ] **Step 2: Run failing test**

Run: `npm exec vitest run tests/frontend/translator-save-practice.test.tsx tests/frontend/bottom-action-buttons.test.tsx`
Expected: missing fields and no “查看” link.

- [ ] **Step 3: Implement payload and post-save link**

Include current relation metadata from `useUserCenterStore`. Store the returned practice entry id from `savePractice()` and render a lightweight link to `/me/practice?entry=<id>` after successful save.

- [ ] **Step 4: Verify**

Run: `npm exec vitest run tests/frontend/translator-save-practice.test.tsx tests/frontend/bottom-action-buttons.test.tsx`
Expected: tests pass.

## Task 4: Notebook Page Components

**Files:**
- Create: `apps/web/components/practice/PracticeEntryCard.tsx`
- Create: `apps/web/components/practice/PracticeFilterBar.tsx`
- Create: `apps/web/components/practice/PracticeEntryDrawer.tsx`
- Create: `apps/web/components/practice/PracticeStates.tsx`
- Test: `apps/web/tests/frontend/practice-components.test.tsx`

- [ ] **Step 1: Write failing component tests**

Cover card rendering, accessible favorite/archive buttons, filter selection state, detail drawer role/title, Esc close, and empty/loading/error states.

- [ ] **Step 2: Run failing component tests**

Run: `npm exec vitest run tests/frontend/practice-components.test.tsx`
Expected: components not found.

- [ ] **Step 3: Implement components**

Use Pebble visual language: `fluid-bg` page context, translucent white/pebble-glass cards, rounded organic corners, gentle green/blue/gold accents. Favorite uses warm gold; archive uses gray-blue; emotion score uses a rounded pill.

- [ ] **Step 4: Verify**

Run: `npm exec vitest run tests/frontend/practice-components.test.tsx`
Expected: component tests pass.

## Task 5: `/me/practice` Route

**Files:**
- Create: `apps/web/app/(main)/me/practice/page.tsx`
- Test: `apps/web/tests/frontend/practice-page.test.tsx`

- [ ] **Step 1: Write failing page tests**

Mock practice client helpers. Assert the page loads unarchived decode entries by default, supports filters, shows “加载更多” when `hasMore`, archives after success, reverts favorite on failure, opens details for `?entry=<id>`, and shows not-found message for missing entries.

- [ ] **Step 2: Run failing page tests**

Run: `npm exec vitest run tests/frontend/practice-page.test.tsx`
Expected: route/component missing.

- [ ] **Step 3: Implement route**

Use local React state and practice client helpers. Desktop shows a responsive grid; mobile naturally stacks cards. Use drawer for details and respect `?entry=<id>`.

- [ ] **Step 4: Verify**

Run: `npm exec vitest run tests/frontend/practice-page.test.tsx`
Expected: page tests pass.

## Task 6: `/me` Notebook Entry Point

**Files:**
- Modify: `apps/web/app/(main)/me/page.tsx`
- Test: `apps/web/tests/frontend/me-page.test.tsx`

- [ ] **Step 1: Write failing test**

Assert `/me` renders a clear “练习本” entry point linking to `/me/practice` alongside feature shortcuts.

- [ ] **Step 2: Run failing test**

Run: `npm exec vitest run tests/frontend/me-page.test.tsx`
Expected: missing link.

- [ ] **Step 3: Implement entry point**

Add a visually consistent card/link using the same healing style as existing shortcuts. Do not repurpose the “关系档案” statistic.

- [ ] **Step 4: Verify**

Run: `npm exec vitest run tests/frontend/me-page.test.tsx`
Expected: tests pass.

## Task 7: Final Verification

**Files:** all touched files.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-client.test.ts tests/backend/practice.test.ts tests/frontend/translator-save-practice.test.tsx tests/frontend/practice-components.test.tsx tests/frontend/practice-page.test.tsx tests/frontend/me-page.test.tsx
```

Expected: all pass.

- [ ] **Step 2: Typecheck**

Run: `npm exec tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Inspect diff**

Run: `git diff -- apps/web docs/superpowers/specs/2026-06-03-practice-notebook-design.md docs/superpowers/plans/2026-06-03-practice-notebook.md`
Expected: only intended notebook-related changes.

---

## Self-Review

- Spec coverage: schema, API, translator save, notebook list/detail/filter/toggles, `/me` entry, accessibility, and tests are covered.
- No git commit steps are included because commits require explicit user request.
- No separate data model is introduced; the plan uses existing `practice_entries` and `contentJsonb`.
