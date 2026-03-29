/**
 * Relation Client
 * API client for relation nodes
 */

import type { RelationNode, RelationCreateRequest, RelationUpdateRequest } from '@pebble/types';

export class RelationError extends Error {
  constructor(
    public readonly code: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND' | 'FORBIDDEN',
    message: string,
  ) {
    super(message);
    this.name = 'RelationError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId: string;
  };
}

function mapRelationError(status: number, message: string): RelationError {
  if (status === 404) {
    return new RelationError('NOT_FOUND', message);
  }

  if (status === 403) {
    return new RelationError('FORBIDDEN', message);
  }

  return new RelationError('HTTP_ERROR', message);
}

async function handleResponse<T>(response: Response): Promise<T> {
  let json: ApiResponse<T> | null = null;

  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = json?.error?.message ?? `HTTP ${response.status}`;
    throw mapRelationError(response.status, message);
  }

  if (!json?.success) {
    throw new RelationError('HTTP_ERROR', json?.error?.message ?? '请求失败');
  }

  return json.data as T;
}

export async function listRelations(): Promise<RelationNode[]> {
  try {
    const response = await fetch('/api/relations');
    return handleResponse<RelationNode[]>(response);
  } catch (error) {
    if (error instanceof RelationError) throw error;
    throw new RelationError('NETWORK_ERROR', '获取关系列表失败，请稍后重试');
  }
}

export async function getRelation(id: string): Promise<RelationNode> {
  try {
    const response = await fetch(`/api/relations/${id}`);
    return handleResponse<RelationNode>(response);
  } catch (error) {
    if (error instanceof RelationError) throw error;
    throw new RelationError('NETWORK_ERROR', '获取关系详情失败，请稍后重试');
  }
}

export async function createRelation(request: RelationCreateRequest): Promise<RelationNode> {
  try {
    const response = await fetch('/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<RelationNode>(response);
  } catch (error) {
    if (error instanceof RelationError) throw error;
    throw new RelationError('NETWORK_ERROR', '创建关系失败，请稍后重试');
  }
}

export async function updateRelation(id: string, request: RelationUpdateRequest): Promise<RelationNode> {
  try {
    const response = await fetch(`/api/relations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<RelationNode>(response);
  } catch (error) {
    if (error instanceof RelationError) throw error;
    throw new RelationError('NETWORK_ERROR', '更新关系失败，请稍后重试');
  }
}

export async function deleteRelation(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/relations/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) return;

    let json: ApiResponse<null> | null = null;

    try {
      json = await response.json();
    } catch {
      json = null;
    }

    throw mapRelationError(response.status, json?.error?.message ?? `HTTP ${response.status}`);
  } catch (error) {
    if (error instanceof RelationError) throw error;
    throw new RelationError('NETWORK_ERROR', '删除关系失败，请稍后重试');
  }
}
