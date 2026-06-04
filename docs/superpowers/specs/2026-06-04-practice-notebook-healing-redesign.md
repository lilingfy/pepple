# Practice Notebook Healing Redesign Spec

## Goal

Redesign `/me/practice` so the practice notebook feels more healing, polished, and consistent with Pebble's existing `/me`, translator, and relation pages. The page should feel like a gentle communication recovery space, not a plain data list.

## Approved Direction

Use the **疗愈练习台** direction:

- A warm hero area with soft gradient and calming copy.
- Lightweight practice statistics.
- A translucent filter console.
- Diary-like practice cards.
- A detail drawer that reads like a communication reflection sheet.

## Visual Principles

1. **Consistent with Pebble**
   - Use existing colors: `#2C3E50`, `#7D8C9F`, `#A8D8B9`, `#BCA564`, soft white glass surfaces.
   - Derived shades such as `#2D6A4F`, `#8A7338`, `#9A7A12`, `#E6B422`, and `#B95C46` are allowed only as accessible text/icon shades of the approved green, gold, and coral accents.
   - Keep rounded cards, translucent backgrounds, gentle borders, and calm shadows.
   - Avoid saturated dashboard-style visuals.

2. **Healing over dense**
   - More spacing and quieter hierarchy.
   - Emotional copy should be gentle, not productivity-driven.
   - Cards should feel like saved reflections, not tickets or table rows.

3. **Information remains clear**
   - Preserve existing functionality: list, search, filters, pagination, favorite, archive, deep-link drawer.
   - Do not change API contracts or data behavior.

## Visual Tokens

Use these concrete Tailwind/CSS class decisions unless an existing component requires a small compatibility adjustment.

### Page Background

- Root page: `min-h-screen bg-[#F7F9FC]`.
- Add non-interactive radial highlight layers inside the page shell:
  - Top left: `absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[#A8D8B9]/20 blur-3xl`.
  - Top right: `absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-[#7D8C9F]/16 blur-3xl`.
  - Lower center: `absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#BCA564]/10 blur-3xl`.
- Content wrapper: `relative z-10 container mx-auto max-w-6xl px-6 pb-12 pt-24`.

### Shared Surfaces

- Primary glass surface: `bg-white/72 backdrop-blur-xl border border-white/70 shadow-sm`.
- Elevated glass surface: `bg-white/78 backdrop-blur-xl border border-white/75 shadow-[0_18px_50px_rgba(44,62,80,0.08)]`.
- Hero radius: `rounded-[2rem] md:rounded-[2.5rem]`.
- Card radius: `rounded-[1.75rem_2.25rem_1.75rem_2.5rem]`.
- Inner paper radius: `rounded-[1.35rem_1.75rem_1.45rem_1.9rem]`.
- Main text: `text-[#2C3E50]`.
- Muted text: `text-[#7D8C9F]`.
- Gentle coral only for errors: `#E07A5F`, always at `/10` or `/12` opacity.
- Motion: use `transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none` on hover-lift elements.

### Pills and Buttons

- Base pill: `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200`.
- Active normal/source pill: `bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm`.
- Active favorite pill: `bg-[#E6B422]/15 text-[#9A7A12] shadow-sm`.
- Active archived pill: `bg-[#7D8C9F]/15 text-[#2C3E50] shadow-sm`.
- Inactive pill: `text-[#7D8C9F]/75 hover:bg-white/55 hover:text-[#2C3E50]`.
- Primary CTA: `inline-flex items-center gap-2 rounded-full bg-[#2C3E50] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#3D4F5F] hover:shadow-md`.
- Secondary/back CTA: `inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#2C3E50] border border-white/70 transition-all hover:bg-white/90`.

### Card Inner Blocks

- Original quote paper: `bg-white/72 border border-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]`.
- Reflection snippet: `bg-[#E6F2ED]/55 border border-[#A8D8B9]/20 text-[#2D6A4F]`.
- Response strip: `bg-[#A8D8B9]/14 border border-[#A8D8B9]/25 text-[#2C3E50]`.
- Metadata chip: `bg-[#EEF2F5]/80 text-[#7D8C9F]`.
- Emotion calm pill: `bg-[#A8D8B9]/18 text-[#2D6A4F]`.
- Emotion medium pill: `bg-[#BCA564]/14 text-[#8A7338]`.
- Emotion high pill: `bg-[#E07A5F]/10 text-[#B95C46]`.

