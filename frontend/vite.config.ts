import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['safe-buffer'],
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: []
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://h25-sim-eq4.onrender.com',
        changeOrigin: true
      }
    }
  }
})
