import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { PracticeEntry } from '@pebble/types';

import { PracticeEntryCard } from '@/components/practice/PracticeEntryCard';
import { PracticeFilterBar, type ArchiveFilter } from '@/components/practice/PracticeFilterBar';
import { PracticeEntryDrawer } from '@/components/practice/PracticeEntryDrawer';
import {
  PracticeEmptyState,
  PracticeSkeletonList,
  PracticeErrorState,
} from '@/components/practice/PracticeStates';

const mockEntry: PracticeEntry = {
  id: 'practice-1',
  sourceType: 'decode',
  primaryReply: '我理解你的感受，但我需要按自己的安排来。',
  content: {
    originalText: '你如果真的在乎我，就不会这样做。',
    surfaceMeaning: '对方认为你的行为代表不在乎。',
    analysis: {
      attackType: '情感勒索',
      scenario: 'decode',
      subtext: '对方试图用内疚感迫使你让步。',
      emotionScore: 72,
      neutralityScore: 28,
      emotionStatus: '高压',
    },
    replyOptions: [
      { id: 'A', label: '提供确定感', content: '我理解你的感受，但我需要按自己的安排来。', tone: '温和坚定' },
      { id: 'B', label: '温和但坚定', content: '我听到了，但这个决定不会改变。', tone: '边界清晰' },
      { id: 'C', label: '极简终结', content: '我知道了。', tone: '灰岩回应' },
    ],
    selectedReplyId: 'A',
    relationId: 'relation-123',
    relationName: '伴侣',
  },
  isFavorite: false,
  isArchived: false,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2024-06-01T10:00:00Z',
};

const mockFavoriteEntry: PracticeEntry = {
  ...mockEntry,
  id: 'practice-2',
  isFavorite: true,
};

const mockSimulatorEntry: PracticeEntry = {
  id: 'practice-simulator',
  sourceType: 'simulator',
  primaryReply: '我会先暂停一下，整理好再继续回应。',
  content: {
    scenarioId: 'scenario-1',
    scenarioName: '边界练习',
    turns: [
      { role: 'user', content: '我现在需要一点空间。' },
      { role: 'assistant', content: '可以，我们先停一下。' },
    ],
  },
  isFavorite: false,
  isArchived: false,
  createdAt: '2024-06-03T10:00:00Z',
  updatedAt: '2024-06-03T10:00:00Z',
};

