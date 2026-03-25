'use client';

import React, { useEffect, useState } from 'react';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';

type BreathingPhase = 'inhale' | 'hold' | 'exhale';

interface BreathingGuideProps {
  onComplete?: () => void;
  duration?: number; // in seconds
}

/**
 * BreathingGuide - 4-7-8 呼吸指导组件
 * 引导用户进行4-7-8呼吸练习，帮助快速平复情绪
 */
export function BreathingGuide({ onComplete, duration = 120 }: BreathingGuideProps) {
  const [phase, setPhase] = React.useState<BreathingPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Breathing cycle timing (4-7-8 pattern)
  const INHALE_TIME = 4000;
  const HOLD_TIME = 7000;
  const EXHALE_TIME = 8000;

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    if (isPaused) return;

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onComplete]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    // Breathing phase cycle
    const runCycle = () => {
      // Inhale (4 seconds)
      setPhase('inhale');
      vibratePattern([100, 50, 100]);

      setTimeout(() => {
        if (isPaused) return;
        // Hold (7 seconds)
        setPhase('hold');

        setTimeout(() => {
          if (isPaused) return;
          // Exhale (8 seconds)
          setPhase('exhale');
          setCycleCount((prev) => prev + 1);
          vibratePattern([200]);

          setTimeout(() => {
            if (!isPaused && timeLeft > 0) {
              runCycle();
            }
          }, EXHALE_TIME);
        }, HOLD_TIME);
      }, INHALE_TIME);
    };

    runCycle();
  }, [isPaused, timeLeft]);

  const vibratePattern = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hrs: hrs.toString().padStart(2, '0'),
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0'),
    };
  };

  const time = formatTime(timeLeft);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return ZH_CN.inhale;
      case 'hold':
        return ZH_CN.hold;
      case 'exhale':
        return ZH_CN.exhale;
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return '用鼻子慢慢吸气（4秒）';
      case 'hold':
        return '轻轻屏住呼吸（7秒）';
      case 'exhale':
        return '用嘴巴缓缓呼气（8秒）';
    }
  };

  const getPhaseDuration = () => {
    switch (phase) {
      case 'inhale':
        return '4s';
      case 'hold':
        return '7s';
      case 'exhale':
        return '8s';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Phase Display */}
        <div className="text-center mb-8">
          <h1 className="text-primary text-3xl font-bold leading-tight mb-2 transition-opacity duration-1000">
            {getPhaseText()}...
          </h1>
          <p className="text-slate-400 text-sm mb-1">{getPhaseInstruction()}</p>
          <p className="text-slate-500 text-xs">
            第 {cycleCount + 1} 轮呼吸 · {getPhaseDuration()}
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center justify-center mb-12 relative">
          {/* Outer glow */}
          <div
            className={`
              w-64 h-64 rounded-full bg-primary/30 blur-2xl absolute
              transition-all duration-1000 ease-in-out
              ${phase === 'inhale' ? 'scale-125' : phase === 'hold' ? 'scale-110' : 'scale-75'}
            `}
          />
          {/* Main circle */}
          <div
            className={`
              w-48 h-48 rounded-full bg-primary shadow-lg shadow-primary/50
              relative z-10 flex items-center justify-center
              transition-all duration-1000 ease-in-out
              ${phase === 'inhale' ? 'scale-100' : phase === 'hold' ? 'scale-110' : 'scale-90'}
            `}
          >
            <div className="w-40 h-40 rounded-full bg-slate-100/10 border border-white/20 flex items-center justify-center">
              <MaterialSymbol
                icon={phase === 'hold' ? 'self_improvement' : 'air'}
                className="text-white text-6xl"
              />
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col items-center max-w-sm w-full mb-8">
          <p className="text-slate-400 text-sm mb-4">
            剩余时间
          </p>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="h-14 w-16 flex items-center justify-center rounded-xl bg-slate-800 shadow-inner">
                <p className="text-slate-200 text-xl font-bold">{time.hrs}</p>
              </div>
              <p className="text-slate-500 text-xs mt-1">时</p>
            </div>
            <div className="flex items-center pb-4">
              <span className="text-xl font-bold text-slate-600">:</span>
            </div>
            <div className="text-center">
              <div className="h-14 w-16 flex items-center justify-center rounded-xl bg-slate-800 shadow-inner">
                <p className="text-slate-200 text-xl font-bold">{time.mins}</p>
              </div>
              <p className="text-slate-500 text-xs mt-1">分</p>
            </div>
            <div className="flex items-center pb-4">
              <span className="text-xl font-bold text-slate-600">:</span>
            </div>
            <div className="text-center">
              <div className="h-14 w-16 flex items-center justify-center rounded-xl bg-slate-800 shadow-inner">
                <p className="text-slate-200 text-xl font-bold">{time.secs}</p>
              </div>
              <p className="text-slate-500 text-xs mt-1">秒</p>
            </div>
          </div>
        </div>

        {/* Safety Message */}
        <p className="text-slate-500 text-sm text-center mb-8 max-w-xs">
          {ZH_CN.youAreSafe}
        </p>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            <MaterialSymbol icon={isPaused ? 'play_arrow' : 'pause'} />
            {isPaused ? '继续' : '暂停'}
          </button>
          <button
            onClick={onComplete}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
          >
            <MaterialSymbol icon="close" />
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
