'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/types/dojo';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* 头像 */}
      <div
        className={`w-10 h-10 flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-safe-green rounded-[60%_40%_70%_30%]'
            : 'bg-accent-gold/15 border border-accent-gold/30 rounded-[40%_60%_30%_70%] shadow-[0_0_15px_rgba(230,180,34,0.1)]'
        }`}
      >
        <span className={`material-symbols-outlined text-xl ${isUser ? 'text-white' : 'text-accent-gold'}`}>
          {isUser ? 'face' : 'flare'}
        </span>
      </div>

      {/* 消息内容 */}
      <div
        className={`max-w-[80%] p-5 leading-relaxed backdrop-blur-sm ${
          isUser
            ? 'bg-moss-green/60 rounded-[2rem_0.5rem_2rem_2.5rem] border border-safe-green/30'
            : 'bg-slate-200/80 rounded-[0.5rem_2rem_2.5rem_2rem] border border-slate-300/30'
        }`}
      >
        <p className="text-slate-700">{message.content}</p>

        {/* 情绪得分标签（仅用户消息） */}
        {isUser && message.emotionScore !== undefined && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-white/50 text-pebble-healing">
            中性度: {message.emotionScore}
          </span>
        )}
      </div>
    </motion.div>
  );
}
