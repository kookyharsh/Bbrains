/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors from your image
        brand: {
          orange: "#FF7675", // Vivid Orange
          purple: "#6C5CE7", // Deep Purple
          mint: "#55E6C1",   // Soft Mint
          slate: "#2F3640",  // Dark Slate
        },
        // UI specific mapping
        ui: {
          dark: {
            bg: "#2F3640",
            surface: "#3A424E",
            textPrimary: "#FFFFFF",
            textSecondary: "#B9BBBE",
          },
          light: {
            bg: "#F5F6FA",
            surface: "#FFFFFF",
            textPrimary: "#2F3640",
            textSecondary: "#636E72",
          }
        }
      },
    },
  },
  plugins: [],
}