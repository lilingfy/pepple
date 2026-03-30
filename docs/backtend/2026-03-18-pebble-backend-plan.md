# Pebble Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend BFF for the Pebble second-version front-end HTMLs with stable, validated APIs, persisted practice data, deterministic fallbacks, and clear operational boundaries.

**Architecture:** Keep Next.js route handlers thin. Put business logic in focused service modules, data access in repositories, and cross-cutting concerns in small policy helpers. Use shared DTOs and runtime validation so API contracts are explicit. Store durable user-facing data in PostgreSQL, keep front-end IndexedDB as a cache only, and make all LLM calls degrade to deterministic local behavior when providers fail.

**Tech Stack:** Next.js 15 Route Handlers, TypeScript 5 strict mode, Drizzle ORM, PostgreSQL/Neon, Supabase Auth session binding, Zod validation, Vitest for backend unit tests, OpenAPI for contract documentation.

**Source of Truth Front-End:**

- `/Users/xyh/Code/pebble/pebble_translator（(第二版）.html`
- `/Users/xyh/Code/pebble/pebble_dojo(第二版）.html`
- `/Users/xyh/Code/pebble/pebble_breathing（第二版）.html`

**Non-Goals for This Plan:**

- Do not change front-end source in this phase.
- Do not add a separate backend service outside `apps/web`.
- Do not add a breathing backend endpoint unless telemetry is explicitly required later.

---

## File Map

### Create

- `docs/backtend/2026-03-18-pebble-backend-plan.md`
- `docs/backtend/openapi.yaml`
- `packages/types/src/backend.ts`
- `apps/web/lib/backend/contracts.ts`
- `apps/web/lib/backend/errors.ts`
- `apps/web/lib/backend/http.ts`
- `apps/web/lib/backend/session.ts`
- `apps/web/lib/backend/rate-limit.ts`
- `apps/web/lib/backend/pii.ts`
- `apps/web/lib/backend/timeouts.ts`
- `apps/web/lib/backend/decode/decode-service.ts`
- `apps/web/lib/backend/decode/prompt.ts`
- `apps/web/lib/backend/decode/rules.ts`
- `apps/web/lib/backend/simulator/scenario-catalog.ts`
- `apps/web/lib/backend/simulator/simulator-scorer.ts`
- `apps/web/lib/backend/simulator/simulator-responder.ts`
- `apps/web/lib/backend/simulator/simulator-summary.ts`
- `apps/web/lib/backend/simulator/simulator-service.ts`
- `apps/web/lib/backend/practice/practice-service.ts`
- `apps/web/lib/backend/repositories/analysis-repository.ts`
- `apps/web/lib/backend/repositories/practice-repository.ts`
- `apps/web/lib/backend/repositories/simulation-repository.ts`
- `apps/web/lib/backend/repositories/session-repository.ts`
- `apps/web/app/api/scenarios/route.ts`
- `apps/web/app/api/simulator/[sessionId]/end/route.ts`
- `apps/web/app/api/practice/route.ts`
- `apps/web/app/api/practice/[practiceId]/route.ts`
- `apps/web/tests/backend/schema.test.ts`
- `apps/web/tests/backend/contracts.test.ts`
- `apps/web/tests/backend/errors.test.ts`
- `apps/web/tests/backend/session.test.ts`
- `apps/web/tests/backend/decode-service.test.ts`
- `apps/web/tests/backend/decode-route.test.ts`
- `apps/web/tests/backend/scenarios-route.test.ts`
- `apps/web/tests/backend/simulator-service.test.ts`
- `apps/web/tests/backend/simulator-route.test.ts`
- `apps/web/tests/backend/practice-service.test.ts`
- `apps/web/tests/backend/analysis-repository.test.ts`
- `apps/web/tests/backend/practice-repository.test.ts`
- `apps/web/tests/backend/simulation-repository.test.ts`
- `apps/web/tests/backend/session-repository.test.ts`
- `apps/web/vitest.config.ts`
- `apps/web/tests/setup.ts`

### Modify

