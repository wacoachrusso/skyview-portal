import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
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
});