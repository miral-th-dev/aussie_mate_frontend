import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React ecosystem - highest priority
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            if (id.includes('react') || id.includes('react-router-dom')) {
              return 'vendor-react-core';
            }
            
            // UI libraries
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui-bundle';
            }
            
            // Maps and location
            if (id.includes('leaflet') || id.includes('react-leaflet') || id.includes('@react-google-maps')) {
              return 'vendor-maps';
            }
            
            // Payment
            if (id.includes('@stripe')) {
              return 'vendor-stripe';
            }
            
            // Utilities and others
            if (
              id.includes('lucide-react') ||
              id.includes('date-fns') ||
              id.includes('dayjs') ||
              id.includes('socket.io-client') ||
              id.includes('yup') ||
              id.includes('swiper')
            ) {
              return 'vendor-utils';
            }
            
            // Everything else
            return 'vendor-others';
          }
        }
      }
    }
  }
})




