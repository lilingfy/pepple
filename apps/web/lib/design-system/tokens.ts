export const pebbleColors = {
  rock: '#7D8C9F',
  healing: '#A8D8B9',
  background: '#F0F6F2',
  accent: '#BCA564',
  warn: '#E07A5F',
  text: '#2C3E50',
  shelter: '#FFFFFF',
  storm: '#EEF2F5',
  insight: '#E6F2ED',
} as const;

export const pebbleFonts = {
  serif: "'Noto Serif SC', serif",
  sans: "'Noto Sans SC', sans-serif",
  display: "'Public Sans', sans-serif",
} as const;

export const pebbleRadii = {
  pebble: '60% 40% 70% 30% / 40% 50% 60% 40%',
  pebble1: '2rem 3rem 2.5rem 4rem',
  pebble2: '4rem 2rem 3.5rem 2.5rem',
  pebble3: '3rem 4rem 2rem 3.5rem',
  pill: '9999px',
} as const;

export const pebbleShadows = {
  glass: '0 20px 50px rgba(125, 140, 159, 0.16)',
  soft: '0 8px 24px rgba(125, 140, 159, 0.12)',
  glow: '0 0 0 1px rgba(255, 255, 255, 0.35), 0 16px 40px rgba(168, 216, 185, 0.2)',
} as const;

export const pebbleSpacing = {
  page: '1.5rem',
  section: '2rem',
  card: '1.5rem',
  stack: '1rem',
} as const;

export const pebbleMotionDurations = {
  brisk: '120ms',
  gentle: '200ms',
  reveal: '320ms',
  ambient: '600ms',
} as const;

export const pebbleCssVariables = {
  '--color-pebble-rock': pebbleColors.rock,
  '--color-pebble-healing': pebbleColors.healing,
  '--color-pebble-bg': pebbleColors.background,
  '--color-pebble-accent': pebbleColors.accent,
  '--color-pebble-warn': pebbleColors.warn,
  '--color-pebble-text': pebbleColors.text,
  '--color-pebble-shelter': pebbleColors.shelter,
  '--color-pebble-storm': pebbleColors.storm,
  '--color-pebble-insight': pebbleColors.insight,
  '--font-pebble-serif': pebbleFonts.serif,
  '--font-pebble-sans': pebbleFonts.sans,
  '--font-pebble-display': pebbleFonts.display,
  '--radius-pebble': pebbleRadii.pebble,
  '--radius-pebble-1': pebbleRadii.pebble1,
  '--radius-pebble-2': pebbleRadii.pebble2,
  '--radius-pebble-3': pebbleRadii.pebble3,
  '--radius-pebble-pill': pebbleRadii.pill,
  '--shadow-pebble-glass': pebbleShadows.glass,
  '--shadow-pebble-soft': pebbleShadows.soft,
  '--shadow-pebble-glow': pebbleShadows.glow,
  '--motion-pebble-brisk': pebbleMotionDurations.brisk,
  '--motion-pebble-gentle': pebbleMotionDurations.gentle,
  '--motion-pebble-reveal': pebbleMotionDurations.reveal,
  '--motion-pebble-ambient': pebbleMotionDurations.ambient,
} as const;
