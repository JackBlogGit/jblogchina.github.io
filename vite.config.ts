import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 项目站点需子路径 (如 /repo-name/)，由 CI 注入；本地开发保持 /
  base: process.env.PAGES_BASE || '/',
})
