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
        // Custom colors for your new gradient
        "paint-start": "#5D43E1",
        "paint-end": "#AB51DE",
      },
      backgroundImage: {
        // Your custom background gradient
        "linear-2-paints":
          "linear-gradient(90deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 22.94%, rgba(255, 255, 255, 0.00) 72.33%, rgba(255, 255, 255, 0.20) 100%), linear-gradient(119deg, var(--tw-colors-paint-start) 12.9%, var(--tw-colors-paint-end) 86.02%)",
      },
    },
  },
  plugins: [],
};
