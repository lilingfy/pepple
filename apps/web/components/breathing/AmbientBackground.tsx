/** 全屏浮动背景色块，纯视觉无状态。 */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
        style={{ background: 'rgba(168,216,185,0.12)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full motion-safe:animate-[pulse_14s_ease-in-out_infinite_2s]"
        style={{ background: 'rgba(125,140,159,0.08)', filter: 'blur(60px)' }}
      />
    </div>
  );
}