describe('PracticeEntryCard', () => {
  const onClick = vi.fn();
  const onFavorite = vi.fn();
  const onArchive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders diary labels, original text, reflection, response, and relation badge', () => {
    render(
      <PracticeEntryCard
        entry={mockEntry}
        onClick={onClick}
        onFavorite={onFavorite}
        onArchive={onArchive}
      />
    );

    expect(screen.getByText('对方原话')).toBeInTheDocument();
    expect(screen.getByText('我读到的潜台词')).toBeInTheDocument();
    expect(screen.getByText('我选择的回应')).toBeInTheDocument();
    expect(screen.getByText('伴侣')).toBeInTheDocument();
    expect(screen.getByText(/你如果真的在乎我/)).toBeInTheDocument();
    expect(screen.getByText(/对方试图用内疚感迫使你让步/)).toBeInTheDocument();
    expect(screen.getByText(/我理解你的感受/)).toBeInTheDocument();
  });

  it('does not show old scenario or attack type header', () => {
    render(<PracticeEntryCard entry={mockEntry} />);
    expect(screen.queryByText('decode')).not.toBeInTheDocument();
    expect(screen.queryByText('读心翻译')).not.toBeInTheDocument();
    expect(screen.queryByText('情感勒索')).not.toBeInTheDocument();
  });

  it('shows emotion score pill in top row', () => {
    render(<PracticeEntryCard entry={mockEntry} />);
    expect(screen.getByText(/高压 · 72/)).toBeInTheDocument();
  });

  it('has card root with correct border radius', () => {
    render(<PracticeEntryCard entry={mockEntry} />);
    expect(screen.getByTestId('practice-entry-card-practice-1')).toHaveClass('rounded-[1.75rem_2.25rem_1.75rem_2.5rem]');
  });

  it('calls onClick when clickable area is clicked', () => {
    render(<PracticeEntryCard entry={mockEntry} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('practice-entry-card-clickable-practice-1'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed on clickable area', () => {
    render(<PracticeEntryCard entry={mockEntry} onClick={onClick} />);
    const clickable = screen.getByTestId('practice-entry-card-clickable-practice-1');
    fireEvent.keyDown(clickable, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed on clickable area', () => {
    render(<PracticeEntryCard entry={mockEntry} onClick={onClick} />);
    const clickable = screen.getByTestId('practice-entry-card-clickable-practice-1');
    fireEvent.keyDown(clickable, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when favorite button is clicked', () => {
    render(<PracticeEntryCard entry={mockEntry} onClick={onClick} onFavorite={onFavorite} />);
    const favButton = screen.getByTestId('favorite-button-practice-1');
    fireEvent.click(favButton);
    expect(onFavorite).toHaveBeenCalledWith('practice-1', true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when archive button is clicked', () => {
    render(<PracticeEntryCard entry={mockEntry} onClick={onClick} onArchive={onArchive} />);
    const archiveButton = screen.getByTestId('archive-button-practice-1');
    fireEvent.click(archiveButton);
    expect(onArchive).toHaveBeenCalledWith('practice-1', true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onFavorite with correct args when favorite button clicked', () => {
    render(<PracticeEntryCard entry={mockEntry} onFavorite={onFavorite} />);
    const favButton = screen.getByTestId('favorite-button-practice-1');
    fireEvent.click(favButton);
    expect(onFavorite).toHaveBeenCalledWith('practice-1', true);
  });

  it('calls onFavorite with false when un-favoriting', () => {
    render(<PracticeEntryCard entry={mockFavoriteEntry} onFavorite={onFavorite} />);
    const favButton = screen.getByTestId('favorite-button-practice-2');
    fireEvent.click(favButton);
    expect(onFavorite).toHaveBeenCalledWith('practice-2', false);
  });

  it('calls onArchive with (id, true) when archive button clicked on unarchived entry', () => {
    render(<PracticeEntryCard entry={mockEntry} onArchive={onArchive} />);
    const archiveButton = screen.getByTestId('archive-button-practice-1');
    fireEvent.click(archiveButton);
    expect(onArchive).toHaveBeenCalledWith('practice-1', true);
  });

  it('calls onArchive with (id, false) when archive button clicked on archived entry', () => {
    const archivedEntry = { ...mockEntry, id: 'practice-archived', isArchived: true };
    render(<PracticeEntryCard entry={archivedEntry} onArchive={onArchive} />);
    const archiveButton = screen.getByTestId('archive-button-practice-archived');
    fireEvent.click(archiveButton);
    expect(onArchive).toHaveBeenCalledWith('practice-archived', false);
  });

  it('favorite and archive buttons have aria-label containing entry summary and date', () => {
    render(<PracticeEntryCard entry={mockEntry} />);
    const favButton = screen.getByTestId('favorite-button-practice-1');
    const archiveButton = screen.getByTestId('archive-button-practice-1');

    expect(favButton).toHaveAttribute('aria-label');
    expect(archiveButton).toHaveAttribute('aria-label');
    expect(favButton.getAttribute('aria-label')).toContain('你如果真的在乎我');
    expect(favButton.getAttribute('aria-label')).toContain('收藏');
    expect(favButton.getAttribute('aria-label')).toContain('保存于');
    expect(archiveButton.getAttribute('aria-label')).toContain('保存于');
  });

  it('archive button shows "归档" text for unarchived entries', () => {
    render(<PracticeEntryCard entry={mockEntry} />);
    const archiveButton = screen.getByTestId('archive-button-practice-1');
    expect(archiveButton).toHaveTextContent('归档');
    expect(archiveButton).toHaveAttribute('aria-label', expect.stringContaining('归档练习'));
  });

  it('archive button shows "取消归档" text for archived entries', () => {
    const archivedEntry = { ...mockEntry, id: 'practice-archived', isArchived: true };
    render(<PracticeEntryCard entry={archivedEntry} />);
    const archiveButton = screen.getByTestId('archive-button-practice-archived');
    expect(archiveButton).toHaveTextContent('取消归档');
    expect(archiveButton).toHaveAttribute('aria-label', expect.stringContaining('取消归档练习'));
  });

  it('renders non-decode entries without dead clickable affordance when onClick is absent', () => {
    render(<PracticeEntryCard entry={mockSimulatorEntry} />);

    expect(screen.getByText('我选择的回应')).toBeInTheDocument();
    expect(screen.getByText(/我会先暂停一下/)).toBeInTheDocument();
    const clickable = screen.getByTestId('practice-entry-card-clickable-practice-simulator');
    expect(clickable).not.toHaveAttribute('role');
    expect(clickable).not.toHaveAttribute('tabindex');
  });

  it('falls back to surface meaning when subtext is empty', () => {
    const surfaceOnlyEntry: PracticeEntry = {
      ...mockEntry,
      id: 'practice-surface-only',
      content: {
        ...mockEntry.content,
        analysis: {
          ...mockEntry.content.analysis,
          subtext: '',
        },
      },
    };

    render(<PracticeEntryCard entry={surfaceOnlyEntry} />);

    expect(screen.getByText('表面意思')).toBeInTheDocument();
    expect(screen.getByText(/对方认为你的行为代表不在乎/)).toBeInTheDocument();
  });

  it('handles emotion fallback labels', () => {
    const statusOnlyEntry: PracticeEntry = {
      ...mockEntry,
      id: 'practice-status-only',
      content: {
        ...mockEntry.content,
        analysis: {
          ...mockEntry.content.analysis,
          emotionScore: undefined as unknown as number,
        },
      },
    };
    const scoreOnlyEntry: PracticeEntry = {
      ...mockEntry,
      id: 'practice-score-only',
      content: {
        ...mockEntry.content,
        analysis: {
          ...mockEntry.content.analysis,
          emotionStatus: undefined as unknown as string,
        },
      },
    };

    const { rerender } = render(<PracticeEntryCard entry={statusOnlyEntry} />);
    expect(screen.getByText('高压')).toBeInTheDocument();

    rerender(<PracticeEntryCard entry={scoreOnlyEntry} />);
    expect(screen.getByText('情绪分 · 72')).toBeInTheDocument();
  });

  it('action buttons have visible focus and reduced-motion classes', () => {
    render(<PracticeEntryCard entry={mockEntry} />);

    expect(screen.getByTestId('favorite-button-practice-1')).toHaveClass('focus:ring-2', 'motion-reduce:transition-none');
    expect(screen.getByTestId('archive-button-practice-1')).toHaveClass('focus:ring-2', 'motion-reduce:transition-none');
  });

  it('does not show relation badge when relationName is absent', () => {
    const entryWithoutRelation = {
      ...mockEntry,
      content: {
        ...mockEntry.content,
        relationName: undefined,
      },
    };
    render(<PracticeEntryCard entry={entryWithoutRelation} />);
    expect(screen.queryByText('伴侣')).not.toBeInTheDocument();
  });
});

describe('PracticeFilterBar', () => {
  const onSearchChange = vi.fn();
  const onRelationFilterChange = vi.fn();
  const onSourceTypeFilterChange = vi.fn();
  const onArchiveFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input, source filters, archive tabs, and relation select', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={['伴侣', '同事']}
      />
    );

    expect(screen.getByTestId('practice-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('source-filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('source-filter-decode')).toBeInTheDocument();
    expect(screen.getByTestId('archive-tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('archive-tab-favorites')).toBeInTheDocument();
    expect(screen.getByTestId('archive-tab-unarchived')).toBeInTheDocument();
    expect(screen.getByTestId('archive-tab-archived')).toBeInTheDocument();
    expect(screen.getByTestId('relation-filter-select')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    fireEvent.change(screen.getByTestId('practice-search-input'), { target: { value: '测试' } });
    expect(onSearchChange).toHaveBeenCalledWith('测试');
  });

  it('calls onSourceTypeFilterChange when source filter clicked', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    fireEvent.click(screen.getByTestId('source-filter-decode'));
    expect(onSourceTypeFilterChange).toHaveBeenCalledWith('decode');
  });

  it('calls onArchiveFilterChange when archive tab clicked', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    fireEvent.click(screen.getByTestId('archive-tab-favorites'));
    expect(onArchiveFilterChange).toHaveBeenCalledWith('favorites');
  });

  it('calls onRelationFilterChange when relation select changes', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={['伴侣', '同事']}
      />
    );

    fireEvent.change(screen.getByTestId('relation-filter-select'), { target: { value: '伴侣' } });
    expect(onRelationFilterChange).toHaveBeenCalledWith('伴侣');
  });

  it('archive buttons expose pressed state via aria-pressed', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="favorites"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    expect(screen.getByTestId('archive-tab-favorites')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('archive-tab-all')).toHaveAttribute('aria-pressed', 'false');
  });

  it('source filter group has role=group, aria-label, and pressed state', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="decode"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    expect(screen.getByRole('group', { name: '来源筛选' })).toBeInTheDocument();
    expect(screen.getByTestId('source-filter-decode')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('source-filter-all')).toHaveAttribute('aria-pressed', 'false');
  });

  it('does not render relation select when relationOptions is empty', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    expect(screen.queryByTestId('relation-filter-select')).not.toBeInTheDocument();
  });

  it('search input has accessible aria-label', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    expect(screen.getByTestId('practice-search-input')).toHaveAttribute('aria-label', '搜索练习内容');
  });

  it('relation select has accessible aria-label', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={['伴侣', '同事']}
      />
    );

    expect(screen.getByTestId('relation-filter-select')).toHaveAttribute('aria-label', '按关系筛选');
  });

  it('archive filter group has role=group and aria-label', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    const group = screen.getByRole('group', { name: '归档筛选' });
    expect(group).toBeInTheDocument();
  });

  it('has root rounded-[1.75rem] and search input h-11', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={[]}
      />
    );

    expect(screen.getByTestId('practice-filter-bar')).toHaveClass('rounded-[1.75rem]');
    expect(screen.getByLabelText('搜索练习内容')).toHaveClass('h-11');
  });

  it('shows relation label and select has h-9', () => {
    render(
      <PracticeFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        relationFilter=""
        onRelationFilterChange={onRelationFilterChange}
        sourceTypeFilter="all"
        onSourceTypeFilterChange={onSourceTypeFilterChange}
        archiveFilter="all"
        onArchiveFilterChange={onArchiveFilterChange}
        relationOptions={['伴侣', '同事']}
      />
    );

    expect(screen.getByText('关系标签')).toBeInTheDocument();
    expect(screen.getByLabelText('按关系筛选')).toHaveClass('h-9');
  });
});

