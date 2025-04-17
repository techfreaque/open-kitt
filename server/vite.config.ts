import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",
    minify: false,
    rollupOptions: {
      external: ["socketcan", "systeminformation"],
    },
  },
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/index.ts",
      exportName: "viteNodeApp",
      tsCompiler: "typescript",
    }),
  ],
});
