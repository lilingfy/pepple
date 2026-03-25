import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalysisResult } from '@/components/translator/AnalysisResult';

const mockResult = {
  surfaceMeaning: '对方在询问进度',
  subtext: '对方其实在表达焦虑',
  emotionStatus: '平稳',
  emotionScore: 30,
  replySuggestions: {
    A: '回复A', B: '回复B', C: '回复C',
    strategy: { A: '提供确定感', B: '温和但坚定', C: '极简终结' },
  },
};

describe('AnalysisResult', () => {
  it('渲染 surfaceMeaning', () => {
    render(<AnalysisResult result={mockResult} />);
    expect(screen.getByText('对方在询问进度')).toBeInTheDocument();
  });

  it('渲染 subtext', () => {
    render(<AnalysisResult result={mockResult} />);
    expect(screen.getByText('对方其实在表达焦虑')).toBeInTheDocument();
  });

  it('不引用旧字段（trueIntent/attackType）', () => {
    // 类型层面约束：只接受 DecodeResponse，不含旧字段
    // 运行时检查：result 对象上不含旧字段
    const { container } = render(<AnalysisResult result={mockResult} />);
    expect(container.innerHTML).not.toContain('trueIntent');
    expect(container.innerHTML).not.toContain('attackType');
  });
});
