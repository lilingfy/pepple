/**
 * Login Page Tests
 * TDD: Tests for server component login page with client LoginForm
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/(main)/login/page';
import RegisterPage from '@/app/(main)/register/page';

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
        <a href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}>去注册</a>
      </form>
    </div>
  ),
}));

// Mock the RegisterForm client component
vi.mock('@/app/(main)/register/RegisterForm', () => ({
  default: ({ redirectUrl }: { redirectUrl: string }) => (
    <div data-testid="register-form" data-redirect-url={redirectUrl}>
      <form>
        <input type="hidden" name="redirectTo" value={redirectUrl} />
        <label htmlFor="email">邮箱</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" />
        <label htmlFor="password">密码</label>
        <input id="password" name="password" type="password" minLength={8} placeholder="创建一个安全密码" />
        <button type="submit" formAction="signUpAction">创建账号</button>
        <a href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>返回登录</a>
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

  it('renders register link instead of inline sign up button', async () => {
    const searchParams = Promise.resolve({});
    render(await LoginPage({ searchParams }));
    const registerLink = screen.getByRole('link', { name: /去注册/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register?redirect=%2Fme');
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

describe('RegisterPage', () => {
  it('renders heading with 注册 Pebble AI', async () => {
    const searchParams = Promise.resolve({});
    render(await RegisterPage({ searchParams }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('注册 Pebble AI');
  });

  it('passes default redirectUrl /me to RegisterForm when no query param', async () => {
    const searchParams = Promise.resolve({});
    render(await RegisterPage({ searchParams }));
    const registerForm = screen.getByTestId('register-form');
    expect(registerForm).toHaveAttribute('data-redirect-url', '/me');
  });

  it('passes redirect query param value to RegisterForm', async () => {
    const searchParams = Promise.resolve({ redirect: '/translator' });
    render(await RegisterPage({ searchParams }));
    const registerForm = screen.getByTestId('register-form');
    expect(registerForm).toHaveAttribute('data-redirect-url', '/translator');
  });

  it('renders create account button with formAction', async () => {
    const searchParams = Promise.resolve({});
    render(await RegisterPage({ searchParams }));
    const createAccountButton = screen.getByRole('button', { name: /创建账号/i });
    expect(createAccountButton).toBeInTheDocument();
    expect(createAccountButton).toHaveAttribute('formAction');
    expect(createAccountButton).toHaveAttribute('type', 'submit');
  });

  it('renders return to login link with redirect param', async () => {
    const searchParams = Promise.resolve({ redirect: '/dojo' });
    render(await RegisterPage({ searchParams }));
    const loginLink = screen.getByRole('link', { name: /返回登录/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login?redirect=%2Fdojo');
  });
});
