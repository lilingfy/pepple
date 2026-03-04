'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MaterialSymbol } from './MaterialSymbol';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showLocalIndicator: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Provider for managing notifications throughout the app
 * Includes privacy-focused local storage indicators
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showLocalBadge, setShowLocalBadge] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const showLocalIndicator = useCallback(() => {
    setShowLocalBadge(true);
    setTimeout(() => setShowLocalBadge(false), 2000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showLocalIndicator }}>
      {children}

      {/* Local Storage Indicator Badge */}
      {showLocalBadge && (
        <div className="fixed bottom-4 left-4 z-50 animate-slideUp">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg shadow-md border border-green-200">
            <MaterialSymbol icon="wifi_off" className="text-sm" />
            <span className="text-sm font-medium">仅本地处理</span>
          </div>
        </div>
      )}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Individual Toast Item component
 */
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const typeStyles = {
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  const typeIcons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[280px] max-w-md animate-slideIn',
        typeStyles[toast.type]
      )}
    >
      <MaterialSymbol icon={typeIcons[toast.type]} className="text-xl flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
        aria-label="关闭"
      >
        <MaterialSymbol icon="close" className="text-lg" />
      </button>
    </div>
  );
}

/**
 * Hook to use Toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * LocalStorageBadge component for showing privacy indicators
 */
export function LocalStorageBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs text-gray-500',
      className
    )}>
      <MaterialSymbol icon="lock_open" className="text-sm" />
      <span>仅本地</span>
    </div>
  );
}
