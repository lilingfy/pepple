# Practice Notebook Healing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/me/practice` into a healing, polished, Pebble-consistent “疗愈练习台” while preserving all practice notebook behavior.

**Architecture:** Keep current client-side state and API behavior. Apply a visual/markup redesign across the practice route and presentational components only: page shell + hero, filter console, diary cards, reflection drawer, and states. Tests should assert behavior remains intact and new UI copy/structure is present.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS, Vitest, Testing Library, existing practice client helpers and `@pebble/types`.

---

## File Structure

- Modify `apps/web/app/(main)/me/practice/page.tsx`: add `AppHeader`, healing page shell, hero, local derived stats, updated not-found/load-more styling, keep data behavior unchanged.
- Modify `apps/web/components/practice/PracticeFilterBar.tsx`: restyle as translucent filter console while preserving props and native relation `<select>`.
- Modify `apps/web/components/practice/PracticeEntryCard.tsx`: restyle as diary/reflection card, update content rules, keep callback behavior and accessible clickable area.
- Modify `apps/web/components/practice/PracticeEntryDrawer.tsx`: restyle drawer as communication reflection sheet, preserve modal accessibility.
- Modify `apps/web/components/practice/PracticeStates.tsx`: update empty/loading/error/filtered-state supporting visuals and skeleton selectors.
- Modify `apps/web/tests/frontend/practice-page.test.tsx`: update page copy/hero/stats/not-found/load-more/responsive smoke assertions.
- Modify `apps/web/tests/frontend/practice-components.test.tsx`: update component copy/structure/skeleton/drawer assertions.
- Keep `apps/web/tests/frontend/practice-page-toast-provider.test.tsx` passing; update only if copy-dependent assertions require it.

## Task 1: Page Shell and Hero

**Files:**
- Modify: `apps/web/app/(main)/me/practice/page.tsx`
- Test: `apps/web/tests/frontend/practice-page.test.tsx`

- [ ] **Step 1: Write failing hero/page tests**

Add or update tests that assert:

```tsx
expect(screen.getByText('把每一次想好好说话的努力，轻轻收好。')).toBeInTheDocument();
expect(screen.getByText('这里收藏了你的读心翻译、回应选择和关系语境，方便你慢慢复盘。')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /返回个人中心/ })).toBeInTheDocument();
expect(screen.getByRole('button', { name: /保存新的练习/ })).toBeInTheDocument();
expect(screen.getByText('已保存')).toBeInTheDocument();
expect(screen.getByText('收藏')).toBeInTheDocument();
expect(screen.getByText('未归档')).toBeInTheDocument();
```

Add a stats test using loaded entries:

```tsx
mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));
render(<PracticePage />);
await screen.findByTestId('practice-entry-card-practice-a');
expect(screen.getByTestId('practice-stat-total')).toHaveTextContent('2');
expect(screen.getByTestId('practice-stat-favorites')).toHaveTextContent('1');
expect(screen.getByTestId('practice-stat-unarchived')).toHaveTextContent('2');
expect(mockListPracticeEntries).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-page.test.tsx
```

Expected: fails because hero copy/stat test IDs are missing.

- [ ] **Step 3: Implement page shell and hero**

In `page.tsx`:

- Import `AppHeader` from `@/components/layout/AppHeader`.
- Derive stats locally:

```tsx
const practiceStats = useMemo(() => ({
  total: entries.length,
  favorites: entries.filter((entry) => entry.isFavorite).length,
  unarchived: entries.filter((entry) => !entry.isArchived).length,
}), [entries]);
```

- Wrap returned page with `AppHeader activeHref="/me"` and the spec page background:

```tsx
<>
  <AppHeader activeHref="/me" />
  <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC]">
    <div aria-hidden="true" className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[#A8D8B9]/20 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-[#7D8C9F]/16 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#BCA564]/10 blur-3xl" />
    <div className="relative z-10 container mx-auto max-w-6xl px-4 pb-12 pt-24 md:px-6">
      {/* hero + existing content */}
    </div>
  </main>
</>
```

- Replace the simple header with a hero card containing the approved copy, CTA, and stat chips. Back button calls `router.push('/me')`; CTA calls `router.push('/translator')`.

- [ ] **Step 4: Verify Task 1**

Run:

```bash
npm exec vitest run tests/frontend/practice-page.test.tsx
```

