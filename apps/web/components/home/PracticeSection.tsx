import React from 'react';

import { ScenarioCard } from './ScenarioCard';

const SCENARIOS = [
  {
    id: 'workplace',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: '职场越界防御',
    description: '面对不合理的打压或越界要求，练习坚定的专业答复。',
    gradient: 'linear-gradient(135deg, #F0F6F2 0%, #E6ECE8 100%)',
    accentColor: '#5D6D7E',
    shadowColor: 'rgba(125, 140, 159, 0.15)',
    hoverShadowColor: 'rgba(125, 140, 159, 0.3)',
    iconBgColor: '#7D8C9F',
    buttonHoverColor: '#5D6D7E',
  },
  {
    id: 'relationship',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: '亲密关系解绑',
    description: '识别伴侣/家人的隐性攻击，练习不争辩、不解释的灰岩应对。',
    gradient: 'linear-gradient(135deg, #F0F6F2 0%, #F2EBE6 100%)',
    accentColor: '#D1A684',
    shadowColor: 'rgba(224, 122, 95, 0.1)',
    hoverShadowColor: 'rgba(224, 122, 95, 0.2)',
    iconBgColor: '#D1A684',
    buttonHoverColor: '#D1A684',
  },
  {
    id: 'social',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="10" r="1" />
        <circle cx="8" cy="10" r="1" />
        <circle cx="16" cy="10" r="1" />
      </svg>
    ),
    title: '社交杠精应对',
    description: '遭遇无端指责时，AI扮演杠精，训练你快速终结话题。',
    gradient: '#F0F6F2',
    accentColor: '#A8D8B9',
    shadowColor: 'rgba(168, 216, 185, 0.2)',
    hoverShadowColor: 'rgba(168, 216, 185, 0.3)',
    iconBgColor: '#A8D8B9',
    buttonHoverColor: '#A8D8B9',
    isPopular: true,
  },
] satisfies Array<{
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  accentColor: string;
  shadowColor: string;
  hoverShadowColor: string;
  iconBgColor: string;
  buttonHoverColor: string;
  isPopular?: boolean;
}>;

/**
 * 模拟陪练场展示区块
 */
export function PracticeSection() {
  return (
    <section id="practice" className="py-32 bg-white/40 border-y border-white/60 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* 标题区 */}
        <div className="text-center mb-20">
          <div className="flex flex-col items-center mb-6">
            <div className="text-[11px] font-bold tracking-[0.4em] text-[#A8D8B9] uppercase mb-4">
              PRACTICE DOJO
            </div>
            <div className="relative inline-block pb-4 text-center">
              <div className="flex items-center justify-center space-x-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8D8B9]" />
                <h3 className="font-serif text-4xl md:text-5xl font-light text-[#2C3E50] tracking-[0.15em]">
                  模拟陪练场
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8D8B9]" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-[#A8D8B9]/60 to-transparent" />
            </div>
          </div>
          <p className="text-gray-500 font-light tracking-widest">
            在真实冲突发生前，通过安全的模拟接种"心理疫苗"。
          </p>
        </div>

        {/* 场景卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              id={scenario.id}
              icon={scenario.icon}
              title={scenario.title}
              description={scenario.description}
              gradient={scenario.gradient}
              accentColor={scenario.accentColor}
              shadowColor={scenario.shadowColor}
              hoverShadowColor={scenario.hoverShadowColor}
              iconBgColor={scenario.iconBgColor}
              buttonHoverColor={scenario.buttonHoverColor}
              isPopular={scenario.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
