import { defineConfig } from "vite";

// Relative base, so the built site works on GitHub Pages at any path.
export default defineConfig({
  base: "./",
  build: { outDir: "dist", assetsInlineLimit: 0 },
});
