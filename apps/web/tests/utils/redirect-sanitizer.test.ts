import { describe, it, expect } from 'vitest';
import { sanitizeRedirect, getSafeRedirect } from '@/lib/utils/redirect-sanitizer';

describe('sanitizeRedirect', () => {
  describe('valid internal paths (allowed)', () => {
    it.each([
      { input: '/me', expected: '/me' },
      { input: '/me/relations', expected: '/me/relations' },
      { input: '/dashboard', expected: '/dashboard' },
      { input: '/login', expected: '/login' },
      { input: '/path/with/nested/routes', expected: '/path/with/nested/routes' },
      { input: '/me?tab=settings', expected: '/me?tab=settings' },
      { input: '/search?q=test&page=1', expected: '/search?q=test&page=1' },
      { input: '/path#section', expected: '/path#section' },
      { input: '/me ', expected: '/me' }, // trailing space trimmed
      { input: ' /me', expected: '/me' }, // leading space trimmed
    ])('allows $input', ({ input, expected }) => {
      expect(sanitizeRedirect(input)).toBe(expected);
    });
  });

  describe('absolute URLs (rejected)', () => {
    it.each([
      { input: 'https://evil.com', description: 'https URL' },
      { input: 'http://evil.com', description: 'http URL' },
      { input: 'ftp://evil.com', description: 'ftp URL' },
      { input: 'javascript:alert(1)', description: 'javascript protocol' },
      { input: 'data:text/html,<script>alert(1)</script>', description: 'data URI' },
      { input: 'file:///etc/passwd', description: 'file protocol' },
      { input: 'mailto:test@example.com', description: 'mailto protocol' },
    ])('rejects $description: $input', ({ input }) => {
      expect(sanitizeRedirect(input)).toBeNull();
    });
  });

  describe('protocol-relative URLs (rejected)', () => {
    it.each([
      { input: '//evil.com', description: 'protocol-relative' },
      { input: '//evil.com/steal', description: 'protocol-relative with path' },
      { input: ' //evil.com', description: 'with leading space' },
    ])('rejects $description: $input', ({ input }) => {
      expect(sanitizeRedirect(input)).toBeNull();
    });
  });

  describe('URL-encoded bypass attempts (rejected)', () => {
    it.each([
      { input: '%2f%2fevil.com', description: 'encoded //' },
      { input: '%2F%2Fevil.com', description: 'encoded // uppercase' },
      { input: '/%2f%2fevil.com', description: 'path with encoded //' },
      { input: 'https%3a//evil.com', description: 'encoded https:' },
      { input: 'https%3A//evil.com', description: 'encoded https: uppercase' },
    ])('rejects $description: $input', ({ input }) => {
      expect(sanitizeRedirect(input)).toBeNull();
    });
  });

  describe('empty or invalid values (rejected)', () => {
    it.each([
      { input: null, description: 'null' },
      { input: undefined, description: 'undefined' },
      { input: '', description: 'empty string' },
      { input: '   ', description: 'whitespace only' },
      { input: 'me', description: 'missing leading slash' },
      { input: 'relative/path', description: 'relative path without slash' },
    ])('rejects $description', ({ input }) => {
      expect(sanitizeRedirect(input as string | null)).toBeNull();
    });
  });

  describe('header injection attempts (rejected)', () => {
    it.each([
      { input: '/me\r\nLocation: https://evil.com', description: 'CRLF injection' },
      { input: '/me\nLocation: https://evil.com', description: 'LF injection' },
      { input: '/me\rSet-Cookie: evil=true', description: 'CR injection' },
    ])('rejects $description', ({ input }) => {
      expect(sanitizeRedirect(input)).toBeNull();
    });
  });

  describe('null byte injection (rejected)', () => {
    it.each([
      { input: '/me\0', description: 'trailing null byte' },
      { input: '\0/me', description: 'leading null byte' },
      { input: '/me\0/settings', description: 'embedded null byte' },
    ])('rejects $description', ({ input }) => {
      expect(sanitizeRedirect(input)).toBeNull();
    });
  });
});

describe('getSafeRedirect', () => {
  it('returns sanitized path when valid', () => {
    expect(getSafeRedirect('/dashboard', '/me')).toBe('/dashboard');
  });

  it('returns fallback when input is invalid', () => {
    expect(getSafeRedirect('https://evil.com', '/me')).toBe('/me');
  });

  it('returns fallback when input is null', () => {
    expect(getSafeRedirect(null, '/me')).toBe('/me');
  });

  it('returns fallback when input is empty', () => {
    expect(getSafeRedirect('', '/me')).toBe('/me');
  });

  it('uses default fallback /me when not specified', () => {
    expect(getSafeRedirect(null)).toBe('/me');
  });

  it('allows custom fallback', () => {
    expect(getSafeRedirect('https://evil.com', '/dashboard')).toBe('/dashboard');
  });
});
