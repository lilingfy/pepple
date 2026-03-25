/**
 * 呼吸状态机纯逻辑层
 *
 * 与 React 无关，可在无 DOM 环境直接单测。
 */

/** 呼吸阶段枚举 */
export type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

/**
 * 4-7-8 呼吸节奏时序常量（毫秒）
 * - inhale: 4s 吸气，激活副交感神经
 * - hold:   7s 屏息，让氧气充分进入血液
 * - exhale: 8s 呼气，排出二氧化碳，放松身心
 */
export const BREATHING_CYCLE: Readonly<Record<Exclude<BreathingPhase, 'idle'>, number>> = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
};

/**
 * 返回当前阶段的下一个运行阶段（循环：inhale → hold → exhale → inhale）
 * idle 不参与循环，调用方负责在 idle 时以 inhale 启动
 */
export function nextPhase(phase: Exclude<BreathingPhase, 'idle'>): Exclude<BreathingPhase, 'idle'> {
  const sequence: Array<Exclude<BreathingPhase, 'idle'>> = ['inhale', 'hold', 'exhale'];
  const idx = sequence.indexOf(phase);
  return sequence[(idx + 1) % sequence.length];
}
