'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ZH_CN } from '@/lib/locales/zh-CN';
import { cn } from '@/lib/utils';

export interface AnalysisResult {
  surfaceMeaning: string;
  trueIntent: string;
  attackType: string[];
  culturalContext?: string;
  tacticalTip: string;
}

interface SubtextCardProps {
  analysis: AnalysisResult;
  className?: string;
}

/**
 * SubtextCard - 潜台词分析结果卡片
 * 展示表面意思、真实意图、攻击类型和文化背景
 */
export function SubtextCard({ analysis, className }: SubtextCardProps) {
  const { surfaceMeaning, trueIntent, attackType, culturalContext, tacticalTip } = analysis;

  return (
    <div className={cn('space-y-4 animate-fadeIn', className)}>
      {/* Surface Meaning */}
      <Card variant="storm" icon="chat_bubble_outline" title={ZH_CN.surfaceMeaning}>
        <p className="text-gray-700 leading-relaxed">{surfaceMeaning}</p>
      </Card>

      {/* True Intent */}
      <Card variant="insight" icon="psychology" title={ZH_CN.trueIntent}>
        <p className="text-gray-700 leading-relaxed">{trueIntent}</p>
      </Card>

      {/* Attack Types */}
      <Card variant="shelter" icon="warning" title={ZH_CN.attackType}>
        <div className="flex flex-wrap gap-2">
          {attackType.map((type, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100"
            >
              {type}
            </span>
          ))}
        </div>
      </Card>

      {/* Cultural Context (if available) */}
      {culturalContext && (
        <Card variant="shelter" icon="public" title={ZH_CN.culturalContext}>
          <p className="text-gray-700 leading-relaxed">{culturalContext}</p>
        </Card>
      )}

      {/* Tactical Tip */}
      <Card variant="insight" icon="tips_and_updates" title={ZH_CN.tacticalTip}>
        <p className="text-gray-700 leading-relaxed">{tacticalTip}</p>
      </Card>
    </div>
  );
}

/**
 * AttackTypeBadge - 攻击类型标签
 */
export function AttackTypeBadge({ type }: { type: string }) {
  const typeColors: Record<string, string> = {
    '道德绑架': 'bg-amber-50 text-amber-700 border-amber-100',
    '比较贬低': 'bg-red-50 text-red-700 border-red-100',
    '以爱之名': 'bg-pink-50 text-pink-700 border-pink-100',
    '面子施压': 'bg-purple-50 text-purple-700 border-purple-100',
    '孝道指责': 'bg-orange-50 text-orange-700 border-orange-100',
    '情感勒索': 'bg-rose-50 text-rose-700 border-rose-100',
    '投射': 'bg-blue-50 text-blue-700 border-blue-100',
    '三角化': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  const colorClass = typeColors[type] || 'bg-gray-50 text-gray-700 border-gray-100';

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border', colorClass)}>
      {type}
    </span>
  );
}
