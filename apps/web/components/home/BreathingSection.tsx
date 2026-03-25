import { BreathingOrb } from './BreathingOrb';

/**
 * 急救呼吸展示区块
 */
export function BreathingSection() {
  return (
    <section id="breathing" className="py-32 px-6 overflow-hidden bg-[#F0F6F2] relative text-center z-10">
      <div className="max-w-4xl mx-auto">
        {/* 标题区 */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-[11px] font-bold tracking-[0.4em] text-[#A8D8B9] uppercase mb-4">
            EMERGENCY BREATHING
          </div>
          <div className="relative inline-block pb-4 text-center">
            <div className="flex items-center justify-center space-x-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8D8B9]" />
              <h3 className="font-serif text-4xl md:text-5xl font-light text-[#2C3E50] tracking-[0.15em]">
                急救呼吸
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8D8B9]" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[1px] bg-gradient-to-r from-transparent via-[#A8D8B9]/60 to-transparent" />
          </div>
        </div>

        <p className="text-gray-500 font-light mb-16 tracking-widest">
          情绪淹没时，请点击下方，跟随鹅卵石的律动找回平静。
        </p>

        {/* 呼吸鹅卵石 */}
        <BreathingOrb />
      </div>
    </section>
  );
}
