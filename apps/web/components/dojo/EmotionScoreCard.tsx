'use client';

import { motion } from 'framer-motion';
import { useDojoStore } from '@/store/dojo-store';
import { getScoreLevel, getScoreColor, getScoreLabel } from '@/types/dojo';

export function EmotionScoreCard() {
  const { rightPanel } = useDojoStore();

  const score = rightPanel?.analysisScore ?? 0;
  const level = getScoreLevel(score);
  const color = getScoreColor(level);
  const label = getScoreLabel(level);

  // 圆环计算
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-8 rounded-pebble-3 pebble-shadow flex flex-col items-center text-center bg-white/30 backdrop-blur-2xl border-white/60 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-gold/20 blur-3xl rounded-full" />

      <h3 className="font-bold text-slate-700 mb-6 tracking-wider flex items-center gap-2">
        <svg className="w-5 h-5 text-accent-gold fill-current drop-shadow-sm" viewBox="0 0 24 24">
          <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
        </svg>
        实时情绪分析
      </h3>

      {/* 圆环 */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        {/* 外发光 */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          animate={{ background: `${color}33` }}
          transition={{ duration: 1 }}
        />

        {/* 背景圆环 */}
        <div className="absolute inset-0 rounded-full border-[6px] border-white/50" />

        {/* 进度圆环 */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <motion.circle
            cx="72"
            cy="72"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* 中心得分 */}
        <div className="w-28 h-28 rounded-full bg-white/90 flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
          <motion.span
            className="text-4xl font-bold [text-shadow:_0_0_10px_rgba(168,216,185,0.4)]"
            style={{ color }}
            key={score}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-safe-green/60 uppercase tracking-widest font-bold">SCORE</span>
        </div>
      </div>

      {/* 等级标签 */}
      <motion.div
        className="px-4 py-1.5 rounded-full mb-3"
        style={{ background: `${color}1A` }}
        animate={{ background: `${color}1A` }}
      >
        <p className="text-sm font-bold text-deep-heal-green [text-shadow:_0_0_8px_rgba(255,255,255,0.8)]">
          中性度得分: {label}
        </p>
      </motion.div>

      {/* 评语 */}
      <p className="text-xs text-slate-600/80 leading-relaxed max-w-[200px]">
        {rightPanel?.analysisSummary ? (
          <>
            你成功识别了情绪陷阱。当前语气<span className="text-deep-heal-green font-medium">非常克制</span>，有效避免了对抗性升级。
          </>
        ) : (
          '开始练习，获取实时情绪分析'
        )}
      </p>
    </div>
  );
}
