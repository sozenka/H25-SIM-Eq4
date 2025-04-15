/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0A1F",
        primary: {
          DEFAULT: "#8B5CF6",
          dark: "#6D28D9",
          light: "#A78BFA"
        },
        secondary: {
          DEFAULT: "#EC4899",
          dark: "#BE185D",
          light: "#F472B6"
        }
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}