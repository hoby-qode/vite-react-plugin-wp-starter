import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react'],
          'react-dom': ['react-dom']
        }
      }
    },
  },
})