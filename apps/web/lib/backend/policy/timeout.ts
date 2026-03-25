/**
 * Timeout Policy
 * Wrapper for adding timeout to async operations
 */

import { createBackendError } from '../errors';

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 * @returns Promise that rejects if timeout is reached
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Create a timeout controller that can be aborted
 * @param timeoutMs - Timeout in milliseconds
 * @returns Object with timeout promise and abort function
 */
export function createTimeoutController(timeoutMs: number = 30000): {
  timeoutPromise: Promise<never>;
  abort: () => void;
} {
  let timeoutId: NodeJS.Timeout;
  let rejectFn: (reason?: unknown) => void;

  const timeoutPromise = new Promise<never>((_, reject) => {
    rejectFn = reject;
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const abort = () => {
    clearTimeout(timeoutId);
    rejectFn(new TimeoutError('Operation was aborted'));
  };

  return { timeoutPromise, abort };
}
