import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
// VITE_BASE is set by the GitHub Pages workflow when the site is served under /<repo>/ instead of a domain root.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
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
