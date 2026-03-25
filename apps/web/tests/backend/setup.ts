/**
 * Backend Test Setup
 * Configuration for backend API tests
 */

import { vi } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock database for unit tests
vi.mock('@/lib/db', () => ({
  db: {
    query: vi.fn(),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => []) })) })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => []) })) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => []) })) })) })),
    delete: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => []) })) })),
  },
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Headers()),
}));

// Helper to create mock request
export function createMockRequest(body: unknown, options: RequestInit = {}): Request {
  return new Request('http://localhost:3000/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// Helper to extract JSON from Response
export async function getJson(response: Response): Promise<unknown> {
  return response.json();
}
