import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  const proxy = {
    '/api': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/health': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/docs': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/openapi.json': {
      target: backendTarget,
      changeOrigin: true,
    },
  };

  return {
    server: {
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), 'index.html'),
          seller: resolve(process.cwd(), 'seller.html'),
        },
      },
    },
  };
});
