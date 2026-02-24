import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 4051,
    allowedHosts: true,   // ← easiest and safest for dev tunnel
    proxy: {
      '/api': {
        target: 'http://localhost:4050',
        changeOrigin: true,
      },
    },
  }
})