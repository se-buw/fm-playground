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
  build:{
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    host: true,
    strictPort: true,
    port: 5173
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173, 
  }
})
 