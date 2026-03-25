'use client';

import { useDojoStore } from '@/store/dojo-store';

export function FeedbackCard() {
  const { rightPanel } = useDojoStore();

  if (!rightPanel) return null;

  return (
    <div className="glass-card p-6 rounded-pebble-1 pebble-shadow">
      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">analytics</span> 陪练建议
      </h3>
      <div className="space-y-4">
        {rightPanel.instantFeedback && (
          <div className="border-l-2 border-safe-green pl-3">
            <p className="text-xs font-bold text-slate-500 mb-1">即时反馈</p>
            <p className="text-sm text-slate-600">{rightPanel.instantFeedback}</p>
          </div>
        )}
        {rightPanel.attentionPoint && (
          <div className="border-l-2 border-accent-gold pl-3 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(230,180,34,0.6)] animate-pulse" />
            <p className="text-xs font-bold text-accent-gold mb-1">注意点</p>
            <p className="text-sm text-slate-600 italic">{rightPanel.attentionPoint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
