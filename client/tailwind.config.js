/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#0B0E17",
          secondary: "#111827",
          tertiary: "#1C2333",
          border: "#1E2D45",
          950: "#080A12",
        },
        accent: {
          DEFAULT: "#2962FF",
          light: "#5C8FFF",
          dark: "#1A44CC",
          50: "rgba(41,98,255,0.05)",
          100: "rgba(41,98,255,0.1)",
        },
        // Keep gold only for the landing/home page branding
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E5C158",
          dark: "#B8960F",
        },
        profit: "#00C853",
        loss: "#FF3D57",
        neutral: "#546E7A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.25s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        "accent-sm": "0 0 12px rgba(41,98,255,0.2)",
        "accent-md": "0 0 20px rgba(41,98,255,0.3)",
        "accent-lg": "0 4px 32px rgba(41,98,255,0.25)",
        profit: "0 0 12px rgba(0,200,83,0.2)",
        loss: "0 0 12px rgba(255,61,87,0.2)",
      },
    },
  },
  plugins: [],
};
