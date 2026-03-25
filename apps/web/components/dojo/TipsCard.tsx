'use client';

import { useDojoStore } from '@/store/dojo-store';

export function TipsCard() {
  const { currentScenario } = useDojoStore();

  if (!currentScenario?.tips?.length) return null;

  return (
    <div className="glass-card p-6 rounded-pebble-2 pebble-shadow">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-accent-gold drop-shadow-[0_0_8px_rgba(230,180,34,0.4)] animate-pulse">lightbulb</span>
        <h2 className="font-bold text-slate-700 tracking-wider">技巧锦囊</h2>
      </div>
      <ul className="space-y-3">
        {currentScenario?.tips?.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-safe-green mt-1.5 shrink-0"></span>
            <span className="text-sm text-slate-600">
              <strong>{tip.name}:</strong> {tip.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
