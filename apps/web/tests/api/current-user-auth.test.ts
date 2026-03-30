import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock db module - factory creates fresh mocks for each test via vi.resetAllMocks
vi.mock('@/lib/db', () => {
  const mockFindFirst = vi.fn();
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  return {
    db: {
      query: {
        userProfiles: {
          findFirst: mockFindFirst,
        },
      },
      insert: mockInsert,
    },
    userProfiles: {
      authUserId: 'auth_user_id',
    },
    // Export mocks for test access - these are the actual vi.fn() instances
    __mocks: {
      findFirst: mockFindFirst,
      returning: mockReturning,
      values: mockValues,
      insert: mockInsert,
    },
  };
});

// ============================================================================
// Imports
// ============================================================================

import { getCurrentRelationUserId } from '@/app/api/relations/_lib/current-user';
import { createClient } from '@/lib/supabase/server';
import * as dbModule from '@/lib/db';
import {
  UnauthenticatedError,
  ProfileResolutionError,
  DatabaseUnavailableError,
} from '@/lib/auth/errors';

describe('getCurrentRelationUserId', () => {
  // Helper to get typed mocks from the module's exported __mocks
  const getMocks = () => {
    const { __mocks } = dbModule as unknown as { __mocks: {
      findFirst: ReturnType<typeof vi.fn>;
      returning: ReturnType<typeof vi.fn>;
      values: ReturnType<typeof vi.fn>;
      insert: ReturnType<typeof vi.fn>;
    }};

    return {
      mockSupabaseClient: vi.mocked(createClient),
      mockDb: {
        findFirst: vi.mocked(__mocks.findFirst),
        insert: vi.mocked(__mocks.insert),
        values: vi.mocked(__mocks.values),
        returning: vi.mocked(__mocks.returning),
      },
    };
  };

  beforeEach(() => {
    // Reset all mocks including call history and implementations
    vi.resetAllMocks();
    // Re-establish the mock method chaining after reset
    const { __mocks } = dbModule as unknown as { __mocks: {
      insert: ReturnType<typeof vi.fn>;
      values: ReturnType<typeof vi.fn>;
      returning: ReturnType<typeof vi.fn>;
    }};
    __mocks.insert.mockImplementation(() => ({ values: __mocks.values }));
    __mocks.values.mockImplementation(() => ({ returning: __mocks.returning }));
  });

  describe('happy paths', () => {
    it('throws UnauthenticatedError when no Supabase user is authenticated', async () => {
      const { mockSupabaseClient } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
      } as any);

      await expect(getCurrentRelationUserId()).rejects.toThrow(UnauthenticatedError);
      await expect(getCurrentRelationUserId()).rejects.toThrow('未登录');
    });

    it('returns existing local profile id when profile exists', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-123' } }, error: null }) },
      } as any);
      mockDb.findFirst.mockResolvedValue({ id: 'profile-456', authUserId: 'auth-user-123' } as any);

      const result = await getCurrentRelationUserId();

      expect(result).toBe('profile-456');
      expect(mockDb.findFirst).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('creates new profile and returns id when profile does not exist', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-789' } }, error: null }) },
      } as any);
      mockDb.findFirst.mockResolvedValueOnce(undefined);
      mockDb.returning.mockResolvedValue([{ id: 'profile-new-123', authUserId: 'auth-user-789' }]);

      const result = await getCurrentRelationUserId();

      expect(result).toBe('profile-new-123');
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledWith({ authUserId: 'auth-user-789' });
    });

    it('handles concurrent creation by retrying lookup on unique constraint violation (code 23505)', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-concurrent' } }, error: null }) },
      } as any);

      // First lookup: no profile
      mockDb.findFirst.mockResolvedValueOnce(undefined);

      // Insert fails with unique constraint violation using proper error code
      const uniqueError = Object.assign(new Error('duplicate key value violates unique constraint'), { code: '23505' });
      mockDb.returning.mockRejectedValue(uniqueError);

      // Retry lookup: profile now exists (created by concurrent request)
      mockDb.findFirst.mockResolvedValueOnce({ id: 'profile-concurrent-456', authUserId: 'auth-user-concurrent' } as any);

      const result = await getCurrentRelationUserId();

      expect(result).toBe('profile-concurrent-456');
      expect(mockDb.findFirst).toHaveBeenCalledTimes(2);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure paths', () => {
    it('throws DatabaseUnavailableError when database is unavailable (db is null)', async () => {
      // Clear module cache to ensure fresh import
      vi.resetModules();

      // Override the mock for this specific test
      vi.doMock('@/lib/db', () => ({
        db: null,
        userProfiles: { authUserId: 'auth_user_id' },
      }));

      // Re-import the module with the new mock
      const { getCurrentRelationUserId: getUserWithNullDb } = await import('@/app/api/relations/_lib/current-user');
      // Import the error class from the same module context
      const { DatabaseUnavailableError } = await import('@/lib/auth/errors');

      await expect(getUserWithNullDb()).rejects.toBeInstanceOf(DatabaseUnavailableError);
      await expect(getUserWithNullDb()).rejects.toThrow('Database connection not available');

      // Cleanup: restore original mock and clear module cache
      vi.doUnmock('@/lib/db');
      vi.resetModules();
    });

    it('throws UnauthenticatedError when Supabase getUser returns an error', async () => {
      const { mockSupabaseClient } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') }) },
      } as any);

      await expect(getCurrentRelationUserId()).rejects.toThrow(UnauthenticatedError);
    });

    it('throws ProfileResolutionError when insert fails with non-unique error', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-fail' } }, error: null }) },
      } as any);
      mockDb.findFirst.mockResolvedValueOnce(undefined);

      // Insert fails with a non-unique error (e.g., connection lost) - no 23505 code
      mockDb.returning.mockRejectedValue(new Error('Connection terminated unexpectedly'));

      await expect(getCurrentRelationUserId()).rejects.toThrow(ProfileResolutionError);
      await expect(getCurrentRelationUserId()).rejects.toThrow('Failed to create user profile');
    });

    it('throws ProfileResolutionError when both insert and retry lookup fail', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-fail2' } }, error: null }) },
      } as any);

      // First lookup: no profile
      mockDb.findFirst.mockResolvedValueOnce(undefined);

      // Insert fails with unique constraint (using code property)
      const uniqueError = Object.assign(new Error('duplicate key value violates unique constraint'), { code: '23505' });
      mockDb.returning.mockRejectedValue(uniqueError);

      // Retry lookup also fails (edge case: profile was deleted between insert failure and retry)
      mockDb.findFirst.mockResolvedValueOnce(undefined);

      await expect(getCurrentRelationUserId()).rejects.toThrow(ProfileResolutionError);
      await expect(getCurrentRelationUserId()).rejects.toThrow('Profile was created concurrently but could not be retrieved');
    });

    it('throws ProfileResolutionError when insert returns empty array', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-empty' } }, error: null }) },
      } as any);
      mockDb.findFirst.mockResolvedValueOnce(undefined);

      mockDb.returning.mockResolvedValue([]); // Empty result

      await expect(getCurrentRelationUserId()).rejects.toThrow(ProfileResolutionError);
      await expect(getCurrentRelationUserId()).rejects.toThrow('Failed to create user profile');
    });
  });

  describe('error code verification', () => {
    it('UnauthenticatedError has correct code', async () => {
      const { mockSupabaseClient } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
      } as any);

      try {
        await getCurrentRelationUserId();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthenticatedError);
        expect((error as UnauthenticatedError).code).toBe('UNAUTHENTICATED');
      }
    });

    it('DatabaseUnavailableError has correct code', async () => {
      vi.resetModules();
      vi.doMock('@/lib/db', () => ({
        db: null,
        userProfiles: { authUserId: 'auth_user_id' },
      }));

      const { getCurrentRelationUserId: getUserWithNullDb } = await import('@/app/api/relations/_lib/current-user');
      const { DatabaseUnavailableError } = await import('@/lib/auth/errors');

      try {
        await getUserWithNullDb();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseUnavailableError);
        expect((error as DatabaseUnavailableError).code).toBe('DATABASE_UNAVAILABLE');
      }

      vi.doUnmock('@/lib/db');
      vi.resetModules();
    });

    it('ProfileResolutionError has correct code', async () => {
      const { mockSupabaseClient, mockDb } = getMocks();
      mockSupabaseClient.mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'auth-user-123' } }, error: null }) },
      } as any);
      mockDb.findFirst.mockResolvedValueOnce(undefined);
      mockDb.returning.mockRejectedValue(new Error('Connection lost'));

      try {
        await getCurrentRelationUserId();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ProfileResolutionError);
        expect((error as ProfileResolutionError).code).toBe('PROFILE_RESOLUTION_FAILED');
      }
    });
  });
});
