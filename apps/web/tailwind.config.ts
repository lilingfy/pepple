import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7e8da0",
          50: "#f4f6f8",
          100: "#e8ecf2",
          200: "#d1d9e5",
          300: "#b3c0d4",
          400: "#95a7c3",
          500: "#7e8da0",
          600: "#6b7a8b",
          700: "#525f6d",
          800: "#434b56",
          900: "#3a4048",
        },
        "background-light": "#f7f7f7",
        "background-dark": "#17191b",
        "bg-light": "#f7f7f7",
        "bg-dark": "#17191b",
        "storm-bg": "#eef2f5",
        "shelter-bg": "#ffffff",
        "insight-bg": "#e6f2ed",
        "insight-text": "#2d6a4f",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      fontFamily: {
        display: ["Spline Sans", "sans-serif"],
        header: ["Quicksand", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
