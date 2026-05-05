# Multi-Page Evaluation — Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Goal:** Expand /narrative and /visual pages to evaluate multiple pages together as a cohesive site, identifying cross-page redundancy, content gaps, role overlap, and information architecture issues.

---

## Overview

Add a "Page Filtering" accordion to the existing /narrative and /visual pages. Users enter a root URL, discover all pages via site crawl, select which pages to include/exclude, then evaluate all selected pages together. The evaluation produces per-page summaries plus cross-page issue cards — like a content strategist reviewing the entire site.

**Single-page mode** (current behavior) remains the default. Multi-page mode activates when the user opens Page Filtering and selects multiple pages.

---

## Architecture

### Shared components (used by BOTH pages — no duplication)

```
www/shared/
  page-filter.js          — reusable page filtering UI component
  page-filter.css         — shared styles for the filter accordion

server/shared/
  site-crawler.ts         — URL discovery (sitemap.xml + Playwright fallback)
  cross-page-types.ts     — shared types for cross-page evaluation

server/
  crawl-routes.ts         — POST /api/crawl endpoint (background job)
```

### Per-page engines (separate because prompt/dimensions differ)

```
server/narrative/
  cross-page-engine.ts    — multi-page narrative synthesis

server/visual/
  cross-page-engine.ts    — multi-page visual synthesis
```

### Modified files

```
www/narrative/index.html  — add page-filter-section placeholder
www/narrative/js/main.js  — import PageFilter, wire multi-page evaluate flow
www/visual/index.html     — add page-filter-section placeholder
www/visual/js/main.js     — import PageFilter, wire multi-page evaluate flow
www/server.ts             — register crawl routes
server/job-manager.ts     — add "crawl", "narrative-site-eval", "visual-site-eval" to JobKind
```

---

## 1. Site Crawler (`server/shared/site-crawler.ts`)

```ts
interface CrawlOptions {
  maxDepth?: number;    // default: 3
  maxUrls?: number;     // default: 100
  timeoutMs?: number;   // default: 30000
}

interface CrawlResult {
  urls: string[];
  source: "sitemap" | "crawl";
  rootUrl: string;
}

async function discoverUrls(rootUrl: string, options?: CrawlOptions, emit?: (msg: string, pct?: number) => void): Promise<CrawlResult>
```

**Strategy: sitemap.xml first, Playwright fallback**

1. Parse `robots.txt` for `Sitemap:` directive
2. If found, fetch and parse sitemap XML (handle sitemap index files with one level of recursion)
3. Extract all `<loc>` URLs
4. If no sitemap, fall back to Playwright BFS:
   - Navigate root URL with `getBrowser()` + `networkidle`
   - Extract all `<a href>` same-origin links
   - Follow up to `maxDepth` levels
   - Deduplicate

**Deduplication rules:**
- Normalize trailing slashes (`/page/` = `/page`)
- Strip `#hash` fragments
- Strip query params for dedup (keep canonical form for display)
- Skip: non-HTML (`.pdf`, `.zip`, `.csv`), `mailto:`, `tel:`, `javascript:`, external domains

**Reuses:** `getBrowser()` from `renderer.ts`, `isPublicUrl()` from `utils.ts`

---

## 2. Crawl Routes (`server/crawl-routes.ts`)

Mounted at `/api/crawl` in `www/server.ts`.

**`POST /api/crawl`**
```ts
// Request
{ url: string, maxDepth?: number, maxUrls?: number }

// Response: 202 { jobId }
// Job result: CrawlResult { urls: string[], source: "sitemap" | "crawl", rootUrl: string }
```

Runs as a background job via `jobManager` with SSE progress:
- "Checking sitemap.xml..." (10%)
- "Parsing sitemap..." / "Crawling pages..." (20-80%)
- "Found 47 pages" (100%)

---

## 3. Page Filter Component (`www/shared/page-filter.js`)

A reusable JavaScript class that renders and manages the page filtering UI.

### API

