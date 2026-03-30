import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Mocks
// ============================================================================

// Mock the current-user module
vi.mock('@/app/api/relations/_lib/current-user', () => ({
  getCurrentRelationUserId: vi.fn(),
}));

// Mock the relation service
vi.mock('@/lib/backend/services/relation-service', () => ({
  relationService: {
    list: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// ============================================================================
// Imports
// ============================================================================

import { GET as listRelations, POST as createRelation } from '@/app/api/relations/route';
import { GET as getRelation, PATCH as updateRelation, DELETE as deleteRelation } from '@/app/api/relations/[id]/route';
import { getCurrentRelationUserId } from '@/app/api/relations/_lib/current-user';
import { relationService } from '@/lib/backend/services/relation-service';
import { createBackendError } from '@/lib/backend/errors';
import { UnauthenticatedError, DatabaseUnavailableError, ProfileResolutionError } from '@/lib/auth/errors';

// ============================================================================
// Helpers
// ============================================================================

function makeRequest(method: string, body?: unknown, id?: string): NextRequest {
  const url = id ? `http://localhost/api/relations/${id}` : 'http://localhost/api/relations';
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Helper to create mock route params
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ============================================================================
// Tests
// ============================================================================

describe('Relations auth responses', () => {
  const mockGetCurrentRelationUserId = vi.mocked(getCurrentRelationUserId);
  const mockRelationService = {
    list: vi.mocked(relationService.list),
    create: vi.mocked(relationService.create),
    getById: vi.mocked(relationService.getById),
    update: vi.mocked(relationService.update),
    delete: vi.mocked(relationService.delete),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('unauthenticated requests return 401 UNAUTHORIZED', () => {
    beforeEach(() => {
      mockGetCurrentRelationUserId.mockRejectedValue(new UnauthenticatedError());
    });

    const unauthenticatedCases = [
      { name: 'GET /api/relations', handler: () => listRelations(), makeReq: () => makeRequest('GET') },
      { name: 'POST /api/relations', handler: (req: NextRequest) => createRelation(req), makeReq: () => makeRequest('POST', { name: 'Test' }) },
      { name: 'GET /api/relations/[id]', handler: (req: NextRequest) => getRelation(req, makeParams('rel-123')), makeReq: () => makeRequest('GET', undefined, 'rel-123') },
      { name: 'PATCH /api/relations/[id]', handler: (req: NextRequest) => updateRelation(req, makeParams('rel-123')), makeReq: () => makeRequest('PATCH', { name: 'Updated' }, 'rel-123') },
      { name: 'DELETE /api/relations/[id]', handler: (req: NextRequest) => deleteRelation(req, makeParams('rel-123')), makeReq: () => makeRequest('DELETE', undefined, 'rel-123') },
    ];

    it.each(unauthenticatedCases)('$name => 401 UNAUTHORIZED', async ({ handler, makeReq }) => {
      const res = await handler(makeReq());

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('未登录');
    });
  });

  describe('database unavailable returns 503 SERVICE_UNAVAILABLE', () => {
    beforeEach(() => {
      mockGetCurrentRelationUserId.mockRejectedValue(new DatabaseUnavailableError('Database connection not available'));
    });

    it('GET /api/relations => 503 when database is unavailable', async () => {
      const res = await listRelations();

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('POST /api/relations => 503 when database is unavailable', async () => {
      const res = await createRelation(makeRequest('POST', { name: 'Test' }));

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('profile resolution failure returns 500 INTERNAL_ERROR', () => {
    beforeEach(() => {
      mockGetCurrentRelationUserId.mockRejectedValue(new ProfileResolutionError('Failed to create user profile'));
    });

    it('GET /api/relations => 500 when profile resolution fails', async () => {
      const res = await listRelations();

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('authenticated path smoke test', () => {
    it('GET /api/relations returns empty list when authenticated', async () => {
      mockGetCurrentRelationUserId.mockResolvedValue('profile-1');
      mockRelationService.list.mockResolvedValue([]);

      const res = await listRelations();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(mockGetCurrentRelationUserId).toHaveBeenCalledTimes(1);
      expect(mockRelationService.list).toHaveBeenCalledWith('profile-1');
    });
  });

  describe('PATCH/DELETE 403 -> 404 translation', () => {
    beforeEach(() => {
      mockGetCurrentRelationUserId.mockResolvedValue('profile-1');
    });

    it('PATCH returns 404 when service throws 403 (forbidden -> not found)', async () => {
      const forbiddenError = createBackendError('FORBIDDEN', '无权修改此关系');
      mockRelationService.update.mockRejectedValue(forbiddenError);

      const req = makeRequest('PATCH', { name: 'Updated' }, 'rel-123');
      const res = await updateRelation(req, makeParams('rel-123'));

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('关系不存在');
    });

    it('DELETE returns 404 when service throws 403 (forbidden -> not found)', async () => {
      const forbiddenError = createBackendError('FORBIDDEN', '无权删除此关系');
      mockRelationService.delete.mockRejectedValue(forbiddenError);

      const req = makeRequest('DELETE', undefined, 'rel-123');
      const res = await deleteRelation(req, makeParams('rel-123'));

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('关系不存在');
    });

    it('PATCH preserves other error statuses (e.g., 500)', async () => {
      const internalError = new Error('Database connection failed');
      mockRelationService.update.mockRejectedValue(internalError);

      const req = makeRequest('PATCH', { name: 'Updated' }, 'rel-123');
      const res = await updateRelation(req, makeParams('rel-123'));

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('DELETE preserves other error statuses (e.g., 500)', async () => {
      const internalError = new Error('Database connection failed');
      mockRelationService.delete.mockRejectedValue(internalError);

      const req = makeRequest('DELETE', undefined, 'rel-123');
      const res = await deleteRelation(req, makeParams('rel-123'));

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
