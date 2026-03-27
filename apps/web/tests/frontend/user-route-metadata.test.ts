import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter' }),
  Noto_Sans_SC: () => ({ variable: '--font-noto-sans-sc' }),
  Noto_Serif_SC: () => ({ variable: '--font-noto-serif-sc' }),
  Public_Sans: () => ({ variable: '--font-public-sans' }),
}));

import { metadata as rootMetadata } from '@/app/layout';
import { metadata as dashboardMetadata } from '@/app/(main)/dashboard/layout';
import { metadata as relationsMetadata } from '@/app/(main)/relations/layout';
import { metadata as newRelationMetadata } from '@/app/(main)/relations/new/layout';
import { metadata as relationChatMetadata } from '@/app/(main)/relations/[id]/chat/layout';

describe('user route metadata', () => {
  it('根布局使用品牌级默认 metadata，而不是写死某个功能页', () => {
    expect(rootMetadata.title).toBe('Pebble AI');
    expect(rootMetadata.description).toContain('情绪防御');
  });

  it('dashboard 与 relations 流程各自暴露正确的页面标题', () => {
    expect(dashboardMetadata.title).toBe('仪表盘 - Pebble AI');
    expect(relationsMetadata.title).toBe('人际关系图谱 - Pebble AI');
    expect(newRelationMetadata.title).toBe('添加人际关系 - Pebble AI');
    expect(relationChatMetadata.title).toBe('关系对话 - Pebble AI');
  });
});
