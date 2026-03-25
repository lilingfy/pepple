import type { Metadata } from 'next';

import { HomePage } from '@/components/home/HomePage';

export const metadata: Metadata = {
  title: '鹅卵石 AI 情绪防御助手 - 基于灰岩法的智能心理盾牌',
  description:
    '不教你迎合，只教你如何在恶意与压力中，保持如鹅卵石般圆润且坚定的边界。读心翻译、模拟陪练、急救呼吸三层防御体系。',
};

export default function Page() {
  return <HomePage />;
}