- `packages/types/src/index.ts`
- `apps/web/lib/db/schema.ts`
- `apps/web/lib/db/index.ts`
- `apps/web/lib/llm/index.ts`
- `apps/web/lib/llm/prompts.ts`
- `apps/web/lib/llm/zhipu.ts`
- `apps/web/app/api/decode/route.ts`
- `apps/web/app/api/simulator/route.ts`
- `apps/web/middleware.ts`
- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`

### Generate

- `apps/web/drizzle/migrations/<generated>_backend.sql`

---

## Chunk 0: Bootstrap the Backend Test Harness

Vitest must exist before any red-green cycle can work. Set up the runner first, then every later task can use a real failure state instead of failing on missing tooling.

### Task 1: Add the backend test harness

**Files:**

- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/tests/setup.ts`
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add the Vitest dependency and scripts**

Add `vitest` to `apps/web` devDependencies. Add a `test:backend` script that runs `vitest run tests/backend` so the package can run backend tests without guessing paths.

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: the lockfile updates cleanly and `vitest` is available in `apps/web`.

- [ ] **Step 3: Write the minimal configuration**

Create a Node-based Vitest config with a `tests/backend/**/*.test.ts` include pattern and a shared setup file. Keep the config isolated from browser test concerns.

- [ ] **Step 4: Verify the runner is available**

Run:

```bash
pnpm --filter @pebble/web vitest --version
```

Expected: Vitest prints a version string without module-resolution errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/vitest.config.ts apps/web/tests/setup.ts apps/web/package.json pnpm-lock.yaml
git commit -m "chore(test): add backend test harness"
```

---

## Chunk 1: Freeze Contracts and Response Shapes

The second-version HTMLs define the public UX. The backend contract must match those widgets directly:

- Translator page needs surface meaning, subtext, emotion detection state, three reply suggestions, copy/save support, and an internal-only safety envelope.
- Simulator page needs scenario metadata, seeded history, turn-by-turn replies, live score feedback, coaching tips, restart semantics, and end-of-session summaries.
- Breathing page is self-contained and should not require a backend dependency.

### Task 1: Define shared backend DTOs

**Files:**

- Create: `packages/types/src/backend.ts`
- Modify: `packages/types/src/index.ts`
- Test: `apps/web/tests/backend/contracts.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that assert:

- decode request rejects empty strings and overlong payloads.
- decode response exposes `surfaceMeaning`, `subtext`, `emotionStatus`, `emotionScore`, and three ordered `replySuggestions` with `key` and `text`.
- simulator request rejects unknown `scenarioId` values.
- simulator response exposes `action`, `sessionId`, `scenario`, `history`, `rightPanel`, and `nextAttack`, and `rightPanel` exposes `analysisScore`, `analysisLabel`, `analysisSummary`, `instantFeedback`, and `attentionPoint`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/contracts.test.ts -v`

Expected: schema and type imports fail until the DTO module exists.

- [ ] **Step 3: Write the minimal implementation**

Create the shared DTOs in `packages/types/src/backend.ts` and export them from `packages/types/src/index.ts`. Keep request and response types separate.

- `ReplySuggestion`: `key`, `text`
- `DecodeResponseV2`: `analysisId`, `surfaceMeaning`, `subtext`, `emotionStatus`, `emotionScore`, `replySuggestions`
- `SimulatorRightPanelV2`: `analysisScore`, `analysisLabel`, `analysisSummary`, `instantFeedback`, `attentionPoint`
- `SimulatorSessionSnapshotV2`: `action`, `sessionId`, `scenario`, `history`, `rightPanel`, `nextAttack`
- `ScenarioCard`: `id`, `categoryId`, `title`, `psychologyContext`, `goal`, `tips`, `seededHistory`, `sortOrder`
- `PracticeEntry`: `source`, `sourceId`, `title`, `summary`, `primaryReply`, `replySuggestions`, `snapshot`, `tags`, `favorite`, `archived`, `createdAt`
- `ApiErrorBody`: `code`, `message`, `details`

Keep safety metadata internal to the service layer instead of widening the public DTO.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/contracts.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/types/src/backend.ts packages/types/src/index.ts apps/web/tests/backend/contracts.test.ts
git commit -m "feat(contracts): add shared backend DTOs"
```

### Task 2: Add runtime validation and HTTP helpers

**Files:**

- Create: `apps/web/lib/backend/contracts.ts`
- Create: `apps/web/lib/backend/errors.ts`
- Create: `apps/web/lib/backend/http.ts`
- Test: `apps/web/tests/backend/errors.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that assert:

- invalid JSON is mapped to `400`.
- validation errors become a stable machine-readable payload.
- unexpected provider failures become `502` or `503` with no raw stack leak.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/errors.test.ts -v`

