'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface MainHeaderItem {
  label: string;
  href: string;
}

interface MainHeaderProps {
  items: MainHeaderItem[];
  activeHref?: string;
  brandLabel?: string;
}

export function MainHeader({
  items,
  activeHref,
  brandLabel = 'Pebble',
}: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-wide text-[var(--color-pebble-text)]">
          {brandLabel}
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-2 md:gap-3">
          {items.map((item) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-gentle',
                  isActive
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-slate-600 hover:bg-white/80 hover:text-[var(--color-pebble-text)]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
