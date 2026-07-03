import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 开发期把 /api 转发到 Express 后端
      '/api': 'http://localhost:4000',
    },
  },
})
