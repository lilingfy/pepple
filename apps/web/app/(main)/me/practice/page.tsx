'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { PracticeEntryCard } from '@/components/practice/PracticeEntryCard';
import { PracticeFilterBar, type ArchiveFilter } from '@/components/practice/PracticeFilterBar';
import { PracticeEntryDrawer } from '@/components/practice/PracticeEntryDrawer';
import { PracticeEmptyState, PracticeErrorState, PracticeSkeletonList } from '@/components/practice/PracticeStates';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import {
  listPracticeEntries,
  getPracticeEntry,
  updatePracticeEntry,
  type PracticeFilters,
} from '@/lib/frontend/practice-client';
import type { PracticeEntry } from '@pebble/types';

const PAGE_LIMIT = 20;

function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [relationFilter, setRelationFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'decode' | 'all'>('decode');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('unarchived');

  const [drawerEntry, setDrawerEntry] = useState<PracticeEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notFoundId, setNotFoundId] = useState<string | null>(null);

  // Race protection: generation counter for list requests
  const listGenerationRef = useRef(0);
  // Deep-link processed id tracking
  const processedEntryIdRef = useRef<string | null>(null);
  // Archive filter ref for stale-closure protection in async handlers
  const archiveFilterRef = useRef(archiveFilter);
  archiveFilterRef.current = archiveFilter;
  // Per-entry operation generation to ignore stale mutation completions
  const archiveGenRef = useRef<Map<string, number>>(new Map());
  // Pending archive ids to prevent rapid duplicate toggles
  const pendingArchiveIdsRef = useRef<Set<string>>(new Set());

  const relationOptions = useMemo(() => {
    const names = new Set<string>();
    for (const entry of entries) {
      const name = entry.sourceType === 'decode' && 'relationName' in entry.content
        ? (entry.content as { relationName?: string }).relationName
        : undefined;
      if (name) names.add(name);
    }
    return Array.from(names).sort();
  }, [entries]);

  const practiceStats = useMemo(() => ({
    total: entries.length,
    favorites: entries.filter((entry) => entry.isFavorite).length,
    unarchived: entries.filter((entry) => !entry.isArchived).length,
  }), [entries]);

  const buildFilters = useCallback((): PracticeFilters => {
    const filters: PracticeFilters = {
      limit: PAGE_LIMIT,
    };

    if (sourceTypeFilter !== 'all') {
      filters.sourceType = sourceTypeFilter;
    }

    if (archiveFilter === 'favorites') {
      filters.isFavorite = true;
    } else if (archiveFilter === 'archived') {
      filters.isArchived = true;
    } else if (archiveFilter === 'unarchived') {
      filters.isArchived = false;
    }
    // 'all' omits isArchived

    return filters;
  }, [sourceTypeFilter, archiveFilter]);

  const loadEntries = useCallback(
    async (append = false, overrideCursor?: string) => {
      if (!append) {
        setIsLoading(true);
        setIsLoadingMore(false);
        setError(null);
        setLoadMoreError(null);
      } else {
        setIsLoadingMore(true);
        setLoadMoreError(null);
      }

      const generation = ++listGenerationRef.current;

      try {
        const filters = buildFilters();
        if (append) {
          const nextRequestCursor = overrideCursor ?? cursor;
          if (nextRequestCursor) {
            filters.cursor = nextRequestCursor;
          }
        }

        const response = await listPracticeEntries(filters);

        // Ignore stale responses
        if (generation !== listGenerationRef.current) {
          return;
        }

        setEntries((prev) => (append ? [...prev, ...response.entries] : response.entries));
        setHasMore(response.hasMore);
        // Use nextCursor if available, otherwise infer from last entry id
        const nextCursor =
          response.nextCursor ??
          (response.entries.length > 0 ? response.entries[response.entries.length - 1].id : undefined);
        setCursor(nextCursor);
      } catch (err) {
        // Ignore stale errors
        if (generation !== listGenerationRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : '加载失败';
        if (append) {
          setLoadMoreError(message);
        } else {
          setError(message);
          setEntries([]);
        }
      } finally {
        if (generation === listGenerationRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [buildFilters, cursor]
  );

  // Reset and reload when filters change (except search/relation which are client-side)
  useEffect(() => {
    setEntries([]);
    setCursor(undefined);
    setHasMore(false);
    void loadEntries(false, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveFilter, sourceTypeFilter]);

  // Deep link: open drawer for ?entry=<id>
  useEffect(() => {
    const entryId = searchParams.get('entry');
    if (!entryId) {
      setNotFoundId(null);
      processedEntryIdRef.current = null;
      return;
    }

    // If we already processed this entryId and drawer is closed, don't re-open
    if (processedEntryIdRef.current === entryId && !isDrawerOpen) {
      return;
    }

    // If drawer is already open with this exact entry, don't re-fetch
    if (isDrawerOpen && drawerEntry?.id === entryId) {
      processedEntryIdRef.current = entryId;
      return;
    }

    // If drawer is open with a different entry, sync to the new one

    // Fetch individually (we don't depend on entries to avoid re-opening on mutations)
    let cancelled = false;
    getPracticeEntry(entryId)
      .then((entry) => {
        if (!cancelled) {
          setDrawerEntry(entry);
          setIsDrawerOpen(true);
          setNotFoundId(null);
          processedEntryIdRef.current = entryId;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFoundId(entryId);
          setIsDrawerOpen(false);
          setDrawerEntry(null);
          processedEntryIdRef.current = entryId;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, isDrawerOpen, drawerEntry?.id]);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (relationFilter) {
      result = result.filter((e) => {
        const name = e.sourceType === 'decode' && 'relationName' in e.content
          ? (e.content as { relationName?: string }).relationName
          : undefined;
        return name === relationFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((e) => {
        const originalText = e.sourceType === 'decode' && 'originalText' in e.content
          ? String((e.content as { originalText?: string }).originalText || '')
          : '';
        return originalText.toLowerCase().includes(q) || e.primaryReply.toLowerCase().includes(q);
      });
    }

    return result;
  }, [entries, relationFilter, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void loadEntries(true);
    }
  }, [hasMore, isLoadingMore, loadEntries]);

  const handleFavorite = useCallback(
    async (id: string, nextFavorite: boolean) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isFavorite: nextFavorite } : e))
      );
      setDrawerEntry((current) =>
        current?.id === id ? { ...current, isFavorite: nextFavorite } : current
      );

      try {
        await updatePracticeEntry(id, { isFavorite: nextFavorite });
      } catch (err) {
        setEntries((prev) => {
          const target = prev.find((e) => e.id === id);
          if (!target) return prev;
          return prev.map((e) =>
            e.id === id ? { ...e, isFavorite: !nextFavorite } : e
          );
        });
        setDrawerEntry((current) =>
          current?.id === id ? { ...current, isFavorite: !nextFavorite } : current
        );
        const message = err instanceof Error ? err.message : '收藏更新失败';
        showToast(message, 'error');
      }
    },
    [showToast]
  );

  const handleArchive = useCallback(
    async (id: string, nextArchived: boolean) => {
      // Prevent rapid duplicate archive toggles
      if (pendingArchiveIdsRef.current.has(id)) {
        return;
      }
      pendingArchiveIdsRef.current.add(id);

      // Increment generation for this entry so stale completions are ignored
      const currentGen = (archiveGenRef.current.get(id) ?? 0) + 1;
      archiveGenRef.current.set(id, currentGen);

      let entryBefore: PracticeEntry | undefined;
      setEntries((prev) => {
        entryBefore = prev.find((e) => e.id === id);
        return prev.map((e) => (e.id === id ? { ...e, isArchived: nextArchived } : e));
      });
      setDrawerEntry((current) =>
        current?.id === id ? { ...current, isArchived: nextArchived } : current
      );

      try {
        await updatePracticeEntry(id, { isArchived: nextArchived });
        // Ignore stale completions if a newer operation started for this entry
        if (archiveGenRef.current.get(id) !== currentGen) {
          return;
        }
        // Use current filter from ref, not stale closure
        const currentFilter = archiveFilterRef.current;
        if (currentFilter === 'unarchived' && nextArchived) {
          setEntries((prev) => prev.filter((e) => e.id !== id));
        } else if (currentFilter === 'archived' && !nextArchived) {
          setEntries((prev) => prev.filter((e) => e.id !== id));
        }
      } catch (err) {
        // Ignore stale error rollbacks if a newer operation started for this entry
        if (archiveGenRef.current.get(id) !== currentGen) {
          return;
        }
        setEntries((prev) => {
          const exists = prev.find((e) => e.id === id);
          if (exists) {
            return prev.map((e) =>
              e.id === id ? { ...e, isArchived: !nextArchived } : e
            );
          }
          if (entryBefore) {
            return [...prev, entryBefore];
          }
          return prev;
        });
        setDrawerEntry((current) =>
          current?.id === id ? { ...current, isArchived: !nextArchived } : current
        );
        const message = nextArchived ? '归档失败' : '取消归档失败';
        showToast(message, 'error');
      } finally {
        pendingArchiveIdsRef.current.delete(id);
      }
    },
    [showToast]
  );

  const handleCardClick = useCallback((entry: PracticeEntry) => {
    setDrawerEntry(entry);
    setIsDrawerOpen(true);
    setNotFoundId(null);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    // Optionally clear query param when closing
    const current = new URLSearchParams(searchParams.toString());
    if (current.has('entry')) {
      current.delete('entry');
      const query = current.toString();
      const url = query ? `/me/practice?${query}` : '/me/practice';
      router.replace(url);
    }
  }, [router, searchParams]);

  const handleEmptyAction = useCallback(() => {
    router.push('/translator');
  }, [router]);

  return (
    <>
      <AppHeader activeHref="/me" />
      <main className="relative min-h-screen overflow-hidden bg-[#F0F7F2]">
        {/* Soft green healing gradient layers */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#E8F5E9_0%,_transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#E3F2FD_0%,_transparent_50%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_#F0F7F2_0%,_#E8F3EB_100%)]" />

        {/* Soft color blobs — green-forward */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[#A8D8B9]/35 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-[#90CAF9]/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#BCA564]/12 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-16 h-56 w-56 rounded-full bg-[#FFF3E0]/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-[#A8D8B9]/22 blur-3xl" />

        <div className="relative z-10 container mx-auto max-w-6xl px-4 pb-12 pt-24 md:px-6">
          {/* Hero */}
          <div
            className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#FEFDF9]/85 backdrop-blur-xl border border-[#A8D8B9]/25 px-6 py-7 md:rounded-[2.5rem] md:px-8 md:py-8 shadow-[0_18px_50px_rgba(45,106,79,0.10)]"
            data-testid="practice-hero-card"
          >
            <div className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-[#A8D8B9]/20 blur-2xl" aria-hidden="true" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-testid="practice-hero">
              {/* Left: text content */}
              <div className="flex flex-col gap-5">
                <button
                  type="button"
                  onClick={() => router.push('/me')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FEFDF9]/80 px-4 py-2 text-sm font-medium text-[#2C3E50] border border-[#A8D8B9]/25 transition-all hover:bg-[#FEFDF9] w-fit"
                  data-testid="back-to-me-button"
                >
                  ← 返回个人中心
                </button>
                <div>
                  <h1 className="mb-3 text-4xl font-bold leading-tight md:text-5xl bg-gradient-to-r from-[#2D6A4F] via-[#7D8C9F] to-[#BCA564] bg-clip-text text-transparent">
                    练习本
                  </h1>
                  <p className="mb-2 text-xl font-semibold text-[#2C3E50] md:text-2xl">
                    把每一次想好好说话的努力，轻轻收好。
                  </p>
                  <p className="max-w-md text-sm leading-relaxed text-[#7D8C9F]">
                    这里收藏了你的读心翻译、回应选择和关系语境，方便你慢慢复盘。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/translator')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2C3E50] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#3D4F5F] hover:shadow-md w-fit"
                >
                  保存新的练习
                </button>
              </div>

              {/* Right: stats */}
              <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] bg-[#F0F7F2]/60 p-2 border border-[#A8D8B9]/20">
                <div className="rounded-[1.15rem] bg-[#FEFDF9]/80 px-4 py-3 text-center" data-testid="practice-stat-total">
                  <div className="text-xl font-semibold text-[#2C3E50]">{practiceStats.total}</div>
                  <div className="mt-1 text-xs text-[#7D8C9F]">已保存</div>
                </div>
                <div className="rounded-[1.15rem] bg-[#FEFDF9]/80 px-4 py-3 text-center" data-testid="practice-stat-favorites">
                  <div className="text-xl font-semibold text-[#2C3E50]">{practiceStats.favorites}</div>
                  <div className="mt-1 text-xs text-[#7D8C9F]">收藏</div>
                </div>
                <div className="rounded-[1.15rem] bg-[#FEFDF9]/80 px-4 py-3 text-center" data-testid="practice-stat-unarchived">
                  <div className="text-xl font-semibold text-[#2C3E50]">{practiceStats.unarchived}</div>
                  <div className="mt-1 text-xs text-[#7D8C9F]">未归档</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <PracticeFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              relationFilter={relationFilter}
              onRelationFilterChange={setRelationFilter}
              sourceTypeFilter={sourceTypeFilter}
              onSourceTypeFilterChange={setSourceTypeFilter}
              archiveFilter={archiveFilter}
              onArchiveFilterChange={setArchiveFilter}
              relationOptions={relationOptions}
            />
          </div>

          {/* Not found message for deep link */}
          {notFoundId && (
            <div
              role="alert"
              className="mb-4 rounded-2xl bg-[#BCA564]/10 border border-[#BCA564]/20 px-4 py-3 text-sm text-[#8A7338]"
              data-testid="deep-link-not-found"
            >
              没有找到这条练习，它可能已经被归档或删除。你仍然可以继续浏览其他记录。
            </div>
          )}

          {/* Content */}
          {isLoading && entries.length === 0 ? (
            <PracticeSkeletonList count={3} />
          ) : error && entries.length === 0 ? (
            <PracticeErrorState onRetry={() => void loadEntries(false, undefined)} />
          ) : entries.length === 0 ? (
            <PracticeEmptyState onAction={handleEmptyAction} />
          ) : (
            <>
              {filteredEntries.length === 0 ? (
                <div className="rounded-3xl border border-[#A8D8B9]/20 bg-[#FEFDF9]/80 px-6 py-8 text-center text-sm text-[#7D8C9F] shadow-[0_8px_30px_rgba(45,106,79,0.05)] backdrop-blur-sm">
                  这些筛选下暂时没有练习，换个标签看看，或继续加载更多。
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="practice-card-grid">
                  {filteredEntries.map((entry) => (
                    <PracticeEntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => handleCardClick(entry)}
                      onFavorite={handleFavorite}
                      onArchive={handleArchive}
                    />
                  ))}
                </div>
              )}

              {loadMoreError && (
                <div
                  role="status"
                  className="mt-5 rounded-2xl bg-[#BCA564]/10 border border-[#BCA564]/20 px-4 py-3 text-center text-sm text-[#8A7338]"
                  data-testid="load-more-error"
                >
                  {loadMoreError}
                </div>
              )}

              {/* Load more */}
              {hasMore && entries.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="rounded-full bg-[#FEFDF9]/90 px-6 py-2.5 text-sm font-medium text-[#2C3E50] border border-[#A8D8B9]/30 shadow-[0_4px_20px_rgba(45,106,79,0.06)] transition-all hover:bg-[#FEFDF9] hover:shadow-[0_8px_30px_rgba(45,106,79,0.10)] disabled:opacity-50"
                    data-testid="load-more-button"
                  >
                    {isLoadingMore ? '加载中…' : '加载更多'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Drawer */}
          <PracticeEntryDrawer
            entry={drawerEntry}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            onFavorite={handleFavorite}
            onArchive={handleArchive}
          />
        </div>
      </main>
    </>
  );
}

export default function PracticePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<PracticeSkeletonList count={3} />}>
        <PracticePageContent />
      </Suspense>
    </ToastProvider>
  );
}
