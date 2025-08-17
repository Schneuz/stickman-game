import { test, expect } from "@playwright/test";

test.describe("Stickman Editor", () => {
  test("should load the editor", async ({ page }) => {
    await page.goto("/");
    
    // Check title
    await expect(page).toHaveTitle(/Stickman Game Editor/);
    
    // Check main heading
    const heading = page.locator("h1");
    await expect(heading).toContainText("Stickman Game Editor");
  });

  test("should generate a scene from prompt", async ({ page }) => {
    await page.goto("/");
    
    // Find the textarea and button
    const textarea = page.locator("textarea");
    const generateButton = page.locator("button", { hasText: "Generate Scene" });
    
    // Enter prompt
    await textarea.fill("A wirft eine Vase auf B");
    
    // Click generate
    await generateButton.click();
    
    // Wait for canvas to appear
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    
    // Check timeline appears
    const timeline = page.locator("text=Timeline");
    await expect(timeline).toBeVisible();
    
    // Check controls appear
    const playButton = page.locator("button[title='Play']");
    await expect(playButton).toBeVisible();
  });

  test("should navigate frames using timeline", async ({ page }) => {
    await page.goto("/");
    
    // Generate a scene first
    const textarea = page.locator("textarea");
    const generateButton = page.locator("button", { hasText: "Generate Scene" });
    await textarea.fill("A wirft eine Vase auf B");
    await generateButton.click();
    
    // Wait for timeline
    await page.waitForSelector("text=Timeline");
    
    // Click on frame 17 (impact frame)
    const frame17Button = page.locator("button", { hasText: "17" }).first();
    await frame17Button.click();
    
    // Check frame indicator updates
    const frameIndicator = page.locator("text=Frame: 17");
    await expect(frameIndicator).toBeVisible();
  });

  test("should take screenshot at impact frame", async ({ page }) => {
    await page.goto("/");
    
    // Generate scene
    const textarea = page.locator("textarea");
    const generateButton = page.locator("button", { hasText: "Generate Scene" });
    await textarea.fill("A wirft eine Vase auf B");
    await generateButton.click();
    
    // Wait for canvas
    await page.waitForSelector("canvas");
    
    // Navigate to frame 17
    const frame17Button = page.locator("button", { hasText: "17" }).first();
    await frame17Button.click();
    
    // Wait a bit for rendering
    await page.waitForTimeout(500);
    
    // Take screenshot of canvas
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveScreenshot("impact-frame.png");
  });

  test("should toggle onion skin", async ({ page }) => {
    await page.goto("/");
    
    // Generate scene
    const textarea = page.locator("textarea");
    const generateButton = page.locator("button", { hasText: "Generate Scene" });
    await textarea.fill("Test scene");
    await generateButton.click();
    
    // Find onion skin button
    const onionSkinButton = page.locator("button[title='Toggle Onion Skin']");
    await onionSkinButton.click();
    
    // Check status text updates
    const statusText = page.locator("text=Onion Skin: ON");
    await expect(statusText).toBeVisible();
    
    // Toggle off
    await onionSkinButton.click();
    const statusTextOff = page.locator("text=Onion Skin: OFF");
    await expect(statusTextOff).toBeVisible();
  });
});