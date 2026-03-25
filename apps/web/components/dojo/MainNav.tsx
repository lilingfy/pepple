'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/translator', label: '读心翻译' },
    { href: '/dojo', label: '模拟陪练', active: true },
    { href: '/breathing', label: '急救呼吸' },
  ];

  return (
    <header className="fixed w-full z-50 px-8 py-6 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-white/40">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-4 cursor-pointer group">
        <div className="w-10 h-10 bg-pebble-rock rounded-[60%_40%_70%_30%/_40%_50%_60%_40%] group-hover:bg-safe-green group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
        <span className="text-2xl font-medium tracking-[0.2em] text-pebble-rock group-hover:text-safe-green transition-colors duration-500">
          Pebble AI
        </span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-3 bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-7 py-3 rounded-full text-base tracking-widest transition-all duration-300 relative ${
              pathname === item.href || item.active
                ? 'font-bold text-slate-800 bg-safe-green/20'
                : 'font-light text-pebble-rock hover:bg-safe-green/20 hover:text-slate-800 hover:font-bold'
            }`}
          >
            {item.label}
            {(pathname === item.href || item.active) && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-safe-green rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* Right side icons */}
      <div className="flex items-center space-x-6 text-pebble-rock">
        <button
          className="hover:text-safe-green transition-colors relative"
          title="系统通知"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-400 rounded-full" />
        </button>
        <div
          className="w-10 h-10 rounded-full bg-pebble-rock/20 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-safe-green transition-all overflow-hidden border border-white/40"
          title="个人中心"
        >
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  );
}
