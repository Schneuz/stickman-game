import { test, expect } from '@playwright/test';

test.describe('Editor E2E', () => {
	test('Generate and scrub to frame 17, canvas snapshot', async ({ page }) => {
		await page.goto('/');
		await page.fill('textarea', 'A wirft eine Vase auf B');
		await page.getByRole('button', { name: 'Generate' }).click();
		await page.getByRole('button', { name: '17' }).click();
		const canvas = page.locator('canvas');
		await expect(canvas).toHaveScreenshot('frame-17.png');
	});
});