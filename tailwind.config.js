/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        drive: {
          bg: '#0b1220',
          surface: '#152033',
          border: '#243247',
          muted: '#8b9bb4',
          accent: '#22c55e',
          accentDim: '#16a34a',
          warn: '#f59e0b',
          danger: '#ef4444',
          info: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};
