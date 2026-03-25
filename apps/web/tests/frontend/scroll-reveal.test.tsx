import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ScrollReveal } from '@/components/home/ScrollReveal';

// Mock useScrollReveal hook
const mockUseScrollReveal = vi.fn((threshold = 0.15) => ({
  ref: { current: null },
  isInView: false,
}));

vi.mock('@/hooks/useScrollReveal', () => ({
  useScrollReveal: (...args: unknown[]) => mockUseScrollReveal(...args),
}));

describe('ScrollReveal', () => {
  it('应该渲染子元素', () => {
    render(
      <ScrollReveal>
        <div data-testid="child">测试内容</div>
      </ScrollReveal>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });

  it('应该应用 slide-up 动画类型的初始类', () => {
    const { container } = render(
      <ScrollReveal animation="slide-up">
        <div>内容</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('opacity-0');
    expect(wrapper.className).toContain('translate-y-24');
    expect(wrapper.className).toContain('scale-95');
  });

  it('应该应用 pop-out 动画类型的初始类', () => {
    const { container } = render(
      <ScrollReveal animation="pop-out">
        <div>内容</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('opacity-0');
    expect(wrapper.className).toContain('scale-[0.70]');
    expect(wrapper.className).not.toContain('translate-y-24');
  });

  it('应该在进入视口时应用可见类', () => {
    // 模拟进入视口
    mockUseScrollReveal.mockReturnValueOnce({ ref: { current: null }, isInView: true });

    const { container } = render(
      <ScrollReveal animation="slide-up">
        <div>内容</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('opacity-100');
    expect(wrapper.className).toContain('translate-y-0');
    expect(wrapper.className).toContain('scale-100');
  });

  it('应该应用自定义 className', () => {
    const { container } = render(
      <ScrollReveal className="custom-class">
        <div>内容</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('应该应用过渡类', () => {
    const { container } = render(
      <ScrollReveal>
        <div>内容</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('transition-all');
    expect(wrapper.className).toContain('duration-1000');
  });
});
