'use client';

import { cn } from '@/lib/utils';
import type { TranslatorStatus } from '@/types/translator';

interface DecodeButtonProps {
  onClick: () => void;
  status: TranslatorStatus;
  disabled?: boolean;
  className?: string;
}

export function DecodeButton({ onClick, status, disabled = false, className }: DecodeButtonProps) {
  const isLoading = status === 'analyzing';
  const isDisabled = isLoading || disabled;

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={isLoading ? '解码中' : '解码'}
        className={cn(
          'group relative flex flex-col items-center justify-center',
          'w-32 h-32 md:w-40 md:h-40',
          'rounded-[45%_55%_70%_30%/30%_40%_60%_70%]',
          'bg-[#A8D8B9] hover:bg-[#A8D8B9]/90 text-white',
          'decode-glow transition-all duration-500',
          'hover:scale-105 active:scale-95 shadow-xl',
          isDisabled && 'opacity-70 cursor-not-allowed hover:scale-100 active:scale-100',
        )}
      >
        {/* 顶部黄色 pulse 装饰点 */}
        <span className="absolute -top-4 -right-2 w-4 h-4 bg-[#FFED94]/70 backdrop-blur-sm rounded-full shadow-[0_0_10px_rgba(255,237,148,0.4)] animate-pulse" />

        {/* 底部绿色鹅卵石形状装饰点 */}
        <span className="absolute -bottom-6 -left-4 w-6 h-6 bg-[#D5E5D5] rounded-[60%_40%_70%_30%/40%_50%_60%_40%]" />

        <span className={cn(
          'material-symbols-outlined text-4xl mb-1 text-[#FDF0B5]',
          'drop-shadow-[0_0_8px_rgba(255,237,148,0.6)]',
          'transition-transform duration-700',
          'group-hover:rotate-180',
          isLoading && 'animate-spin',
        )}>
          auto_awesome
        </span>
        <span className="font-bold text-lg tracking-widest">
          {isLoading ? '解码中...' : '解码'}
        </span>
      </button>
    </div>
  );
}
