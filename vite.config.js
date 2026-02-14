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
        // ✅ Simplified vendor chunk logic (no circular warnings)
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const parts = id.toString().split("node_modules/")[1].split("/");
            const name = parts[0].startsWith("@") ? parts[0] + "/" + parts[1] : parts[0];
            return `vendor-${name}`;
          }
        },
      },
    },
  },
});
