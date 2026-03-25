import Link from 'next/link';

import { AmbientBackground } from './AmbientBackground';
import { CoreArmorText } from './CoreArmorText';
import { ScrollIndicator } from './ScrollIndicator';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden"
    >
      <AmbientBackground />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* 版本标签 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-[#A8D8B9]/30 mb-10 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#A8D8B9] motion-safe:animate-pulse" aria-hidden="true" />
          <span className="text-[10px] tracking-[0.3em] text-[#7D8C9F] uppercase">v1.0 MVP 已上线</span>
        </div>

        {/* 主标题 */}
        <h1 className="font-serif text-6xl md:text-[5rem] text-[#5D6D7E] mb-8 leading-tight tracking-[0.15em]">
          <span className="block mb-4 text-[#7D8C9F]">在嘈杂的世界里</span>
          <span className="inline-block">为你穿上一层</span>
          <CoreArmorText className="mx-4 text-[5.2rem]">情绪盔甲</CoreArmorText>
        </h1>

        {/* 副标题 */}
        <p className="text-lg text-gray-500 mb-12 font-light tracking-widest max-w-2xl mx-auto leading-relaxed mt-6">
          基于"灰岩法"的智能心理盾牌。不教你迎合，只教你如何在恶意与压力中，保持如鹅卵石般圆润且坚定的边界。
        </p>

        {/* CTA 按钮组 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-20">
          <Link href="/translator">
            <button className="px-14 py-6 bg-[#A8D8B9]/90 backdrop-blur-sm text-white rounded-full text-lg font-medium tracking-[0.25em] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#A8D8B9]/40 hover:font-bold transition-all duration-300">
              立即体验
            </button>
          </Link>
          <Link href="/demo">
            <button className="px-14 py-6 rounded-full text-lg font-medium tracking-[0.25em] text-[#7D8C9F] hover:bg-white hover:-translate-y-1.5 hover:font-bold transition-all duration-300 flex items-center gap-4 border border-[#A8D8B9]/20 bg-white/50 backdrop-blur-md shadow-[0_4px_30px_rgba(168,216,185,0.15)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              演示视频
            </button>
          </Link>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
