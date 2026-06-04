import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Scenario } from '@/types/dojo';

const scenarios: Scenario[] = [
  {
    id: 'workplace',
    name: '职场越界',
    description: 'workplace scenario',
    difficulty: 'medium',
    context: 'workplace context',
    goal: 'workplace goal',
    tips: [],
  },
  {
    id: 'relationship',
    name: '亲密关系',
    description: 'relationship scenario',
    difficulty: 'medium',
    context: 'relationship context',
    goal: 'relationship goal',
    tips: [],
  },
];

const loadScenarios = vi.fn();
const selectScenario = vi.fn();
let searchParams = new URLSearchParams('scenarioId=relationship');
let sessionStatus: 'idle' | 'active' | 'ended' = 'active';
let currentScenario: Scenario | null = scenarios[0];

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dojo',
  useParams: () => ({}),
}));

vi.mock('@/store/dojo-store', () => ({
  useDojoStore: () => ({
    loadScenarios,
    selectScenario,
    scenarios,
    sessionStatus,
    currentScenario,
  }),
}));

vi.mock('@/components/layout/AppHeader', () => ({
  AppHeader: () => <header>Header</header>,
}));

vi.mock('@/components/dojo/ScenarioPanel', () => ({
  ScenarioPanel: () => <div>ScenarioPanel</div>,
}));

vi.mock('@/components/dojo/ChatArea', () => ({
  ChatArea: () => <div>ChatArea</div>,
}));

vi.mock('@/components/dojo/CoachingPanel', () => ({
  CoachingPanel: () => <div>CoachingPanel</div>,
}));

vi.mock('@/components/dojo/DojoStatus', () => ({
  DojoStatus: () => <div>DojoStatus</div>,
}));

describe('DojoPage URL scenario selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = new URLSearchParams('scenarioId=relationship');
    sessionStatus = 'active';
    currentScenario = scenarios[0];
  });

  it('switches to the scenario from the URL even when a previous session is active', async () => {
    const { default: DojoPage } = await import('@/app/(main)/dojo/page');

    render(<DojoPage />);

    await waitFor(() => {
      expect(selectScenario).toHaveBeenCalledWith(scenarios[1]);
    });
  });

  it('starts the scenario from the URL again when the current matching session already ended', async () => {
    sessionStatus = 'ended';
    currentScenario = scenarios[1];
    const { default: DojoPage } = await import('@/app/(main)/dojo/page');

    render(<DojoPage />);

    await waitFor(() => {
      expect(selectScenario).toHaveBeenCalledWith(scenarios[1]);
    });
  });

  it('does not force the URL scenario again after the user switches to another scenario', async () => {
    const { default: DojoPage } = await import('@/app/(main)/dojo/page');

    const { rerender } = render(<DojoPage />);

    await waitFor(() => {
      expect(selectScenario).toHaveBeenCalledWith(scenarios[1]);
    });

    selectScenario.mockClear();
    currentScenario = scenarios[1];
    rerender(<DojoPage />);

    currentScenario = scenarios[0];
    rerender(<DojoPage />);

    await waitFor(() => {
      expect(selectScenario).not.toHaveBeenCalled();
    });
  });
});