Expected: helper imports fail until the module exists.

- [ ] **Step 3: Write the minimal implementation**

Implement Zod schemas for request validation, a typed `AppError` hierarchy, and a small `jsonOk/jsonError` helper that route handlers can reuse.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/errors.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/contracts.ts apps/web/lib/backend/errors.ts apps/web/lib/backend/http.ts apps/web/tests/backend/errors.test.ts
git commit -m "feat(backend): add validation and error helpers"
```

---

## Chunk 2: Persistence, Session Identity, and Audit Boundaries

The product should persist user-visible data on the server while keeping sensitive content tightly controlled.

### Task 1: Add anonymous session identity

**Files:**

- Create: `apps/web/lib/backend/session.ts`
- Create: `apps/web/tests/backend/session.test.ts`
- Modify: `apps/web/middleware.ts`

- [ ] **Step 1: Write the failing test**

Add tests for:

- cookie creation when no session cookie exists.
- cookie reuse when the same request returns again.
- secure attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, long-lived expiry.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/session.test.ts -v`

Expected: helper and cookie parsing assertions fail until the module exists.

- [ ] **Step 3: Write the minimal implementation**

Generate a `guest_session_id` cookie for anonymous usage, expose helpers to read or create it, and keep Supabase Auth binding optional. Do not force login for the current front-end.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/session.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/session.ts apps/web/tests/backend/session.test.ts apps/web/middleware.ts
git commit -m "feat(backend): add anonymous session identity"
```

### Task 2: Expand the database schema for backend persistence

**Files:**

- Modify: `apps/web/lib/db/schema.ts`
- Modify: `apps/web/lib/db/index.ts`
- Generate: `apps/web/drizzle/migrations/<generated>_backend.sql`

- [ ] **Step 1: Write the failing test**

Add a schema smoke test that proves the new tables or columns are not available yet. Keep the test focused on exported schema shape, not raw SQL.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/schema.test.ts -v`

Expected: insert and query helpers fail because the new tables do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Add or extend tables for:

- `analysis_logs` metadata with session binding and result snapshot support.
- `practice_entries` for saved translator replies and coach tips.
- `simulation_sessions` with summary and status fields.
- `guest_sessions` for anonymous session binding.
- keep `panic_sessions` for future telemetry, but do not wire a runtime dependency to it in v1.

Prefer JSONB for structured snapshots that are read infrequently. Keep raw sensitive text encrypted or redacted before persistence.

- [ ] **Step 4: Generate and apply the migration**

Run:

```bash
pnpm --filter @pebble/web db:generate
pnpm --filter @pebble/web db:migrate
```

Expected: migration files appear under `apps/web/drizzle/migrations/` and schema sync succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/db/schema.ts apps/web/lib/db/index.ts apps/web/drizzle/migrations
git commit -m "feat(db): add backend persistence tables"
```

### Task 3: Build the analysis repository wrapper

**Files:**

- Create: `apps/web/lib/backend/repositories/analysis-repository.ts`
- Test: `apps/web/tests/backend/analysis-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify the analysis repository inserts sanitized payloads, returns typed records, and only exposes the fields needed by the decode flow.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/analysis-repository.test.ts -v`

Expected: repository imports fail until the wrapper exists.

- [ ] **Step 3: Write the minimal implementation**

Wrap Drizzle queries in one file for analysis records only. Keep SQL out of route handlers. Add small mapping functions from DB rows to API DTOs.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/analysis-repository.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/repositories/analysis-repository.ts apps/web/tests/backend/analysis-repository.test.ts
git commit -m "feat(backend): add analysis repository"
```

### Task 4: Build the practice repository wrapper

**Files:**

- Create: `apps/web/lib/backend/repositories/practice-repository.ts`
- Test: `apps/web/tests/backend/practice-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify the practice repository saves decode and simulator snapshots, preserves ordering, and supports archive and favorite flags.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-repository.test.ts -v`

Expected: repository imports fail until the wrapper exists.

- [ ] **Step 3: Write the minimal implementation**

