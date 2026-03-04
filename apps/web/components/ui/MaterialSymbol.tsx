'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Valid Material Symbol names
export type SymbolName =
  | 'eco'
  | 'psychology'
  | 'warning'
  | 'spa'
  | 'send'
  | 'expand_less'
  | 'expand_more'
  | 'chat_bubble_outline'
  | 'lightbulb'
  | 'tips_and_updates'
  | 'check_circle'
  | 'public'
  | 'emergency'
  | 'close'
  | 'self_improvement'
  | 'air'
  | 'play_arrow'
  | 'pause'
  | 'lock_open'
  | 'play_circle'
  | 'wifi_off'
  | 'work'
  | 'refresh'
  | 'settings'
  | 'dashboard'
  | 'history'
  | 'arrow_back'
  | 'arrow_forward'
  | 'info'
  | 'error'
  | 'arrow_forward_ios'
  | 'minimize'
  | 'favorite'
  | 'shield'
  | 'content_copy';

export interface MaterialSymbolProps {
  icon: SymbolName | string;
  className?: string;
}

/**
 * Material Symbol component using Google Material Symbols Outlined font.
 * Make sure to include the font in your layout:
 * <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
 */
export function MaterialSymbol({ icon, className }: MaterialSymbolProps) {
  return (
    <span className={cn('material-symbols-outlined', className)}>{icon}</span>
  );
}
