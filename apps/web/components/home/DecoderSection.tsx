import { DecoderDemo } from './DecoderDemo';

/**
 * 读心翻译器展示区块
 * 左侧功能介绍，右侧交互式演示
 */
export function DecoderSection() {
  return (
    <section
      id="translator"
      className="py-32 px-6 relative z-20 bg-[#F0F6F2] rounded-t-[4rem] shadow-[0_-20px_60px_-15px_rgba(143,185,168,0.3)] mt-24 overflow-visible"
    >
      {/* 顶部装饰光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] max-w-6xl h-[2px] bg-gradient-to-r from-transparent via-[#A8D8B9]/60 to-transparent opacity-90 z-20" />

      {/* 装饰箭头 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group cursor-default">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-48 h-24 bg-white/90 rounded-[100%] blur-2xl z-0" />
        <div className="relative flex flex-col items-center justify-center z-10">
          <svg
            className="w-28 h-20 scale-x-[1.3] text-[#A8D8B9] drop-shadow-[0_6px_12px_rgba(168,216,185,0.6)]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M6 14L12 9L18 14" />
            <path d="M6 20L12 15L18 20" />
          </svg>
          <div className="w-3.5 h-3.5 bg-[#A8D8B9] rounded-full shadow-[0_0_12px_rgba(168,216,185,0.9)] animate-pulse mt-3" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 mt-12">
        <div className="flex flex-col md:flex-row items-center gap-20">
          {/* 左侧功能介绍 */}
          <div className="flex-1">
            <div className="mb-8">
              <div className="text-[11px] font-bold tracking-[0.4em] text-[#A8D8B9] uppercase mb-4">
                MIND-READING TRANSLATOR
              </div>
              <div className="relative inline-block pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A8D8B9]" />
                  <h3 className="font-serif text-4xl md:text-5xl font-light text-[#2C3E50] tracking-widest">
                    AI 读心翻译器
                  </h3>
                </div>
                <div className="absolute bottom-0 left-0 w-4/5 h-[1px] bg-gradient-to-r from-[#A8D8B9]/60 to-transparent" />
              </div>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed font-light">
              那些令人不安的言语背后，往往隐藏着操控。我们的翻译器能像手术刀般剖析潜台词，并提供不带情绪的"灰岩回复"建议。
            </p>

            <ul className="space-y-5">
              <li className="flex items-center space-x-3 bg-white/50 border border-[#7D8C9F]/10 p-3 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A8D8B9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">识别操控 (Gaslighting / PUA)</span>
              </li>
              <li className="flex items-center space-x-3 bg-white/50 border border-[#7D8C9F]/10 p-3 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A8D8B9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">获取极简、温和、终止版回复策略</span>
              </li>
            </ul>
          </div>

          {/* 右侧演示卡片 */}
          <div className="flex-1 w-full">
            <DecoderDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
