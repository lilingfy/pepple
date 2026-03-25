'use client';

import { cn } from '@/lib/utils';

interface ReplySuggestionCardProps {
  label: 'A' | 'B' | 'C';
  content: string;
  strategy: string;
  originalText: string;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

const labelStyles: Record<'A' | 'B' | 'C', string> = {
  A: 'border-l-4 border-[#A8D8B9] bg-white/80',
  B: 'border-l-4 border-[#FFED94]/80 bg-white/70',
  C: 'border-l-4 border-slate-300 bg-white/60',
};

const selectedStyles: Record<'A' | 'B' | 'C', string> = {
  A: 'ring-2 ring-[#A8D8B9] ring-offset-2 bg-[#A8D8B9]/10',
  B: 'ring-2 ring-[#FFED94] ring-offset-2 bg-[#FFED94]/10',
  C: 'ring-2 ring-slate-400 ring-offset-2 bg-slate-100/80',
};

const badgeStyles: Record<'A' | 'B' | 'C', string> = {
  A: 'text-[#A8D8B9] bg-[#A8D8B9]/10',
  B: 'text-[#A88B32] bg-[#FFED94]/30 border border-[#FFED94]/40',
  C: 'text-slate-400 bg-slate-100',
};

// 位移值配置
const translateConfig: Record<'A' | 'B' | 'C', string> = {
  A: 'translate-x-2',
  B: 'translate-x-1',
  C: 'translate-x-2',
};

export function ReplySuggestionCard({
  label,
  content,
  strategy,
  isSelected,
  onSelect,
  className,
}: ReplySuggestionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-pebble p-5 pebble-shadow transform transition-all cursor-pointer',
        labelStyles[label],
        translateConfig[label],
        isSelected && selectedStyles[label],
        'hover:translate-x-0 hover:shadow-lg',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 flex-shrink-0">
          <span className={cn('text-xs font-bold px-2 py-1 rounded-full', badgeStyles[label])}>
            方案 {label}
          </span>
          <span className="text-xs text-slate-400 text-center">{strategy}</span>
        </div>
        <p className="flex-1 text-sm text-slate-700 leading-relaxed">{content}</p>
        {isSelected && (
          <span className="material-symbols-outlined text-safe-green text-xl">check_circle</span>
        )}
      </div>
    </div>
  );
}