### Card Typography

- Small label text: `text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70`.
- Original quote text: `text-[15px] leading-7 font-medium text-[#2C3E50]`.
- Reflection snippet text: `text-sm leading-6 text-[#2D6A4F]`.
- Response strip text: `text-sm leading-6 font-medium text-[#2C3E50]`.
- Footer metadata text: `text-xs text-[#7D8C9F]/65`.

## Page Layout

### 1. Page Shell

- Keep route: `/me/practice`.
- Add `AppHeader` from `@/components/layout/AppHeader` with `activeHref="/me"` for stronger consistency.
- Use `pt-24`, `max-w-6xl`, and the page background tokens above.
- Background should include subtle gradient blobs or radial highlights using CSS/Tailwind classes, without animation-heavy effects.
- Preserve the current `ToastProvider` and `Suspense` wrapping.

### 2. Hero Section

Replace the current simple header with a larger glass hero card.

Hero container classes:

- `relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white/72 backdrop-blur-xl border border-white/70 px-6 py-7 md:px-8 md:py-8 shadow-[0_18px_50px_rgba(44,62,80,0.08)]`.
- Add an internal decorative glow: `absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-[#A8D8B9]/20 blur-2xl`.
- Layout: `flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between`.

Content:

- Back link: `← 返回个人中心`.
- Eyebrow: `练习本`.
- Main title: `把每一次想好好说话的努力，轻轻收好。`
- Supporting copy: `这里收藏了你的读心翻译、回应选择和关系语境，方便你慢慢复盘。`
- Primary CTA: `保存新的练习` linking/pushing to `/translator`.

Hero stats:

- `已保存`: `entries.length` from the current loaded client state only.
- `收藏`: favorite count from currently loaded entries.
- `未归档`: unarchived count from currently loaded entries.

These are visual summary chips only; do not add a new backend stats endpoint.

Hero stats visual:

- Container: `grid grid-cols-3 gap-2 rounded-[1.5rem] bg-white/50 p-2 border border-white/60`.
- Each stat: `rounded-[1.15rem] bg-white/65 px-4 py-3 text-center`.
- Number: `text-xl font-semibold text-[#2C3E50]`.
- Label: `mt-1 text-xs text-[#7D8C9F]`.

### 3. Filter Console

Redesign `PracticeFilterBar` as a single translucent console:

- Root container: `rounded-[1.75rem] bg-white/68 backdrop-blur-xl border border-white/70 p-4 md:p-5 shadow-sm`.
- Search input becomes larger and more comfortable:
  - Wrapper: `relative min-w-[240px] flex-1`.
  - Input: `h-11 w-full rounded-full bg-white/72 py-2.5 pl-10 pr-4 text-sm text-[#2C3E50] border border-white/75 focus:border-[#A8D8B9]/60 focus:outline-none focus:ring-2 focus:ring-[#A8D8B9]/20`.
- Source/archive filters become soft pill groups.
- Relation selector remains a native `<select>` for accessibility and implementation simplicity, but is visually presented as a small “关系标签” control.
  - Keep current `aria-label="按关系筛选"`.
  - Label text: `关系标签`.
  - Select classes: `h-9 rounded-full bg-white/72 py-1.5 pl-3 pr-8 text-xs text-[#2C3E50] border border-white/70 focus:border-[#A8D8B9]/60 focus:outline-none focus:ring-2 focus:ring-[#A8D8B9]/20 appearance-none`.
- Do not introduce a custom dropdown in this redesign.
- Selected states:
  - Green for active source/normal filters.
  - Gold for favorites.
  - Gray-blue for archived.
- Preserve existing props and callbacks.
- Keep accessibility labels and `aria-pressed` behavior.

### 4. Practice Cards

Redesign `PracticeEntryCard` into a diary/reflection card.

Card structure:

1. Top row:
   - Relation badge if present.
   - Emotion status pill showing `emotionStatus` and `emotionScore`, formatted as `高压 · 72`.
   - Date in muted text.
2. Main quote area:
   - Label: `对方原话`.
   - Original text in a soft white paper-like area.
3. Reflection snippet:
   - Prefer `analysis.subtext` when available.
   - Otherwise show `surfaceMeaning`.
   - If neither exists, omit this block.
   - Label is `我读到的潜台词` when showing subtext, otherwise `表面意思`.
   - Use gentle green/blue tinted background.