```js
import { PageFilter } from '/shared/page-filter.js';

const filter = new PageFilter({
  container: document.getElementById('page-filter-section'),
  onSelectionChange: (selectedUrls) => { /* update badge, enable/disable button */ },
});

// Methods
filter.getSelectedUrls()    // string[] — currently checked URLs
filter.isMultiPageMode()    // boolean — true if >1 URL selected
filter.reset()              // clear discovered URLs, collapse
```

### What it renders inside the container

An accordion matching the "Customize Evaluation" style:

```html
<div class="customize-accordion">
  <button class="customize-toggle">
    Page Filtering <span class="filter-count"></span>
    <span class="chevron">▼</span>
  </button>
  <div class="customize-body">
    <!-- Discover button -->
    <button class="btn" id="discover-btn">Discover Pages</button>
    <div id="discover-progress"></div>

    <!-- URL list (hidden until discovered) -->
    <div id="url-list">
      <!-- Glob filter input -->
      <input type="text" placeholder="Filter: /blog/* or !/admin/*">

      <!-- Grouped URL tree -->
      <div class="url-groups">
        <!-- Group: / -->
        <div class="url-group">
          <label><input type="checkbox" checked> / (root) <span class="group-count">3 pages</span></label>
          <div class="url-items">
            <label><input type="checkbox" checked> /</label>
            <label><input type="checkbox" checked> /about</label>
            <label><input type="checkbox" checked> /pricing</label>
          </div>
        </div>
        <!-- Group: /products -->
        ...
      </div>

      <!-- Count badge -->
      <div class="filter-summary">12 of 47 pages selected</div>
    </div>
  </div>
</div>
```

### Behavior

- **Discover button** reads the URL from the page's existing URL input (`#page-url`)
- Calls `POST /api/crawl` → tracks job via SSE → populates URL list on complete
- **Group toggles** check/uncheck all URLs in a path group
- **Glob filter** input applies include/exclude patterns in real-time:
  - `/blog/*` → only show/check URLs matching `/blog/*`
  - `!/admin/*` → uncheck URLs matching `/admin/*` (prefix `!` = exclude)
- **Count badge** updates on every change
- **onSelectionChange callback** fires on every checkbox/glob change

### Shared CSS (`www/shared/page-filter.css`)

Styles for URL groups, checkboxes, filter input, count badge. Uses same design tokens as the customize accordion (same border, background, font sizes).

---

## 4. Cross-Page Types (`server/shared/cross-page-types.ts`)

```ts
interface PageSummary {
  url: string;
  title: string;
  role: string;           // "industry entry" | "product page" | "case study" | etc.
  funnelStage: string;    // "awareness" | "consideration" | "decision"
  briefAssessment: string;
}

interface IssueCard {
  type: "redundancy" | "gap" | "role_overlap" | "journey_disconnect" | "cta_pattern" | "message_drift";
  severity: "error" | "warning";
  title: string;
  description: string;     // markdown
  affectedPages: string[]; // URLs
  recommendation: string;  // markdown — specific restructuring advice
}

interface CrossPageEvalReport {
  kind: "narrative-site-eval" | "visual-site-eval";
  rootUrl: string;

  // Pass 1: Individual page evaluations (full EvalReport per page)
  perPageReports: EvalReport[];   // one complete evaluation per selected page

  // Pass 2: Cross-page holistic analysis
  pages: PageSummary[];           // role + funnel stage assignment per page (from synthesis)
  siteScore: number;              // 0-1 (cross-page dimensions only)
  siteGrade: string;              // A/B/C/D/F
  crossPageIssues: IssueCard[];   // redundancy, gaps, overlap, journey issues
  dimensions: DimensionResult[];  // cross-page dimensions (shared scoring.ts type)
  siteNarrative: string;          // strategic markdown prose — site-level diagnosis
  prioritizedActions: string[];   // ordered list of highest-leverage changes
  config: {
    guidelines: string[];
    personas: string[];
    tone: string;
    customInstructions: string;
  };
  metadata: {
    evaluatedAt: string;
    modelUsed: string;
    pageCount: number;
  };
}
```

---

## 5. Cross-Page Dimensions

