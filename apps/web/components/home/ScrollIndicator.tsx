'use client';

/**
 * 滚动指示器组件
 * 显示在 Hero 区块底部，提示用户向下滚动
 */
export function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 scroll-indicator">
      <div className="w-0.5 h-10 bg-[#A8D8B9] animate-scroll-line" />
    </div>
  );
}
