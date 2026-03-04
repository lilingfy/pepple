'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';
import { cn } from '@/lib/utils';

interface DecoderInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isAnalyzing: boolean;
  className?: string;
}

/**
 * DecoderInput - 读心翻译器的输入组件
 * 提供文本输入区域和分析按钮
 */
export function DecoderInput({
  onAnalyze,
  isAnalyzing,
  className,
}: DecoderInputProps) {
  const [input, setInput] = useState('');
  const charLimit = 1000;

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || isAnalyzing) return;
    await onAnalyze(input);
  }, [input, isAnalyzing, onAnalyze]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const isOverLimit = input.length > charLimit;
  const charCount = input.length;

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-200 p-6 shadow-sm', className)}>
      <label
        htmlFor="decoder-input"
        className="block text-sm font-medium text-gray-700 mb-3"
      >
        {ZH_CN.stormSection}
      </label>

      <div className="relative">
        <textarea
          id="decoder-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ZH_CN.inputPlaceholderExample}
          disabled={isAnalyzing}
          className={cn(
            'w-full min-h-[160px] px-4 py-3 rounded-xl border bg-gray-50 text-gray-900',
            'placeholder-gray-400 resize-none transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            isOverLimit ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200'
          )}
        />

        {/* Character count */}
        <div className={cn(
          'absolute bottom-3 right-3 text-xs transition-colors',
          isOverLimit ? 'text-red-500' : 'text-gray-400'
        )}>
          {charCount}/{charLimit}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MaterialSymbol icon="lock_open" className="text-sm" />
          <span>{ZH_CN.localDataOnly}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input || isAnalyzing}
          >
            <MaterialSymbol icon="refresh" className="text-lg" />
            {ZH_CN.clear}
          </Button>

          <Button
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing || isOverLimit}
          >
            {isAnalyzing ? (
              <>
                <MaterialSymbol icon="refresh" className="text-lg animate-spin" />
                {ZH_CN.analyzing}
              </>
            ) : (
              <>
                <MaterialSymbol icon="tips_and_updates" className="text-lg" />
                {ZH_CN.analyze}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Over limit warning */}
      {isOverLimit && (
        <p className="mt-2 text-sm text-red-500">
          输入内容过长，请精简后重试
        </p>
      )}
    </div>
  );
}
