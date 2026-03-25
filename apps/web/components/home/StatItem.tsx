import { cn } from '@/lib/utils';

interface StatItemProps {
  value: string;
  label: string;
  className?: string;
}

export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div
      className={cn('flex-1 w-full text-center py-6 md:py-0 relative z-10 group', className)}
      data-purpose="stat-item"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-[#A8D8B9] shadow-[0_0_8px_rgba(168,216,185,0.8)] group-hover:scale-150 transition-transform duration-500"
        />
        <div className="font-serif text-5xl md:text-6xl font-light text-[#7D8C9F] tracking-wider group-hover:text-[#2C3E50] transition-colors duration-500">
          {value}
        </div>
      </div>
      <div className="text-sm tracking-[0.25em] text-gray-500 font-light">{label}</div>
    </div>
  );
}
