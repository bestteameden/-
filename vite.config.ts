import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Cast process to any to avoid TypeScript error if @types/node is missing or incorrectly typed
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY. Defaults to empty string to prevent "undefined" crashes.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})