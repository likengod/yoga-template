import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverEnv = loadEnv(mode, path.resolve(process.cwd(), 'server'), '');
  const rawPort = serverEnv.PORT || env.PORT || env.VITE_API_PORT || '3001';
  const backendPort = '3001';

  return {
    server: {
      host: "::",
      port: 8080,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: 8080,
      host: "::",
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false,
        }
      }
    },
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react';
          }
          if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/recharts/')) {
            return 'ui';
          }
          if (id.includes('node_modules/@tanstack/react-query/') || id.includes('node_modules/date-fns/')) {
            return 'vendor';
          }
        },
      },
    },
  },
  };
});
