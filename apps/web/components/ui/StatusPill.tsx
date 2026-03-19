'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type StatusTone = 'calm' | 'active' | 'warn';

interface StatusPillProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  calm: 'bg-[color:rgba(168,216,185,0.25)] text-[var(--color-pebble-text)]',
  active: 'bg-[color:rgba(125,140,159,0.16)] text-[var(--color-pebble-text)]',
  warn: 'bg-[color:rgba(224,122,95,0.16)] text-[var(--color-pebble-warn)]',
};

export function StatusPill({
  tone = 'active',
  children,
  className,
}: StatusPillProps) {
  return (
    <span
      data-tone={tone}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
