'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useTranslatorStore } from '@/store/translator-store';
import { useUserCenterStore } from '@/store/user-center-store';
import { InputArea } from '@/components/translator/InputArea';
import { EmotionStatusBar } from '@/components/translator/EmotionStatusBar';
import { DecodeButton } from '@/components/translator/DecodeButton';
import { AnalysisResult } from '@/components/translator/AnalysisResult';
import { ReplySuggestions } from '@/components/translator/ReplySuggestions';
import { AppHeader } from '@/components/layout/AppHeader';
import type { DecodeResponse } from '@/types/translator';
import { cn } from '@/lib/utils';
import { savePractice } from '@/lib/frontend/practice-client';

// SVG 图标组件
const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
  </svg>
);

const CheckIcon = ({ className, filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const HeartIcon = ({ className, filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

function ActionButtons({
  result,
  inputText,
  selectedLabel,
}: {
  result: DecodeResponse;
  inputText: string;
  selectedLabel: 'A' | 'B' | 'C' | null;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const { selectedRelation } = useUserCenterStore();

  // 切换方案或获得新结果时，重置保存状态
  useEffect(() => {
    setSaved(false);
    setSavedEntryId(null);
  }, [selectedLabel, result]);

  const handleCopy = async () => {
    if (!selectedLabel) {
      showToast('请先选择一个方案', 'error');
      return;
    }

    try {
      const selectedContent = result.replySuggestions[selectedLabel];
      const textToCopy = `表面语义：${result.surfaceMeaning}\n潜台词：${result.subtext}\n\n选中的回复建议（方案 ${selectedLabel}）：\n${selectedContent}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('已复制到剪贴板', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const handleSave = async () => {
    if (!selectedLabel) {
      showToast('请先选择一个方案', 'error');
      return;
    }

    setSaved(true);
    try {
      const entry = await savePractice({
        sourceType: 'decode',
        primaryReply: result.replySuggestions[selectedLabel],
        content: {
          originalText: inputText,
          surfaceMeaning: result.surfaceMeaning,
          analysis: {
            attackType: 'general',
            scenario: 'decode',
            subtext: result.subtext,
            emotionScore: result.emotionScore,
            neutralityScore: 100 - result.emotionScore,
            emotionStatus: result.emotionStatus,
          },
          replyOptions: [
            { id: 'A', label: result.replySuggestions.strategy.A, content: result.replySuggestions.A, tone: 'neutral' },
            { id: 'B', label: result.replySuggestions.strategy.B, content: result.replySuggestions.B, tone: 'neutral' },
            { id: 'C', label: result.replySuggestions.strategy.C, content: result.replySuggestions.C, tone: 'neutral' },
          ],
          selectedReplyId: selectedLabel,
          ...(selectedRelation
            ? { relationId: selectedRelation.id, relationName: selectedRelation.name }
            : {}),
        },
      });
      setSavedEntryId(entry.id);
      showToast('已存入练习本', 'success');
    } catch {
      setSaved(false);
      showToast('保存失败，请稍后重试', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <div className="flex items-center justify-center gap-3">
        {/* 复制建议按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!selectedLabel}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'border border-[#7D8C9F]/30',
            'text-sm',
            selectedLabel
              ? 'bg-white/20 text-slate-600 hover:bg-white/40'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            'transition-all duration-200',
          )}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-600" filled />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
          {copied ? '已复制' : selectedLabel ? `复制方案 ${selectedLabel}` : '请先选择方案'}
        </button>

        {/* 存入练习本按钮 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saved || !selectedLabel}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'text-sm',
            selectedLabel
              ? 'bg-[#7D8C9F] text-white hover:bg-[#6a7a8c]'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed',
            'transition-all duration-200',
            'disabled:opacity-70',
          )}
        >
          <HeartIcon className={cn('w-4 h-4', saved && 'text-rose-300')} filled={saved} />
          {saved ? '已存入' : '存入练习本'}
        </button>
      </div>

      {/* 查看链接 */}
      {savedEntryId && (
        <Link
          href={`/me/practice?entry=${savedEntryId}`}
          className="text-sm text-[#7D8C9F] hover:text-[#6a7a8c] underline underline-offset-2 transition-colors"
        >
          查看
        </Link>
      )}
    </div>
  );
}

function TranslatorContent() {
  const { status, inputText, result, error, setInput, decode, clearResult } =
    useTranslatorStore();
  const [selectedLabel, setSelectedLabel] = useState<'A' | 'B' | 'C' | null>(null);

  // 当重新分析时，重置选中状态
  const handleClearResult = () => {
    setSelectedLabel(null);
    clearResult();
  };

  return (
    <main className="min-h-screen fluid-bg-translator relative overflow-hidden pt-24">
      {/* 背景装饰：左下角绿色鹅卵石 */}
      <svg
        className="fixed bottom-0 left-0 w-[200px] h-[200px] opacity-20 pointer-events-none z-0"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 20C140 20 170 50 175 90C180 130 150 170 100 175C50 180 20 140 25 90C30 50 60 20 100 20Z"
          fill="#A8D8B9"
        />
      </svg>

      {/* 背景装饰：右上角灰色鹅卵石 */}
      <svg
        className="fixed top-20 right-0 w-[150px] h-[150px] opacity-10 pointer-events-none z-0 rotate-45"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 20C140 20 170 50 175 90C180 130 150 170 100 175C50 180 20 140 25 90C30 50 60 20 100 20Z"
          fill="#7D8C9F"
        />
      </svg>
      <AppHeader activeHref="/translator" />

      {/* Main content: 三栏 Grid */}
      <div className="max-w-7xl mx-auto grid w-full grid-cols-1 items-start gap-8 px-6 pt-8 pb-16 md:grid-cols-12">
        {/* 左栏：输入区（5列） */}
        <div className="md:col-span-5 flex flex-col gap-4 mt-28">
          {/* 标题区：AI 大字 + 竖线分隔 + 读心翻译器 */}
          <div className="mb-6 flex items-center gap-4">
            {/* 左侧：AI 金色大字 */}
            <div className="flex flex-col items-start">
              <span className="text-[#BCA564] text-6xl font-black leading-none">AI</span>
              <div className="h-[3px] w-10 bg-[#BCA564]/60 mt-2" />
            </div>

            {/* 竖线分隔符 */}
            <div className="h-12 w-[1.5px] bg-slate-300/50" />

            {/* 右侧：标题 + 副标题 */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-[#7D8C9F]">读心翻译器</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-xs font-serif italic text-slate-500">Empathic Insight Engine</span>
              </div>
            </div>
          </div>

          <InputArea
            value={inputText}
            onChange={setInput}
            onSubmit={decode}
            status={status}
          />

          {/* 情绪状态条：常驻显示 */}
          <EmotionStatusBar
            emotionStatus={result?.emotionStatus}
            emotionScore={result?.emotionScore}
          />

          {/* 错误提示 */}
          {status === 'error' && error && (
            <div className="rounded-[var(--radius-pebble-2)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* 中栏：解码按钮（2列） */}
        <div className="md:col-span-2 flex flex-col items-center justify-center self-center">
          <DecodeButton
            onClick={decode}
            status={status}
            disabled={!inputText.trim()}
          />
        </div>

        {/* 右栏：分析结果区（5列） */}
        <div className="md:col-span-5 flex flex-col gap-6 mt-28">
          {status === 'result' && result ? (
            <>
              <AnalysisResult result={result} className="animate-revealUp" />
              <ReplySuggestions
                suggestions={result.replySuggestions}
                originalText={inputText}
                selectedLabel={selectedLabel}
                onSelect={setSelectedLabel}
                className="animate-revealUp"
              />
              {/* 底部操作按钮组 */}
              <ActionButtons result={result} inputText={inputText} selectedLabel={selectedLabel} />
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleClearResult}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  重新分析
                </button>
              </div>
            </>
          ) : status !== 'analyzing' ? (
            /* 默认示例内容 - 与设计稿保持一致 */
            <>
              {/* 表面语义 */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#7D8C9F]/80 ml-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">hearing</span>
                  表面语义 <span className="text-slate-400 font-normal">(Surface Meaning)</span>
                </h3>
                <div className="bg-slate-100/60 backdrop-blur-sm rounded-pebble p-6 pebble-shadow border border-white/40">
                  <p className="text-slate-600 leading-relaxed">"你怎么这么自私，连这点忙都不帮？"</p>
                </div>
              </div>

              {/* 潜台词 */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#7D8C9F]/80 ml-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  潜台词 <span className="text-slate-400 font-normal">(Subtext)</span>
                </h3>
                <div className="bg-[#D5E5D5]/50 backdrop-blur-sm rounded-pebble-alt p-6 pebble-shadow border border-white/40">
                  <p className="text-slate-700 leading-relaxed italic">"对方可能正处于焦虑中，这句话的重点不在于你的进度，而在于他对手头项目失控感的投射。他需要的不是解释，而是确定感。"</p>
                </div>
              </div>

              {/* 灰岩回复建议 */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-[#7D8C9F]/80 ml-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">layers</span>
                  灰岩回复建议 <span className="text-slate-400 font-normal">(Gray Rock Replies)</span>
                </h3>
                <div className="space-y-4">
                  {/* 方案 A */}
                  <div className="bg-white/80 rounded-pebble p-5 pebble-shadow transform translate-x-2 transition-transform hover:translate-x-0 cursor-default border-l-4 border-[#A8D8B9]">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-[#A8D8B9] bg-[#A8D8B9]/10 px-2 py-1 rounded-full shrink-0">方案 A</span>
                      <p className="text-slate-600 text-sm">"收到了，我正在处理，预计今天下午五点前发给你。"</p>
                    </div>
                  </div>
                  {/* 方案 B */}
                  <div className="bg-white/70 rounded-pebble p-5 pebble-shadow transform translate-x-1 transition-transform hover:translate-x-0 cursor-default border-l-4 border-[#FFED94]/80">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-[#A88B32] bg-[#FFED94]/30 px-2 py-1 rounded-full border border-[#FFED94]/40 shrink-0">方案 B</span>
                      <p className="text-slate-600 text-sm whitespace-nowrap">"明白了，进度目前大约是 80%，完成后我会第一时间同步。"</p>
                    </div>
                  </div>
                  {/* 方案 C */}
                  <div className="bg-white/60 rounded-pebble p-5 pebble-shadow transform translate-x-2 transition-transform hover:translate-x-0 cursor-default border-l-4 border-slate-300">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full shrink-0">方案 C</span>
                      <p className="text-slate-600 text-sm">"已经在路上了，很快就好。"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-center gap-4 py-6 w-full">
                <button
                  type="button"
                  className="group flex items-center gap-2 px-8 py-2.5 rounded-full border border-[#7D8C9F]/30 text-[#7D8C9F] hover:bg-[#7D8C9F]/10 hover:border-[#7D8C9F]/50 transition-all text-sm font-medium bg-white/20 backdrop-blur-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg transition-all duration-300 group-hover:text-slate-700 group-hover:scale-110 group-hover:[font-variation-settings:'FILL'1]">
                    content_copy
                  </span>
                  复制建议
                </button>
                <button
                  type="button"
                  className="group flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#7D8C9F] text-white hover:bg-[#7D8C9F]/90 transition-all duration-300 text-sm font-medium shadow-md active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg transition-all duration-300 group-hover:text-rose-300 group-hover:scale-110 group-hover:[font-variation-settings:'FILL'1]">
                    favorite
                  </span>
                  存入练习本
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function TranslatorPage() {
  return (
    <ToastProvider>
      <TranslatorContent />
    </ToastProvider>
  );
}
