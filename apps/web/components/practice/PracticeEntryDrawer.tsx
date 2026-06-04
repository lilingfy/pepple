'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { PracticeEntry } from '@pebble/types';
import { getPracticeActionLabel, isDecodeEntry } from './utils';

export interface PracticeEntryDrawerProps {
  entry: PracticeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (id: string, isFavorite: boolean) => void;
  onArchive?: (id: string, nextArchived: boolean) => void;
}

export function PracticeEntryDrawer({ entry, isOpen, onClose, onFavorite, onArchive }: PracticeEntryDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    // Move focus into drawer when opened
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const isDecode = isDecodeEntry(entry);
  const analysis = isDecode ? entry.content.analysis : null;
  const replyOptions = isDecode ? entry.content.replyOptions : [];
  const selectedReplyId = isDecode ? entry.content.selectedReplyId : null;
  const relationName = isDecode ? entry.content.relationName : undefined;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="practice-entry-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2C3E50]/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        data-testid="drawer-backdrop"
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-drawer-title"
        className={cn(
          'relative z-10 flex h-full w-full flex-col overflow-y-auto bg-[#F8FAFC]/88 backdrop-blur-xl shadow-2xl',
          'sm:w-[480px] sm:border-l sm:border-white/70'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/70 bg-white/70 px-6 py-4 backdrop-blur-xl">
          <h2 id="practice-drawer-title" className="text-lg font-semibold text-[#2C3E50]">
            一次沟通复盘
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="关闭详情"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#7D8C9F] transition-colors hover:bg-white/60 hover:text-[#2C3E50]"
            data-testid="drawer-close-button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 px-6 py-5">
          {/* Relation context */}
          {relationName && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#A8D8B9]/15 px-3 py-1 text-sm font-medium text-[#2D6A4F]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {relationName}
              </div>
            </div>
          )}

          {/* Original text */}
          <section className="rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">对方说了什么</h3>
            <div className="text-[15px] leading-7 font-medium text-[#2C3E50]">
              {isDecode ? entry.content.originalText : '—'}
            </div>
          </section>

          {/* Surface meaning */}
          {isDecode && entry.content.surfaceMeaning && (
            <section className="rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">表面意思</h3>
              <div className="text-sm leading-6 text-[#5C697C]">
                {entry.content.surfaceMeaning}
              </div>
            </section>
          )}

          {/* Subtext */}
          {analysis && (
            <section className="rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">可能真正想表达</h3>
              <div className="text-sm leading-6 text-[#2D6A4F]">
                {analysis.subtext}
              </div>
              {(analysis.scenario || analysis.attackType) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#7D8C9F]/65">
                  {analysis.scenario && <span>{analysis.scenario}</span>}
                  {analysis.scenario && analysis.attackType && <span>·</span>}
                  {analysis.attackType && <span>{analysis.attackType}</span>}
                </div>
              )}
            </section>
          )}

          {/* Emotion status */}
          {analysis && (
            <section className="rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">情绪温度</h3>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold',
                    analysis.emotionScore >= 60
                      ? 'bg-[#E07A5F]/10 text-[#B95C46]'
                      : analysis.emotionScore >= 30
                        ? 'bg-[#BCA564]/14 text-[#8A7338]'
                        : 'bg-[#A8D8B9]/18 text-[#2D6A4F]'
                  )}
                >
                  {analysis.emotionStatus}
                </span>
                <span className="text-sm text-[#7D8C9F]">
                  情绪分 {analysis.emotionScore} · 中性分 {analysis.neutralityScore}
                </span>
              </div>
            </section>
          )}

          {/* Reply options */}
          {replyOptions.length > 0 && (
            <section className="rounded-[1.5rem_2rem_1.5rem_2rem] bg-white/70 border border-white/70 p-5 shadow-sm">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">我可以怎样回应</h3>
              <div className="space-y-3">
                {replyOptions.map((option) => {
                  const isSelected = option.id === selectedReplyId;
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        'rounded-[1.5rem_2rem_1.5rem_2rem] p-4 transition-all duration-200 border',
                        isSelected
                          ? 'bg-[#A8D8B9]/18 border-[#A8D8B9]/45 shadow-[0_0_18px_rgba(168,216,185,0.18)]'
                          : 'bg-white/60 border-white/70'
                      )}
                      data-testid={`reply-option-${option.id}`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                            isSelected
                              ? 'bg-[#A8D8B9] text-white'
                              : 'bg-[#EEF2F5] text-[#7D8C9F]'
                          )}
                        >
                          {option.id}
                        </span>
                        <span className="text-xs font-medium text-[#7D8C9F]">{option.tone}</span>
                        {isSelected && (
                          <span className="ml-auto text-xs font-semibold text-[#2D6A4F]">已选择</span>
                        )}
                      </div>
                      <p className="text-sm leading-6 font-medium text-[#2C3E50]">{option.content}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={() => onFavorite?.(entry.id, !entry.isFavorite)}
              aria-label={getPracticeActionLabel(entry, entry.isFavorite ? '取消收藏' : '收藏')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                entry.isFavorite
                  ? 'bg-[#E6B422]/15 text-[#E6B422] hover:bg-[#E6B422]/25'
                  : 'bg-white/60 text-[#7D8C9F] hover:bg-[#E6B422]/10 hover:text-[#E6B422]'
              )}
              data-testid="drawer-favorite-button"
            >
              <svg className="h-4 w-4" fill={entry.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {entry.isFavorite ? '已收藏' : '收藏'}
            </button>

            <button
              type="button"
              onClick={() => onArchive?.(entry.id, !entry.isArchived)}
              aria-label={getPracticeActionLabel(entry, entry.isArchived ? '取消归档' : '归档')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                entry.isArchived
                  ? 'bg-[#7D8C9F]/10 text-[#7D8C9F] hover:bg-[#7D8C9F]/20'
                  : 'bg-white/60 text-[#7D8C9F] hover:bg-[#7D8C9F]/10 hover:text-[#5C697C]'
              )}
              data-testid="drawer-archive-button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {entry.isArchived ? '取消归档' : '归档'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
