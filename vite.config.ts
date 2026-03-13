import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'framer': ['framer-motion'],
          'query': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js'],
          'lucide': ['lucide-react'],
        }
      }
    }
  }
})
