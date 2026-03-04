'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';
import { BreathingGuide } from '@/components/panic/BreathingGuide';

/**
 * Panic (急救呼吸) page
 * Provides immediate breathing exercises for emotional regulation
 */
export default function PanicPage() {
  const [isBreathing, setIsBreathing] = useState(false);

  // Prevent background scrolling when breathing guide is active
  useEffect(() => {
    if (isBreathing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBreathing]);

  const handleComplete = () => {
    setIsBreathing(false);
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
              <MaterialSymbol icon="air" className="text-primary text-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12 max-w-2xl">
        {/* Title Section */}
        <section className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MaterialSymbol icon="air" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {ZH_CN.breathingTitle}
          </h1>
          <p className="text-gray-600">{ZH_CN.breathingSubtitle}</p>
        </section>

        {/* Info Card */}
        <Card variant="insight" className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-insight-bg flex items-center justify-center shrink-0">
              <MaterialSymbol icon="info" className="text-insight-text text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">4-7-8 呼吸法</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                这是一种经过验证的放松技巧：吸气4秒，屏息7秒，呼气8秒。
                它能激活副交感神经系统，帮助您快速平复情绪。
              </p>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        {!isBreathing && (
          <div className="text-center py-8">
            <Button size="lg" onClick={() => setIsBreathing(true)} className="px-12 py-6 text-lg">
              <MaterialSymbol icon="play_circle" className="text-2xl" />
              {ZH_CN.startBreathing}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              建议每次练习2-5分钟
            </p>
          </div>
        )}

        {/* Offline Notice */}
        <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <MaterialSymbol icon="wifi_off" className="text-base" />
            此功能支持离线使用，无需网络连接
          </p>
        </div>

        {/* Emergency Contacts */}
        <Card variant="shelter" className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol icon="emergency" className="text-red-500 text-xl" />
            <h3 className="font-medium text-gray-900">紧急求助资源</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">北京心理危机研究与干预中心</span>
              <a href="tel:010-82951332" className="text-primary font-medium">
                010-82951332
              </a>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">全国24小时心理援助热线</span>
              <a href="tel:400-161-9995" className="text-primary font-medium">
                400-161-9995
              </a>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">希望24热线</span>
              <a href="tel:400-161-9995" className="text-primary font-medium">
                400-161-9995
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            {ZH_CN.safetyDisclaimer}
          </p>
        </Card>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {ZH_CN.back}
          </Link>
        </div>
      </main>

      {/* Breathing Guide Overlay */}
      {isBreathing && (
        <BreathingGuide onComplete={handleComplete} duration={180} />
      )}
    </div>
  );
}
