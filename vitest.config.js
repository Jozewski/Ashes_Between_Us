import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["node_modules/**", ".next/**", "test-results/**", "tests/e2e/**"],
  },
});