### Narrative cross-page (7 dimensions)

| Tier | ID | Dimension | Weight |
|---|---|---|---|
| T1 | `content_redundancy` | Content Redundancy — same messaging repeated across pages | 3 |
| T1 | `funnel_coverage_gaps` | Funnel Coverage Gaps — missing stages or audiences | 3 |
| T1 | `page_role_differentiation` | Page Role Differentiation — each page has a unique job | 3 |
| T2 | `purchase_journey_coherence` | Purchase Journey Coherence — CTAs lead logically between pages | 2 |
| T2 | `message_consistency` | Message Consistency — consistent voice without repetition | 2 |
| T2 | `cta_escalation_strategy` | CTA Escalation — commitment escalates through funnel | 2 |
| T2 | `ia_coherence` | IA Coherence — pages form a navigable hierarchy | 2 |

### Visual cross-page (5 dimensions)

| Tier | ID | Dimension | Weight |
|---|---|---|---|
| T1 | `visual_consistency` | Visual Consistency — consistent imagery style across pages | 3 |
| T1 | `visual_redundancy` | Visual Redundancy — same images/patterns reused too much | 3 |
| T2 | `visual_hierarchy_coherence` | Visual Hierarchy Coherence — hierarchy patterns consistent | 2 |
| T2 | `imagery_differentiation` | Imagery Differentiation — each page has distinct visual identity | 2 |
| T2 | `brand_visual_coherence` | Brand Visual Coherence — imagery aligns with brand palette/style | 2 |

---

## 6. Cross-Page Engines

### Two-Pass Architecture

Multi-page evaluation produces TWO distinct outputs in one report:

**Pass 1 — Individual page evaluations (parallel):**
Run the existing single-page engine (`evaluateNarrative()` or `evaluateVisual()`) on EACH selected page independently. This produces a full `EvalReport` per page — the same output the user would get from evaluating each page individually. These are NOT summarized or reduced — each page gets its complete strategic assessment, dimension scores, and top structural change.

**Pass 2 — Holistic cross-page synthesis (sequential, after Pass 1):**
Feed ALL pages' extracted text into ONE synthesis prompt that evaluates the pages as a system. This produces the cross-page issue cards (redundancy, gaps, role overlap, journey coherence) and the site-level strategic narrative. This pass ONLY looks at cross-page concerns — it does not re-evaluate individual page quality.

Both passes appear in the final `CrossPageEvalReport`: `perPageReports[]` (from Pass 1) + `crossPageIssues[]` + `siteNarrative` (from Pass 2).

### Narrative (`server/narrative/cross-page-engine.ts`)

**Pipeline:**
1. Fetch all selected pages in parallel via `fetchPage()` (with concurrency cap)
2. **Pass 1:** Run `evaluateNarrative()` on each page (reuse existing engine, parallel with concurrency cap). Produces `EvalReport[]` — one per page.
3. **Pass 2:** Run `extractText()` on each page's HTML, cap at ~3K chars each. Build one synthesis prompt with all pages' text + cross-page system prompt.
4. System prompt identity: "You are a senior content strategist conducting a site-wide content audit. You evaluate how pages work together as a system, not individually. You have already received individual page assessments — focus ONLY on cross-page patterns."
5. Chain of thought: page role assignment → funnel mapping → redundancy scan → gap analysis → journey check → recommendations
7. Response format (JSON):
   ```json
   {
     "pages": [{ "url": "...", "role": "...", "funnelStage": "...", "briefAssessment": "..." }],
     "crossPageIssues": [{ "type": "...", "severity": "...", "title": "...", "description": "...", "affectedPages": [...], "recommendation": "..." }],
     "dimensions": [{ "id": "...", "score": 1-5, "findings": "...", "suggestions": "..." }],
     "siteNarrative": "<markdown — site-level strategic diagnosis, 600-1000 words>",
     "prioritizedActions": ["action 1", "action 2", ...]
   }
   ```
