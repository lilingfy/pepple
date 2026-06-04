import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { PracticeEntry } from '@pebble/types';

// Mock next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/me/practice',
}));

vi.mock('@/components/layout/AppHeader', () => ({
  AppHeader: ({ activeHref }: { activeHref?: string }) => (
    <header data-testid="app-header" data-active-href={activeHref} />
  ),
}));

// Mock practice-client helpers
const mockListPracticeEntries = vi.fn();
const mockGetPracticeEntry = vi.fn();
const mockUpdatePracticeEntry = vi.fn();

vi.mock('@/lib/frontend/practice-client', () => ({
  listPracticeEntries: (...args: unknown[]) => mockListPracticeEntries(...args),
  getPracticeEntry: (...args: unknown[]) => mockGetPracticeEntry(...args),
  updatePracticeEntry: (...args: unknown[]) => mockUpdatePracticeEntry(...args),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => ({ showToast: mockShowToast }),
}));

import PracticePage from '@/app/(main)/me/practice/page';

const mockEntryA: PracticeEntry = {
  id: 'practice-a',
  sourceType: 'decode',
  primaryReply: '回复A',
  content: {
    originalText: '原始文本A',
    surfaceMeaning: '表面意思A',
    analysis: {
      attackType: '情感勒索',
      scenario: 'decode',
      subtext: '潜台词A',
      emotionScore: 72,
      neutralityScore: 28,
      emotionStatus: '高压',
    },
    replyOptions: [{ id: 'A', label: 'A', content: '回复A', tone: 'neutral' }],
    selectedReplyId: 'A',
    relationId: 'relation-1',
    relationName: '伴侣',
  },
  isFavorite: false,
  isArchived: false,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2024-06-01T10:00:00Z',
};

const mockEntryB: PracticeEntry = {
  id: 'practice-b',
  sourceType: 'decode',
  primaryReply: '回复B',
  content: {
    originalText: '原始文本B',
    surfaceMeaning: '表面意思B',
    analysis: {
      attackType: '一般攻击',
      scenario: 'decode',
      subtext: '潜台词B',
      emotionScore: 45,
      neutralityScore: 55,
      emotionStatus: '中等',
    },
    replyOptions: [{ id: 'B', label: 'B', content: '回复B', tone: 'neutral' }],
    selectedReplyId: 'B',
    relationId: 'relation-2',
    relationName: '同事',
  },
  isFavorite: true,
  isArchived: false,
  createdAt: '2024-06-02T10:00:00Z',
  updatedAt: '2024-06-02T10:00:00Z',
};

function mockListResponse(entries: PracticeEntry[], hasMore = false, nextCursor?: string) {
  return {
    entries,
    total: entries.length,
    hasMore,
    nextCursor,
  };
}

