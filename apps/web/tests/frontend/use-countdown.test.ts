import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from '@/hooks/useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始 formattedTime 为 01:59，isRunning=false，isComplete=false', () => {
    const { result } = renderHook(() => useCountdown(119));
    expect(result.current.formattedTime).toBe('01:59');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('start() 后 isRunning 变为 true', () => {
    const { result } = renderHook(() => useCountdown(119));
    act(() => { result.current.start(); });
    expect(result.current.isRunning).toBe(true);
  });

  it('每隔 1s 倒计时递减 1 秒', () => {
    const { result } = renderHook(() => useCountdown(119));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('01:58');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('01:57');
  });

  it('分钟借位正确（01:00 → 00:59）', () => {
    const { result } = renderHook(() => useCountdown(60));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('00:59');
  });

  it('到达 00:00 时 isComplete=true，isRunning=false', () => {
    const { result } = renderHook(() => useCountdown(1));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('00:00');
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('倒计时到零后继续推进不出现负数', () => {
    const { result } = renderHook(() => useCountdown(1));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.formattedTime).toBe('00:00');
  });

  it('reset() 归位到初始值，isRunning=false，isComplete=false', () => {
    const { result } = renderHook(() => useCountdown(119));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { result.current.reset(); });
    expect(result.current.formattedTime).toBe('01:59');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('reset() 后再次 start() 正常倒计时', () => {
    const { result } = renderHook(() => useCountdown(119));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(10000); });
    act(() => { result.current.reset(); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.formattedTime).toBe('01:57');
  });

  it('组件卸载后 interval 自动清除（无错误）', () => {
    const { result, unmount } = renderHook(() => useCountdown(119));
    act(() => { result.current.start(); });
    unmount();
    act(() => { vi.advanceTimersByTime(5000); });
  });
});
