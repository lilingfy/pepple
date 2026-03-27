import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '关系对话 - Pebble AI',
  description: '在关系专属语境下继续一段对话练习',
};

export default function RelationChatLayout({ children }: { children: ReactNode }) {
  return children;
}
