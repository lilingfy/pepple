'use client';

import React from 'react';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

export interface ChatMessage {
  role: 'user' | 'antagonist';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  antagonistName?: string;
  disabled?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  antagonistName = 'Antagonist',
  disabled = false
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/10 overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-primary/10">
        <h1 className="text-2xl md:text-[32px] font-bold leading-tight mb-2">
          Practice Dojo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
          Master Gray Rocking techniques with a virtual antagonist.
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MaterialSymbol icon="chat_bubble_outline" className="text-primary/30 text-6xl mb-4" />
              <p className="text-slate-400 dark:text-slate-500">
                Select a scenario to begin practicing
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 flex-shrink-0 rounded-md flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary/20 rounded-full border-2 border-primary/30'
                    : 'bg-slate-200 dark:bg-slate-700 transform rotate-3'
                }`}
              >
                <MaterialSymbol
                  icon={message.role === 'user' ? 'spa' : 'warning'}
                  className={message.role === 'user' ? 'text-primary' : 'text-slate-500'}
                />
              </div>
              <div
                className={`flex flex-col gap-1 ${
                  message.role === 'user' ? 'items-end' : ''
                }`}
              >
                <div className={`flex items-center gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-base font-bold">
                    {message.role === 'user' ? 'You' : antagonistName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p
                  className={`text-base leading-relaxed ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
              <MaterialSymbol icon="warning" className="text-slate-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-primary/10">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled || isLoading}
            placeholder="Type your neutral response..."
            className="w-full bg-white dark:bg-slate-700 border border-primary/20 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 text-base shadow-sm placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || disabled || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          >
            <MaterialSymbol icon="send" />
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3 text-center">
          Remember: Keep it brief, non-committal, and devoid of emotion.
        </p>
      </div>
    </div>
  );
}
