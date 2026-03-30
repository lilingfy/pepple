/**
 * LoginForm Tests
 * TDD: Tests for client form component with real useActionState handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import LoginForm from '@/app/(main)/login/LoginForm';

// Mock the server actions
const mockSignInAction = vi.fn();
const mockSignUpAction = vi.fn();

vi.mock('@/app/(main)/login/actions', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
  signUpAction: (...args: unknown[]) => mockSignUpAction(...args),
  INITIAL_STATE: { error: null, message: null },
  AuthFormState: {},
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInAction.mockResolvedValue({ error: null, message: null });
    mockSignUpAction.mockResolvedValue({ error: null, message: null });
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

  it('renders sign up button', () => {
    render(<LoginForm redirectUrl="/me" />);
    const signUpButton = screen.getByRole('button', { name: /注册/i });
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveAttribute('type', 'submit');
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

  it('displays sign-up verification message when sign-up succeeds without session', async () => {
    mockSignUpAction.mockResolvedValue({ 
      error: null, 
      message: '注册成功，请先完成邮箱验证后再登录。' 
    });

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signUpButton = screen.getByRole('button', { name: /注册/i });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱验证/)).toBeInTheDocument();
    });
  });

  it('shows latest sign-up result even when previous sign-in had error', async () => {
    // First, sign-in fails
    mockSignInAction.mockResolvedValue({ 
      error: 'Sign in failed', 
      message: null 
    });

    const { rerender } = render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    // Submit sign-in (fails)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    await waitFor(() => {
      expect(screen.getByText('Sign in failed')).toBeInTheDocument();
    });

    // Now sign-up succeeds - should show sign-up message, not old sign-in error
    mockSignUpAction.mockResolvedValue({ 
      error: null, 
      message: '注册成功，请先完成邮箱验证后再登录。' 
    });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /注册/i }));

    await waitFor(() => {
      expect(screen.getByText(/邮箱验证/)).toBeInTheDocument();
      expect(screen.queryByText('Sign in failed')).not.toBeInTheDocument();
    });
  });

  it('shows latest sign-in result even when previous sign-up had error', async () => {
    // First, sign-up fails
    mockSignUpAction.mockResolvedValue({ 
      error: 'Email already exists', 
      message: null 
    });

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    // Submit sign-up (fails)
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /注册/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    // Now sign-in succeeds (redirects, but before that shows no error)
    mockSignInAction.mockResolvedValue({ 
      error: null, 
      message: null 
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    await waitFor(() => {
      // The old sign-up error should be gone
      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
    });
  });

  it('disables both buttons while sign-in is pending', async () => {
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
    const signUpButton = screen.getByRole('button', { name: /注册/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    // Both buttons should be disabled while pending
    await waitFor(() => {
      expect(signInButton).toBeDisabled();
      expect(signUpButton).toBeDisabled();
    });

    // Resolve the action
    resolveAction!({ error: null, message: null });
  });

  it('disables both buttons while sign-up is pending', async () => {
    // Create a delayed promise to keep pending state
    let resolveAction: (value: { error: null; message: null }) => void;
    const actionPromise = new Promise<{ error: null; message: null }>((resolve) => {
      resolveAction = resolve;
    });
    mockSignUpAction.mockReturnValue(actionPromise);

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signInButton = screen.getByRole('button', { name: /登录/i });
    const signUpButton = screen.getByRole('button', { name: /注册/i });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    // Both buttons should be disabled while pending
    await waitFor(() => {
      expect(signInButton).toBeDisabled();
      expect(signUpButton).toBeDisabled();
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

  it('shows loading state on sign-up button while signing up', async () => {
    let resolveAction: (value: { error: null; message: null }) => void;
    const actionPromise = new Promise<{ error: null; message: null }>((resolve) => {
      resolveAction = resolve;
    });
    mockSignUpAction.mockReturnValue(actionPromise);

    render(<LoginForm redirectUrl="/me" />);
    
    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const signUpButton = screen.getByRole('button', { name: /注册/i });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText('注册中...')).toBeInTheDocument();
    });

    resolveAction!({ error: null, message: null });
  });
});
