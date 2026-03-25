import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