describe('PracticeEntryDrawer', () => {
  const onClose = vi.fn();
  const onFavorite = vi.fn();
  const onArchive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={false}
        onClose={onClose}
      />
    );
    expect(screen.queryByTestId('practice-entry-drawer')).not.toBeInTheDocument();
  });

  it('renders detail view with renamed sections and content', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog', { name: /一次沟通复盘/ })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('sm:w-[480px]');
    expect(screen.getByText('对方说了什么')).toBeInTheDocument();
    expect(screen.getByText('你如果真的在乎我，就不会这样做。')).toBeInTheDocument();
    expect(screen.getByText('表面意思')).toBeInTheDocument();
    expect(screen.getByText('对方认为你的行为代表不在乎。')).toBeInTheDocument();
    expect(screen.getByText('可能真正想表达')).toBeInTheDocument();
    expect(screen.getByText('对方试图用内疚感迫使你让步。')).toBeInTheDocument();
    expect(screen.getByText('情绪温度')).toBeInTheDocument();
    expect(screen.getByText('高压')).toBeInTheDocument();
    expect(screen.getByText('我可以怎样回应')).toBeInTheDocument();
  });

  it('shows all reply options with selected reply highlighted', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('我可以怎样回应')).toBeInTheDocument();
    expect(screen.getByTestId('reply-option-A')).toBeInTheDocument();
    expect(screen.getByTestId('reply-option-B')).toBeInTheDocument();
    expect(screen.getByTestId('reply-option-C')).toBeInTheDocument();

    const selectedOption = screen.getByTestId('reply-option-A');
    expect(selectedOption.textContent).toContain('已选择');
  });

  it('calls onClose when close button clicked', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId('drawer-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId('drawer-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus to close button when opened', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('drawer-close-button');
    expect(document.activeElement).toBe(closeButton);
  });

  it('traps focus with Tab key', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
        onFavorite={onFavorite}
        onArchive={onArchive}
      />
    );

    const focusable = screen.getByRole('dialog').querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus last element and press Tab
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    // Focus first element and press Shift+Tab
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('calls onFavorite when drawer favorite button clicked', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
        onFavorite={onFavorite}
      />
    );

    fireEvent.click(screen.getByTestId('drawer-favorite-button'));
    expect(onFavorite).toHaveBeenCalledWith('practice-1', true);
  });

  it('calls onArchive with (id, true) when drawer archive button clicked on unarchived entry', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
        onArchive={onArchive}
      />
    );

    fireEvent.click(screen.getByTestId('drawer-archive-button'));
    expect(onArchive).toHaveBeenCalledWith('practice-1', true);
  });

  it('shows "取消归档" in drawer for archived entry and calls onArchive with (id, false)', () => {
    const archivedEntry = { ...mockEntry, isArchived: true };
    render(
      <PracticeEntryDrawer
        entry={archivedEntry}
        isOpen={true}
        onClose={onClose}
        onArchive={onArchive}
      />
    );

    const archiveButton = screen.getByTestId('drawer-archive-button');
    expect(archiveButton).toHaveTextContent('取消归档');
    expect(archiveButton).toHaveAttribute('aria-label', expect.stringContaining('取消归档练习'));

    fireEvent.click(archiveButton);
    expect(onArchive).toHaveBeenCalledWith('practice-1', false);
  });

  it('has accessible dialog title', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'practice-drawer-title');
    expect(screen.getByText('一次沟通复盘')).toHaveAttribute('id', 'practice-drawer-title');
  });

  it('shows relation context when available', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('伴侣')).toBeInTheDocument();
  });

  it('shows muted scenario and attack type in 可能真正想表达 section', () => {
    render(
      <PracticeEntryDrawer
        entry={mockEntry}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('情感勒索')).toBeInTheDocument();
  });
});

