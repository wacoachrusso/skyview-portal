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
          DEFAULT: "#7E69AB",
          foreground: "#ffffff",
        },
        brand: {
          purple: "#8B5CF6",
          magenta: "#D946EF",
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
          DEFAULT: "#7E69AB",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#1e293b",
          foreground: "#ffffff",
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)',
        'card-gradient': 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        'feature-gradient': 'linear-gradient(to right, #243949 0%, #517fa4 100%)',
        'testimonial-gradient': 'linear-gradient(225deg, #8B5CF6 0%, #D946EF 100%)',
        'cta-gradient': 'linear-gradient(to right, #9b87f5 0%, #7E69AB 100%)',
        'footer-gradient': 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(155,135,245,0.15) 0%, transparent 70%)',
        'action-card': 'linear-gradient(225deg, rgba(155,135,245,0.1) 0%, rgba(126,105,171,0.1) 100%)',
        'welcome-card': 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(217,70,239,0.1) 100%)',
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

      maxWidth: {
        container: "80rem",
      },
      boxShadow: {
        glow: "0 -16px 128px 0 hsla(var(--brand-foreground) / 0.5) inset, 0 -16px 32px 0 hsla(var(--brand) / 0.5) inset",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