Wrap Drizzle queries in one file for practice records only. Keep the save contract aligned to the `practice` API payload.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-repository.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/repositories/practice-repository.ts apps/web/tests/backend/practice-repository.test.ts
git commit -m "feat(practice): add repository wrapper"
```

### Task 5: Build the simulation repository wrapper

**Files:**

- Create: `apps/web/lib/backend/repositories/simulation-repository.ts`
- Test: `apps/web/tests/backend/simulation-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify the simulation repository stores session metadata, turn snapshots, and end-of-session summaries without leaking raw provider exceptions.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulation-repository.test.ts -v`

Expected: repository imports fail until the wrapper exists.

- [ ] **Step 3: Write the minimal implementation**

Keep the simulation repository focused on session lifecycle data. Do not mix practice persistence into this wrapper.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulation-repository.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/repositories/simulation-repository.ts apps/web/tests/backend/simulation-repository.test.ts
git commit -m "feat(simulator): add repository wrapper"
```

### Task 6: Build the session repository wrapper

**Files:**

- Create: `apps/web/lib/backend/repositories/session-repository.ts`
- Test: `apps/web/tests/backend/session-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify anonymous guest sessions are created once, reused when present, and can be bound to a Supabase Auth user later.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/session-repository.test.ts -v`

Expected: repository imports fail until the wrapper exists.

- [ ] **Step 3: Write the minimal implementation**

Keep this repository limited to guest-session lookup, insert, and account binding.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/session-repository.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/repositories/session-repository.ts apps/web/tests/backend/session-repository.test.ts
git commit -m "feat(session): add session repository wrapper"
```

---

## Chunk 3: Decode Pipeline for the Translator Page

The translator HTML uses one input box, one decode action, one emotional state display, three reply cards, copy support, and save-to-practice behavior. The backend must return a single normalized decode payload that directly feeds those sections.

### Task 1: Split decode into service, prompt, and rules modules

**Files:**

- Create: `apps/web/lib/backend/decode/decode-service.ts`
- Create: `apps/web/lib/backend/decode/prompt.ts`
- Create: `apps/web/lib/backend/decode/rules.ts`
- Create: `apps/web/lib/backend/pii.ts`
- Create: `apps/web/lib/backend/timeouts.ts`
- Modify: `apps/web/lib/llm/index.ts`
- Modify: `apps/web/lib/llm/prompts.ts`
- Modify: `apps/web/lib/llm/zhipu.ts`
- Test: `apps/web/tests/backend/decode-service.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that assert:

- PII redaction removes phone numbers, emails, and obvious names before provider calls.
- local fallback returns deterministic JSON when the provider is unavailable.
- provider JSON parsing rejects malformed content and falls back safely.
- the returned decode payload includes `surfaceMeaning`, `subtext`, `emotionStatus`, `emotionScore`, and three ordered reply suggestions.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-service.test.ts -v`

Expected: service exports are missing until the modules exist.

- [ ] **Step 3: Write the minimal implementation**

Move the business logic into `decode-service.ts`. Keep provider adapters in `apps/web/lib/llm`. Use a deterministic local rules engine as the fallback path, not a random mock. Normalize all responses to the v2 translator schema. Keep the public response limited to the visible translator fields, and keep any extra safety metadata internal to the service or audit log.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-service.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/decode apps/web/lib/backend/pii.ts apps/web/lib/backend/timeouts.ts apps/web/lib/llm/index.ts apps/web/lib/llm/prompts.ts apps/web/lib/llm/zhipu.ts apps/web/tests/backend/decode-service.test.ts
git commit -m "feat(decode): extract backend decode pipeline"
```

### Task 2: Refactor the decode route into a thin adapter

**Files:**

- Modify: `apps/web/app/api/decode/route.ts`
- Modify: `apps/web/lib/backend/contracts.ts`
- Modify: `apps/web/lib/backend/errors.ts`
- Test: `apps/web/tests/backend/decode-route.test.ts`

- [ ] **Step 1: Write the failing test**

Add route tests that verify:

- empty payloads return `400`.
- invalid JSON returns `400`.
- successful responses have the normalized v2 shape.
- provider failures return a stable fallback response and a safe status code.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-route.test.ts -v`

Expected: route import or contract mismatches fail until the adapter is refactored.

- [ ] **Step 3: Write the minimal implementation**

Keep the route handler small. Parse input, validate it, call the decode service, persist the analysis summary, and map errors through the shared HTTP helper.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-route.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/api/decode/route.ts apps/web/tests/backend/decode-route.test.ts
git commit -m "refactor(api): thin decode route adapter"
```

---

## Chunk 4: Simulator Pipeline for the Practice Dojo Page

