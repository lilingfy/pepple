'use client';

import { cn } from '@/lib/utils';
import { getEmotionTier, type EmotionTier } from '@/types/translator';

interface EmotionStatusBarProps {
  emotionStatus?: string | null;
  emotionScore?: number | null;
  className?: string;
}

// SVG 心形图标
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const tierConfig: Record<EmotionTier, { bar: string; text: string; dot: string }> = {
  calm: {
    bar: 'bg-green-400',
    text: 'text-green-700',
    dot: 'bg-green-400',
  },
  anxious: {
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  stressed: {
    bar: 'bg-rose-400',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
};

// 默认数据：平稳观察中状态
const DEFAULT_DATA = {
  status: '情绪检测：平稳观察中',
  score: 85,
  auxiliaryText: '频率正常，适合进行理性解码',
};

export function EmotionStatusBar({ emotionStatus, emotionScore, className }: EmotionStatusBarProps) {
  // 判断是否使用默认数据
  const isDefault = emotionStatus === null || emotionStatus === undefined;

  // 使用真实数据或默认数据
  const displayStatus = isDefault ? DEFAULT_DATA.status : emotionStatus;
  const displayScore = isDefault ? DEFAULT_DATA.score : (emotionScore ?? DEFAULT_DATA.score);

  const tier = getEmotionTier(displayScore);
  const config = tierConfig[tier];
  const barWidth = `${Math.min(100, Math.max(0, displayScore))}%`;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between',
        'bg-white/30 backdrop-blur-md rounded-full px-6 py-3',
        'border border-white/40 pebble-shadow w-full',
        'transition-all hover:bg-white/50',
        className,
      )}
    >
      {/* 主状态行 */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8D8B9] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A8D8B9]" />
        </div>
        <span className="text-sm font-medium text-slate-600">{displayStatus}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 辅助文本（桌面端可见） */}
        {isDefault && (
          <span className="hidden md:block text-xs text-slate-400 italic">
            {DEFAULT_DATA.auxiliaryText}
          </span>
        )}

        {/* 心率值 */}
        <div className="flex items-center gap-1 bg-[#D5E5D5]/30 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[#A8D8B9] text-[16px]">favorite</span>
          <span className="text-sm font-serif font-bold text-[#A8D8B9]">{displayScore}%</span>
        </div>
      </div>
    </div>
  );
}
