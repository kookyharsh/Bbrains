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
        },
        // Hand-Drawn Design System Colors
        hand: {
          paper: "#fdfbf7",
          pencil: "#2d2d2d",
          muted: "#e5e0d8",
          red: "#ff4d4d",
          blue: "#2d5da1",
          yellow: "#fff9c4",
        }
      },
      fontFamily: {
        kalam: ['var(--font-kalam)'],
        patrick: ['var(--font-patrick)'],
      },
      borderRadius: {
        wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
        wobblyMd: "15px 225px 15px 255px / 255px 15px 225px 15px",
      },
      boxShadow: {
        hard: "4px 4px 0px 0px #2d2d2d",
        "hard-sm": "2px 2px 0px 0px #2d2d2d",
        "hard-lg": "8px 8px 0px 0px #2d2d2d",
      },
      backgroundImage: {
        'paper-texture': 'radial-gradient(#e5e0d8 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}