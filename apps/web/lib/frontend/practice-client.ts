import type { PracticeEntry, PracticeListResponse, PracticeUpdateRequest, PracticeCreateRequest } from '@pebble/types';

export class PracticeError extends Error {
  constructor(
    public readonly code: 'HTTP_ERROR' | 'NETWORK_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'PracticeError';
  }
}

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
  fallbackMessage = '请求失败',
): Promise<T> {
  let response: Response;
  try {
    response = options ? await fetch(url, options) : await fetch(url);
  } catch {
    throw new PracticeError('NETWORK_ERROR', `${fallbackMessage}，请稍后重试`);
  }

  if (!response.ok) {
    throw new PracticeError('HTTP_ERROR', `HTTP ${response.status}`);
  }

  let result: { success?: boolean; error?: { message?: string }; data?: unknown };
  try {
    result = await response.json();
  } catch {
    throw new PracticeError('HTTP_ERROR', fallbackMessage);
  }

  if (!result.success) {
    throw new PracticeError('HTTP_ERROR', result.error?.message || fallbackMessage);
  }
  return result.data as T;
}

export interface PracticeFilters {
  sourceType?: 'decode' | 'simulator';
  isFavorite?: boolean;
  isArchived?: boolean;
  limit?: number;
  cursor?: string;
}

export async function savePractice(request: PracticeCreateRequest): Promise<PracticeEntry> {
  return apiRequest<PracticeEntry>('/api/practice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  }, '保存失败');
}

export async function listPracticeEntries(filters: PracticeFilters = {}): Promise<PracticeListResponse> {
  const params = new URLSearchParams();
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.isFavorite !== undefined) params.set('isFavorite', String(filters.isFavorite));
  if (filters.isArchived !== undefined) params.set('isArchived', String(filters.isArchived));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.cursor) params.set('cursor', filters.cursor);

  const query = params.toString();
  return apiRequest<PracticeListResponse>(`/api/practice${query ? `?${query}` : ''}`, undefined, '获取列表失败');
}

export async function getPracticeEntry(id: string): Promise<PracticeEntry> {
  return apiRequest<PracticeEntry>(`/api/practice/${id}`, undefined, '获取详情失败');
}

export async function updatePracticeEntry(
  id: string,
  updates: PracticeUpdateRequest,
): Promise<PracticeEntry> {
  return apiRequest<PracticeEntry>(`/api/practice/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }, '更新失败');
}

export async function deletePracticeEntry(id: string): Promise<void> {
  return apiRequest<void>(`/api/practice/${id}`, {
    method: 'DELETE',
  }, '删除失败');
}
