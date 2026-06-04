import type { PracticeEntry, PracticeContentDecode } from '@pebble/types';

export function isDecodeEntry(entry: PracticeEntry): entry is PracticeEntry & { content: PracticeContentDecode } {
  return entry.sourceType === 'decode' && 'originalText' in entry.content && 'analysis' in entry.content;
}

export function formatPracticeDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncatePracticeText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function getPracticeActionLabel(entry: PracticeEntry, action: '收藏' | '取消收藏' | '归档' | '取消归档'): string {
  const originalText = isDecodeEntry(entry) ? entry.content.originalText : entry.primaryReply;
  return `${action}练习：${truncatePracticeText(originalText, 20)}，保存于 ${formatPracticeDate(entry.createdAt)}`;
}
