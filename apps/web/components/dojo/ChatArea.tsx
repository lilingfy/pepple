'use client';

import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatArea() {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white/20 backdrop-blur-sm rounded-[3rem] pebble-shadow border border-white/50 overflow-hidden relative z-20">
      <MessageList />
      <ChatInput />
    </div>
  );
}
