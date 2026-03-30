/**
 * Redirect sanitization utility
 * Prevents open redirect vulnerabilities by validating redirect targets
 */

/**
 * Sanitizes a redirect target to prevent open redirect attacks.
 * Only allows internal app-relative paths starting with '/'.
 * Rejects absolute URLs, protocol-relative URLs, empty strings, and malformed values.
 * 
 * @param redirectTo - The raw redirect target from user input (query param or form data)
 * @returns A safe redirect path, or null if the input is unsafe/invalid
 */
export function sanitizeRedirect(redirectTo: string | null | undefined): string | null {
  // Reject null, undefined, or empty strings
  if (!redirectTo || redirectTo.trim() === '') {
    return null;
  }

  const trimmed = redirectTo.trim();

  // Reject absolute URLs (http://, https://, //)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.startsWith('//')) {
    return null;
  }

  // Reject protocol-relative URLs (//example.com)
  if (trimmed.startsWith('//')) {
    return null;
  }

  // Must start with '/' for relative paths
  if (!trimmed.startsWith('/')) {
    return null;
  }

  // Reject paths that try to escape via encoded characters
  // Block %2f%2f (//), %3a (:), and other URL-encoded protocol indicators
  const decoded = decodeURIComponent(trimmed);
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded) || decoded.startsWith('//')) {
    return null;
  }

  // Reject newline characters (header injection attempts)
  if (/[\r\n]/.test(trimmed)) {
    return null;
  }

  // Reject null bytes
  if (/\0/.test(trimmed)) {
    return null;
  }

  // Valid internal path
  return trimmed;
}

/**
 * Gets a safe redirect path with a fallback default.
 * 
 * @param redirectTo - The raw redirect target from user input
 * @param fallback - The fallback path to use if redirectTo is unsafe (default: '/me')
 * @returns A safe redirect path
 */
export function getSafeRedirect(redirectTo: string | null | undefined, fallback: string = '/me'): string {
  const sanitized = sanitizeRedirect(redirectTo);
  return sanitized ?? fallback;
}
