'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';
import {
  DecoderInput,
  SubtextCard,
  ReplyOptions,
  type AnalysisResult,
  type ReplyOptionsData,
} from '@/components/decoder';

/**
 * Decoder (读心翻译器) page
 * Helps users understand psychological manipulation patterns in conversations
 */
export default function DecoderPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [replies, setReplies] = useState<ReplyOptionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('分析失败，请稍后重试');
      }

      const data = await response.json();

      setAnalysis({
        surfaceMeaning: data.surfaceMeaning,
        trueIntent: data.trueIntent,
        attackType: data.attackType,
        culturalContext: data.culturalContext,
        tacticalTip: data.tacticalTip,
      });

      setReplies(data.replies);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');

      // Fallback: Use mock data for demo
      setTimeout(() => {
        setAnalysis({
          surfaceMeaning: '对方在拿你和别人比较，表达对你现状的不满',
          trueIntent: '对方可能感到自己的权威或价值受到威胁，通过贬低你来获得掌控感和优越感',
          attackType: ['比较贬低', '投射', '三角化'],
          culturalContext: '在中国文化中，"别人家的XX"是常见的操控方式，利用社会比较和面子的压力来控制对方的行为',
          tacticalTip: '对方在试图激怒你进入辩解模式。保持钝感是最好的保护——不要进入"比较"的框架，也不需要证明什么。',
        });
        setReplies({
          minimal: '嗯。',
          gentle: '每个人情况都不一样。',
          boundary: '我听到了。咱们先吃饭吧。',
        });
        setIsAnalyzing(false);
      }, 1500);
      return;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setAnalysis(null);
    setReplies(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-storm-bg to-shelter-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MaterialSymbol icon="arrow_back" className="text-xl" />
            <span className="text-sm font-medium">{ZH_CN.back}</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialSymbol icon="psychology" className="text-primary text-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 max-w-3xl">
        {/* Title Section */}
        <section className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MaterialSymbol icon="psychology" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {ZH_CN.decoderTitle}
          </h1>
          <p className="text-gray-600">{ZH_CN.decoderSubtitle}</p>
        </section>

        {/* Input Section */}
        <DecoderInput
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          className="mb-6"
        />

        {/* Error Message */}
        {error && (
          <Card variant="shelter" className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <MaterialSymbol icon="error" className="text-xl" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {analysis && (
          <>
            <SubtextCard analysis={analysis} className="mb-6" />
            {replies && <ReplyOptions replies={replies} className="mb-6" />}
          </>
        )}

        {/* Empty State */}
        {!analysis && !isAnalyzing && (
          <Card variant="shelter" className="text-center py-12">
            <MaterialSymbol
              icon="psychology"
              className="text-5xl text-gray-300 mx-auto mb-4"
            />
            <p className="text-gray-600 mb-2 font-medium">
              输入一段让您感到困扰的对话
            </p>
            <p className="text-sm text-gray-400">
              我们会帮您分析其中的心理模式和潜台词
            </p>
          </Card>
        )}

        {/* Clear Button (when results shown) */}
        {analysis && (
          <div className="text-center">
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {ZH_CN.clear}
            </button>
          </div>
        )}

        {/* Safety Message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <MaterialSymbol icon="spa" className="text-lg text-green-600" />
            {ZH_CN.beGentle}
          </p>
        </div>
      </main>
    </div>
  );
}
