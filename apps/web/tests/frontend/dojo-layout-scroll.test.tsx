import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CoachingPanel } from '@/components/dojo/CoachingPanel';

vi.mock('@/components/dojo/EmotionScoreCard', () => ({
  EmotionScoreCard: () => <div>实时情绪分析</div>,
}));

vi.mock('@/components/dojo/FeedbackCard', () => ({
  FeedbackCard: () => <div>陪练建议</div>,
}));

vi.mock('@/components/dojo/EndSessionButton', () => ({
  EndSessionButton: () => <button type="button">结束练习</button>,
}));

describe('dojo right panel layout', () => {
  it('keeps coaching widgets inside an independently scrollable right rail', () => {
    render(<CoachingPanel />);

    const panel = screen.getByTestId('dojo-coaching-panel');

    expect(panel).toHaveClass('overflow-y-auto');
    expect(panel).toHaveClass('h-full');
    expect(panel).toHaveClass('min-h-0');
    expect(panel).toHaveTextContent('实时情绪分析');
    expect(panel).toHaveTextContent('陪练建议');
    expect(panel).toHaveTextContent('结束练习');
  });
});
