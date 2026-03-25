import { cn } from '@/lib/utils';

interface AmbientBackgroundProps {
  className?: string;
}

/**
 * Hero 区域背景装饰
 * 三层浮动模糊光斑，营造禅意氛围
 */
export function AmbientBackground({ className }: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden',
        className
      )}
    >
      {/* 光斑 1 - 品牌安全绿 */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-[#A8D8B9]/40 blur-[80px] mix-blend-multiply translate-x-20"
        style={{ animation: 'float-blob 12s infinite alternate ease-in-out' }}
      />
      {/* 光斑 2 - 浅绿 */}
      <div
        className="absolute w-[450px] h-[450px] rounded-full bg-[#D4EDDA]/60 blur-[80px] mix-blend-multiply -translate-x-32 -translate-y-20"
        style={{ animation: 'float-blob 12s infinite alternate ease-in-out', animationDelay: '-3s' }}
      />
      {/* 光斑 3 - 品牌主色 */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full bg-[#7D8C9F]/10 blur-[80px] mix-blend-multiply translate-y-32 -translate-x-10"
        style={{ animation: 'float-blob 12s infinite alternate ease-in-out', animationDelay: '-6s' }}
      />
    </div>
  );
}
