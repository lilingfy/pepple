'use client';

import React from 'react';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

interface PanicButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function PanicButton({ onClick, isActive = false }: PanicButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = () => {
    // Trigger vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 300);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-8 right-8 z-50
        w-16 h-16 rounded-full
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${isActive ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'}
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        active:scale-95
      `}
      aria-label="Open breathing exercise"
    >
      {isActive ? (
        <MaterialSymbol icon="close" className="text-white text-3xl" />
      ) : (
        <MaterialSymbol icon="emergency" className="text-white text-3xl" />
      )}
    </button>
  );
}
