'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MaterialSymbol } from './MaterialSymbol';

export interface CardProps {
  variant?: 'storm' | 'shelter' | 'insight' | 'default';
  children: React.ReactNode;
  className?: string;
  icon?: string;
  title?: string;
  onClick?: () => void;
}

/**
 * Card component with Pebble design system variants
 *
 * Variants:
 * - storm: For emotional storm content - light blue-gray background
 * - shelter: For safe harbor content - clean white background
 * - insight: For insight moments - soft green background
 * - default: Neutral card style
 */
export function Card({
  variant = 'default',
  children,
  className,
  icon,
  title,
  onClick,
}: CardProps) {
  const variantStyles = {
    storm: 'bg-storm-bg border-blue-100',
    shelter: 'bg-shelter-bg border-gray-100',
    insight: 'bg-insight-bg border-green-100',
    default: 'bg-white border-gray-200',
  };

  const iconColor = {
    storm: 'text-primary-600',
    shelter: 'text-gray-600',
    insight: 'text-insight-text',
    default: 'text-primary-600',
  };

  const interactiveStyles = onClick
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200'
    : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cn(
        'rounded-[var(--radius-pebble-2)] border p-6 shadow-glass text-left',
        variant === 'default' || variant === 'shelter' ? 'pebble-glass' : '',
        variantStyles[variant],
        interactiveStyles,
        className
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {(icon || title) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className={cn('flex-shrink-0', iconColor[variant])}>
              <MaterialSymbol icon={icon} className="text-2xl" />
            </div>
          )}
          {title && (
            <h3 className={cn(
              'text-lg font-semibold',
              variant === 'insight' ? 'text-insight-text' : 'text-gray-900'
            )}>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </Component>
  );
}

/**
 * CardContent component for consistent padding within cards
 */
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

/**
 * CardDescription component for descriptive text
 */
export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('text-sm text-gray-600', className)}>{children}</p>;
}

export const GlassCard = Card;
