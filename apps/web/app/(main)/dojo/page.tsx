"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDojoStore } from "@/store/dojo-store";
import { AppHeader } from "@/components/layout/AppHeader";
import { ScenarioPanel } from "@/components/dojo/ScenarioPanel";
import { ChatArea } from "@/components/dojo/ChatArea";
import { CoachingPanel } from "@/components/dojo/CoachingPanel";
import { DojoStatus } from "@/components/dojo/DojoStatus";

export default function DojoPage() {
  const searchParams = useSearchParams();
  const { loadScenarios, selectScenario, scenarios, sessionStatus } =
    useDojoStore();

  // 加载场景列表
  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  // 根据 URL 参数自动选择场景
  useEffect(() => {
    const scenarioId = searchParams.get("scenarioId");
    if (scenarioId && scenarios.length > 0 && sessionStatus === "idle") {
      const targetScenario = scenarios.find((s) => s.id === scenarioId);
      if (targetScenario) {
        selectScenario(targetScenario);
      }
    }
  }, [searchParams, scenarios, sessionStatus, selectScenario]);

  return (
    <div className="fluid-bg h-screen flex flex-col relative overflow-hidden">
      {/* 导航栏 */}
      <AppHeader activeHref="/dojo" />

      {/* 背景光晕装饰 */}
      <div
        className="absolute top-[20%] left-[35%] w-[400px] h-[400px] bg-accent-gold/10 rounded-full blur-[120px] animate-breathing pointer-events-none"
        style={{ animationDelay: "-2s" }}
      />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-safe-green/20 rounded-full blur-[100px] animate-breathing pointer-events-none" />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-breathing pointer-events-none"
        style={{ animationDelay: "-4s" }}
      />

      {/* 主内容区 */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-8 pt-32 pb-8 grid grid-cols-12 gap-8 relative z-10">
        {/* 左侧场景面板 */}
        <aside className="col-span-3 flex flex-col gap-6">
          <ScenarioPanel />
        </aside>

        {/* 中央聊天区 */}
        <section className="col-span-6 flex flex-col h-full">
          <ChatArea />
        </section>

        {/* 右侧分析面板 */}
        <aside className="col-span-3 flex flex-col gap-6">
          <CoachingPanel />
        </aside>
      </main>

      {/* 底部装饰 */}
      <div className="fixed bottom-[-50px] left-[-50px] opacity-10 pointer-events-none">
        <svg height="300" viewBox="0 0 200 200" width="300">
          <path
            d="M150 100C150 150 120 180 80 180C40 180 20 150 20 100C20 50 50 20 100 20C150 20 150 50 150 100Z"
            fill="#A8D8B9"
          />
        </svg>
      </div>

      {/* 状态和错误显示 */}
      <DojoStatus />
    </div>
  );
}