4. Response strip:
   - Label: `我选择的回应`.
   - Primary reply in a soft green paper strip.
5. Actions:
   - Favorite and archive remain in the footer.
   - Keep keyboard-accessible clickable detail area separate from nested buttons.

Behavior must not change.

`Primary reply` means the existing `entry.primaryReply` value. Do not recompute it from `replyOptions` during rendering.

Card display rules:

- Remove the old card header display of `scenario` and `attackType`; these move to the drawer.
- Remove the old footer emotion badge; emotion is shown only in the top row.
- Keep date visible once in muted text.
- Relation badge classes: `inline-flex items-center gap-1.5 rounded-full bg-[#A8D8B9]/16 px-3 py-1 text-xs font-medium text-[#2D6A4F]`.
- Card root classes: `group relative overflow-hidden rounded-[1.75rem_2.25rem_1.75rem_2.5rem] bg-white/72 backdrop-blur-xl border border-white/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(44,62,80,0.10)]`.
- Add reduced-motion variants to the card root: `motion-reduce:transition-none motion-reduce:hover:translate-y-0`.
- Clickable content area remains separate from the action buttons and keeps keyboard support for Enter/Space.
- Card grid remains `grid grid-cols-1 gap-4 md:grid-cols-2`.
- Cards should not use Masonry or variable column algorithms in this iteration.

Emotion fallback rules:

- If both `emotionStatus` and `emotionScore` are present, show `emotionStatus · emotionScore`.
- If only `emotionStatus` is present, show `emotionStatus`.
- If only `emotionScore` is present, show `情绪分 · {emotionScore}`.
- If neither is present, omit the emotion pill.

### 5. Detail Drawer

Keep the existing right-side drawer behavior, but restyle and reorganize content.

Title: `一次沟通复盘`.

Drawer layout:

- Mobile: full-width drawer, same as current behavior.
- Desktop: right drawer width remains `sm:w-[480px]`.
- Panel classes: `relative z-10 flex h-full w-full flex-col overflow-y-auto bg-[#F8FAFC]/88 backdrop-blur-xl shadow-2xl sm:w-[480px] sm:border-l sm:border-white/70`.
- Header classes: `sticky top-0 z-10 border-b border-white/70 bg-white/70 px-6 py-4 backdrop-blur-xl`.
- Section surface classes: `rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm`.

Sections:

1. `对方说了什么` — original text.
2. `表面意思` — surface meaning.
3. `可能真正想表达` — subtext and scenario/attack type.
4. `情绪温度` — emotion status, emotion score, neutrality score.
5. `我可以怎样回应` — all reply options, selected one highlighted.
6. Bottom actions — favorite/archive controls.

Preserve:

- `role="dialog"`.
- `aria-modal`.
- Escape close.
- Backdrop close.
- Focus trap and focus restoration.

Drawer content rules:

- Always show original text when the entry is decode content.
- Show `表面意思` only when `surfaceMeaning` is non-empty.
- Show `可能真正想表达` only when `analysis` exists; include `analysis.subtext`, plus a muted metadata row with `scenario` and `attackType`.
- Emotion pill uses the same calm/medium/high color logic as the card.
- Reply option selected state uses: `bg-[#A8D8B9]/18 border-[#A8D8B9]/45 shadow-[0_0_18px_rgba(168,216,185,0.18)]`.
- Non-selected reply options use: `bg-white/60 border-white/70`.

### 6. Empty, Loading, Error, Filtered Empty States

Update copy and styling for healing tone.

Empty state:

- Title: `这里还很安静`.
- Copy: `保存一次读心翻译后，它会变成你的沟通练习档案。`
- CTA: `去保存第一条练习`.

Filtered empty:

- Copy: `这些筛选下暂时没有练习，换个标签看看，或继续加载更多。`

Deep-link not found:

- Copy: `没有找到这条练习，它可能已经被归档或删除。你仍然可以继续浏览其他记录。`
- Styling: `rounded-2xl bg-[#BCA564]/10 border border-[#BCA564]/18 px-4 py-3 text-sm text-[#8A7338]`.

Loading:

- Skeleton cards should match the new diary card silhouette:
  - top metadata row skeleton,
  - large quote paper skeleton,
  - smaller reflection skeleton,
  - response strip skeleton,
  - footer action skeleton.
