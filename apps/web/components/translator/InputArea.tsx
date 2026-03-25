'use client';

import { cn } from '@/lib/utils';
import type { TranslatorStatus } from '@/types/translator';

const MAX_CHARS = 500;

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  status: TranslatorStatus;
  className?: string;
}

export function InputArea({ value, onChange, onSubmit, status, className }: InputAreaProps) {
  const isAnalyzing = status === 'analyzing';
  const isOverLimit = value.length > MAX_CHARS;
  const isDisabled = isAnalyzing || isOverLimit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isDisabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* 标签区 */}
      <label className="text-sm font-bold text-[#7D8C9F]/80 ml-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">psychology_alt</span>
        收到信息 (压力源)
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="在此粘贴让你感到压力的信息，例如：'这件事你怎么还没做完？我不是上周就说了吗？'"
          className={cn(
            'w-full h-80 rounded-pebble bg-white/60 border border-transparent pebble-inset p-8',
            'text-slate-700 placeholder:text-slate-400',
            'focus:outline-none focus:bg-white/80 focus:border-[#A8D8B9]/50',
            'focus:shadow-[0_0_25px_rgba(168,216,185,0.4),0_0_0_1px_rgba(168,216,185,0.3)]',
            'transition-all duration-300 ease-out resize-none',
            'font-sans leading-relaxed',
            isDisabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-label="输入文本"
        />
        {/* 工具栏 */}
        <div className="absolute bottom-6 right-8 left-8 flex justify-between items-center text-slate-300">
          <div className="flex gap-4">
            <button
              type="button"
              disabled
              aria-label="语音输入"
              className="text-[#7D8C9F] hover:text-[#A8D8B9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="语音输入（即将推出）"
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
            <button
              type="button"
              disabled
              aria-label="附件"
              className="text-[#7D8C9F] hover:text-[#A8D8B9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="附件上传（即将推出）"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
          </div>
          <span className="material-symbols-outlined">edit_note</span>
        </div>
      </div>
    </div>
  );
}
