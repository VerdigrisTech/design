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

  test('explorations index renders when present', async ({ page }) => {
    // explorations/ directory ships in a separate PR. This test is intentionally
    // tolerant: if the index exists, verify it renders; if not, skip. Browser-
    // specific behaviors on missing resources differ (Chrome/Safari return 404,
    // Firefox throws NS_ERROR_NET_EMPTY_RESPONSE), so catch navigation errors.
    const errors = watchConsoleErrors(page);
    let response: Awaited<ReturnType<typeof page.goto>> = null;
    try {
      response = await page.goto('/explorations/');
    } catch {
      test.skip(true, 'explorations/ not present on this branch');
    }
    if (!response || !response.ok()) {
      test.skip(true, 'explorations/ does not serve an index on this branch');
    }
    await expect(page.locator('h1, h2').first()).toBeVisible();
    expect(errors, `console errors: ${errors.join('; ')}`).toEqual([]);
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
