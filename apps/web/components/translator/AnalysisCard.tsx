import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  label: string;
  sublabel?: string;
  content: string;
  variant?: 'surface' | 'subtext';
  className?: string;
}

export function AnalysisCard({ label, sublabel, content, variant = 'surface', className }: AnalysisCardProps) {
  // 根据 variant 选择圆角样式
  const radiusClass = variant === 'surface' ? 'rounded-pebble' : 'rounded-pebble-alt';
  const bgClass = variant === 'surface' ? 'bg-slate-100/60' : 'bg-[#D5E5D5]/50';
  const iconName = variant === 'surface' ? 'hearing' : 'visibility';

  return (
    <div
      className={cn(
        radiusClass,
        bgClass,
        'backdrop-blur-sm p-6 pebble-shadow border border-white/40',
        className,
      )}
    >
      <h3 className="text-sm font-bold text-[#7D8C9F]/80 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">{iconName}</span>
        {label}
        {sublabel && <span className="text-slate-400 font-normal"> ({sublabel})</span>}
      </h3>
      <p className={cn('text-sm text-slate-700 leading-relaxed', variant === 'subtext' && 'italic')}>
        {content}
      </p>
    </div>
  );
}
