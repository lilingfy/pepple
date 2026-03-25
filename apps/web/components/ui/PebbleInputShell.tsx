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
    <div className={cn(
      'rounded-pebble bg-white/60 backdrop-blur-sm',
      'pebble-inset',
      'border border-white/50 p-4',
      'transition-shadow duration-300',
      'focus-within:shadow-lg focus-within:border-[#A8D8B9]/30',
      className
    )}>
      {label ? (
        <div className="mb-3 text-sm font-medium tracking-wide text-slate-700">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
