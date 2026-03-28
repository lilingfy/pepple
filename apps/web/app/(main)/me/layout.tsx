import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: '用户中心 | Pebble AI',
  description: '管理你的关系档案，让 AI 更懂你',
};

export default function MeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F6F2] to-[#E8F0EA]">
      <AppHeader activeHref="/me" />
      <div className="pt-24">{children}</div>
    </div>
  );
}
