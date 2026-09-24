/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10243E",
        inkline: "#D8DEE6",
        paper: "#F5F7FA",
        surface: "#FFFFFF",
        accent: "#FF6B35",
        accentDark: "#E2531F",
        dial: "#E8B94A",
        current: "#1C4E80",
        muted: "#5A6B7E",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        meter: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
