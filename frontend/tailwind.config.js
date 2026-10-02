/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#e11d48',
          container: '#be123c',
          hover: '#be123c',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          canvas: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
          low: '#eff4ff',
          'container-low': '#eff4ff',
        },
        'text-primary': '#0b1329',
        'text-muted': '#64748b',
        secondary: '#565e74',
        'border-subtle': '#e2e8f0',
        'border-strong': '#cbd5e1',
        success: '#10b981',
        warning: '#f59e0b',
        brand: {
          red: "#E5322D",
          hoverRed: "#C62828",
          darkRed: "#B71C1C",
          bgLight: "#F4F5F7",
          textDark: "#161616",
          textMuted: "#666666"
        }
      }
    },
  },
  plugins: [],
}
