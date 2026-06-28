
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        estate: {
          blue: '#4000E0',     // Logo indigo (primary)
          darkBlue: '#1A0566',  // Deep logo indigo
          red: '#7C3AED',      // Accent violet (complements logo)
          brown: '#C0C0C0',    // Logo silver accent
          gold: '#D4AF37',     // Premium/wealth accent (summit badges, highlights)
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
        montserrat: ['Sora', 'sans-serif'],
        poppins: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        roll: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(6px) rotate(3deg)' },
          '100%': { transform: 'translateX(0) rotate(0deg)' },
        },
        'bounce-zoom': {
          '0%': { transform: 'scale(1) translateY(0)' },
          '30%': { transform: 'scale(1.06) translateY(-6px)' },
          '60%': { transform: 'scale(0.995) translateY(0)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        'focus-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.035)' },
        },
      },
      animation: {
        roll: 'roll 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-zoom': 'bounce-zoom 700ms cubic-bezier(.2,.8,.2,1)',
        'focus-zoom': 'focus-zoom 160ms ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
