import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 30_000,
  use: {
    headless: true,
  },
  webServer: {
    command: "pnpm -C apps/web dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});