The dojo HTML is a three-column layout: scenario selector and guidance on the left, chat in the center, and live scoring plus coaching on the right. The backend must provide stable scenario data, explicit session lifecycle actions, right-panel state that mirrors the visible cards, and end-of-session summaries.

### Task 1: Create a typed scenario catalog

**Files:**

- Create: `apps/web/lib/backend/simulator/scenario-catalog.ts`
- Modify: `apps/web/app/api/simulator/route.ts`
- Create: `apps/web/app/api/scenarios/route.ts`
- Test: `apps/web/tests/backend/scenarios-route.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that assert:

- scenario IDs map to the exact three dojo categories shown in the HTML: `职场越界`, `亲密关系`, and `社交应对`.
- each scenario includes `categoryId`, `title`, the psychology-context copy, goal line, tips, seeded history, and a stable `sortOrder`.
- the scenario list is deterministic and sorted.
- unknown scenario IDs are rejected.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/scenarios-route.test.ts -v`

Expected: catalog imports fail until the typed seed exists.

- [ ] **Step 3: Write the minimal implementation**

Port the static dojo scenarios into a typed catalog module. Keep the values aligned to the HTML text, including category ids, titles, psychology context, goal line, tip text, and seeded chat history. Return the list in a stable sort order.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/scenarios-route.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/simulator/scenario-catalog.ts apps/web/app/api/scenarios/route.ts apps/web/tests/backend/scenarios-route.test.ts
git commit -m "feat(simulator): add scenario catalog"
```

### Task 2: Build the simulator service

**Files:**

- Create: `apps/web/lib/backend/simulator/simulator-scorer.ts`
- Create: `apps/web/lib/backend/simulator/simulator-responder.ts`
- Create: `apps/web/lib/backend/simulator/simulator-summary.ts`
- Create: `apps/web/lib/backend/simulator/simulator-service.ts`
- Modify: `apps/web/lib/llm/index.ts`
- Modify: `apps/web/lib/llm/prompts.ts`
- Modify: `apps/web/lib/llm/zhipu.ts`
- Test: `apps/web/tests/backend/simulator-service.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify:

- `startSession` returns `action: "start"`, a stable `sessionId`, the selected scenario, seeded history, `rightPanel.analysisScore`, `rightPanel.analysisLabel`, `rightPanel.analysisSummary`, `rightPanel.instantFeedback`, `rightPanel.attentionPoint`, and `nextAttack`.
- `turnSession` appends the latest message, updates `rightPanel.analysisScore`, `rightPanel.analysisLabel`, `rightPanel.analysisSummary`, `rightPanel.instantFeedback`, and `rightPanel.attentionPoint`, and keeps `nextAttack` scenario-specific.
- `restartSession` resets turn history while preserving the scenario and returns a new `sessionId` with refreshed `rightPanel` fields.
- `endSession` returns a summary with final score, turn count, and visible recap text.
- local fallback scores JADE-like replies deterministically.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulator-service.test.ts -v`

Expected: service imports fail until the implementation exists.

- [ ] **Step 3: Write the minimal implementation**

Keep the simulator service thin and compose it from smaller modules: `simulator-scorer.ts` for score calculation, `simulator-responder.ts` for opponent response generation, `simulator-summary.ts` for recap text, and `simulator-service.ts` for orchestration. Persist only summaries and metadata, not unbounded raw transcripts. Use the provider only after local validation and scoring.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulator-service.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/simulator apps/web/lib/llm/index.ts apps/web/lib/llm/prompts.ts apps/web/lib/llm/zhipu.ts apps/web/tests/backend/simulator-service.test.ts
git commit -m "feat(simulator): add scoring service"
```

### Task 3: Refactor the simulator route and add end-of-session support

**Files:**

- Modify: `apps/web/app/api/simulator/route.ts`
- Create: `apps/web/app/api/simulator/[sessionId]/end/route.ts`
- Modify: `apps/web/lib/backend/errors.ts`
- Test: `apps/web/tests/backend/simulator-route.test.ts`

- [ ] **Step 1: Write the failing test**

Add route tests that verify:

