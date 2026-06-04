import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RegisterForm from '@/app/(main)/register/RegisterForm';

const mockSignUpAction = vi.fn();

vi.mock('@/app/(main)/login/actions', () => ({
  signUpAction: (...args: unknown[]) => mockSignUpAction(...args),
}));

describe('RegisterForm', () => {
  it('binds the server action to the form instead of the submit button', () => {
    render(<RegisterForm redirectUrl="/me" />);

    const form = screen.getByTestId('register-form');
    const submitButton = screen.getByRole('button', { name: /创建账号/i });

    expect(form).toHaveAttribute('action');
    expect(submitButton).not.toHaveAttribute('formAction');
  });
});