describe('PracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockListPracticeEntries.mockReset();
    mockGetPracticeEntry.mockReset();
    mockUpdatePracticeEntry.mockReset();
    mockShowToast.mockReset();
    mockReplace.mockReset();
    mockPush.mockReset();
  });

  it('loads unarchived decode entries by default on mount', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(mockListPracticeEntries).toHaveBeenCalledWith(
        expect.objectContaining({ sourceType: 'decode', isArchived: false, limit: 20 })
      );
    });

    expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
  });

  it('renders responsive grid with cards', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
      expect(screen.getByTestId('practice-entry-card-practice-b')).toBeInTheDocument();
    });
  });

  it('filters by search query client-side', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('practice-search-input'), {
      target: { value: '原始文本B' },
    });

    expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('practice-entry-card-practice-b')).toBeInTheDocument();
  });

  it('filters by relation from loaded entries', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('relation-filter-select')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('relation-filter-select'), {
      target: { value: '同事' },
    });

    expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('practice-entry-card-practice-b')).toBeInTheDocument();
  });

  it('filters by sourceType when component exposes it', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('source-filter-all')).toBeInTheDocument();
    });

    // Default is already decode; switch to all first, then back to decode
    fireEvent.click(screen.getByTestId('source-filter-all'));

    await waitFor(() => {
      const lastCall = mockListPracticeEntries.mock.calls[mockListPracticeEntries.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty('sourceType');
    });

    fireEvent.click(screen.getByTestId('source-filter-decode'));

    await waitFor(() => {
      expect(mockListPracticeEntries).toHaveBeenCalledWith(
        expect.objectContaining({ sourceType: 'decode', isArchived: false, limit: 20 })
      );
    });
  });

  it('switches archive filter and omits isArchived for all', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-all')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-all'));

    await waitFor(() => {
      const lastCall = mockListPracticeEntries.mock.calls[mockListPracticeEntries.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty('isArchived');
      expect(lastCall).toHaveProperty('limit', 20);
    });
  });

  it('sends isArchived=true for archived filter', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-archived')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-archived'));

    await waitFor(() => {
      expect(mockListPracticeEntries).toHaveBeenCalledWith(
        expect.objectContaining({ isArchived: true, limit: 20 })
      );
    });
  });

  it('sends isFavorite=true for favorites filter', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-favorites'));

    await waitFor(() => {
      expect(mockListPracticeEntries).toHaveBeenCalledWith(
        expect.objectContaining({ isFavorite: true, limit: 20 })
      );
    });
  });

  it('shows "加载更多" when hasMore and appends entries on click', async () => {
    mockListPracticeEntries
      .mockResolvedValueOnce(mockListResponse([mockEntryA], true, 'cursor-1'))
      .mockResolvedValueOnce(mockListResponse([mockEntryB], false));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    expect(screen.getByTestId('load-more-button')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('load-more-button'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-b')).toBeInTheDocument();
    });

    expect(mockListPracticeEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-1' })
    );
  });

  it('optimistically updates favorite and reverts on PATCH failure', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockRejectedValue(new Error('网络错误'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('favorite-button-practice-a')).toBeInTheDocument();
    });

    const favButton = screen.getByTestId('favorite-button-practice-a');
    // Before click: not favorite
    expect(favButton).toHaveAttribute('aria-label', expect.stringContaining('收藏'));

    fireEvent.click(favButton);

    // Optimistic flip: should now appear as favorite
    await waitFor(() => {
      expect(favButton).toHaveAttribute('aria-label', expect.stringContaining('取消收藏'));
    });

    // Should call update
    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledWith('practice-a', { isFavorite: true });
    });

    // Should revert and show toast
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('网络错误', 'error');
    });

    // After revert: back to not favorite
    await waitFor(() => {
      expect(favButton).toHaveAttribute('aria-label', expect.stringContaining('收藏'));
    });
  });

  it('removes archived entry from list in unarchived view after success', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockResolvedValue({ ...mockEntryA, isArchived: true });

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledWith('practice-a', { isArchived: true });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    });
  });

  it('updates local item for archived/all states instead of removing', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockResolvedValue({ ...mockEntryA, isArchived: true });

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-all')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-all'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledWith('practice-a', { isArchived: true });
    });

    // In 'all' view, item should remain (updated locally)
    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });
  });

  it('sends { isArchived: false } when restoring from archived view and removes restored item', async () => {
    const archivedEntryA = { ...mockEntryA, isArchived: true };
    mockListPracticeEntries.mockResolvedValue(mockListResponse([archivedEntryA]));
    mockUpdatePracticeEntry.mockResolvedValue({ ...archivedEntryA, isArchived: false });

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-archived')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-archived'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledWith('practice-a', { isArchived: false });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    });
  });

  it('shows "归档失败" toast when archiving fails', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockRejectedValue(new Error('网络错误'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('归档失败', 'error');
    });
  });

  it('shows "取消归档失败" toast when restoring fails', async () => {
    const archivedEntryA = { ...mockEntryA, isArchived: true };
    mockListPracticeEntries.mockResolvedValue(mockListResponse([archivedEntryA]));
    mockUpdatePracticeEntry.mockRejectedValue(new Error('网络错误'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-archived')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-archived'));

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('取消归档失败', 'error');
    });
  });

  it('does not remove entry from all view when stale archive resolves after switching to all', async () => {
    let resolveArchive: (value: unknown) => void;
    const archivePromise = new Promise((resolve) => {
      resolveArchive = resolve;
    });

    mockListPracticeEntries
      .mockResolvedValueOnce(mockListResponse([mockEntryA]))
      .mockResolvedValueOnce(mockListResponse([mockEntryA]));

    mockUpdatePracticeEntry.mockReturnValue(archivePromise);

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledWith('practice-a', { isArchived: true });
    });

    fireEvent.click(screen.getByTestId('archive-tab-all'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    resolveArchive!({ ...mockEntryA, isArchived: true });

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });
  });

  it('ignores rapid duplicate archive clicks while pending', async () => {
    let resolveArchive: (value: unknown) => void;
    const archivePromise = new Promise((resolve) => {
      resolveArchive = resolve;
    });

    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockReturnValue(archivePromise);

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));
    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockUpdatePracticeEntry).toHaveBeenCalledTimes(1);
    });

    resolveArchive!({ ...mockEntryA, isArchived: true });

    await waitFor(() => {
      expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    });
  });

  it('failed archive leaves entry visible in unarchived view', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockUpdatePracticeEntry.mockRejectedValue(new Error('网络错误'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('归档失败', 'error');
    });

    expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
  });

  it('failed restore leaves entry visible in archived view', async () => {
    const archivedEntryA = { ...mockEntryA, isArchived: true };
    mockListPracticeEntries.mockResolvedValue(mockListResponse([archivedEntryA]));
    mockUpdatePracticeEntry.mockRejectedValue(new Error('网络错误'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('archive-tab-archived')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-tab-archived'));

    await waitFor(() => {
      expect(screen.getByTestId('archive-button-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('archive-button-practice-a'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('取消归档失败', 'error');
    });

    expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
  });

  it('opens detail drawer on card click', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('practice-entry-card-clickable-practice-a'));

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-drawer')).toBeInTheDocument();
    });
  });

  it('auto-opens drawer for deep link ?entry=<id> when entry is loaded', async () => {
    mockSearchParams = new URLSearchParams('entry=practice-a');
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockGetPracticeEntry.mockResolvedValue(mockEntryA);

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-drawer')).toBeInTheDocument();
    });
  });

  it('fetches entry via getPracticeEntry for deep link if not in loaded list', async () => {
    mockSearchParams = new URLSearchParams('entry=practice-b');
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockGetPracticeEntry.mockResolvedValue(mockEntryB);

    render(<PracticePage />);

    await waitFor(() => {
      expect(mockGetPracticeEntry).toHaveBeenCalledWith('practice-b');
    });

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-drawer')).toBeInTheDocument();
    });
  });

  it('shows gentle not-found message for missing deep link entry without blocking list', async () => {
    mockSearchParams = new URLSearchParams('entry=missing-id');
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));
    mockGetPracticeEntry.mockRejectedValue(new Error('Not found'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('deep-link-not-found')).toBeInTheDocument();
    });

    expect(screen.getByTestId('deep-link-not-found')).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '没有找到这条练习，它可能已经被归档或删除。你仍然可以继续浏览其他记录。'
    );

    // List should still render
    expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
  });

  it('ignores stale list responses when filter changes trigger a newer request', async () => {
    // First call (mount) resolves slowly with entry A
    mockListPracticeEntries.mockImplementationOnce(async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockListResponse([mockEntryA], false);
    });
    // Second call (after filter change) resolves immediately with entry B
    mockListPracticeEntries.mockResolvedValueOnce(mockListResponse([mockEntryB], false));

    render(<PracticePage />);

    // Wait for mount request to start
    await waitFor(() => {
      expect(mockListPracticeEntries).toHaveBeenCalled();
    });

    // Change filter to trigger second request
    fireEvent.click(screen.getByTestId('archive-tab-all'));

    // Wait for second request to complete
    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-b')).toBeInTheDocument();
    });

    // Wait for the stale first request to complete
    await new Promise((r) => setTimeout(r, 100));

    // Entry A from stale request should NOT appear
    expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
  });

  it('renders hero with healing copy, back button, and CTA', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    expect(screen.getByText('把每一次想好好说话的努力，轻轻收好。')).toBeInTheDocument();
    expect(
      screen.getByText('这里收藏了你的读心翻译、回应选择和关系语境，方便你慢慢复盘。')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /返回个人中心/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /保存新的练习/ })).toBeInTheDocument();
    expect(screen.getByText('练习本')).toBeInTheDocument();
    expect(screen.getByTestId('practice-hero')).toHaveClass('lg:flex-row');
  });

  it('derives hero stats from loaded entries without extra API calls', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await screen.findByTestId('practice-entry-card-practice-a');

    expect(screen.getByTestId('practice-stat-total')).toHaveTextContent('2');
    expect(screen.getByTestId('practice-stat-favorites')).toHaveTextContent('1');
    expect(screen.getByTestId('practice-stat-unarchived')).toHaveTextContent('2');
    expect(mockListPracticeEntries).toHaveBeenCalledTimes(1);
  });

  it('renders card grid with responsive breakpoint class', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    expect(screen.getByTestId('practice-card-grid')).toHaveClass('md:grid-cols-2');
  });

  it('shows filtered empty copy when no matches', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA, mockEntryB]));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('practice-entry-card-practice-a')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('practice-search-input'), {
      target: { value: '不存在的文本' },
    });

    expect(screen.queryByTestId('practice-entry-card-practice-a')).not.toBeInTheDocument();
    expect(screen.getByText('这些筛选下暂时没有练习，换个标签看看，或继续加载更多。')).toBeInTheDocument();
  });

  it('load-more button has spec classes', async () => {
    mockListPracticeEntries.mockResolvedValue(mockListResponse([mockEntryA], true, 'cursor-1'));

    render(<PracticePage />);

    await waitFor(() => {
      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    const btn = screen.getByTestId('load-more-button');
    expect(btn).toHaveClass('rounded-full', 'bg-[#FEFDF9]/90', 'px-6', 'py-2.5', 'text-sm', 'font-medium', 'text-[#2C3E50]', 'border', 'border-[#A8D8B9]/30', 'shadow-[0_4px_20px_rgba(45,106,79,0.06)]');
  });
});
