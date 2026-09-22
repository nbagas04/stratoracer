/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        race: {
          bg: '#090c10',
          surface: '#0f141c',
          panel: '#151b26',
          panelHover: '#1a2230',
          border: '#212a3b',
          borderLight: '#2c374d',
          accent: '#00f0ff',
          accentGlow: 'rgba(0, 240, 255, 0.15)',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      }
    },
  },
  plugins: [],
}
