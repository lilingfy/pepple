import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/me/practice',
}));

const mockListPracticeEntries = vi.fn();
const mockGetPracticeEntry = vi.fn();
const mockUpdatePracticeEntry = vi.fn();

vi.mock('@/lib/frontend/practice-client', () => ({
  listPracticeEntries: (...args: unknown[]) => mockListPracticeEntries(...args),
  getPracticeEntry: (...args: unknown[]) => mockGetPracticeEntry(...args),
  updatePracticeEntry: (...args: unknown[]) => mockUpdatePracticeEntry(...args),
}));

import PracticePage from '@/app/(main)/me/practice/page';

describe('PracticePage ToastProvider integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockListPracticeEntries.mockResolvedValue({ entries: [], total: 0, hasMore: false });
  });

  it('renders without requiring an external ToastProvider', async () => {
    expect(() => render(<PracticePage />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByText('练习本')).toBeInTheDocument();
    });
  });
});
