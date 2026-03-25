'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import { ZH_CN } from '@/lib/locales/zh-CN';

/**
 * Dashboard page with welcome message and feature cards
 * Shows: 读心翻译器, 模拟陪练场, 急救呼吸
 */
export default function DashboardPage() {
  // Get user name from localStorage or use default
  const [userName, setUserName] = React.useState<string>('朋友');

  useEffect(() => {
    const storedName = localStorage.getItem('pebble_user_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      // Set default name if not exists
      localStorage.setItem('pebble_user_name', '朋友');
    }
  }, []);

  const features = [
    {
      key: 'decoder',
      icon: 'psychology',
      title: ZH_CN.decoder,
      description: ZH_CN.decoderDesc,
      detail: ZH_CN.decoderDetail,
      href: '/translator',
      variant: 'storm' as const,
    },
    {
      key: 'simulator',
      icon: 'chat_bubble_outline',
      title: ZH_CN.simulator,
      description: ZH_CN.simulatorDesc,
      detail: ZH_CN.simulatorDetail,
      href: '/dojo',
      variant: 'shelter' as const,
    },
    {
      key: 'breathing',
      icon: 'air',
      title: ZH_CN.breathing,
      description: ZH_CN.breathingDesc,
      detail: ZH_CN.breathingDetail,
      href: '/breathing',
      variant: 'insight' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-storm-bg to-shelter-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialSymbol icon="eco" className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ZH_CN.appName}</h1>
              <p className="text-xs text-gray-500">{ZH_CN.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MaterialSymbol icon="lock_open" className="text-sm" />
            <span>{ZH_CN.localOnly}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {ZH_CN.welcome.replace('{name}', userName)}
          </h2>
          <p className="text-lg text-gray-600">{ZH_CN.dashboardSubtitle}</p>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Link key={feature.key} href={feature.href} className="group">
              <Card
                variant={feature.variant}
                icon={feature.icon}
                title={feature.title}
                className="h-full transition-all duration-300 group-hover:shadow-lg"
              >
                <CardDescription className="mb-3">
                  {feature.description}
                </CardDescription>
                <p className="text-sm text-gray-700">
                  {feature.detail}
                </p>
                <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:gap-2 gap-1 transition-all">
                  <span>{ZH_CN.start}</span>
                  <MaterialSymbol icon="arrow_forward" className="text-lg" />
                </div>
              </Card>
            </Link>
          ))}
        </section>

        {/* Daily Affirmation */}
        <section className="max-w-2xl mx-auto">
          <Card variant="shelter" className="text-center py-8">
            <MaterialSymbol icon="self_improvement" className="text-3xl text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {ZH_CN.boundariesAreHealthy}
            </p>
            <p className="text-sm text-gray-500">
              {ZH_CN.youDeserveRespect}
            </p>
          </Card>
        </section>

        {/* Privacy Notice */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MaterialSymbol icon="lock_open" className="text-sm" />
            <span>{ZH_CN.privacyNote}</span>
          </div>
          <p>{ZH_CN.madeWith} ❤️</p>
        </footer>
      </main>
    </div>
  );
}
