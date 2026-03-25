export function Footer() {
  return (
    <footer role="contentinfo" className="bg-white/80 backdrop-blur-md py-12 px-8 border-t border-white relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 tracking-widest uppercase">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-4 h-4 bg-[#A8D8B9] rounded-[60%_40%_70%_30%/_40%_50%_60%_40%]" />
          <span>© 2026 PEBBLE AI EMOTION DEFENSE. 本地化存储，隐私优先。</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-[#A8D8B9] transition">隐私政策</a>
          <a href="#" className="hover:text-[#A8D8B9] transition">使用条款</a>
        </div>
      </div>
    </footer>
  );
}
