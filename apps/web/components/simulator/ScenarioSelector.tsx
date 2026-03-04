'use client';

import React from 'react';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import scenarios from '@/public/scenarios.json';
import { cn } from '@/lib/utils';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  antagonist: {
    name: string;
    avatar: string;
  };
  openings: string[];
  attacks: string[];
}

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void;
  selectedId?: string;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const difficultyLabels: Record<string, string> = {
  easy: '入门',
  medium: '进阶',
  hard: '挑战'
};

export function ScenarioSelector({ onSelect, selectedId }: ScenarioSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedScenario = scenarios.scenarios.find((s) => s.id === selectedId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/10 hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <MaterialSymbol icon="psychology" className="text-primary text-2xl" />
          <div className="text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              选择场景
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {selectedScenario?.title || '点击选择练习场景'}
            </p>
          </div>
        </div>
        <MaterialSymbol
          icon={isOpen ? 'expand_less' : 'expand_more'}
          className="text-slate-400"
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-primary/10 max-h-[400px] overflow-y-auto">
          <div className="p-2 space-y-1">
            {scenarios.scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  onSelect(scenario as Scenario);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-colors ${
                  selectedId === scenario.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MaterialSymbol
                    icon="warning"
                    className="text-slate-400 dark:text-slate-500"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {scenario.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {scenario.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    difficultyColors[scenario.difficulty]
                  }`}
                >
                  {difficultyLabels[scenario.difficulty]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
