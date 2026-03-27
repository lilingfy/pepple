'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRelationStore } from '@/store/relation-store';
import { sendChatMessage, type ChatMessage } from '@/lib/frontend/relation-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function RelationChatPage() {
  const params = useParams();
  const router = useRouter();
  const relationId = params.id as string;
  const { nodes, loadNodes } = useRelationStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const relation = nodes.find((n) => n.id === relationId);

  useEffect(() => {
    if (nodes.length === 0) {
      loadNodes();
    }
  }, [nodes.length, loadNodes]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const chatHistory: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: userMessage.content });

      const response = await sendChatMessage(relationId, chatHistory);

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败，请稍后重试');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen fluid-bg relative overflow-hidden flex flex-col">
      {/* 背景光晕 */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-breathing pointer-events-none" />

      {/* 头部 */}
      <header className="relative z-10 px-8 pt-32 pb-4">
        <button
          onClick={() => router.push('/relations')}
          aria-label="返回关系图谱"
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回图谱
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {relation?.name || '加载中...'}
            </h1>
            <p className="text-white/60 text-sm">
              {relation?.relationshipType || '关系对话'}
            </p>
          </div>
        </div>

        {/* 标签 */}
        {relation?.tags && relation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {relation.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 欢迎消息 */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-8 py-6"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-medium mb-2">欢迎来到 {relation?.name || '这段关系'} 的对话空间</h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    我会通过提问帮助你探索这段关系中的感受和想法。请记住，没有所谓的"正确答案"——你的感受本身就是真实的。
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed mt-3">
                    你可以自由地分享任何想法。也许我们可以从最近发生的一件事开始？
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 消息列表 */}
      <main className="relative z-10 flex-1 overflow-y-auto px-8 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white/10 text-white/90 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/60' : 'text-white/40'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 正在输入指示器 */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 text-white/90 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2 text-red-200 text-sm">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入框 */}
      <footer className="relative z-10 px-8 pb-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <textarea
              aria-label="消息输入"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的想法..."
              rows={1}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              style={{ maxHeight: '120px' }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              aria-label={isTyping ? '发送中' : '发送消息'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {isTyping ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  发送
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </motion.button>
          </div>
          <p className="text-white/40 text-xs mt-2 text-center">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </footer>
    </div>
  );
}
