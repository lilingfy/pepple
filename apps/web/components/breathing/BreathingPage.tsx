"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

/**
 * 急救呼吸页 - 第二版设计稿实现
 *
 * 纯 CSS 动画驱动，自动播放 4-7-8 呼吸循环
 * 无需点击启动，页面加载即开始
 */

export function BreathingPage() {
  const [timeLeft, setTimeLeft] = useState(119);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const TOTAL_TIME = 119;

  // 倒计时逻辑
  useEffect(() => {
    if (isPaused || isCompleted) return;

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsCompleted(true);
          setIsPaused(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isPaused, isCompleted]);

  const handleOrbClick = () => {
    if (isCompleted) {
      // 重新开始
      setTimeLeft(TOTAL_TIME);
      setIsCompleted(false);
      setIsPaused(false);
    } else {
      // 暂停/继续
      setIsPaused((p) => !p);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen bg-[#F0F6F2] text-[#7D8C9F] overflow-hidden select-none">
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes etherealBreathing {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 50px rgba(168, 216, 185, 0.2),
              inset 0 0 30px rgba(255, 255, 255, 0.4);
          }
          21.05% {
            transform: scale(1.35);
            box-shadow:
              0 0 100px rgba(168, 216, 185, 0.6),
              inset 0 0 60px rgba(255, 255, 255, 0.8);
          }
          57.89% {
            transform: scale(1.35);
            box-shadow:
              0 0 100px rgba(168, 216, 185, 0.6),
              inset 0 0 60px rgba(255, 255, 255, 0.8);
          }
          100% {
            transform: scale(1);
            box-shadow:
              0 0 50px rgba(168, 216, 185, 0.2),
              inset 0 0 30px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes etherealStatusUpdate {
          0%,
          21.05% {
            --status-text: "吸气";
            --status-color: #2c5545;
          }
          21.06%,
          57.89% {
            --status-text: "屏息";
            --status-color: #7d8c9f;
          }
          57.9%,
          100% {
            --status-text: "呼气";
            --status-color: #4a6b5d;
          }
        }

        @keyframes etherealInstructionUpdate {
          0%,
          21.05% {
            --instruction-text: "DEEP INHALE (4S)";
          }
          21.06%,
          57.89% {
            --instruction-text: "HOLD GENTLY (7S)";
          }
          57.9%,
          100% {
            --instruction-text: "SLOW EXHALE (8S)";
          }
        }

        @keyframes ambientFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-45%, -55%) scale(1.2);
            opacity: 0.5;
          }
        }

        @keyframes mistPulse {
          0%,
          100% {
            opacity: 0.5;
            filter: blur(8px);
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            filter: blur(12px);
            transform: scale(1.02);
          }
        }

        .animate-ethereal-breathing {
          animation: etherealBreathing 19s linear infinite;
        }

        .status-sync-ethereal::after {
          content: var(--status-text, "吸气");
          color: var(--status-color, #2c5545);
          animation: etherealStatusUpdate 19s linear infinite;
        }

        .instruction-sync-ethereal::after {
          content: var(--instruction-text, "DEEP INHALE (4S)");
          animation: etherealInstructionUpdate 19s linear infinite;
        }

        .ambient-float-1 {
          animation: ambientFloat 15s ease-in-out infinite;
        }

        .ambient-float-2 {
          animation: ambientFloat 20s ease-in-out infinite reverse;
        }

        .mist-diffusion {
          background: radial-gradient(
            circle,
            rgba(168, 216, 185, 0.15) 0%,
            transparent 70%
          );
          animation: mistPulse 8s ease-in-out infinite;
        }

        .paused .animate-ethereal-breathing,
        .paused .status-sync-ethereal::after,
        .paused .instruction-sync-ethereal::after {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-[20%] rounded-full bg-amber-100/40 w-[600px] h-[600px] blur-[120px] ambient-float-1"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] rounded-full bg-[#A8D8B9]/20 w-[700px] h-[700px] blur-[100px] ambient-float-2"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Header */}
      <header
        className="fixed w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-xl border-b border-white/40 top-0"
        style={{ backgroundColor: "rgba(240, 246, 242, 0.6)" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div
            className="w-10 h-10 bg-[#7D8C9F] group-hover:bg-[#A8D8B9] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
            style={{ borderRadius: "60% 40% 70% 30% / 40% 50% 60% 40%" }}
          />
          <span className="text-2xl font-medium tracking-[0.2em] text-[#7D8C9F] group-hover:text-[#A8D8B9] transition-colors duration-500">
            Pebble AI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-3 bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
          <Link
            href="/"
            className="px-7 py-3 rounded-full text-base font-light tracking-widest text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-bold transition-all duration-300"
          >
            首页
          </Link>
          <Link
            href="/translator"
            className="px-7 py-3 rounded-full text-base font-light tracking-widest text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-bold transition-all duration-300"
          >
            读心翻译
          </Link>
          <Link
            href="/dojo"
            className="px-7 py-3 rounded-full text-base font-light tracking-widest text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-bold transition-all duration-300"
          >
            模拟陪练
          </Link>
          <Link
            href="/breathing"
            className="px-7 py-3 rounded-full text-base font-bold tracking-widest text-[#2C3E50] bg-[#A8D8B9]/20 relative transition-all duration-300"
          >
            急救呼吸
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#A8D8B9] rounded-full animate-pulse" />
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-6 text-[#7D8C9F]">
          <NotificationDropdown />
          <Link
            href="/me"
            className="w-10 h-10 rounded-full bg-[#7D8C9F]/20 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#A8D8B9] transition-all overflow-hidden"
            aria-label="用户中心"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "relative z-10 min-h-screen flex flex-col items-center px-4 pt-32 pb-40",
          (isPaused || isCompleted) && "paused",
        )}
      >
        {/* Module Title */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 opacity-60 font-medium">
            EMERGENCY BREATHING
          </p>
          <h1 className="font-serif text-5xl font-bold flex items-center justify-center space-x-5">
            {/* Decorative stars */}
            <svg
              className="w-10 h-10 text-[#E8D499] fill-current drop-shadow-sm"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
            <span className="text-[#7D8C9F]">急救呼吸</span>
            <svg
              className="w-10 h-10 text-[#E8D499] fill-current drop-shadow-sm"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
          </h1>
          <p className="mt-4 text-sm opacity-70 max-w-md mx-auto leading-relaxed">
            情绪淹没时，请点击下方，跟随光晕的律动找回平静。
          </p>
        </div>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center mb-10 w-full h-[360px]">
          {/* Background glow */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#c8e6d3] to-[#e4f2e9] blur-[50px] opacity-50 pointer-events-none" />

          {/* Breathing circle with CSS animation - clickable to pause/resume or restart */}
          <div
            onClick={handleOrbClick}
            className="relative z-20 flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#d9efe2] to-[#c8e6d3] w-72 h-72 md:w-80 md:h-80 transition-all duration-1000 animate-ethereal-breathing cursor-pointer group"
            role="button"
            aria-label={
              isCompleted
                ? "重新开始呼吸练习"
                : isPaused
                  ? "继续呼吸练习"
                  : "暂停呼吸练习"
            }
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOrbClick();
            }}
          >
            {/* Status text with CSS animation */}
            <div className="text-center flex flex-col items-center justify-center z-30 transform transition-transform duration-700 group-hover:scale-105">
              {isCompleted ? (
                <>
                  <span className="block font-serif text-3xl md:text-4xl font-bold mb-4 tracking-[0.2em] text-[#7D8C9F] drop-shadow-sm">
                    完成
                  </span>
                  <span className="block text-[11px] md:text-xs uppercase tracking-[0.25em] text-[#9CA3AF] font-medium">
                    点击重新开始
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-serif text-4xl md:text-5xl font-bold mb-4 tracking-[0.3em] status-sync-ethereal drop-shadow-sm" />
                  <span className="block text-[11px] md:text-xs uppercase tracking-[0.25em] text-[#9CA3AF] font-medium instruction-sync-ethereal" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Instruction text with mist effect */}
        <div className="text-center mb-16 relative group z-50">
          <div className="absolute inset-0 mist-diffusion -z-10 scale-150" />
          <p className="font-serif font-light text-xl text-[#7D8C9F]/80 tracking-[0.4em] px-12 py-2">
            {isCompleted
              ? "呼吸练习已完成"
              : isPaused
                ? "点击光晕继续呼吸"
                : "请放空思绪，跟随律动呼吸"}
          </p>
        </div>

        {/* Cooldown Inhibitor */}
        <div className="flex flex-col items-center mt-auto relative z-30">
          <div
            className="rounded-[2rem] px-10 py-6 flex items-center space-x-10"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-bold opacity-40 tracking-[0.2em] mb-1">
                {isCompleted ? "已完成" : "建议平静时长"}
              </span>
              <div
                className="font-mono text-3xl font-light warm-glow"
                style={{
                  color: isCompleted ? "#7D8C9F" : "#E6B422",
                  textShadow: isCompleted
                    ? "none"
                    : "0 0 15px rgba(230, 180, 34, 0.4)",
                }}
              >
                {formattedTime}
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-300/50" />
            <div className="flex flex-col items-center group">
              <svg
                className={cn(
                  "w-5 h-5 mb-1",
                  isCompleted
                    ? "text-[#A8D8B9]"
                    : "text-[#E6B422] animate-pulse",
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[9px] opacity-40 font-bold tracking-tighter">
                {isCompleted ? "点击重新开始" : "AI 引导中"}
              </span>
            </div>
          </div>
          <p className="mt-4 text-[11px] opacity-40 uppercase tracking-[0.2em]">
            {isCompleted
              ? "Session completed"
              : "Reactive reply inhibitor active"}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full px-10 py-6 flex justify-between items-center text-[10px] opacity-40 font-medium z-50">
        <div>© 2026 PEBBLE AI EMOTION DEFENSE. 本地化存储，隐私优先。</div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-black transition-colors">
            隐私政策
          </a>
          <a href="#" className="hover:text-black transition-colors">
            使用条款
          </a>
        </div>
      </footer>
    </div>
  );
}
