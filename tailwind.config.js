/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sidebar-accent": "white",
        "sidebar-accent-foreground": "rgb(126 34 206)", // purple-700
      },
    },
  },
  plugins: [],
};
