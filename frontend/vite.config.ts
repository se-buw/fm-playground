import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // {
    //   // Plugin code is from https://github.com/chaosprint/vite-plugin-cross-origin-isolation
    //   name: 'configure-response-headers',
    //   configureServer: (server) => {
    //     server.middlewares.use((_req, res, next) => {
    //       res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    //       res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    //       next();
    //     });
    //   },
    // },
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/alloy': {
        target: 'http://fmp-alloy-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/alloy/, ''),
      },
      '/cnd': {
        target: 'http://fmp-cnd:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cnd/, ''),
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/alloy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/alloy/, ''),
      },
      '/cnd': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cnd/, ''),
      },
    },
  },
});
