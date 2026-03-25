'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { useAnimation } from 'framer-motion';
import type { BreathingPhase } from '@/lib/breathing/breathing-machine';
import { GlowLayer } from './GlowLayer';
import { WaveLayer } from './WaveLayer';
import { StatusText } from './StatusText';

type AnimationControls = ReturnType<typeof useAnimation>;

interface BreathingOrbProps {
  controls: AnimationControls;
  phase: BreathingPhase;
  isActive: boolean;
  onClick: () => void;
}

/**
 * 鹅卵石形状呼吸圆。
 * - scale 动画由外部 controls 驱动（状态机单一真相源）
 * - prefers-reduced-motion 下跳过 scale 动画
 */
export function BreathingOrb({ controls, phase, isActive, onClick }: BreathingOrbProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const label = isActive ? '点击暂停呼吸练习' : '点击开始呼吸练习';

  return (
    <div className="relative flex items-center justify-center">
      <GlowLayer />
      <WaveLayer isActive={isActive} />

      <motion.button
        animate={reducedMotion ? undefined : controls}
        initial={{ scale: 1, opacity: 0.85 }}
        onClick={onClick}
        aria-label="呼吸圆"
        aria-pressed={isActive}
        title={label}
        className="relative z-20 flex flex-col items-center justify-center cursor-pointer focus:outline-none"
        style={{
          width: 288,
          height: 288,
          borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
          background:
            'linear-gradient(135deg, rgba(168,216,185,0.6), rgba(168,216,185,0.4), rgba(255,255,255,0.4))',
          boxShadow: '0 20px 60px rgba(168,216,185,0.3)',
        }}
      >
        <StatusText phase={phase} />
      </motion.button>
    </div>
  );
}
