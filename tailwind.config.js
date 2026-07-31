/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // All font sizes scaled ~20% up from Tailwind's defaults.
      fontSize: {
        xs: ["0.9rem", { lineHeight: "1.2rem" }],
        sm: ["1.05rem", { lineHeight: "1.5rem" }],
        base: ["1.2rem", { lineHeight: "1.8rem" }],
        lg: ["1.35rem", { lineHeight: "1.95rem" }],
        xl: ["1.5rem", { lineHeight: "2.1rem" }],
        "2xl": ["1.8rem", { lineHeight: "2.4rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.7rem" }],
        "4xl": ["2.7rem", { lineHeight: "3.15rem" }],
      },
    },
  },
  plugins: [],
};
