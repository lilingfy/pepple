import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HomePage } from '@/components/home/HomePage';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('HomePage', () => {
  // --- 1. 路由与骨架 ---
  it('渲染品牌名称', () => {
    render(<HomePage />);
    expect(screen.getByText('Pebble AI')).toBeInTheDocument();
  });

  it('包含 main 主体内容区', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // --- 2. 导航 ---
  it('导航包含三个功能入口链接', () => {
    render(<HomePage />);
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(within(nav).getByRole('link', { name: '读心翻译' })).toHaveAttribute('href', '/translator');
    expect(within(nav).getByRole('link', { name: '模拟陪练' })).toHaveAttribute('href', '/dojo');
    expect(within(nav).getByRole('link', { name: '急救呼吸' })).toHaveAttribute('href', '/breathing');
  });

  it('导航包含开启防御 CTA 按钮', () => {
    render(<HomePage />);
    // 可能有多个 "开启防御" 入口，确认至少存在一个
    expect(screen.getAllByRole('link', { name: '开启防御' }).length).toBeGreaterThan(0);
  });

  // --- 3. Hero 区 ---
  it('Hero 区展示主标题', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('情绪盔甲')).toBeInTheDocument();
  });

  it('Hero 区展示副标题文案', () => {
    render(<HomePage />);
    expect(screen.getByText(/灰岩法/)).toBeInTheDocument();
  });

  it('Hero 区包含立即体验 CTA', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: '立即体验' })).toHaveAttribute('href', '/translator');
  });

  // --- 4. 统计区 ---
  it('统计区展示四项可信度数据', () => {
    render(<HomePage />);
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('1.2M')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('统计区展示各项描述文本', () => {
    render(<HomePage />);
    expect(screen.getByText('言语冲突降低')).toBeInTheDocument();
    expect(screen.getByText('情绪防御实例')).toBeInTheDocument();
    expect(screen.getByText('实时心理屏障')).toBeInTheDocument();
    expect(screen.getByText('数据隐私泄露')).toBeInTheDocument();
  });

  // --- 5. 功能展示区块 ---
  it('展示读心翻译器区块', () => {
    render(<HomePage />);
    expect(screen.getByText('AI 读心翻译器')).toBeInTheDocument();
    expect(screen.getByText('MIND-READING TRANSLATOR')).toBeInTheDocument();
  });

  it('展示模拟陪练场区块', () => {
    render(<HomePage />);
    expect(screen.getByText('模拟陪练场')).toBeInTheDocument();
    expect(screen.getByText('PRACTICE DOJO')).toBeInTheDocument();
  });

  it('展示急救呼吸区块', () => {
    render(<HomePage />);
    expect(screen.getByText('EMERGENCY BREATHING')).toBeInTheDocument();
  });

  it('展示三个练习场景卡片', () => {
    render(<HomePage />);
    expect(screen.getByText('职场越界防御')).toBeInTheDocument();
    expect(screen.getByText('亲密关系解绑')).toBeInTheDocument();
    expect(screen.getByText('社交杠精应对')).toBeInTheDocument();
    expect(screen.getByText('最常练习')).toBeInTheDocument();
  });

  // --- 6. 可访问性 ---
  it('主导航有 aria-label', () => {
    render(<HomePage />);
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
  });

  it('页面有 footer', () => {
    render(<HomePage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
