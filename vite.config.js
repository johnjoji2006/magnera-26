import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Three static entry points, same as the original flat-file site
// (index.html, technical.html, cultural.html), each its own React root.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        technical: resolve(__dirname, "technical.html"),
        cultural: resolve(__dirname, "cultural.html"),
      },
    },
  },
});
