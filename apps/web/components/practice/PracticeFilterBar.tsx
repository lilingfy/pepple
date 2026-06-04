'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ArchiveFilter = 'all' | 'favorites' | 'unarchived' | 'archived';

export interface PracticeFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  relationFilter: string;
  onRelationFilterChange: (relation: string) => void;
  sourceTypeFilter: 'decode' | 'all';
  onSourceTypeFilterChange: (type: 'decode' | 'all') => void;
  archiveFilter: ArchiveFilter;
  onArchiveFilterChange: (filter: ArchiveFilter) => void;
  relationOptions: string[];
}

const archiveTabs: { value: ArchiveFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'favorites', label: '收藏' },
  { value: 'unarchived', label: '未归档' },
  { value: 'archived', label: '已归档' },
];

const archiveActiveClasses: Record<ArchiveFilter, string> = {
  all: 'bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm',
  favorites: 'bg-[#E6B422]/15 text-[#9A7A12] shadow-sm',
  unarchived: 'bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm',
  archived: 'bg-[#7D8C9F]/15 text-[#2C3E50] shadow-sm',
};

export function PracticeFilterBar({
  searchQuery,
  onSearchChange,
  relationFilter,
  onRelationFilterChange,
  sourceTypeFilter,
  onSourceTypeFilterChange,
  archiveFilter,
  onArchiveFilterChange,
  relationOptions,
}: PracticeFilterBarProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] bg-[#FEFDF9]/85 backdrop-blur-xl border border-[#A8D8B9]/25 p-4 md:p-5 shadow-[0_8px_30px_rgba(45,106,79,0.06)]',
        'flex flex-col gap-4'
      )}
      data-testid="practice-filter-bar"
    >
      {/* Top row: search + source type */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8C9F]/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索练习内容…"
            aria-label="搜索练习内容"
            className={cn(
              'h-11 w-full rounded-full bg-[#FEFDF9]/80 py-2.5 pl-10 pr-4 text-sm text-[#2C3E50]',
              'placeholder:text-[#7D8C9F]/50',
              'border border-[#A8D8B9]/25 focus:border-[#A8D8B9]/60 focus:outline-none focus:ring-2 focus:ring-[#A8D8B9]/20',
              'transition-all duration-200'
            )}
            data-testid="practice-search-input"
          />
        </div>

        {/* Source type filter */}
        <div className="flex items-center rounded-full bg-[#F0F7F2]/50 p-1 border border-[#A8D8B9]/20" role="group" aria-label="来源筛选">
          <button
            type="button"
            onClick={() => onSourceTypeFilterChange('all')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              sourceTypeFilter === 'all'
                ? 'bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm'
                : 'text-[#7D8C9F]/75 hover:bg-white/55 hover:text-[#2C3E50]'
            )}
            data-testid="source-filter-all"
            aria-pressed={sourceTypeFilter === 'all'}
          >
            全部来源
          </button>
          <button
            type="button"
            onClick={() => onSourceTypeFilterChange('decode')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              sourceTypeFilter === 'decode'
                ? 'bg-[#A8D8B9]/20 text-[#2D6A4F] shadow-sm'
                : 'text-[#7D8C9F]/75 hover:bg-white/55 hover:text-[#2C3E50]'
            )}
            data-testid="source-filter-decode"
            aria-pressed={sourceTypeFilter === 'decode'}
          >
            读心翻译
          </button>
        </div>
      </div>

      {/* Second row: archive tabs + relation filter */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Archive filter buttons */}
        <div className="flex items-center gap-1" role="group" aria-label="归档筛选">
          {archiveTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={archiveFilter === tab.value}
              onClick={() => onArchiveFilterChange(tab.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                archiveFilter === tab.value
                  ? archiveActiveClasses[tab.value]
                  : 'text-[#7D8C9F]/75 hover:bg-white/55 hover:text-[#2C3E50]'
              )}
              data-testid={`archive-tab-${tab.value}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Relation text filter */}
        {relationOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7D8C9F]/60">关系标签</span>
            <select
              value={relationFilter}
              onChange={(e) => onRelationFilterChange(e.target.value)}
              aria-label="按关系筛选"
              className={cn(
                'h-9 rounded-full bg-[#FEFDF9]/80 py-1.5 pl-3 pr-8 text-xs text-[#2C3E50]',
                'border border-[#A8D8B9]/25 focus:border-[#A8D8B9]/60 focus:outline-none focus:ring-2 focus:ring-[#A8D8B9]/20',
                'appearance-none transition-all duration-200'
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237D8C9F' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '14px',
              }}
              data-testid="relation-filter-select"
            >
              <option value="">全部关系</option>
              {relationOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
