import { describe, expect, it } from 'vitest';

import {
  pebbleColors,
  pebbleFonts,
  pebbleMotionDurations,
  pebbleRadii,
  pebbleShadows,
  pebbleSpacing,
} from '@/lib/design-system/tokens';

describe('Pebble design tokens', () => {
  it('exports the core color tokens', () => {
    expect(pebbleColors.rock).toBe('#7D8C9F');
    expect(pebbleColors.healing).toBe('#A8D8B9');
    expect(pebbleColors.background).toBe('#F0F6F2');
    expect(pebbleColors.accent).toBe('#BCA564');
    expect(pebbleColors.warn).toBe('#E07A5F');
    expect(pebbleColors.text).toBe('#2C3E50');
  });

  it('exports the core font tokens', () => {
    expect(pebbleFonts.serif).toContain('Noto Serif SC');
    expect(pebbleFonts.sans).toContain('Noto Sans SC');
    expect(pebbleFonts.display).toContain('Public Sans');
  });

  it('exports pebble radii, shadows, spacing, and motion durations', () => {
    expect(pebbleRadii.pebble).toContain('60% 40% 70% 30%');
    expect(pebbleShadows.glass).toContain('rgba');
    expect(pebbleSpacing.section).toBe('2rem');
    expect(pebbleMotionDurations.gentle).toBe('200ms');
  });
});
