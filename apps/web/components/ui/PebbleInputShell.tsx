'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PebbleInputShellProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function PebbleInputShell({
  label,
  children,
  className,
}: PebbleInputShellProps) {
  return (
    <div className={cn('pebble-glass rounded-[var(--radius-pebble-1)] border border-white/50 p-4 shadow-glass', className)}>
      {label ? (
        <div className="mb-3 text-sm font-medium tracking-wide text-slate-700">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
