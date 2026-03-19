'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageShellProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({
  header,
  footer,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn('min-h-screen bg-background-light text-[var(--color-pebble-text)]', className)}>
      {header}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">{children}</main>
      {footer ? <footer className="mx-auto w-full max-w-6xl px-4 pb-8 md:px-6">{footer}</footer> : null}
    </div>
  );
}

interface SidebarLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function SidebarLayout({
  left,
  center,
  right,
  className,
}: SidebarLayoutProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]', className)}>
      <aside className="space-y-4">{left}</aside>
      <section className="min-w-0">{center}</section>
      <aside className="space-y-4">{right}</aside>
    </div>
  );
}

interface CenteredStageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function CenteredStageLayout({
  title,
  description,
  children,
  className,
}: CenteredStageLayoutProps) {
  return (
    <section className={cn('mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center', className)}>
      <div className="mb-8 max-w-xl space-y-3">
        <h1 className="font-serif text-4xl font-semibold text-[var(--color-pebble-text)] md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-7 text-slate-600 md:text-base">{description}</p>
        ) : null}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}
