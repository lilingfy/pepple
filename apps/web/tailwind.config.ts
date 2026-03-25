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
          DEFAULT: '#7D8C9F',
          600: '#6B7A90',
          700: '#5C697C',
        },
        'background-light': '#F0F6F2',
        'background-dark': '#17191B',
        'storm-bg': '#EEF2F5',
        'shelter-bg': '#FFFFFF',
        'insight-bg': '#E6F2ED',
        'insight-text': '#2D6A4F',
        // 设计稿专用颜色
        'safe-green': '#A8D8B9',
        'moss-green': '#D5E5D5',
        'accent-gold': '#E6B422',
        'deep-heal-green': '#8BA895',
        'pebble-rock': '#7D8C9F',
        'pebble-healing': '#A8D8B9',
        'pebble-bg': '#F0F6F2',
        'pebble-accent': '#BCA564',
        'pebble-warn': '#E07A5F',
        'pebble-text': '#2C3E50',
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
