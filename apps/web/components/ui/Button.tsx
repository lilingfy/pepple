'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}

/**
 * Button component with Pebble design system variants
 *
 * Variants:
 * - primary: Main action buttons with primary color background
 * - secondary: Secondary actions with subtle background
 * - ghost: Minimal buttons with no background
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  isLoading = false,
  loadingLabel = '加载中',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-gentle focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-glow',
    secondary: 'pebble-glass text-slate-700 hover:bg-white/80 active:bg-white/70',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          data-testid="button-loading-indicator"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
      {isLoading ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  );
}

export const PebbleButton = Button;
