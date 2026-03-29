'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RelationNode } from '@pebble/types';

interface RelationDetailProps {
  node: RelationNode | null;
  onStartChat: () => void;
  onClose: () => void;
  onSetAsCurrent?: () => void;
  isCurrent?: boolean;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  职场: { bg: 'bg-[#A8D8B9]/20', text: 'text-[#5A8A6A]', border: 'border-[#A8D8B9]/30' },
  NPD: { bg: 'bg-[#BCA564]/20', text: 'text-[#8A7340]', border: 'border-[#BCA564]/30' },
  BPD: { bg: 'bg-[#BCA564]/20', text: 'text-[#8A7340]', border: 'border-[#BCA564]/30' },
  父母: { bg: 'bg-[#E8C4C4]/30', text: 'text-[#A08080]', border: 'border-[#E8C4C4]/30' },
  配偶: { bg: 'bg-[#E8C4C4]/30', text: 'text-[#A08080]', border: 'border-[#E8C4C4]/30' },
  朋友: { bg: 'bg-[#A8D8B9]/20', text: 'text-[#5A8A6A]', border: 'border-[#A8D8B9]/30' },
  其他: { bg: 'bg-[#7D8C9F]/15', text: 'text-[#5D6D7A]', border: 'border-[#7D8C9F]/30' },
};

function getNodeColors(tags: string[]) {
  for (const tag of tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  }
  return TAG_COLORS['其他'];
}

export function RelationDetail({
  node,
  onStartChat,
  onClose,
  onSetAsCurrent,
  isCurrent,
}: RelationDetailProps) {
  const colors = node ? getNodeColors(node.tags) : null;

  return (
    <AnimatePresence>
      {node && colors && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 100, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2"
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-[2rem_3rem_2.5rem_4rem] pebble-glass',
              'border shadow-[0_20px_60px_rgba(125,140,159,0.2)]'
            )}
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#A8D8B9]/20 to-transparent blur-2xl" />

            <div className="relative p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', colors.bg)}>
                    <span className={cn('text-lg font-semibold', colors.text)}>
                      {node.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">{node.name}</h3>
                    <p className="text-sm text-[#7D8C9F]">
                      {isCurrent ? '当前使用中的关系' : '点击开始对话'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="关闭详情"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7D8C9F]/10 transition-colors hover:bg-[#7D8C9F]/20"
                >
                  <svg aria-hidden="true" className="h-4 w-4 text-[#7D8C9F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {node.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className={cn('rounded-full px-3 py-1 text-xs font-medium', colors.bg, colors.text)}
                  >
                    {tag}
                  </span>
                ))}
                {node.relationshipType && (
                  <span className="rounded-full bg-[#BCA564]/20 px-3 py-1 text-xs font-medium text-[#8A7340]">
                    {node.relationshipType}
                  </span>
                )}
              </div>

              {node.对方特点 && (
                <div className="mb-4">
                  <p className="mb-1 text-xs text-[#7D8C9F]">对方特点</p>
                  <p className="text-sm leading-relaxed text-[#2C3E50]">
                    {node.对方特点.length > 80 ? `${node.对方特点.slice(0, 80)}...` : node.对方特点}
                  </p>
                </div>
              )}

              {node.期望结果 && (
                <div className="mb-4">
                  <p className="mb-1 text-xs text-[#7D8C9F]">期望结果</p>
                  <p className="text-sm leading-relaxed text-[#2C3E50]">
                    {node.期望结果.length > 60 ? `${node.期望结果.slice(0, 60)}...` : node.期望结果}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {onSetAsCurrent && (
                  <button
                    onClick={onSetAsCurrent}
                    disabled={Boolean(isCurrent)}
                    className={cn(
                      'flex-1 rounded-full py-3 font-medium transition-all duration-200',
                      isCurrent
                        ? 'cursor-default bg-[#7D8C9F]/15 text-[#7D8C9F]'
                        : 'bg-[#7D8C9F]/10 text-[#2C3E50] hover:bg-[#7D8C9F]/20'
                    )}
                  >
                    {isCurrent ? '当前使用中' : '设为当前关系'}
                  </button>
                )}

                <button
                  onClick={onStartChat}
                  className={cn(
                    'flex-1 rounded-full bg-gradient-to-r from-[#A8D8B9] to-[#7D8C9F] py-3 font-medium text-white',
                    'shadow-[0_8px_20px_rgba(168,216,185,0.3)]',
                    'transition-all duration-200 hover:shadow-[0_12px_30px_rgba(168,216,185,0.4)]',
                    'active:scale-[0.98] flex items-center justify-center gap-2'
                  )}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  开始对话
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
