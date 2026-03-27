import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '人际关系图谱 - Pebble AI',
  description: '查看、管理并进入重要关系的对话空间',
};

export default function RelationsLayout({ children }: { children: ReactNode }) {
  return children;
}
