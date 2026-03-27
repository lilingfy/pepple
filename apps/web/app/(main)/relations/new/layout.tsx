import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '添加人际关系 - Pebble AI',
  description: '补充关系信息并生成专属的对话上下文',
};

export default function NewRelationLayout({ children }: { children: ReactNode }) {
  return children;
}
