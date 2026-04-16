import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-browser smoke tests for the design.verdigris.co Jekyll site.
 *
 * Tests run against a locally-served _site/ directory. Build Jekyll first
 * (`bundle exec jekyll build`), then this config serves _site on port 4000
 * via a static file server and runs smoke specs on chromium, webkit, firefox.
 *
 * Rationale and scope tracked in Linear Z2O-1114.
 */
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  webServer: {
    // http-server -e html adds automatic .html extension fallback so
    // extensionless URLs like /foundations/composition resolve to the
    // built _site/foundations/composition.html, matching how GitHub
    // Pages serves the deployed site.
    command: 'npx http-server _site -p 4000 -e html -s',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
});
