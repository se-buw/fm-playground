import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [{
    // Plugin code is from https://github.com/chaosprint/vite-plugin-cross-origin-isolation
    name: "configure-response-headers",
    configureServer: (server) => {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        next();
      });
    },
  },
  react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0', 
		allowedHosts: true,
    proxy: {
      '/nuxmv': {
        target: 'http://fmp-nuxmv-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/nuxmv/, '')
      },
      '/smt': {
        target: 'http://fmp-z3-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/smt/, '')
      },
      '/alloy': {
        target: 'http://fmp-alloy-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/alloy/, '')
      },
      '/spectra': {
        target: 'http://fmp-spectra-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spectra/, '')
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    port: 5173,
    strictPort: true,
    host: '0.0.0.0', 
		allowedHosts: true,
    proxy: {
      '/nuxmv': {
        target: 'http://fmp-nuxmv-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/nuxmv/, '')
      },
      '/smt': {
        target: 'http://fmp-z3-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/smt/, '')
      },
      '/alloy': {
        target: 'http://fmp-alloy-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/alloy/, '')
      },
      '/spectra': {
        target: 'http://fmp-spectra-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spectra/, '')
      },
    },
  }
})