- `action: "start"` returns a session snapshot with seeded history and the explicit `rightPanel` fields: `analysisScore`, `analysisLabel`, `analysisSummary`, `instantFeedback`, and `attentionPoint`.
- `action: "turn"` returns the updated snapshot with the latest turn appended and refreshed `rightPanel` fields.
- `action: "restart"` returns a fresh session snapshot with a new `sessionId` and reset `rightPanel` fields.
- invalid scenario IDs and missing session IDs return `400`.
- ending a session returns a summary with final score, turn count, and recap text.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulator-route.test.ts -v`

Expected: route tests fail until the adapter and end route exist.

- [ ] **Step 3: Write the minimal implementation**

Keep the route thin. Parse the discriminated request shape, call the simulator service, persist the session snapshot, and expose a dedicated end route for the dojo page’s `结束演练` action. Return the visible right-panel fields directly instead of the old generic coach-feedback shape.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/simulator-route.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/api/simulator/route.ts apps/web/app/api/simulator/[sessionId]/end/route.ts apps/web/tests/backend/simulator-route.test.ts
git commit -m "refactor(api): add simulator session routes"
```

---

## Chunk 5: Practice API and Saved Content

The translator HTML has copy and save actions. The backend should expose a single `practice` concept for saved replies and coaching snippets.

### Task 1: Add the practice service and API

**Files:**

- Create: `apps/web/lib/backend/practice/practice-service.ts`
- Create: `apps/web/app/api/practice/route.ts`
- Create: `apps/web/app/api/practice/[practiceId]/route.ts`
- Create: `apps/web/tests/backend/practice-service.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify:

- `POST /api/practice` saves either a translator decode snapshot or a dojo session snapshot under the same `practice` name.
- for decode saves, `primaryReply` defaults to the first reply suggestion and the full three-suggestion set is stored alongside the visible snapshot fields.
- for dojo saves, `primaryReply` is the latest neutral reply or coach-approved reply chosen by the caller.
- `GET /api/practice` returns the user’s saved entries ordered newest first.
- `PATCH /api/practice/[practiceId]` toggles `favorite` and `archived` without corrupting the rest of the list.
- `DELETE /api/practice/[practiceId]` removes the entry only after the caller opts into a hard delete.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-service.test.ts -v`

Expected: imports fail until the practice service exists.

- [ ] **Step 3: Write the minimal implementation**

Keep the practice API small and explicit. Store only the minimum useful snapshot:

- `source` (`decode` or `simulator`)
- `sourceId` (`analysisId` or `sessionId`)
- `title`
- `summary`
- `primaryReply`
- `replySuggestions`
- `snapshot`
- `tags`
- `favorite` or `archived` state
- `createdAt`

For decode saves, `snapshot` should carry `surfaceMeaning`, `subtext`, `emotionStatus`, and `emotionScore`. For dojo saves, `snapshot` should carry `scenarioId`, `analysisScore`, `analysisLabel`, `instantFeedback`, and `attentionPoint`.

`POST /api/practice` should accept the union payload above. `PATCH /api/practice/[practiceId]` should update `favorite` and `archived`. `DELETE /api/practice/[practiceId]` should hard-delete only after the caller explicitly requests removal.

`replySuggestions` should preserve the rendered order. For decode saves, store all three suggestions exactly as shown in the translator UI.

Use the repository layer; do not write SQL inside the route handler.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-service.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/practice apps/web/app/api/practice apps/web/tests/backend/practice-service.test.ts
git commit -m "feat(practice): add saved reply persistence"
```

### Task 2: Add lightweight practice filters for practice summaries

**Files:**

- Modify: `apps/web/lib/db/schema.ts`
- Modify: `apps/web/lib/backend/repositories/practice-repository.ts`
- Test: `apps/web/tests/backend/practice-repository.test.ts`

- [ ] **Step 1: Write the failing test**

Add a repository test proving practice entries can be filtered by kind, tag, favorite state, archived state, and creation date without loading the entire table into memory.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-repository.test.ts -v`

Expected: filtering helpers fail until the repository supports them.

- [ ] **Step 3: Write the minimal implementation**

Add focused filtering helpers only where the UI or reporting needs them. Avoid introducing a large reporting layer now.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/practice-repository.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/db/schema.ts apps/web/lib/backend/repositories/practice-repository.ts apps/web/tests/backend/practice-repository.test.ts
git commit -m "feat(practice): add lightweight filters"
```

---

## Chunk 6: Security, Safety, and Operational Hardening

The product handles emotionally sensitive text. Safety and privacy belong in the backend policy layer, not in route handlers.

### Task 1: Add PII redaction and safety classification

**Files:**

- Create: `apps/web/lib/backend/pii.ts`
- Modify: `apps/web/lib/backend/decode/rules.ts`
- Modify: `apps/web/lib/backend/simulator/simulator-service.ts`
- Test: `apps/web/tests/backend/decode-service.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests that verify:

