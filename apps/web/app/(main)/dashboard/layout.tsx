import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '仪表盘 - Pebble AI',
  description: 'Pebble AI 用户工具入口与今日练习概览',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
