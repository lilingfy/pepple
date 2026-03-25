'use client';

import { EmotionScoreCard } from './EmotionScoreCard';
import { FeedbackCard } from './FeedbackCard';
import { EndSessionButton } from './EndSessionButton';

export function CoachingPanel() {
  return (
    <>
      <EmotionScoreCard />
      <FeedbackCard />
      <EndSessionButton />
    </>
  );
}
