'use client';

import { useState, useCallback, useRef } from 'react';
import { useAnimation } from 'framer-motion';

type AnimationControls = ReturnType<typeof useAnimation>;
import {
  type BreathingPhase,
  BREATHING_CYCLE,
  nextPhase,
} from '@/lib/breathing/breathing-machine';

export interface UseBreathingReturn {
  phase: BreathingPhase;
  isActive: boolean;
  controls: AnimationControls;
  start: () => void;
  reset: () => void;
}

/**
 * 驱动 4-7-8 呼吸状态机。
 *
 * - 单一真相源：phase 决定文案、动画和波纹渲染
 * - isActiveRef 控制递归循环终止，防止卸载后继续执行
 * - 多次调用 start() 时若已在运行则忽略
 */
export function useBreathing(): UseBreathingReturn {
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [isActive, setIsActive] = useState(false);
  const controls = useAnimation();
  // ref 用于异步循环中检查是否仍在运行（避免闭包捕获旧 state）
  const isActiveRef = useRef(false);

  const reset = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setPhase('idle');
    controls.stop();
  }, [controls]);

  const start = useCallback(() => {
    // 已运行中则忽略，防止多个循环并行
    if (isActiveRef.current) return;

    isActiveRef.current = true;
    setIsActive(true);

    const runCycle = async (currentPhase: Exclude<BreathingPhase, 'idle'>) => {
      if (!isActiveRef.current) return;

      setPhase(currentPhase);

      if (currentPhase === 'inhale') {
        await controls.start({
          scale: 1.5,
          opacity: 1,
          transition: { duration: BREATHING_CYCLE.inhale / 1000, ease: 'easeInOut' },
        });
      } else if (currentPhase === 'hold') {
        // 屏息：保持当前 scale，等待 7s
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, BREATHING_CYCLE.hold);
          // 注册清理：若 reset 在等待期间调用则提前退出
          const checkInterval = setInterval(() => {
            if (!isActiveRef.current) {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      } else {
        // exhale
        await controls.start({
          scale: 1,
          opacity: 0.8,
          transition: { duration: BREATHING_CYCLE.exhale / 1000, ease: 'easeInOut' },
        });
      }

      if (!isActiveRef.current) return;
      await runCycle(nextPhase(currentPhase));
    };

    runCycle('inhale');
  }, [controls]);

  return { phase, isActive, controls, start, reset };
}
