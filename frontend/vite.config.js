import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
 