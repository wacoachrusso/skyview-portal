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
    host: true,
    port: 8080,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      // Handle all routes through index.html for SPA routing
      "^(?!/assets|/lovable-uploads).*": {
        target: "/index.html",
        rewrite: () => "/index.html"
      }
    }
  },
  preview: {
    port: 8080,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
}));