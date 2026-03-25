import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalysisCard } from '@/components/translator/AnalysisCard';

describe('AnalysisCard', () => {
  it('渲染 label', () => {
    render(<AnalysisCard label="表面语义" content="这是表面意思" />);
    expect(screen.getByText('表面语义')).toBeInTheDocument();
  });

  it('渲染 content', () => {
    render(<AnalysisCard label="潜台词" content="这是潜台词" />);
    expect(screen.getByText('这是潜台词')).toBeInTheDocument();
  });
});
