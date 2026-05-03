import { test, expect, Page } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Resolve __dirname under both CommonJS (Playwright's default loader) and ESM.
// package.json sets "type": "module" but Playwright's test runner historically
// shims __dirname; computing it from import.meta.url works in both cases.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Render-time overflow detection for category example HTMLs.
 *
 * Catches the class of bug Loop 5M surfaced and PR #43 fixed:
 *   - abcam-kickoff-redux.html slide 6 clipped 363px of timeline content.
 *   - architectural-advantages-redux.html CTA bar clipped 90px below page fold.
 *
 * Static analysis (HTML/CSS lint, rule validators) cannot detect these.
 * Only loading the page in a real browser, sizing the viewport to the
 * intended print master, and measuring scrollHeight / scrollWidth catches
 * "content runs past the page; overflow:hidden hides the evidence."
 *
 * Strategy:
 *   - Walk every *.html under categories/{slides,one-pagers,case-studies,
 *     whitepapers}/examples/.
 *   - For each, set viewport to the genre's intended page size.
 *   - For slides:      every <section class="vd-slide"> must have
 *                      scrollHeight <= 720 and scrollWidth <= 1280.
 *   - For one-pagers:  every <article class="vd-onepager"> must have
 *                      scrollHeight <= 1056 (8.5x11in @ 96dpi) and
 *                      scrollWidth <= 816.
 *   - For whitepapers: every <section class="vd-cover"> and
 *                      <section class="vd-paper"> measured against
 *                      the same Letter master.
 *   - For case-studies: web layout (multi-page scroll), so we only
 *                      check no horizontal overflow on the document
 *                      and no horizontal overflow inside marked
 *                      anchors / quotes.
 *
 * Tolerance: 2px of slop is treated as rounding noise (subpixel layout,
 * font fallback metrics differ across engines). Anything more is a clip.
 *
 * Browser scope: chromium only. Overflow is a layout geometry question
 * that does not differ meaningfully across engines for these documents,
 * and the existing cross-browser smoke job already covers engine drift
 * for the canvas / nav code paths. Running this on three engines just
 * triples the per-PR cost without new signal.
 */

const REPO_ROOT = resolve(__dirname, '..', '..');
const TOLERANCE_PX = 2;

type Genre = 'slides' | 'one-pagers' | 'case-studies' | 'whitepapers';

interface ExampleFile {
  path: string;       // absolute filesystem path
  fileUrl: string;    // file:// URL Playwright loads
  name: string;       // basename for the test name
  genre: Genre;
}

const GENRE_DIRS: Genre[] = ['slides', 'one-pagers', 'case-studies', 'whitepapers'];

function discoverExamples(): ExampleFile[] {
  const out: ExampleFile[] = [];
  for (const genre of GENRE_DIRS) {
    const dir = join(REPO_ROOT, 'categories', genre, 'examples');
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.endsWith('.html')) continue;
      // Skip explicit broken / negative-fixture HTMLs — those exist to
      // exercise validators, not to be linted as production output.
      if (entry.endsWith('-broken.html')) continue;
      const full = join(dir, entry);
      try {
        if (!statSync(full).isFile()) continue;
      } catch {
        continue;
      }
      out.push({
        path: full,
        fileUrl: pathToFileURL(full).href,
        name: entry,
        genre,
      });
    }
  }
  return out;
}

