'use client';

import { useState } from 'react';
import { ReplySuggestionCard } from './ReplySuggestionCard';
import type { ReplySuggestions as ReplySuggestionsType } from '@/types/translator';

interface ReplySuggestionsProps {
  suggestions: ReplySuggestionsType;
  originalText: string;
  onSelect: (label: 'A' | 'B' | 'C' | null) => void;
  selectedLabel: 'A' | 'B' | 'C' | null;
  className?: string;
}

const ORDER: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];

export function ReplySuggestions({
  suggestions,
  originalText,
  onSelect,
  selectedLabel,
  className,
}: ReplySuggestionsProps) {
  if (!suggestions) {
    return (
      <div className={className}>
        <h3 className="text-sm font-bold text-[#7D8C9F]/80 ml-4 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">layers</span>
          灰岩回复建议 <span className="text-slate-400 font-normal">(Gray Rock Replies)</span>
        </h3>
        <div className="text-slate-400 text-sm ml-4">暂无回复建议</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-[#7D8C9F]/80 ml-4 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">layers</span>
        灰岩回复建议 <span className="text-slate-400 font-normal">(Gray Rock Replies)</span>
        <span className="text-xs text-slate-400 ml-2">请先点击选择一个方案</span>
      </h3>
      <div className="space-y-4">
        {ORDER.map((key) => (
          <ReplySuggestionCard
            key={key}
            label={key}
            content={suggestions[key]}
            strategy={suggestions.strategy[key]}
            originalText={originalText}
            isSelected={selectedLabel === key}
            onSelect={() => onSelect(key)}
          />
        ))}
      </div>
    </div>
  );
}
