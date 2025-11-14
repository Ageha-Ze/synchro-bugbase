/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // App Router
    "./pages/**/*.{js,ts,jsx,tsx}",     // Pages Router
    "./components/**/*.{js,ts,jsx,tsx}",// Components
    "./src/**/*.{js,ts,jsx,tsx}",       // (optional, kalau kamu punya folder src/)
  ],

  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out backwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),  // WAJIB dipasang di sini, bukan di CSS
  ],
};