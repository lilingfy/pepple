"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUserCenterStore } from "@/store/user-center-store";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./NotificationDropdown";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "读心翻译", href: "/translator" },
  { label: "模拟陪练", href: "/dojo" },
  { label: "急救呼吸", href: "/breathing" },
];

interface AppHeaderProps {
  /** 当前页面路径，用于高亮导航 */
  activeHref?: string;
}

export function AppHeader({ activeHref }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedRelation } = useUserCenterStore();

  const currentPath = activeHref ?? pathname;

  const handleRelationClick = () => {
    // 保存当前路径，以便返回
    const returnUrl = encodeURIComponent(currentPath);
    router.push(`/me/relations?back=${returnUrl}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 group"
        aria-label="Pebble AI 首页"
      >
        <div
          className="w-10 h-10 rounded-[60%_40%_70%_30%/_40%_50%_60%_40%] bg-[#7D8C9F] group-hover:bg-[#A8D8B9] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
          aria-hidden="true"
        />
        <span className="text-2xl font-medium tracking-[0.2em] text-[#7D8C9F] group-hover:text-[#A8D8B9] transition-colors duration-500">
          Pebble AI
        </span>
      </Link>

      {/* 主导航 */}
      <nav
        aria-label="主导航"
        className="hidden md:flex items-center gap-1 bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-sm"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-7 py-3 rounded-full text-base tracking-widest transition-all duration-300 relative",
                isActive
                  ? "font-bold text-[#2C3E50] bg-[#A8D8B9]/20"
                  : "font-light text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-medium",
              )}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#A8D8B9] rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 右侧功能区 */}
      <div className="flex items-center gap-4">
        {/* RelationSelector */}
        <button
          type="button"
          onClick={handleRelationClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
            selectedRelation
              ? "bg-[#A8D8B9]/20 text-[#2C3E50] hover:bg-[#A8D8B9]/30"
              : "bg-white/40 text-[#7D8C9F] hover:bg-white/60 border border-dashed border-[#7D8C9F]/30",
          )}
        >
          <span className="material-symbols-outlined text-sm">
            {selectedRelation ? "person" : "person_add"}
          </span>
          <span className="text-sm font-medium">
            {selectedRelation
              ? `当前：${selectedRelation.name}`
              : "选择关系对象"}
          </span>
          {selectedRelation && <span className="text-xs opacity-60">▼</span>}
        </button>

        {/* 通知按钮 */}
        <NotificationDropdown />

        {/* 用户头像 */}
        <Link
          href="/me"
          className="w-10 h-10 rounded-full bg-[#7D8C9F]/20 flex items-center justify-center text-[#7D8C9F] hover:ring-2 hover:ring-[#A8D8B9] transition-all overflow-hidden"
          aria-label="用户中心"
        >
          <span className="material-symbols-outlined">person</span>
        </Link>
      </div>
    </header>
  );
}
