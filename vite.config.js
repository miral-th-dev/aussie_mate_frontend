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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui': ['@mui/material', '@mui/x-date-pickers', '@emotion/react', '@emotion/styled'],
          'maps-leaflet': ['leaflet', 'react-leaflet', '@react-google-maps/api'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'utils': ['lucide-react', 'date-fns', 'dayjs', 'socket.io-client', 'yup'],
        }
      }
    }
  }
})

