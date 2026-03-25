'use client';

import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type AnimationType = 'slide-up' | 'pop-out';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  className?: string;
  threshold?: number;
}

/**
 * 滚动渐显动画包装组件
 * 使用 IntersectionObserver 检测元素进入视口时触发动画
 */
export function ScrollReveal({
  children,
  animation = 'slide-up',
  className,
  threshold = 0.15,
}: ScrollRevealProps) {
  const { ref, isInView } = useScrollReveal(threshold);

  const animationClasses = {
    'slide-up': {
      hidden: 'opacity-0 translate-y-24 scale-95',
      visible: 'opacity-100 translate-y-0 scale-100',
    },
    'pop-out': {
      hidden: 'opacity-0 scale-[0.70]',
      visible: 'opacity-100 scale-100',
    },
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-1000 ease-out will-change-transform',
        animationClasses[animation].hidden,
        isInView && animationClasses[animation].visible,
        className
      )}
    >
      {children}
    </div>
  );
}
