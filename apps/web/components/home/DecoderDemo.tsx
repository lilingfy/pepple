'use client';

import { useRouter } from 'next/navigation';

/**
 * 读心翻译器演示组件
 * 展示示例输入、解码结果和灰岩回复建议
 * 点击跳转到读心翻译器页面
 */
export function DecoderDemo() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/translator');
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white/40 backdrop-blur-md p-8 rounded-[40px] shadow-xl shadow-[#A8D8B9]/10 border border-white cursor-pointer hover:shadow-2xl hover:shadow-[#A8D8B9]/20 hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* 点击提示 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#A8D8B9] text-white text-[10px] px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
        点击体验完整功能
      </div>
      {/* 输入示例 */}
      <div className="mb-6">
        <div className="text-[10px] text-gray-500 mb-2 tracking-widest uppercase">对方发来：</div>
        <div className="p-5 bg-white rounded-2xl text-sm italic text-gray-700 shadow-sm border border-gray-100">
          "你连这点小事都做不好，离开我你还能干什么？"
        </div>
      </div>

      {/* 箭头指示 */}
      <div className="flex justify-center my-4">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A8D8B9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 解码结果 */}
      <div>
        <div className="text-[10px] text-[#A8D8B9] mb-2 tracking-widest uppercase font-medium">
          鹅卵石解码与建议：
        </div>
        <div className="p-5 bg-white rounded-2xl text-sm text-[#2C3E50] shadow-sm border border-gray-100">
          {/* 潜台词 */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <span className="text-xs px-2 py-1 bg-[#F0F6F2] text-[#7D8C9F] rounded mb-2 inline-block">
              潜台词
            </span>
            <p className="text-gray-600 mt-1 font-light">
              "我需要通过贬低你来证明我的价值并控制你。" (投射与情感勒索)
            </p>
          </div>

          {/* 灰岩回复建议 */}
          <div>
            <span className="text-xs px-2 py-1 bg-[#F0F6F2] text-[#A8D8B9] rounded mb-2 inline-block">
              灰岩回复建议
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-3 py-1.5 bg-white rounded-lg text-xs border border-gray-200 cursor-pointer hover:border-[#A8D8B9] hover:text-[#A8D8B9] transition-colors">
                极简：嗯。
              </button>
              <button className="px-3 py-1.5 bg-white rounded-lg text-xs border border-gray-200 cursor-pointer hover:border-[#A8D8B9] hover:text-[#A8D8B9] transition-colors">
                温和：那是你的看法。
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
