"use client";

import { useActionState, useRef } from "react";
import { signInAction, signUpAction, INITIAL_STATE, AuthFormState } from "./actions";

interface LoginFormProps {
  redirectUrl: string;
}

type ActionType = 'signIn' | 'signUp' | null;

export default function LoginForm({ redirectUrl }: LoginFormProps) {
  const lastActionRef = useRef<ActionType>(null);

  const [signInState, signInFormAction, isSignInPending] = useActionState<AuthFormState, FormData>(
    async (state, formData) => {
      lastActionRef.current = 'signIn';
      return signInAction(state, formData);
    },
    INITIAL_STATE
  );

  const [signUpState, signUpFormAction, isSignUpPending] = useActionState<AuthFormState, FormData>(
    async (state, formData) => {
      lastActionRef.current = 'signUp';
      return signUpAction(state, formData);
    },
    INITIAL_STATE
  );

  // Determine which state to display based on which action was most recently submitted
  const displayState = lastActionRef.current === 'signIn' ? signInState : 
                       lastActionRef.current === 'signUp' ? signUpState : 
                       { error: null, message: null };
  const isPending = isSignInPending || isSignUpPending;

  return (
    <form className="mt-8 space-y-6">
      <input type="hidden" name="redirectTo" value={redirectUrl} />

      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      {displayState.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{displayState.error}</p>
        </div>
      )}

      {displayState.message && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{displayState.message}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          formAction={signInFormAction}
          disabled={isPending}
          className="flex-1 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSignInPending ? "登录中..." : "登录"}
        </button>
        <button
          type="submit"
          formAction={signUpFormAction}
          disabled={isPending}
          className="flex-1 justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSignUpPending ? "注册中..." : "注册"}
        </button>
      </div>
    </form>
  );
}
