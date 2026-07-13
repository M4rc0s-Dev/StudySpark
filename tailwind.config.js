/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm academic ink + paper palette. Dominant near-black ink with a
        // single confident amber accent — avoids the purple-on-white cliché.
        ink: {
          DEFAULT: '#1c1917', // warm near-black (stone-900)
          soft: '#44403c', // stone-700
          muted: '#78716c', // stone-500
        },
        paper: {
          DEFAULT: '#fafaf9', // stone-50
          raised: '#ffffff',
          sunken: '#f5f5f4', // stone-100
        },
        ember: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Warm sepia dark mode: brown base + off-white text for low-glare
        // reading/study comfort (Kindle-style). Only used via `dark:sepia-*`.
        sepia: {
          50: '#efe6d6', // near-white warm text
          100: '#ece3d4', // primary text on dark sepia
          200: '#d8cbb6', // secondary text
          300: '#b9ab92', // muted text
          400: '#3d3024', // hairline border
          500: '#4d4031', // stronger border
          600: '#211a13', // input / inset surface
          700: '#2f261c', // card surface
          800: '#2a221a', // raised surface
          900: '#241d15', // page background
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -12px rgba(28,25,23,0.18)',
        lift: '0 2px 4px rgba(28,25,23,0.05), 0 18px 40px -16px rgba(28,25,23,0.28)',
      },
    },
  },
  plugins: [],
}
