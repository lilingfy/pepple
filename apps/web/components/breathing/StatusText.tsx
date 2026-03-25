'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { BreathingPhase } from '@/lib/breathing/breathing-machine';

interface StatusTextProps {
  phase: BreathingPhase;
}

const PHASE_TEXT: Record<BreathingPhase, { cn: string; en: string }> = {
  idle:   { cn: '点击开始', en: 'TAP TO START' },
  inhale: { cn: '吸气',     en: 'DEEP INHALE (4S)' },
  hold:   { cn: '屏息',     en: 'HOLD GENTLY (7S)' },
  exhale: { cn: '呼气',     en: 'SLOW EXHALE (8S)' },
};

/** 呼吸圆中心状态文案。阶段切换时淡入，禁止同时显示两条文案。 */
export function StatusText({ phase }: StatusTextProps) {
  const text = PHASE_TEXT[phase];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-1 select-none"
      >
        <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] text-[#7D8C9F]">
          {text.cn}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#7D8C9F]/60">
          {text.en}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
