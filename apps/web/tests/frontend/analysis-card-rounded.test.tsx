import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalysisCard } from '@/components/translator/AnalysisCard';

describe('AnalysisCard Rounded Corners', () => {
  it('surface 卡片使用 rounded-pebble', () => {
    render(<AnalysisCard label="表面语义" content="测试内容" variant="surface" />);

    // 检查 GlassCard 容器是否具有 rounded-pebble 类
    const card = screen.getByText('测试内容').closest('div[class*="rounded"]');
    expect(card).toBeInTheDocument();
  });

  it('subtext 卡片使用 rounded-pebble-alt', () => {
    render(<AnalysisCard label="潜台词分析" content="测试内容" variant="subtext" />);

    // 检查 GlassCard 容器是否具有 rounded-pebble-alt 类
    const card = screen.getByText('测试内容').closest('div[class*="rounded"]');
    expect(card).toBeInTheDocument();
  });

  it('默认使用 surface 样式', () => {
    render(<AnalysisCard label="表面语义" content="测试内容" />);

    const card = screen.getByText('测试内容').closest('div[class*="rounded"]');
    expect(card).toBeInTheDocument();
  });

  it('subtext 变体显示斜体内容', () => {
    render(<AnalysisCard label="潜台词分析" content="测试内容" variant="subtext" />);

    const content = screen.getByText('测试内容');
    expect(content).toHaveClass('italic');
  });

  it('surface 变体不显示斜体', () => {
    render(<AnalysisCard label="表面语义" content="测试内容" variant="surface" />);

    const content = screen.getByText('测试内容');
    expect(content).not.toHaveClass('italic');
  });
});
