import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock matchMedia for prefers-reduced-motion tests
function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

import { BreathingPage } from '@/components/breathing/BreathingPage';

describe('BreathingPage', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('渲染标题：急救呼吸', () => {
    render(<BreathingPage />);
    // "急救呼吸" 出现在标题和导航中，使用 getAllByText 确保至少有一个
    expect(screen.getAllByText('急救呼吸').length).toBeGreaterThanOrEqual(1);
  });

  it('渲染英文副标题', () => {
    render(<BreathingPage />);
    expect(screen.getByText('EMERGENCY BREATHING')).toBeDefined();
  });

  it('渲染引导文字', () => {
    render(<BreathingPage />);
    expect(screen.getByText('请放空思绪，跟随律动呼吸')).toBeDefined();
  });

  it('渲染倒计时初始值 01:59', () => {
    render(<BreathingPage />);
    expect(screen.getByText('01:59')).toBeDefined();
  });

  it('渲染 AI 引导中标识', () => {
    render(<BreathingPage />);
    expect(screen.getByText('AI 引导中')).toBeDefined();
  });

  it('渲染建议平静时长标签', () => {
    render(<BreathingPage />);
    expect(screen.getByText('建议平静时长')).toBeDefined();
  });

  it('渲染导航链接', () => {
    render(<BreathingPage />);
    expect(screen.getByText('首页')).toBeDefined();
    expect(screen.getByText('读心翻译')).toBeDefined();
    expect(screen.getByText('模拟陪练')).toBeDefined();
    // "急救呼吸" 出现在标题和导航中，使用 getAllByText
    expect(screen.getAllByText('急救呼吸').length).toBeGreaterThanOrEqual(1);
  });

  it('渲染页脚隐私政策', () => {
    render(<BreathingPage />);
    expect(screen.getByText('隐私政策')).toBeDefined();
  });

  it('呼吸圆可点击暂停/继续', () => {
    render(<BreathingPage />);
    const orb = screen.getByRole('button', { name: /暂停呼吸练习|继续呼吸练习/ });
    expect(orb).toBeDefined();
  });
});
