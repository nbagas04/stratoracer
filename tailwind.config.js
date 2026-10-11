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
          bg: '#0d1117',
          surface: '#161b22',
          panel: '#1c2128',
          panelHover: '#21262d',
          border: '#30363d',
          borderLight: '#3d444d',
          accent: '#38bdf8',
          accentMuted: 'rgba(56, 189, 248, 0.12)',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      }
    },
  },
  plugins: [],
}
