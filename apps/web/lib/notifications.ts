export type NotificationType = "official" | "system" | "update";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  href?: string;
}

export const OFFICIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "official-001",
    title: "Pebble AI 正式上线",
    body: "感谢你的关注，Pebble AI 已开放全部功能，包括读心翻译、模拟陪练与急救呼吸。",
    type: "official",
    createdAt: "2026-05-20T10:00:00Z",
    read: false,
    href: "/",
  },
  {
    id: "official-002",
    title: "新功能：模拟陪练",
    body: "现在你可以通过模拟对话练习沟通技巧，AI 将实时反馈情绪得分与建议。",
    type: "update",
    createdAt: "2026-05-28T14:00:00Z",
    read: false,
    href: "/dojo",
  },
  {
    id: "official-003",
    title: "系统维护通知",
    body: "本周日凌晨 02:00–04:00 进行例行维护，期间服务可能短暂不可用。",
    type: "system",
    createdAt: "2026-06-01T09:00:00Z",
    read: true,
  },
];

export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((i) => !i.read).length;
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
