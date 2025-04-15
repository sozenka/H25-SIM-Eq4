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
        target: 'http://localhost:5000', // ✅ FIXED BACKEND PORT
        changeOrigin: true
      }
    }
  }
})
