import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C1694F',
          light: '#F5E6E0',
          dark: '#9A4A35',
        },
        cream: {
          DEFAULT: '#F0EBE3',
          dark: '#E8E0D6',
        },
        ink: {
          DEFAULT: '#2D2D2D',
          mid: '#6B6B6B',
          light: '#9A9A9A',
        },
        sage: {
          DEFAULT: '#4A7C6F',
          light: '#E0EDEB',
          dark: '#2D5A50',
        },
        parchment: '#FAF8F4',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        input: '8px',
        card: '12px',
      },
    },
  },
  plugins: [],
}

export default config
