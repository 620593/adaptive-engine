/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      colors: {
        background: "#0a0a0f",
        surface: "#111118",
        border: "#1e1e2e",
        primary: {
          500: "#6366f1",
          600: "#4f46e5",
        },
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        textPrimary: "#f1f5f9",
        textSecondary: "#94a3b8",
        textMuted: "#475569",
      },
    },
  },
  plugins: [],
};
