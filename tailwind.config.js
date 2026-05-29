/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        swg: {
          navy: "#16303f",
          blue: "#236f86",
          teal: "#2ba6ad",
          aqua: "#d9f3f2",
          sky: "#7fcfd2",
          ink: "#243746",
          line: "#dfe8ee",
          mist: "#f5f8fb",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        corporate: "0 16px 35px rgba(36, 55, 70, 0.08)",
        soft: "0 10px 26px rgba(36, 55, 70, 0.06)",
      },
    },
  },
  plugins: [],
};
