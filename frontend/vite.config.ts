import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The FastAPI backend runs on 8001 (8000 is often taken by the lecture 7 app).
const BACKEND = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 5173 is often taken by the lecture 7 app, so default to 5174.
  server: {
    port: 5174,
    proxy: {
      '/api': BACKEND,
      '/media': BACKEND,
    },
  },
})
