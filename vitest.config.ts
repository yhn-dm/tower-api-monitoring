import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@tower/db": path.resolve(__dirname, "libs/db/src/index.ts"),
      "@tower/db/*": path.resolve(__dirname, "libs/db/src/*"),
    },
  },
});
