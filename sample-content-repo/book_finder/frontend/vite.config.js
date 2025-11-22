import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network (essential for Docker)
    port: 3000, // Match the port in docker-compose
    watch: {
      usePolling: true // Often required for Docker volumes on Windows/Mac
    }
  }
})