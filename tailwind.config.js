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
        // Calm "slate blue + mist" study palette. Deep navy ink on a cool misty
        // paper, with a single serene slate-blue accent. Blue is the color most
        // associated with focus and low visual fatigue — restful for long study
        // sessions and, crucially, high-contrast (navy text never blends into
        // the light background the way the old warm scheme did).
        ink: {
          DEFAULT: '#1e2a38', // deep navy ink — strong contrast on paper
          soft: '#3a4a5c', // muted navy
          muted: '#647587', // slate-500-ish for secondary text
        },
        paper: {
          DEFAULT: '#f3f5f8', // cool misty background
          raised: '#ffffff',
          sunken: '#e7ecf2', // soft blue-gray for cards / sunken surfaces
        },
        // Slate-blue accent scale (replaces the old amber "ember"). Kept under
        // the `ember` token name so the whole app picks it up without touching
        // every className. 500 is the confident, calm accent.
        ember: {
          50: '#eef3f8',
          100: '#d9e3ee',
          200: '#bacadd',
          300: '#90a9c6',
          400: '#6a88ab',
          500: '#4a6c86',
          600: '#3a5670',
          700: '#2d4459',
        },
        // Cool navy dark mode: deep slate base + soft off-white text for
        // low-glare night study. Kept under the `sepia` token name.
        sepia: {
          50: '#eef2f7', // near-white cool text
          100: '#e2e8f0', // primary text on dark
          200: '#cbd5e1', // secondary text
          300: '#94a3b8', // muted text
          400: '#33445a', // hairline border
          500: '#3f5169', // stronger border
          600: '#16202e', // input / inset surface
          700: '#1c2836', // card surface
          800: '#1a2531', // raised surface
          900: '#141e29', // page background
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,42,56,0.05), 0 8px 24px -12px rgba(30,42,56,0.20)',
        lift: '0 2px 4px rgba(30,42,56,0.06), 0 18px 40px -16px rgba(30,42,56,0.30)',
      },
    },
  },
  plugins: [],
}
