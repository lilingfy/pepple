import { FeatureCard } from './FeatureCard';

const FEATURES = [
  {
    icon: '🔍',
    label: 'MIND-READING TRANSLATOR',
    title: '读心翻译器',
    description: '输入一段让你困扰的对话，AI 解析隐藏的情绪攻击模式，提供三条"灰岩式"回应建议。',
    href: '/translator',
    gradient: 'bg-gradient-to-br from-[#E8F4F0] to-[#F0F6F2]',
  },
  {
    icon: '🥊',
    label: 'PRACTICE DOJO',
    title: '模拟陪练场',
    description: '在安全环境中与 AI 模拟真实冲突场景，练习如何在职场、亲密关系、社交中保持边界。',
    href: '/dojo',
    gradient: 'bg-gradient-to-br from-[#EDF2F7] to-[#F7F9FC]',
  },
  {
    icon: '🌬️',
    label: 'EMERGENCY BREATHING',
    title: '急救呼吸',
    description: '情绪崩溃时的即时干预。4-7-8 呼吸法配合鹅卵石动画，帮你在 2 分钟内找回平静。',
    href: '/breathing',
    gradient: 'bg-gradient-to-br from-[#F0F9F4] to-[#F0F6F2]',
  },
] as const;

export function FeatureSection() {
  return (
    <section id="features" className="py-32 px-6 relative z-10" aria-label="核心功能">
      <div className="max-w-6xl mx-auto">
        {/* 标题区 */}
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.4em] text-[#A8D8B9] uppercase mb-4 font-bold">
            CORE FEATURES
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#5D6D7E] tracking-wide">
            三层情绪防御体系
          </h2>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.href} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