describe('PracticeStates', () => {
  it('PracticeEmptyState renders gentle copy and CTA', () => {
    const onAction = vi.fn();
    render(<PracticeEmptyState onAction={onAction} />);

    expect(screen.getByText('这里还很安静')).toBeInTheDocument();
    expect(screen.getByText('保存一次读心翻译后，它会变成你的沟通练习档案。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '去保存第一条练习' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('empty-state-action'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('PracticeEmptyState renders without action button when onAction is absent', () => {
    render(<PracticeEmptyState />);
    expect(screen.queryByTestId('empty-state-action')).not.toBeInTheDocument();
  });

  it('PracticeSkeletonList renders skeleton cards with correct count', () => {
    render(<PracticeSkeletonList count={2} />);
    expect(screen.getByTestId('practice-skeleton-list')).toBeInTheDocument();
    const cards = screen.getAllByTestId('practice-skeleton-card');
    expect(cards).toHaveLength(2);
  });

  it('PracticeSkeletonList uses default count of 3', () => {
    render(<PracticeSkeletonList />);
    const cards = screen.getAllByTestId('practice-skeleton-card');
    expect(cards).toHaveLength(3);
  });

  it('PracticeErrorState renders gentle copy and retry button', () => {
    const onRetry = vi.fn();
    render(<PracticeErrorState onRetry={onRetry} />);

    expect(screen.getByText('练习本暂时没有打开')).toBeInTheDocument();
    expect(screen.getByText('可能是网络轻轻绊了一下，稍后再试就好。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('error-retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('PracticeErrorState renders without retry button when onRetry is absent', () => {
    render(<PracticeErrorState />);
    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
  });
});
