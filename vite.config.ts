import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/v1': {
        target: 'https://api.careeragent.fyi',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://api.careeragent.fyi',
        changeOrigin: true,
      },
    },
  },
})
