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
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        success: {
          100: "#dcfce7",
          300: "#86efac",
          700: "#15803d",
        },
        warning: {
          100: "#fef3c7",
          300: "#fcd34d",
          700: "#b45309",
        },
      },

      boxShadow: {
        smooth: "0 4px 14px rgba(0, 0, 0, 0.08)",
        "smooth-lg": "0 10px 25px rgba(0, 0, 0, 0.12)",
        glow: "0 0 15px rgba(14, 165, 233, 0.5)",
      },

      transitionDuration: {
        350: "350ms",
      },
    },
  },
  plugins: [],
}
