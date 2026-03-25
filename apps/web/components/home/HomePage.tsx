import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { StatsSection } from './StatsSection';
import { DecoderSection } from './DecoderSection';
import { PracticeSection } from './PracticeSection';
import { BreathingSection } from './BreathingSection';
import { Footer } from './Footer';
import { ScrollReveal } from './ScrollReveal';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#F0F6F2] text-[#5D6D7E] overflow-x-hidden">
      <Navigation />

      <main>
        <HeroSection />

        {/* 分隔线 */}
        <div aria-hidden="true" className="relative flex justify-center items-center py-12 opacity-80">
          <div className="w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#A8D8B9]/60 to-transparent" />
          <div className="absolute w-1.5 h-1.5 bg-[#A8D8B9] rounded-full shadow-[0_0_8px_rgba(168,216,185,0.8)] animate-pulse" />
        </div>

        <StatsSection />

        <ScrollReveal animation="slide-up">
          <DecoderSection />
        </ScrollReveal>

        <ScrollReveal animation="pop-out">
          <PracticeSection />
        </ScrollReveal>

        <ScrollReveal animation="pop-out">
          <BreathingSection />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
