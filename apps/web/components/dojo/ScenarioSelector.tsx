'use client';

import React from 'react';
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

// 场景分类映射 - 将多个场景归类到三个主要类别
const scenarioCategories: Record<string, { label: string; scenarioIds: string[] }> = {
  'workplace': {
    label: '职场越界',
    scenarioIds: ['boss_overtime_demands']
  },
  'relationship': {
    label: '亲密关系',
    scenarioIds: ['parent_marriage_pressure', 'partner_financial_control', 'partner_social_restriction', 'parent_guilt_trip', 'in_law_comparison']
  },
  'social': {
    label: '社交应对',
    scenarioIds: ['relative_borrowing_money', 'parent_career_interference']
  }
};

export function ScenarioSelector({ onSelect, selectedId }: ScenarioSelectorProps) {
  // 获取当前选中的分类
  const getSelectedCategory = () => {
    if (!selectedId) return null;
    for (const [catKey, cat] of Object.entries(scenarioCategories)) {
      if (cat.scenarioIds.includes(selectedId)) return catKey;
    }
    return null;
  };

  const selectedCategory = getSelectedCategory();

  // 选择分类时，默认选择该分类下的第一个场景
  const handleCategorySelect = (categoryKey: string) => {
    const category = scenarioCategories[categoryKey];
    const firstScenarioId = category.scenarioIds[0];
    const scenario = scenarios.scenarios.find((s) => s.id === firstScenarioId);
    if (scenario) {
      onSelect(scenario as Scenario);
    }
  };

  return (
    <div
      className="p-6 mb-2"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '3rem 4rem 2rem 3.5rem',
        boxShadow: '10px 10px 20px rgba(125, 140, 159, 0.08), -5px -5px 15px rgba(255, 255, 255, 0.7)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-5 h-5 text-[#A8D8B9]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h2 className="font-bold text-slate-700 tracking-wider">场景选择</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(scenarioCategories).map(([categoryKey, category]) => {
          const isSelected = selectedCategory === categoryKey;

          return (
            <button
              key={categoryKey}
              onClick={() => handleCategorySelect(categoryKey)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs border transition-all duration-300",
                isSelected
                  ? "bg-[#A8D8B9] text-slate-800 border-[#A8D8B9] font-bold shadow-sm"
                  : "text-[#7D8C9F] border-[#7D8C9F]/20 font-light hover:bg-[#A8D8B9]/10 hover:border-[#A8D8B9]/40"
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
