'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RelationNode } from '@pebble/types';

interface RelationNodeProps {
  node: RelationNode;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

const TAG_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  职场: { bg: 'bg-[#A8D8B9]/20', text: 'text-[#5A8A6A]', ring: 'ring-[#A8D8B9]' },
  NPD: { bg: 'bg-[#BCA564]/20', text: 'text-[#8A7340]', ring: 'ring-[#BCA564]' },
  BPD: { bg: 'bg-[#BCA564]/20', text: 'text-[#8A7340]', ring: 'ring-[#BCA564]' },
  父母: { bg: 'bg-[#E8C4C4]/30', text: 'text-[#A08080]', ring: 'ring-[#E8C4C4]' },
  配偶: { bg: 'bg-[#E8C4C4]/30', text: 'text-[#A08080]', ring: 'ring-[#E8C4C4]' },
  朋友: { bg: 'bg-[#A8D8B9]/20', text: 'text-[#5A8A6A]', ring: 'ring-[#A8D8B9]' },
  其他: { bg: 'bg-[#7D8C9F]/15', text: 'text-[#5D6D7A]', ring: 'ring-[#7D8C9F]' },
};

function getNodeColors(tags: string[]) {
  for (const tag of tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  }
  return TAG_COLORS['其他'];
}

export function RelationNodeCard({ node, index, onClick, isSelected }: RelationNodeProps) {
  const colors = getNodeColors(node.tags);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={node.name}
      className={cn(
        'group relative flex flex-col items-center justify-center',
        'w-20 h-20 rounded-[2rem_3rem_2.5rem_4rem] pebble-glass',
        'cursor-pointer transition-all duration-300',
        'shadow-[0_8px_20px_rgba(125,140,159,0.12)]',
        'hover:shadow-[0_12px_30px_rgba(125,140,159,0.2)]',
        isSelected && 'ring-2 ring-[#A8D8B9] ring-offset-2'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          colors.bg
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className={cn('text-sm font-semibold', colors.text)}>
          {node.name.length > 4 ? `${node.name.slice(0, 4)}...` : node.name}
        </span>
        {node.tags.length > 0 && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', colors.bg, colors.text)}>
            {node.tags[0]}
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute -inset-1 rounded-[inherit] animate-pulse opacity-50 bg-[#A8D8B9]/20" />
      )}
    </motion.button>
  );
}

export function RelationNodeCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="w-20 h-20 rounded-[2rem_3rem_2.5rem_4rem] pebble-glass animate-pulse"
    />
  );
}
