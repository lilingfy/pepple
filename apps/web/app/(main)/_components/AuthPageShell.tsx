import type { ReactNode } from "react";

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthPageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F0F6F2] via-white to-[#E8F0EA] px-4 py-12 text-[#2C3E50]">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-pebble bg-[#A8D8B9]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-pebble bg-[#7D8C9F]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-28 w-28 -translate-x-1/2 rounded-pebble border border-white/70 bg-white/25 shadow-glass" />

      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden lg:block">
            <div className="pebble-glass relative overflow-hidden rounded-[2rem] p-8 shadow-glass">
              <div className="mb-10 inline-flex h-16 w-16 items-center justify-center rounded-pebble bg-gradient-to-br from-[#A8D8B9] to-[#7D8C9F] text-2xl font-bold text-white shadow-glow">
                P
              </div>
              <p className="mb-4 text-sm font-semibold tracking-[0.28em] text-[#7D8C9F]">
                PEBBLE AI
              </p>
              <h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-[#2C3E50]">
                给情绪留一块柔软的缓冲地带
              </h2>
              <p className="max-w-sm text-base leading-8 text-slate-600">
                登录后保存关系档案、练习记录与个人偏好，让每一次分析都更贴近你的真实语境。
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3 text-sm text-[#7D8C9F]">
                <div className="rounded-2xl bg-white/55 p-4">匿名体验保留</div>
                <div className="rounded-2xl bg-white/55 p-4">邮箱密码登录</div>
                <div className="rounded-2xl bg-white/55 p-4">关系档案同步</div>
                <div className="rounded-2xl bg-white/55 p-4">安全路由保护</div>
              </div>
            </div>
          </aside>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-7 text-center lg:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#7D8C9F]">
                {eyebrow}
              </p>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C3E50]">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-glass backdrop-blur-xl sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
