'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { PracticeEntry } from '@pebble/types';
import { formatPracticeDate, getPracticeActionLabel, isDecodeEntry, truncatePracticeText } from './utils';

export interface PracticeEntryCardProps {
  entry: PracticeEntry;
  onClick?: () => void;
  onFavorite?: (id: string, isFavorite: boolean) => void;
  onArchive?: (id: string, nextArchived: boolean) => void;
}

export function PracticeEntryCard({ entry, onClick, onFavorite, onArchive }: PracticeEntryCardProps) {
  const isDecode = isDecodeEntry(entry);
  const analysis = isDecode ? entry.content.analysis : null;
  const originalText = isDecode ? entry.content.originalText : '';
  const summaryText = originalText || entry.primaryReply;
  const relationName = isDecode ? entry.content.relationName : undefined;
  const isClickable = Boolean(onClick);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(entry.id, !entry.isFavorite);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(entry.id, !entry.isArchived);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Reflection logic: prefer subtext; else surfaceMeaning; omit if neither
  const reflection = analysis?.subtext
    ? { label: '我读到的潜台词', text: analysis.subtext }
    : isDecode && entry.content.surfaceMeaning
      ? { label: '表面意思', text: entry.content.surfaceMeaning }
      : null;

  // Emotion fallback logic
  const emotionLabel = analysis?.emotionStatus && typeof analysis.emotionScore === 'number'
    ? `${analysis.emotionStatus} · ${analysis.emotionScore}`
    : analysis?.emotionStatus
      ? analysis.emotionStatus
      : typeof analysis?.emotionScore === 'number'
        ? `情绪分 · ${analysis.emotionScore}`
        : null;

  const emotionScore = analysis?.emotionScore ?? 0;
  const emotionPillClass = emotionScore >= 60
    ? 'bg-[#E07A5F]/10 text-[#B95C46]'
    : emotionScore >= 30
      ? 'bg-[#BCA564]/14 text-[#8A7338]'
      : 'bg-[#A8D8B9]/18 text-[#2D6A4F]';

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[1.75rem_2.25rem_1.75rem_2.5rem] bg-[#FEFDF9]/90 backdrop-blur-xl border border-[#A8D8B9]/25 shadow-[0_4px_20px_rgba(45,106,79,0.06)]',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(45,106,79,0.12)]',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
      )}
      data-testid={`practice-entry-card-${entry.id}`}
    >
      {/* Clickable content area (separate from action buttons for valid ARIA) */}
      <div
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? `练习：${truncatePracticeText(summaryText, 40)}` : undefined}
        onClick={onClick}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        className={cn(
          'p-6 pb-0',
          isClickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A8D8B9]/40'
        )}
        data-testid={`practice-entry-card-clickable-${entry.id}`}
      >
        {/* Top row: relation badge, emotion pill, date */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {relationName && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#A8D8B9]/16 px-3 py-1 text-xs font-medium text-[#2D6A4F]">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {relationName}
            </div>
          )}
          {emotionLabel && (
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', emotionPillClass)}>
              {emotionLabel}
            </span>
          )}
          <span className="ml-auto text-xs text-[#7D8C9F]/65">{formatPracticeDate(entry.createdAt)}</span>
        </div>

        {/* Original quote */}
        <div className="mb-4">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">
            对方原话
          </span>
          <div className="rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#FEFDF9]/80 border border-[#A8D8B9]/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <p className="text-[15px] leading-7 font-medium text-[#2C3E50]">
              {truncatePracticeText(originalText, 80)}
            </p>
          </div>
        </div>

        {/* Reflection snippet */}
        {reflection && (
          <div className="mb-4">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">
              {reflection.label}
            </span>
            <div className="rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#E6F2ED]/55 border border-[#A8D8B9]/20 p-4">
              <p className="text-sm leading-6 text-[#2D6A4F]">
                {truncatePracticeText(reflection.text, 100)}
              </p>
            </div>
          </div>
        )}

        {/* Response strip */}
        <div className="mb-4">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8C9F]/70">
            我选择的回应
          </span>
          <div className="rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#A8D8B9]/14 border border-[#A8D8B9]/25 p-4">
            <p className="text-sm leading-6 font-medium text-[#2C3E50]">
              {truncatePracticeText(entry.primaryReply, 60)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: actions */}
      <div className="flex items-center justify-end px-6 pb-6">
        <div className="flex items-center gap-1">
          {/* Favorite toggle */}
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={getPracticeActionLabel(entry, entry.isFavorite ? '取消收藏' : '收藏')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E6B422]/30 motion-reduce:transition-none',
              entry.isFavorite
                ? 'bg-[#E6B422]/15 text-[#E6B422] hover:bg-[#E6B422]/25'
                : 'text-[#7D8C9F]/50 hover:bg-white/60 hover:text-[#E6B422]'
            )}
            data-testid={`favorite-button-${entry.id}`}
          >
            <svg className="h-4 w-4" fill={entry.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* Archive action */}
          <button
            type="button"
            onClick={handleArchive}
            aria-label={getPracticeActionLabel(entry, entry.isArchived ? '取消归档' : '归档')}
            className={cn(
              'group flex h-8 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7D8C9F]/25 motion-reduce:transition-none',
              entry.isArchived
                ? 'bg-[#7D8C9F]/10 text-[#7D8C9F] hover:bg-[#7D8C9F]/20'
                : 'text-[#7D8C9F]/50 hover:bg-[#7D8C9F]/10 hover:text-[#7D8C9F]'
            )}
            data-testid={`archive-button-${entry.id}`}
          >
            <span className="flex h-8 w-8 items-center justify-center">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-200 group-hover:max-w-[5rem] group-focus:max-w-[5rem] group-hover:pr-2.5 group-focus:pr-2.5 motion-reduce:transition-none">
              {entry.isArchived ? '取消归档' : '归档'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
