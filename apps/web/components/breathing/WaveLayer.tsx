'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveLayerProps {
  isActive: boolean;
}

const WAVE_DELAYS = [0, 1.3, 2.6] as const;

/**
 * 三层同心波纹。isActive=false 时不渲染。
 * 检测 prefers-reduced-motion，启用时同样不渲染。
 */
export function WaveLayer({ isActive }: WaveLayerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isActive || reducedMotion) return null;

  return (
    <>
      {WAVE_DELAYS.map((delay, i) => (
        <motion.div
          key={i}
          data-testid="wave-layer"
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            width: 288,
            height: 288,
            borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
            background: 'rgba(168,216,185,0.18)',
          }}
          initial={{ scale: 1, opacity: 0.7, filter: 'blur(8px)' }}
          animate={{
            scale: [1, 2.8],
            opacity: [0.7, 0],
            filter: ['blur(8px)', 'blur(30px)'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay,
            ease: [0.2, 0.5, 0.3, 1],
          }}
        />
      ))}
    </>
  );
}
