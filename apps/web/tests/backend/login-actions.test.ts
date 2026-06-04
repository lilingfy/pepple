/**
 * Login Actions Tests
 * TDD: Tests for signInAction, signUpAction, signOutAction server actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInAction, signUpAction, signOutAction } from '@/app/(main)/login/actions';
import { INITIAL_STATE } from '@/app/(main)/login/state';

// Mock Supabase server client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockSetSession = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      setSession: mockSetSession,
    },
  })),
}));

// Mock Next.js navigation and cache
const mockRedirect = vi.fn();
const mockRevalidatePath = vi.fn();
const mockCookieSet = vi.fn();
const mockCookieGetAll = vi.fn(() => []);

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`Redirect: ${url}`);
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: (path: string, type?: string) => {
    mockRevalidatePath(path, type);
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    getAll: mockCookieGetAll,
    set: mockCookieSet,
  })),
}));

describe('Login Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    mockSetSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockCookieGetAll.mockReturnValue([]);
  });

  describe('INITIAL_STATE', () => {
    it('has correct initial values', () => {
      expect(INITIAL_STATE).toEqual({ error: null, message: null });
    });
  });

  describe('signInAction', () => {
    it('redirects to /me on successful sign in without redirectTo', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'user-123' } } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await expect(signInAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockCookieSet).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('redirects to redirectTo path on successful sign in when provided', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'user-123' } } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', '/dashboard');

      await expect(signInAction(null, formData)).rejects.toThrow('Redirect: /dashboard');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('returns error state on failed sign in', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      const result = await signInAction(null, formData);

      expect(result.error).toBe('Invalid login credentials');
      expect(result.message).toBeNull();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('returns error state when email is missing', async () => {
      const formData = new FormData();
      formData.append('password', 'password123');

      const result = await signInAction(null, formData);

      expect(result.error).toContain('邮箱');
      expect(result.message).toBeNull();
    });

    it('redirects to /me when redirectTo is an absolute URL (open redirect hardening)', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'user-123' } } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', 'https://evil.com');

      await expect(signInAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('redirects to /me when redirectTo is a protocol-relative URL', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'user-123' } } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', '//evil.com');

      await expect(signInAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('redirects to /me when redirectTo contains CRLF injection attempt', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'user-123' } } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', '/me\r\nLocation: https://evil.com');

      await expect(signInAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('returns error state when password is missing', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const result = await signInAction(null, formData);

      expect(result.error).toContain('密码');
      expect(result.message).toBeNull();
    });
  });

  describe('signUpAction', () => {
    it('returns verification message when sign up succeeds but no session', async () => {
      mockSignUp.mockResolvedValue({
        data: { session: null, user: { id: 'new-user-123' } },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');

      const result = await signUpAction(null, formData);

      expect(result.error).toBeNull();
      expect(result.message).toContain('邮箱验证');
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3020/login?redirect=%2Fme',
        },
      });
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to /me when sign up succeeds with immediate session', async () => {
      mockSignUp.mockResolvedValue({
        data: { 
          session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'new-user-123' } },
          user: { id: 'new-user-123' },
        },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');

      await expect(signUpAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('redirects to redirectTo when sign up succeeds with immediate session', async () => {
      mockSignUp.mockResolvedValue({
        data: { 
          session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'new-user-123' } },
          user: { id: 'new-user-123' },
        },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', '/welcome');

      await expect(signUpAction(null, formData)).rejects.toThrow('Redirect: /welcome');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/welcome');
    });

    it('returns error state on failed sign up', async () => {
      mockSignUp.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'User already registered' },
      });

      const formData = new FormData();
      formData.append('email', 'existing@example.com');
      formData.append('password', 'password123');

      const result = await signUpAction(null, formData);

      expect(result.error).toBe('User already registered');
      expect(result.message).toBeNull();
    });

    it('returns error when password is less than 8 characters', async () => {
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'short');

      const result = await signUpAction(null, formData);

      expect(result.error).toContain('密码');
      expect(result.message).toBeNull();
    });

    it('redirects to /me when redirectTo is an absolute URL (open redirect hardening)', async () => {
      mockSignUp.mockResolvedValue({
        data: { 
          session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'new-user-123' } },
          user: { id: 'new-user-123' },
        },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', 'https://evil.com');

      await expect(signUpAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });

    it('redirects to /me when redirectTo is a protocol-relative URL in signUp', async () => {
      mockSignUp.mockResolvedValue({
        data: { 
          session: { access_token: 'access-token', refresh_token: 'refresh-token', user: { id: 'new-user-123' } },
          user: { id: 'new-user-123' },
        },
        error: null,
      });

      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('redirectTo', '//evil.com');

      await expect(signUpAction(null, formData)).rejects.toThrow('Redirect: /me');
      expect(mockRedirect).toHaveBeenCalledWith('/me');
    });
  });

  describe('signOutAction', () => {
    it('calls revalidatePath and redirects to /login after sign out', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await expect(signOutAction()).rejects.toThrow('Redirect: /login');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('still calls revalidatePath and redirects to /login even if sign out has error', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Some error' } });

      await expect(signOutAction()).rejects.toThrow('Redirect: /login');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });
});
