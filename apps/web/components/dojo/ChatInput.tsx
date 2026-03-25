'use client';

import { useState, useRef } from 'react';
import { useDojoStore } from '@/store/dojo-store';

export function ChatInput() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, restartSession, sessionStatus, isTyping } = useDojoStore();

  const handleSend = async () => {
    if (!input.trim() || isTyping || sessionStatus !== 'active') return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
    // 发送后重新聚焦输入框
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = sessionStatus !== 'active' || isTyping;

  return (
    <div className="p-6 bg-white/40 border-t border-white/60 relative z-30">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={sessionStatus === 'ended' ? '会话已结束' : '输入你的回应...'}
          className="w-full h-16 pl-8 pr-20 rounded-full border-none bg-white/80 pebble-shadow focus:ring-2 focus:ring-safe-green text-slate-700 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          className="absolute right-2 w-12 h-12 bg-safe-green text-white rounded-[45%_55%_70%_30%] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-primary/60">
        <button className="flex items-center gap-1 text-xs hover:text-safe-green transition-colors disabled:opacity-50" disabled>
          <span className="material-symbols-outlined text-sm">mic</span> 语音输入
        </button>
        <button
          onClick={restartSession}
          disabled={sessionStatus === 'idle' || isTyping}
          className="flex items-center gap-1 text-xs hover:text-accent-gold transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span> 重启本局
        </button>
      </div>
    </div>
  );
}
