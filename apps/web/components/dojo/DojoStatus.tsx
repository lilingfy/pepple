'use client';

import { useDojoStore } from '@/store/dojo-store';

export function DojoStatus() {
  const { error, sessionStatus, currentScenario, sessionId } = useDojoStore();

  if (!error && sessionStatus === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {error && (
        <div className="bg-rose-500/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined">error</span>
            <span className="font-bold">错误</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Debug status */}
      <div className="bg-slate-800/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm text-xs font-mono">
        <div>Status: {sessionStatus}</div>
        <div>Scenario: {currentScenario?.name || 'none'}</div>
        <div>Session: {sessionId || 'none'}</div>
      </div>
    </div>
  );
}
