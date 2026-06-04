"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { signUpAction } from "../login/actions";
import { INITIAL_STATE, type AuthFormState } from "../login/state";

interface RegisterFormProps {
  redirectUrl: string;
}

export default function RegisterForm({ redirectUrl }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    INITIAL_STATE,
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
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-medium text-[#2C3E50]">
              密码
            </label>
            <span className="text-xs text-[#7D8C9F]">至少 8 个字符</span>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              className="block w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 pr-12 text-[#2C3E50] placeholder-slate-400 shadow-sm transition focus:border-[#7D8C9F] focus:outline-none focus:ring-2 focus:ring-[#7D8C9F]/20 sm:text-sm"
              placeholder="创建一个安全密码"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-4 inline-flex items-center text-xs font-medium text-[#7D8C9F] transition hover:text-[#5A6A7A]"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? "隐藏" : "显示"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#A8D8B9]/12 p-4 text-sm leading-6 text-slate-600">
        <span className="font-medium text-[#2C3E50]">注册后你可以：</span>
        保存关系档案、同步练习记录，并在个人中心继续管理你的情绪防御工具箱。
      </div>

      {state.error && (
        <div className="rounded-2xl border border-[#E07A5F]/20 bg-[#E07A5F]/10 p-4">
          <p className="text-sm text-[#B95C46]">{state.error}</p>
        </div>
      )}

      {state.message && (
        <div className="rounded-2xl border border-[#A8D8B9]/30 bg-[#A8D8B9]/15 p-4">
          <p className="text-sm text-[#4E8B66]">{state.message}</p>
        </div>
      )}

      <Button
        type="submit"
        formAction={formAction}
        isLoading={isPending}
        loadingLabel="注册中"
        className="w-full py-3"
      >
        {isPending ? "注册中..." : "创建账号"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        已经有账号？
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="ml-1 font-medium text-[#7D8C9F] underline-offset-4 transition hover:text-[#5A6A7A] hover:underline"
        >
          返回登录
        </Link>
      </p>
    </form>
  );
}
