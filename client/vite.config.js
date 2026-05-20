import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // added base path for github pages deployment -jh
  base: '/space-arcade/',
})