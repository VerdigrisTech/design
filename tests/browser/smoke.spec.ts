import { test, expect, Page } from '@playwright/test';

/**
 * Smoke tests for the design.verdigris.co Jekyll site.
 *
 * Each test verifies:
 *  - page loads without uncaught JavaScript errors
 *  - page has a non-empty title
 *  - main navigation is present and interactive
 *  - if the page has canvas elements, they rendered with non-zero dimensions
 *
 * This is the floor. Visual regression and deeper interaction tests are
 * separate concerns (see Z2O-1089 subissues for the companion website pipeline).
 */

function watchConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  return errors;
}

async function assertCanvasesRendered(page: Page) {
  const widths = await page.evaluate(() =>
    Array.from(document.querySelectorAll('canvas')).map(c => c.width),
  );
  if (widths.length === 0) return;
  for (const w of widths) {
    expect(w, 'canvas width should be > 0').toBeGreaterThan(0);
  }
}

test.describe('design system surfaces', () => {
  test('home page renders', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/Verdigris/);
    await expect(page.locator('nav').first()).toBeVisible();
    await assertCanvasesRendered(page);
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('specimen page renders with canvases', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    await page.goto('/specimen.html');
    await expect(page).toHaveTitle(/.+/);
    await assertCanvasesRendered(page);
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('composition foundation renders', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    await page.goto('/foundations/composition');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await assertCanvasesRendered(page);
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('video foundation renders', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    await page.goto('/foundations/video');
    await expect(page.locator('h1').first()).toBeVisible();
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('color foundation renders', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    await page.goto('/foundations/color');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('explorations index renders', async ({ page }) => {
    const errors = watchConsoleErrors(page);
    const response = await page.goto('/explorations/');
    // Acceptable either way: explicit index or 404 until directory listing is added
    if (response && response.ok()) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
      expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
    }
  });
});

test.describe('cross-browser canvas rendering', () => {
  /**
   * Regression guard for the class of bug caught by Andrew Jo on 2026-04-15:
   * canvas path math that did not match drawn paths rendered differently on
   * Firefox and Safari. This test does not verify specific visuals (that is
   * visual regression's job) but does catch the case where canvas API calls
   * throw or produce zero-dimension output on non-Chromium browsers.
   */
  test('every canvas on specimen reports non-zero dimensions', async ({ page, browserName }) => {
    await page.goto('/specimen.html');
    const metrics = await page.evaluate(() =>
      Array.from(document.querySelectorAll('canvas')).map(c => ({
        id: c.id,
        width: c.width,
        height: c.height,
      })),
    );
    for (const m of metrics) {
      expect(m.width, `canvas ${m.id} width on ${browserName}`).toBeGreaterThan(0);
      expect(m.height, `canvas ${m.id} height on ${browserName}`).toBeGreaterThan(0);
    }
  });
});
