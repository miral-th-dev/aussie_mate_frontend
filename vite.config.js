import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    svgr(),
    react({
      jsxImportSource: undefined,
      babel: {
        plugins: []
      }
    }),
    tailwindcss()
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: true,
      port: 5173
    },
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {

            // ✅ React core + DOM - SATHE rakhva (split na karva!)
            if (id.includes("react-dom") || (id.includes("react") && !id.includes("@emotion") && !id.includes("@mui") && !id.includes("react-router") && !id.includes("react-leaflet") && !id.includes("react-i18next") && !id.includes("react-day-picker") && !id.includes("react-apple"))) {
              return "vendor-react";
            }

            // ✅ Typo fix - "includes" correct karyu
            if (id.includes("@emotion") || id.includes("@mui")) {
              return "vendor-mui";
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

            // Socket
            if (id.includes("socket.io")) {
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

            return "vendor-others";
          }
        },
      },
    },
  },
});