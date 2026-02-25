import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const API_TARGET = 'http://localhost:6001'
// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    define: {
        __API_BASE_URL__: JSON.stringify(`${API_TARGET}/api`),
    },
    server: {
        host: true,
        port: 6002,
        allowedHosts: true,   // ← easiest and safest for dev tunnel
        proxy: {
            '/api': {
                target: API_TARGET,
                changeOrigin: true,
            },
        },
    }
})