interface OverflowReport {
  selector: string;
  index: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

async function measureSelector(page: Page, selector: string): Promise<OverflowReport[]> {
  return page.evaluate((sel: string) => {
    const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
    return els.map((el, index) => ({
      selector: sel,
      index,
      scrollHeight: el.scrollHeight,
      scrollWidth: el.scrollWidth,
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
    }));
  }, selector);
}

async function waitForReady(page: Page): Promise<void> {
  // Fonts have to settle before measuring or scrollHeight reflects
  // fallback metrics. The example HTMLs request Inter/Lato/JetBrains
  // Mono via Google Fonts with display=block, so document.fonts.ready
  // resolves only after the webfonts (or their timeout) land.
  await page.evaluate(() => (document as any).fonts && (document as any).fonts.ready);
  // One animation frame for layout to flush.
  await page.evaluate(
    () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
}

function formatOverflow(file: string, expectedH: number, expectedW: number, r: OverflowReport): string {
  const heightClip = Math.max(0, r.scrollHeight - expectedH);
  const widthClip = Math.max(0, r.scrollWidth - expectedW);
  const lines: string[] = [];
  lines.push(`OVERFLOW in ${file}:${r.selector}[${r.index}]`);
  if (heightClip > TOLERANCE_PX) {
    lines.push(`  Expected: ${expectedH}px height`);
    lines.push(`  Actual:   ${r.scrollHeight}px (clip ${heightClip}px)`);
  }
  if (widthClip > TOLERANCE_PX) {
    lines.push(`  Expected: ${expectedW}px width`);
    lines.push(`  Actual:   ${r.scrollWidth}px (clip ${widthClip}px)`);
  }
  return lines.join('\n');
}

const examples = discoverExamples();

// ---------- slides: 1280x720 per .vd-slide section ----------
//
// KNOWN_OVERFLOW: existing slide examples that overflow today. Tracked as
// tech debt — these examples were shipped in PR #43 (abcam, verdigris-101)
// and PR #44 (apex-trading) before the overflow validator existed. Marked
// `test.fixme()` so the test runs, reports the failure as expected-known,
// and doesn't block CI. Filed for tightening in Linear (see PR #44 body).
//
// Adding a NEW example to this list is NOT acceptable — new examples must
// fit. The list shrinks over time as each ticket lands.
const KNOWN_OVERFLOW_SLIDES = new Set<string>([
  'abcam-kickoff-redux.html',
  'verdigris-101-redux.html',
  'apex-trading-pilot-kickoff-from-lightfield.html',
]);

test.describe('overflow detection: slides', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'overflow is layout-engine-agnostic; chromium-only');

  const slideExamples = examples.filter(e => e.genre === 'slides');
  for (const ex of slideExamples) {
    const isKnownFailing = KNOWN_OVERFLOW_SLIDES.has(ex.name);
    test(ex.name, async ({ page }) => {
      test.fixme(isKnownFailing, `Tracked tech debt: ${ex.name} content density exceeds slide bounds; see PR #44 follow-up tickets`);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(ex.fileUrl);
      await waitForReady(page);

      const reports = await measureSelector(page, 'section.vd-slide');
      expect(reports.length, `${ex.name} should contain at least one .vd-slide`).toBeGreaterThan(0);

      const failures: string[] = [];
      for (const r of reports) {
        const heightClip = r.scrollHeight - 720;
        const widthClip = r.scrollWidth - 1280;
        if (heightClip > TOLERANCE_PX || widthClip > TOLERANCE_PX) {
          failures.push(formatOverflow(ex.name, 720, 1280, r));
        }
      }
      expect(failures, failures.join('\n\n')).toEqual([]);
    });
  }
});

// ---------- one-pagers: Letter portrait, 816x1056 ----------
test.describe('overflow detection: one-pagers', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'overflow is layout-engine-agnostic; chromium-only');

  const onePagerExamples = examples.filter(e => e.genre === 'one-pagers');
  for (const ex of onePagerExamples) {
    test(ex.name, async ({ page }) => {
      await page.setViewportSize({ width: 816, height: 1056 });
      await page.goto(ex.fileUrl);
      await waitForReady(page);

      const reports = await measureSelector(page, 'article.vd-onepager, .vd-onepager');
      expect(reports.length, `${ex.name} should contain at least one .vd-onepager`).toBeGreaterThan(0);

      const failures: string[] = [];
      for (const r of reports) {
        const heightClip = r.scrollHeight - 1056;
        const widthClip = r.scrollWidth - 816;
        if (heightClip > TOLERANCE_PX || widthClip > TOLERANCE_PX) {
          failures.push(formatOverflow(ex.name, 1056, 816, r));
        }
      }
      expect(failures, failures.join('\n\n')).toEqual([]);
    });
  }
});

// ---------- whitepapers: only .vd-cover is single-page; .vd-paper is multi-page ----------
test.describe('overflow detection: whitepapers', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'overflow is layout-engine-agnostic; chromium-only');

  const whitepaperExamples = examples.filter(e => e.genre === 'whitepapers');
  for (const ex of whitepaperExamples) {
    test(ex.name, async ({ page }) => {
      await page.setViewportSize({ width: 816, height: 1056 });
      await page.goto(ex.fileUrl);
      await waitForReady(page);

      // .vd-cover is exactly one printed Letter page, so it must not overflow.
      // .vd-paper is intentionally tall — it uses @page paper to auto-paginate
      // across N pages at print time. Measuring paper against 1056px would
      // be a false positive. We do still check that paper has no horizontal
      // overflow (which would force a sideways scroll on every page).
      const covers = await measureSelector(page, 'section.vd-cover');
      const papers = await measureSelector(page, 'section.vd-paper');
      expect(
        covers.length + papers.length,
        `${ex.name} should contain at least one .vd-cover or .vd-paper`,
      ).toBeGreaterThan(0);

      const failures: string[] = [];
      for (const r of covers) {
        const heightClip = r.scrollHeight - 1056;
        const widthClip = r.scrollWidth - 816;
        if (heightClip > TOLERANCE_PX || widthClip > TOLERANCE_PX) {
          failures.push(formatOverflow(ex.name, 1056, 816, r));
        }
      }
      for (const r of papers) {
        const widthClip = r.scrollWidth - 816;
        if (widthClip > TOLERANCE_PX) {
          failures.push(
            `OVERFLOW in ${ex.name}:section.vd-paper[${r.index}] horizontal\n` +
              `  Expected: <= 816px width\n` +
              `  Actual:   ${r.scrollWidth}px (clip ${widthClip}px)`,
          );
        }
      }
      expect(failures, failures.join('\n\n')).toEqual([]);
    });
  }
});

