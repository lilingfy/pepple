import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmotionStatusBar } from '@/components/translator/EmotionStatusBar';

describe('EmotionStatusBar', () => {
  it('默认状态显示默认情绪数据', () => {
    const { container } = render(<EmotionStatusBar emotionStatus={null} emotionScore={null} />);
    // 新实现：常驻显示，默认显示 "情绪检测：平稳观察中" 和 85%
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('情绪检测：平稳观察中')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('结果态展示 emotionStatus 文本', () => {
    render(<EmotionStatusBar emotionStatus="平稳" emotionScore={30} />);
    expect(screen.getByText('平稳')).toBeInTheDocument();
  });

  it('score=30 显示绿色进度条', () => {
    const { container } = render(<EmotionStatusBar emotionStatus="平稳" emotionScore={30} />);
    expect(container.innerHTML).toContain('bg-green-400');
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('score=55 显示黄色进度条', () => {
    const { container } = render(<EmotionStatusBar emotionStatus="轻微焦虑" emotionScore={55} />);
    expect(container.innerHTML).toContain('bg-amber-400');
    expect(screen.getByText('55%')).toBeInTheDocument();
  });

  it('score=80 显示红色进度条', () => {
    const { container } = render(<EmotionStatusBar emotionStatus="压力较高" emotionScore={80} />);
    expect(container.innerHTML).toContain('bg-rose-400');
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
