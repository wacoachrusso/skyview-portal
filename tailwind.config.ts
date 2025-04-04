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
          teal: "#14b8a6",
          emerald: "#10b981",
          amber: "#f59e0b",
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
        'hero-gradient': 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 60%, #6a5996 100%)',
        'premium-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #3a76d0 100%)',
        'luxury-dark': 'linear-gradient(to right, #111827 0%, #1e293b 100%)',
        'card-gradient': 'linear-gradient(180deg, #1e293b 0%, #131c2c 100%)',
        'feature-gradient': 'linear-gradient(to right, #243949 0%, #3a6078 100%)',
        'testimonial-gradient': 'linear-gradient(225deg, rgba(139,92,246,0.9) 0%, rgba(217,70,239,0.9) 100%)',
        'cta-gradient': 'linear-gradient(to right, rgba(155,135,245,0.9) 0%, rgba(126,105,171,0.9) 100%)',
        'footer-gradient': 'linear-gradient(to bottom, #1e293b 0%, #111827 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(155,135,245,0.08) 0%, transparent 70%)',
        'chat-user-gradient': 'linear-gradient(135deg, #4383e0 0%, #2563EB 100%)',
        'chat-ai-gradient': 'linear-gradient(135deg, #1E293B 0%, #131c2c 100%)',
        'action-card': 'linear-gradient(225deg, rgba(155,135,245,0.06) 0%, rgba(126,105,171,0.06) 100%)',
        'welcome-card': 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(217,70,239,0.06) 100%)',
        'stats-card': 'linear-gradient(225deg, rgba(249,115,22,0.06) 0%, rgba(212,175,55,0.06) 100%)',
      },
      boxShadow: {
        'premium': '0 8px 20px -5px rgba(59, 130, 246, 0.08), 0 6px 8px -6px rgba(59, 130, 246, 0.08)',
        'premium-hover': '0 15px 30px -8px rgba(59, 130, 246, 0.15), 0 8px 12px -3px rgba(59, 130, 246, 0.1)',
        'gold': '0 8px 20px -5px rgba(212, 175, 55, 0.08), 0 6px 8px -6px rgba(212, 175, 55, 0.08)',
        'gold-hover': '0 15px 30px -8px rgba(212, 175, 55, 0.15), 0 8px 12px -3px rgba(212, 175, 55, 0.1)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
        heading: ["Inter", "Poppins", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
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
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "pulse-subtle": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.85",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "pulse-subtle": "pulse-subtle 3s infinite ease-in-out",
        'slide': 'shimmer 28s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
