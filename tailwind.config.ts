import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ink and brand.600 are the two shades the Developer Panel's color
        // pickers control at runtime (see src/app/layout.tsx, which sets these
        // CSS variables from SiteSettings). Every other shade stays a static
        // fallback tint so the rest of the palette still looks coherent.
        ink: "var(--color-secondary, #0D2A4A)",
        brand: {
          50: "#eafaf3",
          100: "#cdf1e0",
          200: "#9ce3c1",
          300: "#65cf9f",
          400: "#38b881",
          500: "#1a9c68",
          600: "var(--color-primary, #137d54)",
          700: "#126345",
          800: "#124f39",
          900: "#0f4130",
        },
        amber: {
          500: "#e08e2b",
        },
      },
      fontFamily: {
        sans: ["var(--font-family, ui-sans-serif)", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
