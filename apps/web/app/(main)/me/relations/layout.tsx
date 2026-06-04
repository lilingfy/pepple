import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人际关系图谱 - Pebble AI',
  description: '管理你的人际关系图谱，为读心翻译器提供关系上下文',
};

export default function MeRelationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
