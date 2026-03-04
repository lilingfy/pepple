'use client';

import React from 'react';
import { ScenarioSelector, Scenario } from '@/components/simulator/ScenarioSelector';
import { ChatInterface, ChatMessage } from '@/components/simulator/ChatInterface';
import { ScoreDisplay, CoachFeedback } from '@/components/simulator/ScoreDisplay';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

interface SimulatorResponse {
  coachFeedback: CoachFeedback;
  nextAttack: string;
}

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = React.useState<Scenario | null>(
    null
  );
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = React.useState<CoachFeedback | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        role: 'antagonist',
        content:
          scenario.openings[
            Math.floor(Math.random() * scenario.openings.length)
          ],
        timestamp: new Date()
      }
    ]);
    setFeedback(undefined);
  };

  const sendMessage = async (userMessage: string) => {
    if (!selectedScenario) return;

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          userMessage,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: SimulatorResponse = await response.json();

      // Update feedback
      setFeedback(data.coachFeedback);

      // Add antagonist response
      const antagonistMsg: ChatMessage = {
        role: 'antagonist',
        content: data.nextAttack,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, antagonistMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMsg: ChatMessage = {
        role: 'antagonist',
        content: 'Let me try another angle...',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScenario = () => {
    if (selectedScenario) {
      startScenario(selectedScenario);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 text-primary flex items-center justify-center">
                <MaterialSymbol icon="eco" className="text-2xl" />
              </div>
              <h2 className="text-lg font-bold">Pebble</h2>
            </div>
            <nav className="flex gap-6">
              <a
                href="/"
                className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium"
              >
                Dashboard
              </a>
              <span className="text-primary text-sm font-bold border-b-2 border-primary pb-1">
                Practice Dojo
              </span>
              <a
                href="/panic"
                className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium"
              >
                Breathing Space
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Scenario Selector */}
          <div className="mb-8">
            <ScenarioSelector
              onSelect={startScenario}
              selectedId={selectedScenario?.id}
            />
            {selectedScenario && (
              <button
                onClick={resetScenario}
                className="mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
              >
                <MaterialSymbol icon="refresh" className="text-base" />
                Reset scenario
              </button>
            )}
          </div>

          {/* Simulator Interface */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                isLoading={isLoading}
                antagonistName={selectedScenario?.antagonist.name || 'Antagonist'}
                disabled={!selectedScenario}
              />
            </div>
            <ScoreDisplay feedback={feedback} />
          </div>
        </div>
      </main>
    </div>
  );
}
