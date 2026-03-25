import { GlassCard } from '@/components/ui/Card';
import { StatItem } from './StatItem';

const STATS = [
  { value: '98%', label: '言语冲突降低' },
  { value: '1.2M', label: '情绪防御实例' },
  { value: '24h', label: '实时心理屏障' },
  { value: '0', label: '数据隐私泄露' },
] as const;

export function StatsSection() {
  return (
    <section id="stats-section" className="py-24 relative z-10" aria-label="产品数据统计">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <GlassCard className="rounded-[3rem] p-10 md:p-14 relative overflow-hidden border border-white/60 shadow-[0_10px_30px_rgba(125,140,159,0.2),0_20px_60px_rgba(125,140,159,0.15)]">
          {/* 装饰光晕 */}
          <div aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 -left-32 w-64 h-64 bg-[#A8D8B9]/15 rounded-full blur-3xl z-0" />
          <div aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 -right-32 w-64 h-64 bg-[#7D8C9F]/10 rounded-full blur-3xl z-0" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            {STATS.map((stat, index) => (
              <div key={stat.label} className="contents">
                <StatItem value={stat.value} label={stat.label} />
                {index < STATS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-[#7D8C9F]/20 to-transparent relative z-10"
                  />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
