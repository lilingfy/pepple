import Link from 'next/link';

import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: string;
  label: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
}

export function FeatureCard({ icon, label, title, description, href, gradient }: FeatureCardProps) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={cn(
        'group block rounded-[2rem] p-8 border border-white/40 relative overflow-hidden',
        'hover:-translate-y-2 hover:shadow-2xl transition-all duration-500',
        gradient
      )}
    >
      {/* 图标容器 */}
      <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center mb-6 group-hover:bg-white/50 transition-colors duration-300 text-3xl">
        {icon}
      </div>

      {/* 标签 */}
      <div className="text-[10px] tracking-[0.4em] uppercase text-[#7D8C9F] mb-3 font-medium">
        {label}
      </div>

      {/* 标题 */}
      <h3 className="font-serif text-2xl text-[#2C3E50] mb-3 tracking-wide">{title}</h3>

      {/* 描述 */}
      <p className="text-sm text-gray-600 leading-relaxed font-light">{description}</p>

      {/* 进入箭头 */}
      <div className="mt-6 flex items-center gap-2 text-[#7D8C9F] text-sm font-medium group-hover:gap-3 transition-all duration-300">
        <span>开始体验</span>
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
