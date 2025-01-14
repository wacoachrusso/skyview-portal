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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1EAEDB",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0FA0CE",
          foreground: "#ffffff",
        },
        brand: {
          blue: "#1EAEDB",
          skyblue: "#33C3F0",
          orange: "#F97316",
          gold: "#D4AF37",
          navy: "#1a365d",
          slate: "#334155",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#334155",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#0FA0CE",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#1e293b",
          foreground: "#ffffff",
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #33C3F0 0%, #1EAEDB 100%)',
        'card-gradient': 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        'feature-gradient': 'linear-gradient(to right, #243949 0%, #517fa4 100%)',
        'testimonial-gradient': 'linear-gradient(225deg, #1EAEDB 0%, #33C3F0 100%)',
        'cta-gradient': 'linear-gradient(to right, #33C3F0 0%, #1EAEDB 100%)',
        'footer-gradient': 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(30,174,219,0.15) 0%, transparent 70%)',
        'action-card': 'linear-gradient(225deg, rgba(30,174,219,0.1) 0%, rgba(15,160,206,0.1) 100%)',
        'welcome-card': 'linear-gradient(135deg, rgba(30,174,219,0.1) 0%, rgba(51,195,240,0.1) 100%)',
        'stats-card': 'linear-gradient(225deg, rgba(249,115,22,0.1) 0%, rgba(212,175,55,0.1) 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;