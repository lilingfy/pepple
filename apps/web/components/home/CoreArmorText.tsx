import { cn } from '@/lib/utils';

interface CoreArmorTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 核心盔甲文字效果组件
 * 带圆角边框、多层阴影和下划线发光动画
 */
export function CoreArmorText({ children, className }: CoreArmorTextProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border border-[#8FB9A8]/30 px-3',
        'shadow-[0_2px_4px_rgba(125,140,159,0.2),0_4px_8px_rgba(125,140,159,0.15),0_8px_16px_rgba(125,140,159,0.1),0_16px_32px_rgba(125,140,159,0.05)]',
        'tracking-[0.1em] relative text-[#8FB8A8] transition-all duration-300',
        'after:content-[""] after:absolute after:w-[140%] after:h-[6px]',
        'after:bg-gradient-to-r after:from-transparent after:via-[#8FB9A8] after:to-transparent',
        'after:bottom-[-15px] after:left-1/2 after:-translate-x-1/2',
        'after:rounded-full after:blur-[4px] after:opacity-70 after:-z-10',
        'after:shadow-[0_4px_6px_rgba(125,140,159,0.1),0_10px_15px_rgba(125,140,159,0.05)]',
        'motion-safe:after:animate-pulse-glow',
        className
      )}
    >
      {children}
    </span>
  );
}
