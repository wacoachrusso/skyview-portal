import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Redirect all requests to index.html
      "/*": {
        target: "/index.html",
        changeOrigin: true,
        rewrite: () => "/index.html"
      }
    }
  },
  preview: {
    port: 8080
  }
}));