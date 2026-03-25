import Link from 'next/link';

const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '读心翻译', href: '/translator' },
  { label: '模拟陪练', href: '/dojo' },
  { label: '急救呼吸', href: '/breathing' },
] as const;

export function Navigation() {
  return (
    <header className="fixed w-full z-50 px-8 py-6 flex justify-between items-center bg-[#F0F6F2]/60 backdrop-blur-xl border-b border-white/40">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-4 group"
        aria-label="Pebble AI 首页"
      >
        <div
          className="w-10 h-10 rounded-[60%_40%_70%_30%/_40%_50%_60%_40%] bg-[#7D8C9F] group-hover:bg-[#A8D8B9] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
          aria-hidden="true"
        />
        <span className="text-2xl font-medium tracking-[0.2em] text-[#7D8C9F] group-hover:text-[#A8D8B9] transition-colors duration-500">
          Pebble AI
        </span>
      </Link>

      {/* 主导航 */}
      <nav aria-label="主导航" className="flex items-center gap-1 bg-white/40 px-3 py-1.5 rounded-full border border-white/60 shadow-sm max-md:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-7 py-3 rounded-full text-base tracking-widest transition-all duration-300 relative ${
                isActive
                  ? 'font-bold text-[#2C3E50] bg-[#A8D8B9]/20'
                  : 'font-light text-[#7D8C9F] hover:bg-[#A8D8B9]/20 hover:text-[#2C3E50] hover:font-medium'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#A8D8B9] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <Link href="/translator">
        <button className="px-8 py-3.5 bg-white text-[#7D8C9F] text-sm font-medium tracking-widest hover:bg-[#A8D8B9] hover:text-white hover:shadow-lg hover:shadow-[#A8D8B9]/30 transition-all duration-500 rounded-full border border-[#A8D8B9]/30">
          开启防御
        </button>
      </Link>
    </header>
  );
}
