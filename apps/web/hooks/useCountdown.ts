'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCountdownReturn {
  formattedTime: string;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  reset: () => void;
}

/**
 * 倒计时 Hook。
 *
 * @param initialSeconds 初始秒数，默认 119（01:59）
 *
 * - setInterval 在 useEffect 清理函数中 clearInterval，防止积累
 * - 到零后自动停止，禁止负数
 */
export function useCountdown(initialSeconds = 119): UseCountdownReturn {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // ref 保存 initialSeconds 供 reset 使用
  const initialRef = useRef(initialSeconds);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setRemaining(initialRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { formattedTime, isRunning, isComplete, start, reset };
}
