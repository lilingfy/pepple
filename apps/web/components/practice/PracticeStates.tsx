'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PracticeEmptyStateProps {
  onAction?: () => void;
}

export function PracticeEmptyState({ onAction }: PracticeEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-16 text-center"
      data-testid="practice-empty-state"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-[#A8D8B9]/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-[#A8D8B9]/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-xs space-y-2">
        <p className="text-base font-medium text-[#2C3E50]">这里还很安静</p>
        <p className="text-sm leading-relaxed text-[#7D8C9F]/70">
          保存一次读心翻译后，它会变成你的沟通练习档案。
        </p>
      </div>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            'mt-2 rounded-full bg-[#A8D8B9] px-6 py-2.5 text-sm font-medium text-white',
            'shadow-[0_4px_15px_rgba(168,216,185,0.3)]',
            'transition-all duration-200 hover:bg-[#8BC4A0] hover:shadow-[0_6px_20px_rgba(168,216,185,0.4)]'
          )}
          data-testid="empty-state-action"
        >
          去保存第一条练习
        </button>
      )}
    </div>
  );
}

export interface PracticeSkeletonListProps {
  count?: number;
}

export function PracticeSkeletonList({ count = 3 }: PracticeSkeletonListProps) {
  return (
    <div className="space-y-4" data-testid="practice-skeleton-list" role="status" aria-busy="true" aria-label="正在加载练习记录">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-[1.75rem_2.25rem_1.75rem_2.5rem] bg-[#FEFDF9]/80 border border-[#A8D8B9]/20 p-6 shadow-[0_4px_20px_rgba(45,106,79,0.05)]',
            'animate-pulse motion-reduce:animate-none'
          )}
          data-testid="practice-skeleton-card"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-5 w-24 rounded-full bg-[#E8F3EB]" />
            <div className="h-4 w-20 rounded-full bg-[#E8F3EB]" />
          </div>
          <div className="mb-4 space-y-2 rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#FEFDF9]/60 border border-[#A8D8B9]/15 p-4">
            <div className="h-4 w-24 rounded-full bg-[#E8F3EB]" />
            <div className="h-5 w-11/12 rounded-lg bg-[#E8F3EB]" />
            <div className="h-5 w-2/3 rounded-lg bg-[#E8F3EB]" />
          </div>
          <div className="mb-4 h-14 w-full rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#E6F2ED]/55 border border-[#A8D8B9]/15" />
          <div className="mb-4 h-16 w-full rounded-[1.35rem_1.75rem_1.45rem_1.9rem] bg-[#A8D8B9]/14 border border-[#A8D8B9]/20" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-full bg-[#E8F3EB]" />
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 rounded-full bg-[#E8F3EB]" />
              <div className="h-8 w-8 rounded-full bg-[#E8F3EB]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface PracticeErrorStateProps {
  onRetry?: () => void;
}

export function PracticeErrorState({ onRetry }: PracticeErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 rounded-[2rem] bg-[#FEFDF9]/85 border border-[#A8D8B9]/20 py-16 text-center shadow-[0_8px_30px_rgba(45,106,79,0.06)]"
      data-testid="practice-error-state"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-[#E07A5F]/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-[#B95C46]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-xs space-y-2">
        <p className="text-base font-medium text-[#2C3E50]">练习本暂时没有打开</p>
        <p className="text-sm leading-relaxed text-[#7D8C9F]/70">
          可能是网络轻轻绊了一下，稍后再试就好。
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'mt-2 rounded-full bg-[#2C3E50] px-6 py-2.5 text-sm font-medium text-white',
            'shadow-sm transition-all duration-200 hover:bg-[#3D4F5F] hover:shadow-md'
          )}
          data-testid="error-retry-button"
        >
          重新加载
        </button>
      )}
    </div>
  );
}