- Skeleton root uses the same card radius and `bg-white/55 border border-white/60`.
- Keep the existing `PracticeSkeletonList` count prop. Default count remains `3`.
- Add stable selectors for tests:
  - root list: `data-testid="practice-skeleton-list"`,
  - each card: `data-testid="practice-skeleton-card"`.

Error:

- Title: `练习本暂时没有打开`.
- Copy: `可能是网络轻轻绊了一下，稍后再试就好。`
- CTA label: `重新加载`.
- Styling: `rounded-[2rem] bg-white/70 border border-white/70 shadow-sm`, with coral only as a small icon background `bg-[#E07A5F]/10 text-[#B95C46]`.

Load more:

- Label remains `加载更多`; loading label remains `加载中…`.
- Button classes: `rounded-full bg-white/72 px-6 py-2.5 text-sm font-medium text-[#2C3E50] border border-white/70 shadow-sm transition-all hover:bg-white/90 hover:shadow-md disabled:opacity-50`.

## Exact Component Decisions

- Keep `PracticeFilterBar` as a controlled presentational component with the same props.
- Keep `PracticeEntryCard` as a presentational component with the same props.
- Keep `PracticeEntryDrawer` as a presentational component with the same props.
- Keep `PracticeStates` exports compatible with existing page imports.
- `/me/practice/page.tsx` may add local derived values for hero stats, but must not add API calls.
- The redesign is CSS/markup/copy only, except for local derived UI stats.

## Responsive Behavior

- Page width: `max-w-6xl`.
- Main page padding: `px-6`; mobile may use `px-4` only if needed to avoid overflow.
- Hero: stacked on mobile, text and stats side-by-side on `lg` and above.
- Filters: wrap naturally; search takes full width on small screens and shares a row on `md` and above.
- Card grid: `grid-cols-1 md:grid-cols-2`.
- Drawer: full width below `sm`, `480px` right-side panel at `sm` and above.
- No horizontal scrolling should appear at viewport widths >= 360px.
- Responsive behavior can be covered by class-based smoke tests rather than browser viewport tests: assert grid includes `md:grid-cols-2`, drawer includes `sm:w-[480px]`, and hero includes `lg:flex-row`.

## Component Scope

Modify only visual/UI organization in these areas:

- `apps/web/app/(main)/me/practice/page.tsx`
- `apps/web/components/practice/PracticeEntryCard.tsx`
- `apps/web/components/practice/PracticeFilterBar.tsx`
- `apps/web/components/practice/PracticeEntryDrawer.tsx`
- `apps/web/components/practice/PracticeStates.tsx`
- Existing practice page/component tests as needed for copy, accessibility, and stable selectors.

No backend, schema, or API changes are required.

## Non-Goals

- No new backend stats endpoint.
- No new practice modes, spaced repetition, quiz flow, or review scheduling.
- No changes to save/archive/favorite behavior.
- No broad redesign of `/me`, translator, or relation pages.
- No custom relation dropdown or popover in this iteration.
- No animated background loops or motion-heavy effects.

## Testing Requirements

Update tests to verify:

- Page still renders default entries and filters.
- Hero title/copy and CTA are present.
- Filter controls remain accessible.
- Card actions still fire favorite/archive callbacks and card detail remains keyboard accessible.
- Drawer retains dialog semantics and renders the renamed/refined sections.
- Empty/filtered/error states render updated copy.
- Deep-link not-found renders the updated gentle copy and non-red styling target via class or semantic assertion.
- Hero stats derive from loaded entries without requiring a new API call.
- Skeleton tests verify `PracticeSkeletonList` renders the requested count and stable skeleton selectors.
- Responsive smoke tests verify key breakpoint classes (`md:grid-cols-2`, `sm:w-[480px]`, `lg:flex-row`) are present.

Run:

```bash
npm exec vitest run tests/frontend/practice-components.test.tsx tests/frontend/practice-page.test.tsx tests/frontend/practice-page-toast-provider.test.tsx
npm exec tsc --noEmit
```

## Acceptance Criteria

- `/me/practice` feels visually consistent with Pebble's calm glass UI.
- The page communicates “reflection notebook” rather than “plain archive list”.
- All existing practice notebook behavior still works.
- Accessibility fixes from the previous implementation remain intact.
- Focused tests and TypeScript pass.
