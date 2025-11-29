/* eslint-env node */
/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub Pages deployment
  // Change this to match your repository name if different
  base: process.env.VITE_BASE_PATH || '/expenso_backup_analysis_ui/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
