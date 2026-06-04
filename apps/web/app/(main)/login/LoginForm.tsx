"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "./actions";
import { INITIAL_STATE, type AuthFormState } from "./state";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  redirectUrl: string;
}

export default function LoginForm({ redirectUrl }: LoginFormProps) {
  const [signInState, signInFormAction, isSignInPending] = useActionState<AuthFormState, FormData>(
    signInAction,
    INITIAL_STATE
  );

  return (
    <form className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectUrl} />

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#2C3E50]">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-[#2C3E50] placeholder-slate-400 shadow-sm transition focus:border-[#7D8C9F] focus:outline-none focus:ring-2 focus:ring-[#7D8C9F]/20 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#2C3E50]">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-[#2C3E50] placeholder-slate-400 shadow-sm transition focus:border-[#7D8C9F] focus:outline-none focus:ring-2 focus:ring-[#7D8C9F]/20 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      {signInState.error && (
        <div className="rounded-2xl border border-[#E07A5F]/20 bg-[#E07A5F]/10 p-4">
          <p className="text-sm text-[#B95C46]">{signInState.error}</p>
        </div>
      )}

      {signInState.message && (
        <div className="rounded-2xl border border-[#A8D8B9]/30 bg-[#A8D8B9]/15 p-4">
          <p className="text-sm text-[#4E8B66]">{signInState.message}</p>
        </div>
      )}

      <Button
        type="submit"
        formAction={signInFormAction}
        isLoading={isSignInPending}
        loadingLabel="登录中"
        className="w-full py-3"
      >
        {isSignInPending ? "登录中..." : "登录"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        还没有账号？
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
          className="ml-1 font-medium text-[#7D8C9F] underline-offset-4 transition hover:text-[#5A6A7A] hover:underline"
        >
          去注册
        </Link>
      </p>
    </form>
  );
}
