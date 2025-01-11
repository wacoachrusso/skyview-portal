import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  console.log('Vite config mode:', mode);
  
  return {
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
          target: "/",
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
    },
    // Add better error handling and logging
    build: {
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, warn) {
          // Log build warnings
          console.warn('Build warning:', warning);
          warn(warning);
        },
      },
    },
    // Add better error logging for development
    logLevel: 'info',
  };
});