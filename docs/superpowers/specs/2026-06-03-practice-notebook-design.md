# Practice Notebook Design

## Goal

Turn the translator “存入练习本” action into a useful review system: saved translator analyses become reusable communication cases, organized by relationship object, with enough data to support future deliberate practice.

## Current Context

- The translator already has a save action that posts to `POST /api/practice`.
- The backend already stores practice entries and supports list, update, and delete APIs.
- The frontend currently only implements creation; there is no notebook page for browsing saved entries.
- Saved decode entries currently miss two important fields for review:
  - `surfaceMeaning`, shown in the UI but not persisted.
  - `relationId`, used by translator context but not persisted in practice content.

## Recommended Product Model

Use the notebook as a **case library first**, with relationship-based organization and future practice-card expansion.

The first version must let users answer:

1. What did the other person say?
2. What did the AI think the surface meaning and subtext were?
3. Which reply did I choose?
4. Which relationship object was this case related to?
5. Which saved cases are important, unresolved, or archived?

## User Flow

1. User enters text in the translator.
2. AI returns analysis and A/B/C reply options.
3. User selects one reply option.
4. User clicks “存入练习本”.
5. The saved entry captures the original text, analysis, all reply options, selected reply, and current relation context.
6. User opens the notebook from `/me` or from a post-save “查看” link.
7. User can browse, filter, favorite, archive, and open case details.

## Data to Persist for Decode Entries

Extend the saved decode practice content to include:

- `originalText`
- `surfaceMeaning`
- `subtext`
- `emotionStatus`
- `emotionScore`
- `neutralityScore`
- `replyOptions` for A/B/C
- `selectedReplyId`
- `primaryReply`
- `relationId` if a current relation is selected
- `relationName` as a denormalized display snapshot when a current relation is selected, so notebook list cards can render without an extra relation lookup

The database can keep using the existing flexible `contentJsonb` field. No new table is required for the first version.

### Implementation-Ready Decode Content Schema

For first-version decode notebook entries, `contentJsonb` MUST use this shape:

```ts
type DecodePracticeContent = {
  originalText: string;
  surfaceMeaning: string;
  analysis: {
    attackType: string;
    scenario: string;
    subtext: string;
    emotionScore: number;
    neutralityScore: number;
    emotionStatus: string;
  };
  replyOptions: Array<{
    id: 'A' | 'B' | 'C';
    label: string;
    content: string;
    tone: string;
  }>;
  selectedReplyId: 'A' | 'B' | 'C';
  relationId?: string;
  relationName?: string;
};
```

Example persisted decode content:

```json
{
  "originalText": "你如果真的在乎我，就不会这样做。",
  "surfaceMeaning": "对方认为你的行为代表不在乎。",
  "analysis": {
    "attackType": "情感勒索",
    "scenario": "decode",
    "subtext": "对方试图用内疚感迫使你让步。",
    "emotionScore": 72,
    "neutralityScore": 28,
    "emotionStatus": "高压"
  },
  "replyOptions": [
    { "id": "A", "label": "A", "content": "我理解你的感受，但我需要按自己的安排来。", "tone": "温和坚定" },
    { "id": "B", "label": "B", "content": "我听到了，但这个决定不会改变。", "tone": "边界清晰" },
    { "id": "C", "label": "C", "content": "我知道了。", "tone": "灰岩回应" }
  ],
  "selectedReplyId": "B",
  "relationId": "relation-123",
  "relationName": "伴侣"
}
```

`primaryReply` remains the top-level database/API field and MUST equal the selected reply option content.

### API Contracts

Use the existing practice API shape:

#### Create

`POST /api/practice`

Request for decode entries:

```json
{
  "sourceType": "decode",
  "primaryReply": "我听到了，但这个决定不会改变。",
  "content": { "...": "DecodePracticeContent as above" }
}
```

Response:

```json
{ "success": true, "data": { "id": "practice-1", "sourceType": "decode", "primaryReply": "...", "content": {}, "isFavorite": false, "isArchived": false, "createdAt": "...", "updatedAt": "..." } }
```

The frontend practice client MUST return the created entry, not `void`, so translator can link to `/me/practice?entry=<id>`.

#### List

`GET /api/practice`

Supported query parameters:

- `sourceType=decode|simulator`
- `isFavorite=true|false`
- `isArchived=true|false`; default remains `false` for normal notebook browsing
- `limit=20` first-version page size
- `cursor=<entry-id-or-createdAt-cursor>` using the existing backend cursor behavior

Response:

```json
{ "success": true, "data": { "entries": [], "total": 0, "hasMore": false } }
```

First version uses a “加载更多” button when `hasMore` is true. Infinite scroll is out of scope.

#### Update Favorite / Archive

`PATCH /api/practice/:practiceId`

Request supports:

```json
{ "isFavorite": true }
```

or

```json
{ "isArchived": true }
```

Response returns the updated practice entry in `{ success: true, data }`.

#### Detail

`GET /api/practice/:practiceId` returns `{ success: true, data: PracticeEntry }`.

#### Delete

`DELETE /api/practice/:practiceId` exists but is not exposed in the first notebook UI. Archive is the first-version removal behavior.

## Notebook Page

Add a notebook page at `/me/practice`, reachable from `/me`.

### List View

Show saved entries as cards with:

- Original text summary
- Relationship object name, when available
- Emotion score
- Selected reply preview
- Saved time
- Favorite toggle
- Archive toggle

### Filters

First version filters:

- All
- Favorites
- Unarchived
- By relationship object, if relation data is available

