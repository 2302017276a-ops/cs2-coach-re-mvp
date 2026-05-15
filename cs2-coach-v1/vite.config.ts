import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cs2-coach-re-mvp/',
  plugins: [react()],
})

