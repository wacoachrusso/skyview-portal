
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
      port: 8080, // Changed from 3000 to 8080
      strictPort: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    },
    preview: {
      port: 5173,
      strictPort: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      // Remove open configuration to prevent browser auto-opening issues
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, warn) {
          console.log('Build warning:', warning);
          warn(warning);
        },
      },
    },
    logLevel: 'info',
  };
});
