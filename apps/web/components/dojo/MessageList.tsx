'use client';

import { useRef, useEffect } from 'react';
import { useDojoStore } from '@/store/dojo-store';
import { MessageBubble } from './MessageBubble';

export function MessageList() {
  const { messages, isTyping } = useDojoStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-8 space-y-8 chat-container scroll-smooth"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-primary/40">
          <span className="material-symbols-outlined text-6xl mb-4">chat</span>
          <p className="text-sm">开始你的模拟对话练习</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-[40%_60%_30%_70%] bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-accent-gold text-xl">flare</span>
          </div>
          <div className="bg-slate-200/80 backdrop-blur-sm p-4 rounded-[0.5rem_2rem_2.5rem_2rem] border border-slate-300/30">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        </div>
      )}

      {/* 底部留白，确保最后一条消息不被遮挡 */}
      <div className="h-4" />
    </div>
  );
}
