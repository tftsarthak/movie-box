import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = env.BACKEND_PORT || 3000;

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      }
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        }
      }
    }
  };
})
