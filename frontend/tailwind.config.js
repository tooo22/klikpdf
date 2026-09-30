/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
