import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "node",
  target: "node22",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  // Bundle the workspace package; keep real npm dependencies external.
  noExternal: ["@resumeai/shared"],
});