Expected: page tests pass or only later-component visual tests fail.

## Task 2: Filter Console Redesign

**Files:**
- Modify: `apps/web/components/practice/PracticeFilterBar.tsx`
- Test: `apps/web/tests/frontend/practice-components.test.tsx`

- [ ] **Step 1: Write failing filter tests**

Add assertions:

```tsx
expect(screen.getByTestId('practice-filter-bar')).toHaveClass('rounded-[1.75rem]');
expect(screen.getByLabelText('搜索练习内容')).toHaveClass('h-11');
expect(screen.getByText('关系标签')).toBeInTheDocument();
expect(screen.getByLabelText('按关系筛选')).toHaveClass('h-9');
```

Keep existing callback tests for search, source, archive, and relation filters.

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: fails because new styling/classes/copy are missing.

- [ ] **Step 3: Implement filter console**

Update `PracticeFilterBar` root and controls using the spec tokens:

- Root: `rounded-[1.75rem] bg-white/68 backdrop-blur-xl border border-white/70 p-4 md:p-5 shadow-sm`.
- Search input: `h-11 ...` from spec.
- Keep native `<select>`, label text `关系标签`, and `aria-label="按关系筛选"`.
- Use active pill classes:
  - favorites active: `bg-[#E6B422]/15 text-[#9A7A12] shadow-sm`.
  - archived active: `bg-[#7D8C9F]/15 text-[#2C3E50] shadow-sm`.
  - normal active: `bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm`.

- [ ] **Step 4: Verify Task 2**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: filter component tests pass.

## Task 3: Diary Practice Card Redesign

**Files:**
- Modify: `apps/web/components/practice/PracticeEntryCard.tsx`
- Test: `apps/web/tests/frontend/practice-components.test.tsx`

- [ ] **Step 1: Write failing card tests**

Add/update tests for:

```tsx
expect(screen.getByText('对方原话')).toBeInTheDocument();
expect(screen.getByText('我读到的潜台词')).toBeInTheDocument();
expect(screen.getByText('我选择的回应')).toBeInTheDocument();
expect(screen.queryByText('decode')).not.toBeInTheDocument();
expect(screen.getByText(/高压 · 72/)).toBeInTheDocument();
expect(screen.getByTestId('practice-entry-card-practice-a')).toHaveClass('rounded-[1.75rem_2.25rem_1.75rem_2.5rem]');
```

Keep tests that favorite/archive buttons do not trigger card open, and Enter/Space opens the detail area.

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: fails because card labels/layout/classes are missing.

- [ ] **Step 3: Implement card redesign**

Update `PracticeEntryCard`:

- Use `entry.primaryReply` directly for response strip.
- Reflection logic:

```tsx
const reflection = analysis?.subtext
  ? { label: '我读到的潜台词', text: analysis.subtext }
  : isDecode && entry.content.surfaceMeaning
    ? { label: '表面意思', text: entry.content.surfaceMeaning }
    : null;
```

- Emotion label logic:

```tsx
const emotionLabel = analysis?.emotionStatus && typeof analysis.emotionScore === 'number'
  ? `${analysis.emotionStatus} · ${analysis.emotionScore}`
  : analysis?.emotionStatus
    ? analysis.emotionStatus
    : typeof analysis?.emotionScore === 'number'
      ? `情绪分 · ${analysis.emotionScore}`
      : null;
```

- Move date to top row, remove scenario/attack type from card, and remove old footer emotion badge.
- Keep clickable area separate from buttons.
- Apply reduced-motion classes.

- [ ] **Step 4: Verify Task 3**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: card tests pass.

## Task 4: Reflection Drawer Redesign

**Files:**
- Modify: `apps/web/components/practice/PracticeEntryDrawer.tsx`
- Test: `apps/web/tests/frontend/practice-components.test.tsx`

- [ ] **Step 1: Write failing drawer tests**

Add/update assertions:

```tsx
expect(screen.getByRole('dialog', { name: /一次沟通复盘/ })).toBeInTheDocument();
expect(screen.getByText('对方说了什么')).toBeInTheDocument();
expect(screen.getByText('可能真正想表达')).toBeInTheDocument();
expect(screen.getByText('情绪温度')).toBeInTheDocument();
expect(screen.getByText('我可以怎样回应')).toBeInTheDocument();
expect(screen.getByRole('dialog')).toHaveClass('sm:w-[480px]');
```

