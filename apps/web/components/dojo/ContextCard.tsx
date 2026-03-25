'use client';

import { useDojoStore } from '@/store/dojo-store';

export function ContextCard() {
  const { currentScenario } = useDojoStore();

  if (!currentScenario) return null;

  return (
    <div className="glass-card p-6 rounded-pebble-1 pebble-shadow">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-safe-green">psychology</span>
        <h2 className="font-bold text-slate-700 tracking-wider">心理语境</h2>
      </div>
      <div className="space-y-4">
        <div className="bg-white/40 p-4 rounded-2xl border border-white/60">
          <p className="text-xs font-bold text-primary mb-1">情境：{currentScenario.name}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{currentScenario.context}</p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-xs text-accent-gold">verified</span>
          <span className="text-xs text-slate-500 italic">达成目标：{currentScenario.goal}</span>
        </div>
      </div>
    </div>
  );
}