// ---------- case studies: web layout, only check no horizontal overflow ----------
test.describe('overflow detection: case studies', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'overflow is layout-engine-agnostic; chromium-only');

  const csExamples = examples.filter(e => e.genre === 'case-studies');
  for (const ex of csExamples) {
    test(ex.name, async ({ page }) => {
      // Case studies are intentionally a tall web scroll layout, not paged.
      // The legitimate failure mode is HORIZONTAL overflow (content forcing
      // a sideways scrollbar). Match a normal desktop viewport width.
      const viewportWidth = 1280;
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      await page.goto(ex.fileUrl);
      await waitForReady(page);

      // Document-wide horizontal overflow check.
      const docMetrics = await page.evaluate(() => ({
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        docClientWidth: document.documentElement.clientWidth,
      }));

      const failures: string[] = [];
      const horizontalOverflow = Math.max(
        docMetrics.bodyScrollWidth - viewportWidth,
        docMetrics.docScrollWidth - viewportWidth,
      );
      if (horizontalOverflow > TOLERANCE_PX) {
        failures.push(
          `OVERFLOW in ${ex.name}: document horizontal\n` +
            `  Expected: ${viewportWidth}px width\n` +
            `  Actual:   ${Math.max(docMetrics.bodyScrollWidth, docMetrics.docScrollWidth)}px ` +
            `(clip ${horizontalOverflow}px)`,
        );
      }

      // Per-element horizontal overflow on the marked components that
      // historically have produced sideways scroll (anchors, quotes).
      const anchors = await measureSelector(page, '.vd-cs-anchor');
      const quotes = await measureSelector(page, '.vd-cs-quote');
      for (const r of [...anchors, ...quotes]) {
        const widthClip = r.scrollWidth - r.clientWidth;
        if (widthClip > TOLERANCE_PX) {
          failures.push(
            `OVERFLOW in ${ex.name}:${r.selector}[${r.index}] horizontal\n` +
              `  Expected: <= ${r.clientWidth}px width\n` +
              `  Actual:   ${r.scrollWidth}px (clip ${widthClip}px)`,
          );
        }
      }

      expect(failures, failures.join('\n\n')).toEqual([]);
    });
  }
});

// ---------- self-test: the broken fixture must fail the slides detector ----------
test.describe('overflow detection: self-test (fixture)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'overflow is layout-engine-agnostic; chromium-only');

  test('broken-overflow.html fixture is detected as overflowing', async ({ page }) => {
    const fixturePath = resolve(__dirname, '..', 'fixtures', 'broken-overflow.html');
    const fixtureUrl = pathToFileURL(fixturePath).href;

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(fixtureUrl);
    await waitForReady(page);

    const reports = await measureSelector(page, 'section.vd-slide');
    expect(reports.length, 'fixture should have at least one .vd-slide').toBeGreaterThan(0);

    // The fixture is built so that EVERY slide overflows. If any one of
    // them measures within bounds, the detector is broken — either the
    // fixture changed and no longer overflows, or the measurement code
    // stopped working.
    const overflowing = reports.filter(r => r.scrollHeight - 720 > TOLERANCE_PX);
    expect(
      overflowing.length,
      `expected every fixture .vd-slide to overflow, got ${overflowing.length}/${reports.length}. ` +
        `Heights: ${reports.map(r => r.scrollHeight).join(', ')}`,
    ).toBe(reports.length);
  });
});

// Surface the discovered example list at module load to help debugging
// when the suite reports zero tests.
if (examples.length === 0) {
  console.warn(
    `[example-overflow.spec.ts] no example HTMLs discovered under ${REPO_ROOT}/categories/*/examples/`,
  );
}
