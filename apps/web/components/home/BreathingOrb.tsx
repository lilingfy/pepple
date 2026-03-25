'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BreathingOrbProps {
  className?: string;
}

/**
 * 呼吸鹅卵石组件
 * 展示呼吸动画和波纹扩散效果
 * 点击跳转到急救呼吸页面
 */
export function BreathingOrb({ className }: BreathingOrbProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/breathing');
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex justify-center items-center py-24 cursor-pointer group',
        className
      )}
    >
      {/* 点击提示 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#A8D8B9] text-white text-[10px] px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md whitespace-nowrap">
        点击进入急救呼吸
      </div>
      {/* 波纹层（hover 时触发）- 设计稿结构 */}
      <div
        className="shape-wave-layer w-72 h-72 bg-[#A8D8B9]/30 pebble-shape"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="shape-wave-layer w-72 h-72 bg-[#A8D8B9]/25 pebble-shape"
        style={{ animationDelay: '1.3s' }}
      />
      <div
        className="shape-wave-layer w-72 h-72 bg-[#A8D8B9]/20 pebble-shape"
        style={{ animationDelay: '2.6s' }}
      />

      {/* 基础呼吸层 - 始终动画 */}
      <div
        className="w-72 h-72 bg-[#A8D8B9]/20 pebble-shape breathe-animation absolute group-hover:scale-105 transition-transform duration-1000"
      />
      <div
        className="w-56 h-56 bg-[#A8D8B9]/30 pebble-shape breathe-animation absolute"
        style={{ animationDelay: '-2s' }}
      />

      {/* 核心交互鹅卵石 */}
      <div className="w-48 h-48 bg-gradient-to-br from-[#B5E2C5] to-[#9BCBAE] flex flex-col items-center justify-center pebble-shape relative z-10 shadow-xl shadow-[#A8D8B9]/40 group-hover:shadow-2xl group-active:scale-95 transition-all border border-white/30">
        {/* 风图标 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2"
        >
          <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
          <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
          <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
        </svg>

        {/* 文字 */}
        <span className="font-serif text-white text-xl font-medium tracking-widest drop-shadow-sm">
          急救呼吸
        </span>
        <span className="text-white/80 text-[10px] tracking-widest mt-1">
          Tap for a breath
        </span>
      </div>
    </div>
  );
}
