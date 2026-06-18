import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5131',
        changeOrigin: true
      }
    },
    port: 5173,
    host:'0.0.0.0'
  },
  preview:{
   port:4173,
    host:'0.0.0.0',
    allowedHosts: ['zadanie-rekrutacyjne-frontend.onrender.com']
  }
})
