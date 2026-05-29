/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        swg: {
          navy: "#0f2d52",
          blue: "#155e9f",
          sky: "#0ea5e9",
          ink: "#172033",
          line: "#d7e2ef",
          mist: "#f4f8fc",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        corporate: "0 14px 35px rgba(15, 45, 82, 0.08)",
      },
    },
  },
  plugins: [],
};
