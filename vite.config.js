import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: funciona no GitHub Pages independente do nome do repositório
export default defineConfig({
  plugins: [react()],
  base: './',
})
