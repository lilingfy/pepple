import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Navigation } from '@/components/home/Navigation';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock PebbleButton
vi.mock('@/components/ui/Button', () => ({
  PebbleButton: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('Navigation', () => {
  it('应该渲染 Logo 和品牌名称', () => {
    render(<Navigation />);
    expect(screen.getByText('Pebble AI')).toBeInTheDocument();
  });

  it('Logo 应该使用异形鹅卵石形状', () => {
    render(<Navigation />);
    const logo = screen.getByLabelText('Pebble AI 首页').querySelector('[aria-hidden="true"]');
    expect(logo).toHaveClass('rounded-[60%_40%_70%_30%/_40%_50%_60%_40%]');
  });

  it('Logo 应该有 hover 效果类', () => {
    render(<Navigation />);
    const logo = screen.getByLabelText('Pebble AI 首页').querySelector('[aria-hidden="true"]');
    expect(logo).toHaveClass('group-hover:rotate-12');
    expect(logo).toHaveClass('group-hover:scale-110');
  });

  it('主导航应该包含所有导航项', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '读心翻译' })).toHaveAttribute('href', '/translator');
    expect(screen.getByRole('link', { name: '模拟陪练' })).toHaveAttribute('href', '/dojo');
    expect(screen.getByRole('link', { name: '急救呼吸' })).toHaveAttribute('href', '/breathing');
  });

  it('当前页导航项应该有脉冲点指示器', () => {
    render(<Navigation />);
    // 首页是当前页，应该有脉冲点
    const homeLink = screen.getByRole('link', { name: '首页' });
    expect(homeLink.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('应该包含开启防御 CTA 按钮', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: '开启防御' })).toHaveAttribute('href', '/translator');
  });
});
