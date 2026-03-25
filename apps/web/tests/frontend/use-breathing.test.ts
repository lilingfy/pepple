import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** 手动控制 animation promise 的辅助 */
function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => { resolve = r; });
  return { promise, resolve };
}

const mockStop = vi.fn();
let currentDeferred = createDeferred();

vi.mock('framer-motion', () => ({
  useAnimation: () => ({
    start: vi.fn().mockImplementation(() => {
      currentDeferred = createDeferred();
      return currentDeferred.promise;
    }),
    stop: mockStop,
  }),
}));

import { useBreathing } from '@/hooks/useBreathing';

describe('useBreathing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockStop.mockClear();
    currentDeferred = createDeferred();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态为 idle，isActive 为 false', () => {
    const { result } = renderHook(() => useBreathing());
    expect(result.current.phase).toBe('idle');
    expect(result.current.isActive).toBe(false);
  });

  it('start() 同步设置 isActive=true，phase=inhale', () => {
    const { result } = renderHook(() => useBreathing());
    act(() => {
      result.current.start();
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.phase).toBe('inhale');
  });

  it('inhale 动画完成后进入 hold', async () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    expect(result.current.phase).toBe('inhale');

    // 手动完成 inhale 动画
    await act(async () => { currentDeferred.resolve(); });
    expect(result.current.phase).toBe('hold');
  });

  it('hold 阶段经过 7000ms 进入 exhale', async () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    // 完成 inhale → 进入 hold
    await act(async () => { currentDeferred.resolve(); });
    expect(result.current.phase).toBe('hold');

    // 推进 hold 定时器
    await act(async () => {
      vi.advanceTimersByTime(7000);
      await vi.runAllTicks();
    });
    expect(result.current.phase).toBe('exhale');
  });

  it('exhale 动画完成后循环回到 inhale', async () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    await act(async () => { currentDeferred.resolve(); }); // inhale → hold
    await act(async () => {
      vi.advanceTimersByTime(7000);
      await vi.runAllTicks();
    }); // hold → exhale
    await act(async () => { currentDeferred.resolve(); }); // exhale → inhale
    expect(result.current.phase).toBe('inhale');
  });

  it('reset() 立即回到 idle，isActive=false', async () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    act(() => { result.current.reset(); });
    expect(result.current.phase).toBe('idle');
    expect(result.current.isActive).toBe(false);
  });

  it('reset() 调用 controls.stop()', () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    act(() => { result.current.reset(); });
    expect(mockStop).toHaveBeenCalled();
  });

  it('已在运行中再次 start() 不新增循环', () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    const phaseBefore = result.current.phase;
    act(() => { result.current.start(); }); // 应被忽略
    expect(result.current.phase).toBe(phaseBefore);
    expect(result.current.isActive).toBe(true);
  });

  it('reset 后再次 start() 可正常启动新循环', () => {
    const { result } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    act(() => { result.current.reset(); });
    act(() => { result.current.start(); });
    expect(result.current.isActive).toBe(true);
    expect(result.current.phase).toBe('inhale');
  });

  it('组件卸载后循环自动终止（不抛 setState 错误）', async () => {
    const { result, unmount } = renderHook(() => useBreathing());
    act(() => { result.current.start(); });
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(30000);
      await vi.runAllTicks();
    });
  });
});
