'use client';

import React from 'react';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

export interface CoachFeedback {
  score: number;
  analysis: string;
  culturalContext: string;
  suggestion: string;
  betterReply: string;
}

interface ScoreDisplayProps {
  feedback?: CoachFeedback;
}

export function ScoreDisplay({ feedback }: ScoreDisplayProps) {
  const circumference = 2 * Math.PI * 46;
  const offset = feedback ? circumference - (feedback.score / 100) * circumference : circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent composure.';
    if (score >= 50) return 'Getting there...';
    return 'Work on neutrality.';
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
      {/* Neutrality Score Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4 relative">
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-primary/10"
              cx="50"
              cy="50"
              fill="transparent"
              r="46"
              stroke="currentColor"
              strokeWidth="8"
            />
            {feedback && (
              <circle
                className={getScoreColor(feedback.score)}
                cx="50"
                cy="50"
                fill="transparent"
                r="46"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeWidth="8"
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            )}
          </svg>
          <span
            className={`text-3xl font-bold ${
              feedback ? getScoreColor(feedback.score) : 'text-primary'
            }`}
          >
            {feedback?.score ?? '--'}
          </span>
        </div>
        <h2 className="text-lg font-bold mb-1">Neutrality Score</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {feedback ? getScoreMessage(feedback.score) : 'Start practicing to see your score'}
        </p>
      </div>

      {/* Feedback Section */}
      {feedback && (
        <>
          {/* Analysis */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <MaterialSymbol icon="psychology" className="text-primary" />
              <h3 className="text-lg font-bold">Analysis</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {feedback.analysis}
            </p>
          </div>

          {/* Cultural Context */}
          {feedback.culturalContext && (
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                <MaterialSymbol icon="public" className="text-base" />
                Cultural Context
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {feedback.culturalContext}
              </p>
            </div>
          )}

          {/* Suggestion */}
          {feedback.suggestion && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <MaterialSymbol icon="tips_and_updates" className="text-primary" />
                <h3 className="text-lg font-bold">Coach Tip</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {feedback.suggestion}
              </p>
            </div>
          )}

          {/* Better Reply */}
          {feedback.betterReply && feedback.betterReply !== '你的回应已经很好了！' && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <MaterialSymbol icon="check_circle" className="text-base" />
                Better Reply
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "{feedback.betterReply}"
              </p>
            </div>
          )}
        </>
      )}

      {/* Default Tips */}
      {!feedback && (
        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
          <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            <MaterialSymbol icon="lightbulb" className="text-base" />
            Pro Tip
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            When they accuse you, don't try to correct their perception. A simple "Mhm"
            or "I hear you" is often enough.
          </p>
        </div>
      )}
    </div>
  );
}
