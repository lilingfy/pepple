'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';
import { cn } from '@/lib/utils';

export interface ReplyOptionsData {
  minimal: string;
  gentle: string;
  boundary: string;
}

interface ReplyOptionsProps {
  replies: ReplyOptionsData;
  className?: string;
}

type ReplyType = 'minimal' | 'gentle' | 'boundary';

/**
 * ReplyOptions - 三级回复选项组件
 * 展示极简、温和、坚定三种回复选项，支持一键复制
 */
export function ReplyOptions({ replies, className }: ReplyOptionsProps) {
  const [copiedType, setCopiedType] = useState<ReplyType | null>(null);

  const handleCopy = useCallback(async (type: ReplyType, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const replyConfigs: { type: ReplyType; label: string; icon: string; color: string }[] = [
    {
      type: 'minimal',
      label: ZH_CN.replies.minimal,
      icon: 'minimize',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
    },
    {
      type: 'gentle',
      label: ZH_CN.replies.gentle,
      icon: 'favorite',
      color: 'text-green-700 bg-green-50 border-green-200',
    },
    {
      type: 'boundary',
      label: ZH_CN.replies.boundary,
      icon: 'shield',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <Card
      variant="shelter"
      icon="chat_bubble_outline"
      title={ZH_CN.resultResponse}
      className={className}
    >
      <div className="space-y-3">
        {replyConfigs.map(({ type, label, icon, color }) => {
          const text = replies[type];
          const isCopied = copiedType === type;

          return (
            <div
              key={type}
              className={cn(
                'group relative rounded-xl border p-4 transition-all duration-200',
                'hover:shadow-md cursor-pointer',
                color
              )}
              onClick={() => handleCopy(type, text)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MaterialSymbol icon={icon} className="text-lg" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed pr-8">
                    &ldquo;{text}&rdquo;
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                    isCopied && 'opacity-100'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(type, text);
                  }}
                >
                  <MaterialSymbol
                    icon={isCopied ? 'check_circle' : 'content_copy'}
                    className={cn('text-lg', isCopied && 'text-green-600')}
                  />
                  <span className={cn(isCopied && 'text-green-600')}>
                    {isCopied ? ZH_CN.copied : ZH_CN.copy}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        点击任意回复即可复制
      </p>
    </Card>
  );
}
