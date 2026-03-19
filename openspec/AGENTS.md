# OpenSpec Working Guide

## Purpose

This file mirrors the project context and artifact rules defined in [config.yaml](/Users/xyh/Code/pebble/openspec/config.yaml) so OpenSpec work does not depend on implicit memory.

## Project Context

- Project: Pebble AI Emotion Defense Assistant
- Code name: `pebble-ai`
- Goal: deliver a production-grade `Next.js 15 + TypeScript` app from the approved design sources and drive work through OpenSpec.
- Core stack: `Next.js 15`, `React 19`, `TypeScript 5`, `Tailwind CSS 4`, `Framer Motion 11`, `Zustand 5`, `Immer 10`, `shadcn/ui`

## Source Of Truth

- Frontend source of truth:
  - `/Users/xyh/Code/pebble/pebble_breathing（第二版）.html`
  - `/Users/xyh/Code/pebble/pebble_dojo(第二版）.html`
  - `/Users/xyh/Code/pebble/pebble_translator（(第二版）.html`
- Backend must adapt to those frontends.
- Do not change frontend contracts to hide backend design problems.

## Taskbook Map

- `TB-005`: design system and component library
- `TB-001`: home page
- `TB-002`: translator
- `TB-003`: dojo
- `TB-004`: breathing
- `TB-006`: backend BFF and interfaces

Taskbooks:
- `/Users/xyh/Code/pebble/docs/taskbook/00-任务书总览.md`
- `/Users/xyh/Code/pebble/docs/taskbook/01-项目概述与索引.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-001-首页模块技术预研.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-002-读心翻译器技术预研.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-003-模拟陪练场技术预研.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-004-急救呼吸技术预研.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-005-设计系统与组件库预研.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-006-后端BFF与接口技术预研.md`

Execution checklists:
- `/Users/xyh/Code/pebble/docs/taskbook/TB-001-执行清单.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-002-执行清单.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-003-执行清单.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-004-执行清单.md`
- `/Users/xyh/Code/pebble/docs/taskbook/TB-006-执行清单.md`

## Architecture Constraints

### Frontend

- Routes:
  - `/`
  - `/translator`
  - `/dojo`
  - `/breathing`
- Reuse `TB-005` design system before adding new page-specific components.
- Preserve the pebble visual language, glass surfaces, bilingual tone, and restrained animation.
- Each page must define and handle at least: initial, loading, success, and failure states.
- Network access belongs in dedicated frontend client modules, not presentation components.

### Backend

- Backend architecture is BFF.
- Server is the source of truth.
- `practice` is the only valid backend name. Do not use `practice-book`.
- Breathing stays frontend-first and does not require backend runtime support.
- Primary endpoints:
  - `POST /api/decode`
  - `GET /api/scenarios`
  - `POST /api/simulator`
  - `POST /api/simulator/[sessionId]/end`
  - `POST /api/practice`
  - `GET /api/practice`
  - `PATCH /api/practice/[practiceId]`
  - `DELETE /api/practice/[practiceId]`
- Translator contract must expose:
  - `surfaceMeaning`
  - `subtext`
  - `emotionStatus`
  - `emotionScore`
  - `replySuggestions`
- Dojo contract must expose stable `start / turn / restart / end` semantics.
- Dojo `rightPanel` must include:
  - `analysisScore`
  - `analysisLabel`
  - `analysisSummary`
  - `instantFeedback`
  - `attentionPoint`

## Delivery Rules

### Proposal Rules

- Every proposal must define goal, scope, non-goals, dependencies, risks, and acceptance.
- Every proposal must cite the related taskbook and execution checklist.
- Frontend proposals must state which approved HTML and route are affected.
- Backend proposals must state affected DTOs, APIs, persistence objects, and fallback behavior.
- Every proposal must include TDD strategy: `Red`, `Green`, `Refactor`, `Document`.
- Every proposal must map user scenarios to concrete tests.

### Task Rules

- Tasks must follow TDD order:
  - write the failing test
  - implement the minimum change
  - refactor
  - update docs and regression checks
- Each task should fit within `0.5-2 hours`.
- Split tasks by frontend, backend, database, docs, and tests when possible.
- API tasks must include DTO, route, service, tests, and OpenAPI sync.
- Page tasks must include responsive review, accessibility review, and key interaction tests.
- Finished tasks must update taskbook, checklist, and any affected docs when needed.

### Spec Rules

- Specs describe stable behavior and contracts, not temporary implementation detail.
- Spec field names must match public API and visible frontend data.
- Specs must define required fields, optional fields, errors, and edge cases.
- Specs must define validation, error mapping, safety constraints, and fallback behavior.
- Specs must remain directly testable.

## Quality Rules

### TDD

- TDD is mandatory for feature work and fixes.
- Do not start implementation before defining the failing test path.
- Prefer small red-green-refactor loops over large batches.

### Frontend

- Treat the approved HTML as the visual contract.
- Validate desktop and mobile layouts for every page change.
- No horizontal overflow, blocked actions, or inaccessible critical controls.
- Animation must support readability and emotional guidance, not decoration for its own sake.

### Backend

- Use clear `route / service / repository / policy / types` boundaries.
- Define DTOs and runtime schema validation before implementing handlers.
- All external calls require timeout, bounded retries where appropriate, normalized errors, and deterministic fallback.
- Persist only the minimum necessary data. Redact or encrypt sensitive text when needed.
- Session APIs must define lifecycle semantics explicitly. Do not rely on frontend inference.

## Sync Rule

When OpenSpec artifacts change behavior or contracts, also sync the affected:
- taskbook
- execution checklist
- OpenAPI docs
- tests
