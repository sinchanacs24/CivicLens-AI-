/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#82abff",
          400: "#4f7fff",
          500: "#2955f5",
          600: "#1c3fce",
          700: "#1830a1",
          800: "#162a80",
          900: "#152668",
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      fontFamily: {
        display: ["'Cambria'", "Georgia", "serif"],
        sans: ["Calibri", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 20% 20%, rgba(41,85,245,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(6,182,212,0.2), transparent 40%), linear-gradient(180deg, #0b1120 0%, #0f172a 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