### Detail View

Opening an entry shows:

- Original text
- Surface meaning
- Subtext
- Emotion status / score
- All reply options
- Selected reply
- Relationship object context

### Frontend UX and Visual Requirements

The notebook page must feel consistent with the existing Pebble frontend: calm, spacious, healing, and visually polished rather than utilitarian.

Layout requirements:

- Use the existing soft gradient / fluid background language from `/me`, `/me/relations`, and translator pages.
- Use pebble-glass translucent white cards with rounded organic corners, subtle borders, and soft shadows.
- Use a spacious page header with title, short explanatory subtitle, and a clear back/navigation affordance.
- Use a top filter bar for the first version: `全部`, `收藏`, `未归档`, and relationship filter.
- Use a responsive card grid on desktop and a single-column card list on mobile.
- Open entry details in a right-side drawer on desktop; on mobile, use a full-screen detail panel.
- Keep cards calm and readable: original text summary must be prominent, while metadata such as relation name, emotion score, and saved time must be secondary.

Visual tone requirements:

- The page must look “大气、美观、治愈”: airy spacing, low visual noise, gentle green/blue/gold accents, and no harsh warning colors except for destructive actions.
- Favorite must use a warm gold star/icon treatment.
- Archive must use a soft gray/blue treatment, not a destructive red style.
- Emotion score must use a small rounded pill, matching the soft score language used elsewhere in the app.
- Empty, loading, and error states must be designed, not left as plain text.

State requirements:

- Empty state: show a gentle card explaining “还没有保存练习，去读心翻译存入第一条”, with a CTA to `/translator`.
- Loading state: show skeleton cards using the same rounded glass style.
- Error state: show a retry action in a non-alarming style.
- After saving from translator, a “查看” affordance must navigate to `/me/practice?entry=<id>` using the saved entry id returned by the create API.

### Frontend Component Structure

Implement with small, testable components:

- `PracticeNotebookPage`: route-level data loading and filter state.
- `PracticeFilterBar`: top filter chips/dropdowns.
- `PracticeEntryCard`: list/grid card for a single entry.
- `PracticeEntryDrawer`: desktop detail drawer and mobile full-screen detail presentation.
- `PracticeEmptyState`, `PracticeSkeletonList`, `PracticeErrorState`.

Data fetching must use local React state and the existing frontend client pattern. React Query/SWR is not required for first version.

### Interaction Requirements

- Favorite toggle: use optimistic update, then revert and show a non-blocking error message if PATCH fails.
- Archive toggle: no confirmation dialog in first version; treat it like a reversible soft remove. Archived entries disappear from the default unarchived list after a successful update.
- Relationship filter: use a simple select/dropdown populated from relation names present in loaded practice entries. A full relation search is out of scope.
- Deep link: `/me/practice?entry=<id>` must open that entry detail automatically if it exists in the loaded page; if it is not loaded, fetch it via `GET /api/practice/:id`; if not found, show a gentle “这条练习不存在或已归档” message and keep the list visible.
- Detail drawer close: click close button, press `Esc`, or click backdrop on desktop.

### Accessibility Requirements

- Detail drawer must have `role="dialog"`, an accessible title, and close on `Esc`.
- Favorite and archive buttons must have explicit `aria-label` values containing the entry summary and saved date.
- Filter controls must be keyboard reachable and expose selected state.
- Loading skeletons must not trap focus.

## `/me` Entry Point

Add a “练习本” entry point on the user center page alongside the existing feature shortcuts.

The “关系档案” numeric card currently shows a placeholder `0`; replacing it with the real relation count is a separate task and is out of scope for the notebook implementation. It must not be used to represent practice notebook entries.

## Translator Save Feedback

After successful save:

- Keep the existing “已存入” feedback.
- Add a lightweight “查看” link to `/me/practice?entry=<id>` after the create API returns the saved entry id.

If saving fails:

- Keep the existing failure toast.
- Do not mark the entry as saved.

## Out of Scope for First Version

- Spaced repetition scheduling.
- AI-generated quizzes.
- Full offline queue.
- Complex analytics dashboards.
- Separate notebook data model beyond existing `practice_entries`.

## Future Extension

Once the case library is useful, entries can become active practice cards:

- “这句话真实意图是什么？”
- “哪种回复更稳？”
- “请自己写一句边界回复。”
- Compare user-written reply against the saved AI suggestions.

## Testing Requirements

Required tests before implementation is considered complete:

- Translator save sends decode content with `surfaceMeaning`, `analysis.emotionStatus`, `relationId`, and `relationName` when a current relation is selected.
- Practice client create returns the created entry id so translator can render a “查看” link.
- `GET /api/practice` client supports `sourceType`, `isFavorite`, `isArchived`, `limit`, and `cursor`.
- Notebook list renders saved decode entries with original text summary, relation name, emotion score, selected reply preview, and saved time.
- Favorite toggle sends `PATCH /api/practice/:id` with `isFavorite` and updates/reverts UI correctly.
- Archive toggle sends `PATCH /api/practice/:id` with `isArchived`; archived entries disappear from the default list after success.
- Filters work for all, favorites, unarchived, and relation name.
- Detail view shows original text, surface meaning, subtext, emotion score/status, all reply options, selected reply, and relationship context.
- `/me/practice?entry=<id>` opens the detail drawer for an existing entry and shows a gentle not-found message for missing entries.
- `/me` exposes a clear notebook entry point.
- Drawer has `role="dialog"`, closes on `Esc`, and exposes an accessible close button.