Keep existing Escape, backdrop, focus, favorite, and archive behavior tests.

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: fails because drawer title/sections/classes are missing.

- [ ] **Step 3: Implement drawer redesign**

Update drawer title to `一次沟通复盘` and reorganize sections as specified:

- `对方说了什么`
- `表面意思` only if non-empty
- `可能真正想表达` with subtext + muted scenario/attackType row
- `情绪温度`
- `我可以怎样回应`

Apply panel/header/section classes from the spec. Preserve current modal accessibility, focus trap, focus restoration, Escape close, and backdrop close.

- [ ] **Step 4: Verify Task 4**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx
```

Expected: drawer tests pass.

## Task 5: States, Skeletons, Not Found, and Load More Polish

**Files:**
- Modify: `apps/web/components/practice/PracticeStates.tsx`
- Modify: `apps/web/app/(main)/me/practice/page.tsx`
- Test: `apps/web/tests/frontend/practice-components.test.tsx`
- Test: `apps/web/tests/frontend/practice-page.test.tsx`

- [ ] **Step 1: Write failing state tests**

Add/update assertions:

```tsx
expect(screen.getByText('这里还很安静')).toBeInTheDocument();
expect(screen.getByText('保存一次读心翻译后，它会变成你的沟通练习档案。')).toBeInTheDocument();
expect(screen.getByRole('button', { name: '去保存第一条练习' })).toBeInTheDocument();
expect(screen.getByText('练习本暂时没有打开')).toBeInTheDocument();
expect(screen.getByText('可能是网络轻轻绊了一下，稍后再试就好。')).toBeInTheDocument();
expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument();
expect(screen.getByTestId('practice-skeleton-list')).toBeInTheDocument();
expect(screen.getAllByTestId('practice-skeleton-card')).toHaveLength(3);
```

For page not-found:

```tsx
expect(screen.getByRole('alert')).toHaveTextContent('没有找到这条练习，它可能已经被归档或删除。你仍然可以继续浏览其他记录。');
```

For responsive smoke:

```tsx
expect(screen.getByTestId('practice-card-grid')).toHaveClass('md:grid-cols-2');
expect(screen.getByTestId('practice-hero')).toHaveClass('lg:flex-row');
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx tests/frontend/practice-page.test.tsx
```

Expected: fails because copy/selectors/classes are missing.

- [ ] **Step 3: Implement states and page polish**

- Update `PracticeEmptyState` copy and CTA.
- Update `PracticeErrorState` title/copy/CTA and styling.
- Update `PracticeSkeletonList` to render `data-testid="practice-skeleton-list"` and each card with `data-testid="practice-skeleton-card"`.
- Update `/me/practice` not-found alert copy/classes.
- Add `data-testid="practice-card-grid"` to the card grid.
- Add `data-testid="practice-hero"` to the hero layout element.
- Apply load-more button classes from the spec.

- [ ] **Step 4: Verify Task 5**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx tests/frontend/practice-page.test.tsx tests/frontend/practice-page-toast-provider.test.tsx
npm exec tsc --noEmit
```

Expected: focused tests and typecheck pass.

## Task 6: Final Verification and Diff Review

**Files:** all touched files.

- [ ] **Step 1: Run focused regression suite**

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx tests/frontend/practice-page.test.tsx tests/frontend/practice-page-toast-provider.test.tsx tests/frontend/me-page.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript**

Run:

```bash
npm exec tsc --noEmit
```

Expected: no output and exit 0.

- [ ] **Step 3: Inspect diff**

Run:

```bash
git diff -- apps/web/app/\(main\)/me/practice/page.tsx apps/web/components/practice apps/web/tests/frontend/practice-page.test.tsx apps/web/tests/frontend/practice-components.test.tsx docs/superpowers/specs/2026-06-04-practice-notebook-healing-redesign.md docs/superpowers/plans/2026-06-04-practice-notebook-healing-redesign.md
```

Expected: only visual redesign, test, and spec/plan changes. No backend/API/schema changes.

---

## Self-Review Checklist

- Spec coverage: page shell, hero, stats, filter console, cards, drawer, states, responsive behavior, tests all map to tasks.
- Placeholder scan: no TBD/TODO/fill-later steps.
- Type consistency: all tasks preserve existing public component props and practice API behavior.
