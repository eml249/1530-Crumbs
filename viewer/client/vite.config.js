import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The viewer runs on its own ports so it can sit next to the main app:
//   main client 5173 / main server 5000   (existing)
//   viewer client 5174 / viewer server 5001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
})
