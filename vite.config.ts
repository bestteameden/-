import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Try to find the API key in various likely environment variables
  const apiKey = process.env.API_KEY || env.API_KEY || 
                 process.env.VITE_API_KEY || env.VITE_API_KEY || 
                 process.env.GOOGLE_API_KEY || env.GOOGLE_API_KEY || '';

  // Log during build to help debugging (visible in Vercel build logs)
  if (mode === 'production') {
    if (apiKey) {
      console.log('✅ API_KEY found and injected during build.');
    } else {
      console.warn('⚠️ WARNING: API_KEY is missing during build. The app will fail to generate content.');
      console.warn('Please check Vercel Settings > Environment Variables.');
    }
  }

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY with the found key
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  }
})