8. Every issue card recommendation must name specific pages and specific content to move/merge/add
9. Use markdown in siteNarrative (## headings, **bold**, - bullets — same format as single-page)
10. Timeout: 180s (parallel fetch + one large LLM call)

### Visual (`server/visual/cross-page-engine.ts`)

Same pipeline structure but:
- Uses `extractImages()` from `visual/engine.ts` instead of `extractText()`
- Sends above-fold screenshots of all pages (base64) in addition to image metadata
- System prompt focuses on visual consistency, imagery style, brand coherence
- 5 visual cross-page dimensions instead of 7 narrative ones
- siteNarrative focuses on visual diagnosis

---

## 7. Multi-Page Evaluation Flow (Client Side)

When `filter.isMultiPageMode()` is true, the evaluate button triggers:

**Narrative page (`www/narrative/js/main.js`):**
```js
const res = await fetch('/api/narrative/evaluate-site', {
  method: 'POST',
  body: JSON.stringify({
    urls: filter.getSelectedUrls(),
    ...gatherConfig(),
  }),
});
```

**Visual page (`www/visual/js/main.js`):**
```js
const res = await fetch('/api/visual/evaluate-site', {
  method: 'POST',
  body: JSON.stringify({
    urls: filter.getSelectedUrls(),
    ...gatherConfig(),
  }),
});
```

Both return `{ jobId }` → SSE progress → render `CrossPageEvalReport` on complete.

---

## 8. Multi-Page Report Rendering

The report has TWO sections: individual page results and holistic cross-page analysis.

### Section A: Individual Page Evaluations (from Pass 1)

Each page in `perPageReports[]` is rendered as an expandable card:
- **Header row:** URL, overall grade badge, score percentage
- **Expandable body:** the full single-page evaluation (same rendering as current single-page mode — strategic assessment, dimension cards, top structural change)
- First page expanded by default, rest collapsed
- Clicking a page URL expands/collapses its full evaluation

This gives the user the SAME depth of individual feedback they'd get from running each page separately.

### Section B: Holistic Cross-Page Analysis (from Pass 2)

Below the individual pages:

1. **Per-page role table** (collapsed by default):
   | URL | Role | Funnel Stage | Status |
   |-----|------|-------------|--------|
   | /signals | Product page | Consideration | 3 issues |
   | /industries/data-center | Industry entry | Awareness | 1 issue |

2. **Cross-page issue cards** (primary output, open by default, sorted by severity):
   Each card shows: type badge (redundancy/gap/overlap/disconnect), severity, title, affected page URLs as links, description (markdown), recommendation (markdown)

3. **Prioritized actions** — ordered, numbered, concrete

4. **Cross-page dimension scores** (collapsed by default)

5. **Site-level strategic narrative** at the bottom (markdown, same renderer)

**Shared rendering:** Both the per-page report cards and cross-page analysis are rendered by a shared module (`www/shared/cross-page-report.js`) so both /narrative and /visual use identical rendering code.

---

## 9. Routes

### New routes in `server/narrative-routes.ts`:

**`POST /evaluate-site`**
```ts
// Request
{ urls: string[], guidelines?: string[], personas?: string[], tone?: string, customInstructions?: string }

// Response: 202 { jobId }
// Job kind: "narrative-site-eval"
// Job result: CrossPageEvalReport
```

### New routes in `server/visual-routes.ts`:

**`POST /evaluate-site`**
Same shape, job kind `"visual-site-eval"`.

### New routes in `server/crawl-routes.ts`:

**`POST /api/crawl`**
```ts
// Request
{ url: string, maxDepth?: number, maxUrls?: number }

// Response: 202 { jobId }
// Job kind: "crawl"
// Job result: CrawlResult
```

### Server registration (`www/server.ts`):
```ts
import { crawlRoutes } from "../server/crawl-routes.js";
app.route("/api/crawl", crawlRoutes());
```

---

## 10. Job Manager Updates

Add to `JobKind` in `server/job-manager.ts`:
- `"crawl"`
- `"narrative-site-eval"`
- `"visual-site-eval"`

(Hyphenated verb form consistent with existing `"narrative-eval"`, `"visual-eval"` convention.)

Timeout for site evaluation: 300s (fetching 10+ pages + large synthesis prompt).

---

## 11. Parallel Fetch Concurrency

`fetchPage()` creates a new Playwright page per call. 20 simultaneous pages would consume ~1-2GB RAM. The cross-page engines must limit concurrency to **3-5 parallel fetches** using a simple semaphore/queue pattern. Example:

```ts
async function fetchAllPages(urls: string[], emit): Promise<PageFetchResult[]> {
  const CONCURRENCY = 4;
  const results: PageFetchResult[] = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const fetched = await Promise.all(batch.map(u => fetchPage(u)));
    results.push(...fetched);
    emit(`Fetched ${results.length} of ${urls.length} pages...`, Math.round((results.length / urls.length) * 60));
  }
  return results;
}
```

---

## 12. Session Persistence

Multi-page results saved to `EvalStore` with mode `"narrative-site-eval"` or `"visual-site-eval"`. The page's init function must check for BOTH modes — `loadLast('narrative')` and `loadLast('narrative-site')` — and restore whichever is more recent. Same for visual.

```js
// In narrative/main.js init:
const lastSingle = await EvalStore.loadLast('narrative');
const lastSite = await EvalStore.loadLast('narrative-site-eval');
const last = [lastSingle, lastSite].filter(Boolean).sort((a, b) => b.savedAt - a.savedAt)[0];
if (last) restoreSession(last);
```

The saved session includes `crawlResult` (discovered URLs) and `selectedUrls` so the page filter can be restored on return.

---

## 13. UX Details

### Mode indicator
The Evaluate button label changes based on mode:
- Single page: **"Evaluate"** (current)
- Multi-page: **"Evaluate N Pages"** (e.g., "Evaluate 12 Pages")

This makes the active mode explicit without a separate indicator.

### Glob syntax help
The glob filter input has a small `?` icon/tooltip next to it:
> "Use `/path/*` to include matching URLs. Prefix with `!` to exclude (e.g., `!/blog/*`). Separate multiple patterns with commas."

### Crawl progress and cancel
- Discover button shows SSE progress: "Checking sitemap.xml...", "Found 47 pages"
- If crawl takes >5s, a "Cancel" link appears next to the progress spinner
- Cancel closes the SSE connection and the crawl job (fire-and-forget — server may continue but client ignores)
- Timeout message at 30s: "Crawl is taking longer than expected. Try reducing max depth."

### Customize applies to multi-page
Guideline/persona/tone selections from the Customize accordion apply site-wide in multi-page mode. Add a note inside the Customize accordion when Page Filtering is active: "Settings apply to all selected pages."

### Report hierarchy
For multi-page reports, collapse secondary sections by default:
- **Open by default:** Cross-page issue cards (primary), prioritized actions
- **Collapsed by default:** Per-page summary table (expandable), dimension scores, site narrative

### Error surfaces
- **0 pages found:** Inline error inside the Page Filtering accordion, replacing the URL list area
- **Partial fetch failures:** Warning banner above results: "3 of 15 pages failed to load and were excluded"
- **Crawl error:** Inline error replacing the Discover button progress area, with retry button

### Page URL input ID
Both `/narrative/index.html` and `/visual/index.html` must use `id="page-url"` for their URL input. The PageFilter component reads from `document.getElementById('page-url').value`. Verify this ID exists on both pages before implementation.

---

## 14. Edge Cases

- **Single URL selected in multi-page mode:** Fall back to single-page evaluation (existing behavior). Button says "Evaluate" not "Evaluate 1 Page".
- **Too many pages (>20):** Cap at 20 with a warning. Truncate body text per page to ~2K chars to fit token budget.
- **Crawl finds 0 pages:** Inline error in accordion: "No pages found. Check the URL or try a different site."
- **Page fetch fails for some URLs:** Skip failed pages, include them in report as "failed to fetch" with the error. Evaluate the rest. Warning banner in results.
- **Duplicate content across pages (same page, different URLs):** Deduplication in crawler handles this.
- **Clicking Discover while crawl is running:** Ignore (button disabled during crawl).
