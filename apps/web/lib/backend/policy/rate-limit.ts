/**
 * Rate Limiting Policy
 * Simple in-memory rate limiting per session
 */

import { createBackendError } from '../errors';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const DEFAULT_WINDOW_MS = 60000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = DEFAULT_WINDOW_MS, maxRequests: number = DEFAULT_MAX_REQUESTS) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if a request is allowed
   * @param key - Unique identifier (session ID, IP, etc.)
   * @returns Object with allowed status and remaining count
   */
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart > this.windowMs) {
      // New window
      this.store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
      };
    }

    // Existing window
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.windowStart + this.windowMs,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetAt: entry.windowStart + this.windowMs,
    };
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > this.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// Specific rate limiters for different endpoints
export const decodeRateLimiter = new RateLimiter(60000, 10); // 10 requests per minute
export const simulatorRateLimiter = new RateLimiter(60000, 30); // 30 requests per minute

/**
 * Check rate limit and throw if exceeded
 * @param key - Session or user identifier
 * @param limiter - Rate limiter instance
 */
export function assertRateLimit(
  key: string,
  limiter: RateLimiter = globalRateLimiter
): { remaining: number; resetAt: number } {
  const result = limiter.check(key);

  if (!result.allowed) {
    const error = createBackendError(
      'RATE_LIMITED',
      'Too many requests, please try again later',
      { resetAt: result.resetAt }
    );
    throw Object.assign(new Error(error.message), error);
  }

  return { remaining: result.remaining, resetAt: result.resetAt };
}

export { RateLimiter };
