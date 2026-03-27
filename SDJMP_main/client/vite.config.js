import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.BROWSER = 'none'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // OPTIMIZATION: Disable sourcemaps in production (save 832KB)
    minify: 'terser', // Ensure aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('@tanstack/react-query') ||
            id.includes('react-dom') ||
            id.includes('/react/')
          ) {
            return 'framework'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('/zod/')
          ) {
            return 'forms'
          }

          // OPTIMIZATION: Separate radix-ui to its own chunk
          if (id.includes('@radix-ui')) {
            return 'radix-ui'
          }

          // OPTIMIZATION: Separate utility libraries
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
            return 'utils'
          }

          return undefined
        },
      },
    },
  },
  preview: {
    open: false,
    port: 3000,
  },
})
