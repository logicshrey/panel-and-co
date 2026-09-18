/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          aetherguard: { primary: "#0EA5E9", secondary: "#FFFFFF", accent: "#C0C0C0" },
          ironclad:    { primary: "#DC2626", secondary: "#1F2937", accent: "#000000" },
          nightspire:  { primary: "#581C87", secondary: "#FCD34D", accent: "#1E1B4B" },
        },
        fontFamily: {
          poster: ["'Bebas Neue'", "sans-serif"],
          body: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  };