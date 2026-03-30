import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Mocks - Must be defined before imports
// ============================================================================

// Mock Supabase env helpers
vi.mock('@/lib/supabase/env', () => ({
  getSupabaseUrl: vi.fn().mockReturnValue('http://localhost:54321'),
  getSupabaseAnonKey: vi.fn().mockReturnValue('mock-anon-key'),
}));

// Create mock store for Supabase client
const mockGetUser = vi.fn();

// Mock @supabase/ssr with proper factory function
vi.mock('@supabase/ssr', async () => ({
  createServerClient: vi.fn().mockImplementation(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// ============================================================================
// Imports - After mocks
// ============================================================================

import { middleware, config } from '@/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

// Shared setup for all test suites
const setupMocks = () => {
  vi.clearAllMocks();
  mockGetUser.mockReset();
};

describe('middleware', () => {
  beforeEach(setupMocks);

  describe('delegation to updateSession', () => {
    it('delegates request to updateSession and returns its response', async () => {
      // Arrange - spy on updateSession and mock its return value
      const updateSessionSpy = vi.spyOn(await import('@/lib/supabase/middleware'), 'updateSession');
      const mockResponse = NextResponse.next();
      updateSessionSpy.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest(new URL('http://localhost:3020/some-path'), {
        method: 'GET',
      });

      // Act
      const result = await middleware(request);

      // Assert
      expect(updateSessionSpy).toHaveBeenCalledTimes(1);
      expect(updateSessionSpy).toHaveBeenCalledWith(request);
      expect(result).toBe(mockResponse);

      updateSessionSpy.mockRestore();
    });
  });
});

describe('updateSession', () => {
  beforeEach(setupMocks);

  describe('protected route handling - unauthenticated', () => {
    // Table-driven tests for protected routes
    const protectedRoutes = [
      { path: '/me', expectedRedirect: '/login?redirect=%2Fme' },
      { path: '/me/relations', expectedRedirect: '/login?redirect=%2Fme%2Frelations' },
      { path: '/me/settings', expectedRedirect: '/login?redirect=%2Fme%2Fsettings' },
    ];

    it.each(protectedRoutes)(
      'redirects unauthenticated $path to login with redirect param',
      async ({ path, expectedRedirect }) => {
        // Arrange - simulate unauthenticated user
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = new NextRequest(new URL(`http://localhost:3020${path}`), {
          method: 'GET',
        });

        // Act - call real updateSession
        const result = await updateSession(request);

        // Assert - behavior-focused: check redirect location, not status code
        expect(mockGetUser).toHaveBeenCalledTimes(1);
        expect(result.headers.get('location')).toContain(expectedRedirect);
      }
    );

    it('preserves search params in redirect when present', async () => {
      // Arrange - simulate unauthenticated user with search params
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest(new URL('http://localhost:3020/me?tab=settings'), {
        method: 'GET',
      });

      // Act - call real updateSession
      const result = await updateSession(request);

      // Assert - behavior-focused: check redirect contains the preserved params
      const location = result.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=');
      expect(location).toContain('tab%3Dsettings');
    });
  });

  describe('protected route handling - authenticated', () => {
    // Table-driven tests for authenticated access to protected routes
    const protectedRoutes = ['/me', '/me/relations', '/me/settings'];

    it.each(protectedRoutes)(
      'allows authenticated requests to %s through without redirect',
      async (path) => {
        // Arrange - simulate authenticated user
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        });

        const request = new NextRequest(new URL(`http://localhost:3020${path}`), {
          method: 'GET',
        });

        // Act - call real updateSession
        const result = await updateSession(request);

        // Assert - behavior-focused: no redirect header means allowed through
        expect(mockGetUser).toHaveBeenCalledTimes(1);
        expect(result.headers.get('location')).toBeNull();
      }
    );
  });

  describe('non-protected routes', () => {
    // Table-driven tests for public routes
    const publicRoutes = ['/login', '/', '/about', '/contact'];

    it.each(publicRoutes)(
      'allows unauthenticated requests to %s without redirect',
      async (path) => {
        // Arrange - simulate unauthenticated user on public route
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = new NextRequest(new URL(`http://localhost:3020${path}`), {
          method: 'GET',
        });

        // Act - call real updateSession
        const result = await updateSession(request);

        // Assert - behavior-focused: no redirect header means allowed through
        expect(mockGetUser).toHaveBeenCalledTimes(1);
        expect(result.headers.get('location')).toBeNull();
      }
    );
  });

  describe('Supabase client integration', () => {
    it('creates Supabase client with correct configuration', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest(new URL('http://localhost:3020/login'), {
        method: 'GET',
      });

      // Act
      await updateSession(request);

      // Assert
      expect(createServerClient).toHaveBeenCalledTimes(1);
      expect(createServerClient).toHaveBeenCalledWith(
        'http://localhost:54321',
        'mock-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
    });
  });
});

describe('config', () => {
  it('exports matcher config as array', () => {
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it('matcher excludes static assets', () => {
    // Loosely check that the matcher excludes common static paths
    const matcher = config.matcher[0];
    expect(matcher).toContain('_next/static');
    expect(matcher).toContain('favicon.ico');
  });
});
