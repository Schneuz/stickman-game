import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	snapshotDir: './tests/__snapshots__',
	use: {
		baseURL: 'http://localhost:5173',
	},
	webServer: {
		command: 'pnpm -C apps/web dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
	},
});