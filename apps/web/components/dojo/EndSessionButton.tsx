'use client';

import { useRouter } from 'next/navigation';
import { useDojoStore } from '@/store/dojo-store';

export function EndSessionButton() {
  const router = useRouter();
  const { endSession, sessionStatus, isTyping } = useDojoStore();

  const handleEnd = async () => {
    if (sessionStatus !== 'active') return;
    await endSession();
    // 结束会话后返回首页
    router.push('/');
  };

  return (
    <button
      onClick={handleEnd}
      disabled={sessionStatus !== 'active' || isTyping}
      className="mt-auto w-full py-4 bg-primary text-white rounded-full font-bold tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 group duration-300 ease-smooth hover:-translate-y-1 hover:scale-105 hover:bg-deep-heal-green hover:shadow-hover-spread disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
    >
      <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">flag</span>
      结束演练
    </button>
  );
}
