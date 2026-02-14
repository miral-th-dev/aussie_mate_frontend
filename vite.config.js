import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [svgr(), react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Handle Emotion/MUI first to prevent cn initialization issues
            if (id.includes("@emotion") || id.includes("@mui")) {
              return "vendor-mui";
            }
            
            // React core
            if (id.includes("react") && !id.includes("@emotion") && !id.includes("@mui")) {
              return "vendor-react";
            }
            
            // React DOM
            if (id.includes("react-dom")) {
              return "vendor-react-dom";
            }
            
            // React Router
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            
            // Maps
            if (id.includes("leaflet") || id.includes("react-leaflet") || id.includes("@react-google-maps")) {
              return "vendor-maps";
            }
            
            // Stripe
            if (id.includes("@stripe")) {
              return "vendor-stripe";
            }
            
            // Other major libraries
            if (id.includes("socket.io") || id.includes("socket.io-client")) {
              return "vendor-socket";
            }
            
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            
            if (id.includes("date-fns") || id.includes("dayjs")) {
              return "vendor-date";
            }
            
            if (id.includes("yup")) {
              return "vendor-validation";
            }
            
            if (id.includes("swiper")) {
              return "vendor-swiper";
            }
            
            // Everything else
            return "vendor-others";
          }
        },
      },
    },
  },
});
