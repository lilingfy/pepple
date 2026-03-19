import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './tests/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          600: '#6B7A90',
          700: '#5C697C',
        },
        'background-light': 'var(--color-bg-light)',
        'background-dark': 'var(--color-bg-dark)',
        'storm-bg': 'var(--color-storm-bg)',
        'shelter-bg': 'var(--color-shelter-bg)',
        'insight-bg': 'var(--color-insight-bg)',
        'insight-text': 'var(--color-insight-text)',
      },
      borderRadius: {
        pebble: 'var(--radius-pebble)',
        'pebble-1': 'var(--radius-pebble-1)',
        'pebble-2': 'var(--radius-pebble-2)',
        'pebble-3': 'var(--radius-pebble-3)',
      },
      boxShadow: {
        glass: 'var(--shadow-pebble-glass)',
        pebble: 'var(--shadow-pebble-soft)',
        glow: 'var(--shadow-pebble-glow)',
      },
      fontFamily: {
        serif: ['var(--font-pebble-serif)'],
        sans: ['var(--font-pebble-sans)'],
        display: ['var(--font-pebble-display)'],
      },
      transitionDuration: {
        brisk: 'var(--motion-pebble-brisk)',
        gentle: 'var(--motion-pebble-gentle)',
        reveal: 'var(--motion-pebble-reveal)',
        ambient: 'var(--motion-pebble-ambient)',
      },
    },
  },
};

export default config;
