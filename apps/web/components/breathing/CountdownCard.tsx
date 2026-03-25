import { GlassCard } from '@/components/ui/Card';

interface CountdownCardProps {
  formattedTime: string;
  isRunning: boolean;
}

/** 玻璃拟态倒计时胶囊，复用 GlassCard。 */
export function CountdownCard({ formattedTime, isRunning }: CountdownCardProps) {
  return (
    <GlassCard className="rounded-full px-8 py-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full bg-amber-400 ${isRunning ? 'animate-pulse' : ''}`}
          />
          <span className="text-sm font-light tracking-wide text-[#7D8C9F]">
            建议平静时长
          </span>
        </div>
        <span className="font-mono text-xl font-semibold text-[#7D8C9F]">
          {formattedTime}
        </span>
      </div>
    </GlassCard>
  );
}
