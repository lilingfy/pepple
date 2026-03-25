'use client';

import { useDojoStore } from '@/store/dojo-store';
import { ContextCard } from './ContextCard';
import { TipsCard } from './TipsCard';

export function ScenarioPanel() {
  const { scenarios, currentScenario, selectScenario } = useDojoStore();

  // Handle undefined scenarios
  const safeScenarios = scenarios ?? [];

  return (
    <>
      {/* 场景选择 */}
      <div className="glass-card p-6 rounded-pebble-3 pebble-shadow mb-2">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-safe-green">theater_comedy</span>
          <h2 className="font-bold text-slate-700 tracking-wider">场景选择</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {safeScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => selectScenario(scenario)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                currentScenario?.id === scenario.id
                  ? 'font-bold bg-safe-green text-slate-800 border border-safe-green shadow-sm'
                  : 'font-light text-primary border border-primary/20 hover:bg-safe-green/10 hover:border-safe-green/40'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* 心理语境 */}
      {currentScenario && <ContextCard />}

      {/* 技巧锦囊 */}
      {currentScenario && <TipsCard />}
    </>
  );
}