- phone numbers, emails, and easy identifiers are redacted before logs or provider calls.
- crisis-like content returns a safe response and does not proceed into normal analysis.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-service.test.ts -v`

Expected: safety helpers fail until implemented.

- [ ] **Step 3: Write the minimal implementation**

Keep safety classification deterministic. If the text is high risk, return a guarded response, surface support guidance, and skip the normal provider flow.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/decode-service.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/pii.ts apps/web/lib/backend/decode/rules.ts apps/web/lib/backend/simulator/simulator-service.ts apps/web/tests/backend/decode-service.test.ts
git commit -m "feat(safety): add redaction and crisis guards"
```

### Task 2: Add rate limiting and request timeouts

**Files:**

- Create: `apps/web/lib/backend/rate-limit.ts`
- Create: `apps/web/lib/backend/timeouts.ts`
- Modify: `apps/web/app/api/decode/route.ts`
- Modify: `apps/web/app/api/simulator/route.ts`
- Modify: `apps/web/app/api/practice/route.ts`

- [ ] **Step 1: Write the failing test**

Add tests for per-session throttling and provider timeout fallback.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pebble/web vitest run tests/backend/errors.test.ts -v`

Expected: helper-level assertions fail until the limiter exists.

- [ ] **Step 3: Write the minimal implementation**

Implement a small route-level limiter keyed by session ID and IP fallback. Add a hard timeout around provider calls. If the environment later needs multi-instance throttling, move the limiter backend to Redis without changing route signatures.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @pebble/web vitest run tests/backend/errors.test.ts -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/backend/rate-limit.ts apps/web/lib/backend/timeouts.ts apps/web/app/api/decode/route.ts apps/web/app/api/simulator/route.ts apps/web/app/api/practice/route.ts
git commit -m "feat(backend): add safety limits"
```

---

## Chunk 7: Tooling, OpenAPI, and Verification

The backend plan is not complete until it is testable and documented.

### Task 1: Write the OpenAPI contract and run final verification

**Files:**

- Create: `docs/backtend/openapi.yaml`
- Modify: `docs/backtend/2026-03-18-pebble-backend-plan.md`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Write the failing test**

Validate the generated OpenAPI file against the DTOs and make sure each public route has request and response examples.
Cover `POST /api/decode`, `POST /api/simulator`, `POST /api/simulator/[sessionId]/end`, `GET /api/scenarios`, `POST /api/practice`, `PATCH /api/practice/[practiceId]`, and `DELETE /api/practice/[practiceId]`.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm exec redocly lint docs/backtend/openapi.yaml
pnpm --filter @pebble/web type-check
pnpm --filter @pebble/web vitest run tests/backend
pnpm --filter @pebble/web db:generate
```

Expected: one or more commands fail until the implementation is complete.

- [ ] **Step 3: Write the minimal implementation**

Document the public backend surface in OpenAPI, list the error responses, and confirm the plan’s file boundaries still hold after implementation. Add `@redocly/cli` to the root devDependencies if it is not already installed.

- [ ] **Step 4: Run the final verification**

Run:

```bash
pnpm exec redocly lint docs/backtend/openapi.yaml
pnpm --filter @pebble/web type-check
pnpm --filter @pebble/web vitest run tests/backend
pnpm --filter @pebble/web db:generate
pnpm --filter @pebble/web db:migrate
```

Expected: PASS with no schema drift.

- [ ] **Step 5: Commit**

```bash
git add docs/backtend/openapi.yaml docs/backtend/2026-03-18-pebble-backend-plan.md package.json pnpm-lock.yaml
git commit -m "docs(backend): finalize backend plan and openapi"
```

---

## Implementation Notes

- Keep route handlers under roughly 60 lines by pushing logic into services.
- Keep one file, one responsibility. If a file starts mixing validation, persistence, and provider calls, split it.
- Prefer deterministic fallback logic over opaque mocks.
- Persist the minimum necessary sensitive data and redact before logs.
- Use typed mapping functions at every boundary between DB rows, service results, and API DTOs.
- Do not introduce a second backend stack or separate service process until the monorepo outgrows the current BFF shape.
