'use client';

import { EmotionScoreCard } from './EmotionScoreCard';
import { FeedbackCard } from './FeedbackCard';
import { EndSessionButton } from './EndSessionButton';

export function CoachingPanel() {
  return (
    <div
      data-testid="dojo-coaching-panel"
      className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]"
    >
      <EmotionScoreCard />
      <FeedbackCard />
      <EndSessionButton />
    </div>
  );
}
