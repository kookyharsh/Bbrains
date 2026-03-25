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
        // Admin Role Management Colors from Stitch
        admin: {
          "surface-dim": "#d1d5d7",
          "inverse-surface": "#0c0f10",
          "on-primary-container": "#401500",
          "primary-container": "#ff7a2f",
          "on-background": "#2c2f30",
          "primary-fixed": "#ff7a2f",
          "on-tertiary-fixed-variant": "#5e4000",
          "error-dim": "#b92902",
          "surface-bright": "#f5f6f7",
          "on-tertiary-fixed": "#372400",
          "secondary-dim": "#7e3e00",
          "on-tertiary-container": "#523700",
          "on-error-container": "#520c00",
          "on-secondary": "#fff0e8",
          "surface-variant": "#dadddf",
          "on-primary-fixed": "#000000",
          "tertiary": "#7a5400",
          "primary-dim": "#893600",
          "on-secondary-fixed-variant": "#803f00",
          "tertiary-fixed": "#fbb423",
          "on-tertiary": "#fff1df",
          "surface-container-low": "#eff1f2",
          "secondary-container": "#ffc69f",
          "on-error": "#ffefec",
          "primary-fixed-dim": "#f66700",
          "outline-variant": "#abadae",
          "inverse-primary": "#fe6b00",
          "on-secondary-fixed": "#552800",
          "on-surface-variant": "#595c5d",
          "tertiary-fixed-dim": "#eba60f",
          "tertiary-dim": "#6b4900",
          "outline": "#757778",
          "surface-container-high": "#e0e3e4",
          "surface-container": "#e6e8ea",
          "surface-container-highest": "#dadddf",
          "primary": "#9c3f00",
          "surface-container-lowest": "#ffffff",
          "background": "#f5f6f7",
          "on-secondary-container": "#723700",
          "surface": "#f5f6f7",
          "surface-tint": "#9c3f00",
          "inverse-on-surface": "#9b9d9e",
          "secondary": "#904800",
          "secondary-fixed": "#ffc69f",
          "error-container": "#f95630",
          "tertiary-container": "#fbb423",
          "secondary-fixed-dim": "#ffb37d",
          "error": "#b02500",
          "on-primary-fixed-variant": "#4f1c00",
          "on-primary": "#fff0ea",
          "on-surface": "#2c2f30"
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