"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  NotificationItem,
  OFFICIAL_NOTIFICATIONS,
  getUnreadCount,
  formatNotificationTime,
  NotificationType,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  NotificationType,
  { icon: string; color: string; bg: string }
> = {
  official: {
    icon: "campaign",
    color: "text-[#A8D8B9]",
    bg: "bg-[#A8D8B9]/15",
  },
  update: {
    icon: "new_releases",
    color: "text-[#7D8C9F]",
    bg: "bg-[#7D8C9F]/15",
  },
  system: {
    icon: "info",
    color: "text-[#2C3E50]",
    bg: "bg-[#2C3E50]/10",
  },
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items] = useState<NotificationItem[]>(OFFICIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = getUnreadCount(items);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, handleClose]);

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        aria-label="通知"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleToggle}
        className="relative p-2 rounded-full text-[#7D8C9F] hover:bg-white/50 transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center bg-rose-400 text-white text-[10px] font-bold rounded-full border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full border border-white" />
        )}
      </button>

      {/* 下拉面板 */}
      {open && (
        <div
          role="menu"
          aria-label="通知列表"
          className={cn(
            "absolute top-full right-0 mt-2 z-50",
            "w-[calc(100vw-2rem)] sm:w-80",
            "bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl",
            "overflow-hidden flex flex-col"
          )}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/50">
            <span className="text-sm font-semibold text-[#2C3E50]">通知</span>
            {unreadCount > 0 && (
              <span className="text-xs text-rose-400 font-medium">
                {unreadCount} 条未读
              </span>
            )}
          </div>

          {/* 列表 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#7D8C9F]">
                暂无通知
              </div>
            ) : (
              <ul className="divide-y divide-white/40">
                {items.map((item) => {
                  const meta = TYPE_META[item.type];
                  const itemClassName = cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors",
                    "hover:bg-white/50 focus:bg-white/50 focus:outline-none",
                    !item.read && "bg-[#A8D8B9]/5",
                  );
                  const itemContent = (
                    <>
                      {/* 图标 */}
                      <div
                        className={cn(
                          "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          meta.bg,
                        )}
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-base",
                            meta.color,
                          )}
                        >
                          {meta.icon}
                        </span>
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#2C3E50] truncate">
                            {item.title}
                          </span>
                          {!item.read && (
                            <span
                              className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0"
                              aria-label="未读"
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#7D8C9F] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                        <span className="text-[10px] text-[#7D8C9F]/70 mt-1 block">
                          {formatNotificationTime(item.createdAt)}
                        </span>
                      </div>
                    </>
                  );

                  return (
                    <li key={item.id} role="none">
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          role="menuitem"
                          className={itemClassName}
                        >
                          {itemContent}
                        </Link>
                      ) : (
                        <div role="menuitem" className={itemClassName}>
                          {itemContent}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 底部 */}
          <div className="px-4 py-2 border-t border-white/50 text-center">
            <span className="text-[10px] text-[#7D8C9F]/60">
              仅展示官方消息
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
