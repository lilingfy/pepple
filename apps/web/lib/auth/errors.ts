/**
 * Auth errors for distinguishing authentication vs backend failures
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHENTICATED' | 'PROFILE_RESOLUTION_FAILED' | 'DATABASE_UNAVAILABLE'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Error thrown when no authenticated user is found (401 scenario)
 */
export class UnauthenticatedError extends AuthError {
  constructor(message: string = '未登录') {
    super(message, 'UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}

/**
 * Error thrown when profile resolution fails for an authenticated user (5xx scenario)
 */
export class ProfileResolutionError extends AuthError {
  constructor(
    message: string = '用户资料解析失败',
    public readonly cause?: unknown
  ) {
    super(message, 'PROFILE_RESOLUTION_FAILED');
    this.name = 'ProfileResolutionError';
  }
}

/**
 * Error thrown when database is unavailable (503 scenario)
 */
export class DatabaseUnavailableError extends AuthError {
  constructor(
    message: string = '数据库服务不可用',
    public readonly cause?: unknown
  ) {
    super(message, 'DATABASE_UNAVAILABLE');
    this.name = 'DatabaseUnavailableError';
  }
}

/**
 * Type guard for AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Type guard for UnauthenticatedError
 */
export function isUnauthenticatedError(error: unknown): error is UnauthenticatedError {
  return error instanceof UnauthenticatedError;
}
