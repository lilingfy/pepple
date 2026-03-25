/** 环境发光层：两层同心光晕，纯视觉无状态。 */
export function GlowLayer() {
  return (
    <>
      {/* 外层发光 400px */}
      <div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(168,216,185,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* 内层发光 300px */}
      <div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </>
  );
}
