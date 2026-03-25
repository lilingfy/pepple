'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  accentColor: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  iconBgColor?: string;
  buttonHoverColor?: string;
  isPopular?: boolean;
}

/**
 * 场景卡片组件
 * 展示模拟陪练场的练习场景入口
 */
export function ScenarioCard({
  id,
  icon,
  title,
  description,
  gradient,
  accentColor,
  shadowColor = 'rgba(125, 140, 159, 0.15)',
  hoverShadowColor = 'rgba(125, 140, 159, 0.15)',
  iconBgColor = '#7D8C9F',
  buttonHoverColor,
  isPopular = false,
}: ScenarioCardProps) {
  return (
    <div
      className={cn(
        "group p-10 rounded-[40px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative",
        isPopular ? "border-[#A8D8B9]/20" : "border-white/60"
      )}
      style={{
        background: gradient.includes('gradient') ? gradient : '#F0F6F2',
        boxShadow: isPopular
          ? `0 10px 40px -10px ${shadowColor}, inset 0 0 20px rgba(168, 216, 185, 0.1)`
          : `0 10px 40px -10px ${shadowColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isPopular
          ? `0 25px 50px -12px ${hoverShadowColor}, inset 0 0 20px rgba(168, 216, 185, 0.1)`
          : `0 25px 50px -12px ${hoverShadowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isPopular
          ? `0 10px 40px -10px ${shadowColor}, inset 0 0 20px rgba(168, 216, 185, 0.1)`
          : `0 10px 40px -10px ${shadowColor}`;
      }}
    >
      {/* 最常练习标签 */}
      {isPopular && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-[#A8D8B9]/20 text-[#A8D8B9] text-[10px] rounded-bl-2xl font-medium tracking-wider">
          最常练习
        </div>
      )}

      {/* 图标容器 */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 shadow-sm text-[#7D8C9F] group-hover:text-white"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = iconBgColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        }}
      >
        {icon}
      </div>

      {/* 标题 */}
      <h4 className="font-serif text-xl mb-4 font-medium text-[#2C3E50]">{title}</h4>

      {/* 描述 */}
      <p className="text-gray-500 text-sm leading-relaxed font-light mb-8">{description}</p>

      {/* 按钮 */}
      <Link
        href={`/dojo?scenarioId=${id}`}
        className="text-xs tracking-widest flex items-center transition-all hover:tracking-[0.2em]"
        style={{ color: '#7D8C9F' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = buttonHoverColor || accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#7D8C9F';
        }}
      >
        开始演练
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
