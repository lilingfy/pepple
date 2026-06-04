import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '添加人际关系 - Pebble AI',
  description: '添加新的人际关系节点',
};

export default function NewRelationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
