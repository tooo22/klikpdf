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
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#b80035',
          container: '#be123c',
          hover: '#920028',
        },
        "crimson-primary": "#E11D48",
        "crimson-dark": "#BE123C",
        "crimson-glow": "#FFE4E6",
        "navy-deep": "#0F172A",
        "navy-banner": "#1E1B4B",
        "tertiary": "#006847",
        "tertiary-container": "#00845a",
        "secondary": "#5b598c",
        "surface-card": "#FFFFFF",
        "surface-bg": "#F8FAFC",
        "surface-bright": "#f8f9ff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#0b1c30",
        "on-background": "#0b1c30",
        "success-emerald": "#10B981",
        "coral-accent": "#EF4444",
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
        'border-subtle': 'rgba(226, 232, 240, 0.8)',
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
