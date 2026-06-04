/**
 * LoginForm Tests
 * TDD: Tests for client form component with real useActionState handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import LoginForm from '@/app/(main)/login/LoginForm';

// Mock the server actions
const mockSignInAction = vi.fn();

vi.mock('@/app/(main)/login/actions', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
  INITIAL_STATE: { error: null, message: null },
  AuthFormState: {},
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInAction.mockResolvedValue({ error: null, message: null });
  });

  // --- Rendering Tests ---
  it('renders email input with label 邮箱', () => {
    render(<LoginForm redirectUrl="/me" />);
    const emailInput = screen.getByLabelText(/邮箱/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
  });

  it('renders password input with label 密码 and minLength 8', () => {
    render(<LoginForm redirectUrl="/me" />);
    const passwordInput = screen.getByLabelText(/密码/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  it('renders hidden redirectTo input', () => {
    render(<LoginForm redirectUrl="/dashboard" />);
    const hiddenInput = screen.getByDisplayValue('/dashboard');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('type', 'hidden');
    expect(hiddenInput).toHaveAttribute('name', 'redirectTo');
  });

  it('renders sign in button', () => {
    render(<LoginForm redirectUrl="/me" />);
    const signInButton = screen.getByRole('button', { name: /登录/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('type', 'submit');
  });

  it('renders register link', () => {
    render(<LoginForm redirectUrl="/me" />);
    const registerLink = screen.getByRole('link', { name: /去注册/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register?redirect=%2Fme');
  });

  it('renders email placeholder', () => {
    render(<LoginForm redirectUrl="/me" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders password placeholder', () => {
    render(<LoginForm redirectUrl="/me" />);
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  // --- State Handling Tests ---
  it('displays sign-in error when sign-in fails', async () => {
    mockSignInAction.mockResolvedValue({ 
      error: 'Invalid credentials', 
      message: null 
    });

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signInButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables sign-in button while sign-in is pending', async () => {
    // Create a delayed promise to keep pending state
    let resolveAction: (value: { error: null; message: null }) => void;
    const actionPromise = new Promise<{ error: null; message: null }>((resolve) => {
      resolveAction = resolve;
    });
    mockSignInAction.mockReturnValue(actionPromise);

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signInButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    // Button should be disabled while pending
    await waitFor(() => {
      expect(signInButton).toBeDisabled();
    });

    // Resolve the action
    resolveAction!({ error: null, message: null });
  });

  it('shows loading state on sign-in button while signing in', async () => {
    let resolveAction: (value: { error: null; message: null }) => void;
    const actionPromise = new Promise<{ error: null; message: null }>((resolve) => {
      resolveAction = resolve;
    });
    mockSignInAction.mockReturnValue(actionPromise);

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signInButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('登录中...')).toBeInTheDocument();
    });

    resolveAction!({ error: null, message: null });
  });
});
