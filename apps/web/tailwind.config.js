/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        carbon: {
          950: '#09090b',
          900: '#111114',
          850: '#151519',
          800: '#18181b',
          750: '#1f1f23',
          700: '#27272a',
          600: '#3f3f46',
        },
        motorsport: {
          red: '#dc2626',
          crimson: '#ef4444',
          darkRed: '#991b1b',
          black: '#09090b',
          card: '#111114',
          white: '#ffffff',
          silver: '#e4e4e7',
          steel: '#27272a',
        },
        zinc: {
          400: '#27272a',
          500: '#18181b',
        }
      }
    },
  },
  plugins: [],
}
