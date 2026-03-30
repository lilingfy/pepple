/**
 * Login Page Tests
 * TDD: Tests for server component login page with client LoginForm
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/(main)/login/page';

// Mock the LoginForm client component
vi.mock('@/app/(main)/login/LoginForm', () => ({
  default: ({ redirectUrl }: { redirectUrl: string }) => (
    <div data-testid="login-form" data-redirect-url={redirectUrl}>
      <form>
        <input type="hidden" name="redirectTo" value={redirectUrl} />
        <label htmlFor="email">邮箱</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" />
        <label htmlFor="password">密码</label>
        <input id="password" name="password" type="password" minLength={8} placeholder="••••••••" />
        <button type="submit" formAction="signInAction">登录</button>
        <button type="submit" formAction="signUpAction">注册</button>
      </form>
    </div>
  ),
}));


describe('LoginPage', () => {
  // --- Rendering Tests ---
  it('renders heading with 登录 Pebble AI', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('登录 Pebble AI');
  });

  it('renders email input field with label 邮箱', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const emailInput = screen.getByLabelText(/邮箱/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
  });

  it('renders password input field with label 密码 and minLength 8', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const passwordInput = screen.getByLabelText(/密码/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  it('renders sign in button with formAction', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const signInButton = screen.getByRole('button', { name: /登录/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('formAction');
    expect(signInButton).toHaveAttribute('type', 'submit');
  });

  it('renders sign up button with formAction', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const signUpButton = screen.getByRole('button', { name: /注册/i });
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveAttribute('formAction');
    expect(signUpButton).toHaveAttribute('type', 'submit');
  });

  it('passes default redirectUrl /me to LoginForm when no query param', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const loginForm = screen.getByTestId('login-form');
    expect(loginForm).toHaveAttribute('data-redirect-url', '/me');
  });

  it('passes redirect query param value to LoginForm', async () => {
    const searchParams = Promise.resolve({ redirect: '/translator' });
    render(await LoginPage({ searchParams }));
    const loginForm = screen.getByTestId('login-form');
    expect(loginForm).toHaveAttribute('data-redirect-url', '/translator');
  });

  it('renders hidden redirectTo input with default value /me', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const hiddenInput = document.querySelector('input[type="hidden"][name="redirectTo"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('value', '/me');
  });

  it('renders hidden redirectTo input with redirect query param value', async () => {
    const searchParams = Promise.resolve({ redirect: '/dashboard' });
    render(await LoginPage({ searchParams }));
    const hiddenInput = document.querySelector('input[type="hidden"][name="redirectTo"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('value', '/dashboard');
  });

  it('renders email placeholder', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toBeInTheDocument();
  });

  it('renders password placeholder', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toBeInTheDocument();
  });
});
