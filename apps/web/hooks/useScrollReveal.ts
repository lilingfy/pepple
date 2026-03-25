'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 滚动渐显动画 Hook
 * 使用 IntersectionObserver 检测元素是否进入视口
 * @param threshold - 可见度阈值（0-1），默认 0.15
 * @returns ref - 绑定到目标元素的 ref，isInView - 是否在视口内
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, isInView };
}
