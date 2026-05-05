# Multi-Page Evaluation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-page evaluation to /narrative and /visual pages — crawl a site, select pages, get individual page evaluations AND holistic cross-page analysis identifying redundancy, gaps, and IA issues.

**Architecture:** Shared site crawler + page filter component used by both pages. Two-pass evaluation: Pass 1 runs existing single-page engines per page, Pass 2 runs a cross-page synthesis prompt. Shared report renderer for both pages.

**Tech Stack:** Hono, Playwright, OpenAI GPT-4o, TypeScript (server), vanilla JS (client), IndexedDB (persistence)

**Spec:** `docs/superpowers/specs/2026-04-09-multi-page-evaluation-design.md`

---

## File Map

### New files to create:

```
server/shared/
  site-crawler.ts          — URL discovery (sitemap + Playwright BFS)
  cross-page-types.ts      — shared types (PageSummary, IssueCard, CrossPageEvalReport)

server/
  crawl-routes.ts          — POST /api/crawl endpoint

server/narrative/
  cross-page-guidelines.ts — 7 cross-page narrative dimensions
  cross-page-engine.ts     — two-pass narrative site evaluation

server/visual/
  cross-page-guidelines.ts — 5 cross-page visual dimensions
  cross-page-engine.ts     — two-pass visual site evaluation

www/shared/
  page-filter.js           — reusable page filtering UI component
  page-filter.css          — shared styles for page filter accordion
  cross-page-report.js     — shared cross-page report renderer
```

### Existing files to modify:

```
server/job-manager.ts         — add "crawl", "narrative-site-eval", "visual-site-eval" to JobKind
server/narrative-routes.ts    — add POST /evaluate-site endpoint
server/visual-routes.ts       — add POST /evaluate-site endpoint
www/server.ts                 — register crawl routes
www/narrative/index.html      — add page-filter-section placeholder
www/narrative/js/main.js      — import PageFilter, wire multi-page flow, update session restore
www/visual/index.html         — add page-filter-section placeholder
www/visual/js/main.js         — import PageFilter, wire multi-page flow, update session restore
```

---

## Task 1: Cross-Page Types + Job Manager Updates

**Files:**
- Create: `server/shared/cross-page-types.ts`
- Modify: `server/job-manager.ts`

- [ ] **Step 1: Create `server/shared/cross-page-types.ts`**

Define the shared types used by both narrative and visual cross-page engines:

```ts
import type { DimensionResult, EvalReport } from "./scoring.js";

export interface PageSummary {
  url: string;
  title: string;
  role: string;
  funnelStage: string;
  briefAssessment: string;
}

export interface IssueCard {
  type: "redundancy" | "gap" | "role_overlap" | "journey_disconnect" | "cta_pattern" | "message_drift";
  severity: "error" | "warning";
  title: string;
  description: string;
  affectedPages: string[];
  recommendation: string;
}

export interface CrossPageEvalReport {
  kind: "narrative-site-eval" | "visual-site-eval";
  rootUrl: string;
  perPageReports: EvalReport[];
  pages: PageSummary[];
  siteScore: number;
  siteGrade: string;
  crossPageIssues: IssueCard[];
  dimensions: DimensionResult[];
  siteNarrative: string;
  prioritizedActions: string[];
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

- [ ] **Step 2: Add new job kinds to `server/job-manager.ts`**

Add `"crawl"`, `"narrative-site-eval"`, `"visual-site-eval"` to the `JobKind` union type.

- [ ] **Step 3: Commit**

```bash
git add server/shared/cross-page-types.ts server/job-manager.ts
git commit -m "feat: add cross-page types and job kinds for multi-page evaluation"
```

---

## Task 2: Site Crawler

**Files:**
- Create: `server/shared/site-crawler.ts`

- [ ] **Step 1: Create `server/shared/site-crawler.ts`**

Implement URL discovery with sitemap.xml primary and Playwright BFS fallback:

```ts
import { getBrowser } from "../renderer.js";
import { isPublicUrl } from "../utils.js";

export interface CrawlOptions {
  maxDepth?: number;
  maxUrls?: number;
  timeoutMs?: number;
}

export interface CrawlResult {
  urls: string[];
  source: "sitemap" | "crawl";
  rootUrl: string;
}

export async function discoverUrls(
  rootUrl: string,
  options?: CrawlOptions,
  emit?: (msg: string, pct?: number) => void,
): Promise<CrawlResult>
```

Implementation details:
- Validate URL (parse, http/https, isPublicUrl)
- Try `GET {origin}/robots.txt` → find `Sitemap:` line → fetch that URL
- If no robots.txt sitemap, try `GET {origin}/sitemap.xml`
- Parse sitemap XML: extract all `<loc>` tags via regex `/<loc>([^<]+)<\/loc>/g`
- Handle sitemap index: if XML contains `<sitemapindex>`, recurse one level to fetch child sitemaps
- If no sitemap found, fall back to Playwright BFS:
  - Navigate root URL, extract `document.querySelectorAll('a[href]')` same-origin links
  - BFS with queue, visited Set, maxDepth (default 3)
  - Each level: filter same-origin, normalize, deduplicate
- Deduplication: normalize trailing slashes, strip `#hash`, strip query params for dedup
- Skip: `.pdf`, `.zip`, `.csv`, `.png`, `.jpg`, `mailto:`, `tel:`, `javascript:`, external domains
- Cap at maxUrls (default 100)
- Sort URLs alphabetically before returning
- Use `emit()` for progress throughout

- [ ] **Step 2: Commit**

```bash
git add server/shared/site-crawler.ts
git commit -m "feat: add site crawler with sitemap + Playwright BFS fallback"
```

---

## Task 3: Crawl Routes + Server Registration

**Files:**
- Create: `server/crawl-routes.ts`
- Modify: `www/server.ts`

- [ ] **Step 1: Create `server/crawl-routes.ts`**

```ts
import { Hono } from "hono";
import { jobManager } from "./job-manager.js";
import { discoverUrls } from "./shared/site-crawler.js";
import { isPublicUrl } from "./utils.js";

export function crawlRoutes() {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof SyntaxError) return c.json({ error: "Invalid request body" }, 400);
    console.error("[crawl]", err);
    return c.json({ error: "Internal server error" }, 500);
  });

  app.post("/", async (c) => {
    const body = await c.req.json<{ url?: string; maxDepth?: number; maxUrls?: number }>();
    if (!body.url) return c.json({ error: "url is required" }, 400);

    // Validate URL
    let parsed: URL;
    try { parsed = new URL(body.url); } catch { return c.json({ error: "Invalid URL" }, 400); }
    if (!parsed.protocol.startsWith("http")) return c.json({ error: "URL must use http or https" }, 400);
    if (!isPublicUrl(body.url)) return c.json({ error: "URL targets a private/internal address" }, 400);

    const job = jobManager.create("crawl", {
      label: parsed.hostname,
      page: "/narrative", // crawl is shared, but tag it for the bar
      url: body.url,
    });

    jobManager.run(job.id, async (_job, emit) => {
      return discoverUrls(body.url!, {
        maxDepth: body.maxDepth,
        maxUrls: body.maxUrls,
      }, emit);
    }, 60_000);

    return c.json({ jobId: job.id }, 202);
  });

  return app;
}
```

- [ ] **Step 2: Register in `www/server.ts`**

Add import and route registration:
```ts
import { crawlRoutes } from "../server/crawl-routes.js";
// After existing routes:
app.route("/api/crawl", crawlRoutes());
```

Add console log line for the new route.

- [ ] **Step 3: Commit**

```bash
git add server/crawl-routes.ts www/server.ts
git commit -m "feat: add crawl API route with server registration"
```

---

## Task 4: Cross-Page Guidelines (Narrative + Visual)

**Files:**
- Create: `server/narrative/cross-page-guidelines.ts`
- Create: `server/visual/cross-page-guidelines.ts`

- [ ] **Step 1: Create `server/narrative/cross-page-guidelines.ts`**

7 cross-page narrative dimensions using the same `Guideline` interface from `./guidelines.ts`:

Tier 1 (enabled, weight 3, error): `content_redundancy`, `funnel_coverage_gaps`, `page_role_differentiation`
Tier 2 (enabled, weight 2, warning): `purchase_journey_coherence`, `message_consistency`, `cta_escalation_strategy`, `ia_coherence`

Each with descriptive `label` and `description` matching the spec.

- [ ] **Step 2: Create `server/visual/cross-page-guidelines.ts`**

5 cross-page visual dimensions:

Tier 1 (enabled, weight 3, error): `visual_consistency`, `visual_redundancy`
Tier 2 (enabled, weight 2, warning): `visual_hierarchy_coherence`, `imagery_differentiation`, `brand_visual_coherence`

- [ ] **Step 3: Commit**

```bash
git add server/narrative/cross-page-guidelines.ts server/visual/cross-page-guidelines.ts
git commit -m "feat: add cross-page evaluation guidelines for narrative and visual"
```

---

## Task 5: Narrative Cross-Page Engine

**Files:**
- Create: `server/narrative/cross-page-engine.ts`

- [ ] **Step 1: Create `server/narrative/cross-page-engine.ts`**

Two-pass evaluation engine:

```ts
import OpenAI from "openai";
import { fetchPage, type PageFetchResult } from "../shared/page-fetcher.js";
import { evaluateNarrative, extractText } from "./engine.js";
import { NARRATIVE_GUIDELINES, type Guideline } from "./guidelines.js";
import { CROSS_PAGE_NARRATIVE_GUIDELINES } from "./cross-page-guidelines.js";
import type { TonePreset } from "../shared/tone-presets.js";
import { TONE_PROMPTS } from "../shared/tone-presets.js";
import { buildPersonaPrompt } from "../shared/personas.js";
import { computeOverallScore, scoreToGrade, type DimensionResult, type EvalReport } from "../shared/scoring.js";
import type { CrossPageEvalReport, PageSummary, IssueCard } from "../shared/cross-page-types.js";

export interface SiteEvalRequest {
  urls: string[];
  guidelines?: Guideline[];
  personas: string[];
  tone: TonePreset;
  customInstructions: string;
  emit: (msg: string, pct?: number) => void;
}

export async function evaluateNarrativeSite(req: SiteEvalRequest): Promise<CrossPageEvalReport>
```

Implementation:
- **Concurrency-limited fetch:** Batch fetch pages in groups of 4 using the pattern from the spec
- **Pass 1:** Run `evaluateNarrative()` on each page (concurrency 2 — LLM calls). Each produces an `EvalReport`. Screenshot saving uses `narrative-evals/{uuid}/` path. Progress: "Evaluating page 3 of 12..." (0-60%)
- **Pass 2:** Extract text from each page (reuse `extractText()`, cap 3K chars each). Build synthesis prompt with:
  - System prompt: senior content strategist identity
  - Chain of thought: page role → funnel mapping → redundancy → gaps → journey → recommendations
  - All pages' text labeled by URL
  - Cross-page guidelines as evaluation criteria
  - Persona + tone + custom instructions
  - Response format: JSON with `pages`, `crossPageIssues`, `dimensions`, `siteNarrative`, `prioritizedActions`
  - Specificity constraint: every recommendation names specific pages and content
  - Markdown for siteNarrative (## headings, **bold**, - bullets, no top-level #)
- Progress: "Analyzing cross-page patterns..." (60-90%), "Complete!" (100%)
- Merge: combine `perPageReports[]` from Pass 1 with synthesis results from Pass 2 into `CrossPageEvalReport`

- [ ] **Step 2: Commit**

```bash
git add server/narrative/cross-page-engine.ts
git commit -m "feat: add narrative cross-page evaluation engine with two-pass architecture"
```

---

## Task 6: Visual Cross-Page Engine

**Files:**
- Create: `server/visual/cross-page-engine.ts`

- [ ] **Step 1: Create `server/visual/cross-page-engine.ts`**

Same two-pass structure as narrative but:
- Pass 1: Uses `evaluateVisual()` from `./engine.ts`
- Pass 2: Uses `extractImages()` for metadata + sends above-fold screenshots (base64) of all pages
- System prompt focuses on visual consistency, imagery style, brand coherence
- 5 visual cross-page dimensions from `./cross-page-guidelines.ts`
- `kind: "visual-site-eval"`

```ts
import { evaluateVisual, extractImages } from "./engine.js";
import { CROSS_PAGE_VISUAL_GUIDELINES } from "./cross-page-guidelines.js";
import type { CrossPageEvalReport } from "../shared/cross-page-types.js";

export interface VisualSiteEvalRequest {
  urls: string[];
  guidelines?: any[];
  personas: string[];
  tone: string;
  customInstructions: string;
  emit: (msg: string, pct?: number) => void;
}

export async function evaluateVisualSite(req: VisualSiteEvalRequest): Promise<CrossPageEvalReport>
```

- [ ] **Step 2: Commit**

```bash
git add server/visual/cross-page-engine.ts
git commit -m "feat: add visual cross-page evaluation engine"
```

---

## Task 7: Site Evaluation Routes

**Files:**
- Modify: `server/narrative-routes.ts`
- Modify: `server/visual-routes.ts`

- [ ] **Step 1: Add `POST /evaluate-site` to `server/narrative-routes.ts`**

New endpoint at the bottom of the existing `narrativeRoutes()` function:

```ts
app.post("/evaluate-site", async (c) => {
  const body = await c.req.json<{
    urls?: string[];
    guidelines?: string[];
    personas?: string[];
    tone?: string;
    customInstructions?: string;
  }>();

  if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
    return c.json({ error: "urls array is required" }, 400);
  }
  if (body.urls.length > 20) {
    return c.json({ error: "Maximum 20 pages per evaluation" }, 400);
  }

  const job = jobManager.create("narrative-site-eval", {
    label: `${body.urls.length} pages`,
    page: "/narrative",
  });

  jobManager.run(job.id, async (_job, emit) => {
    // Resolve guidelines
    let guidelines = NARRATIVE_GUIDELINES;
    if (body.guidelines && Array.isArray(body.guidelines)) {
      const enabledSet = new Set(body.guidelines);
      guidelines = NARRATIVE_GUIDELINES.map(g => ({ ...g, enabled: enabledSet.has(g.id) }));
    }

    return evaluateNarrativeSite({
      urls: body.urls!,
      guidelines,
      personas: body.personas || ["facility_manager"],
      tone: (body.tone as TonePreset) || "authoritative",
      customInstructions: (body.customInstructions || "").slice(0, 2000),
      emit,
    });
  }, 300_000);

  return c.json({ jobId: job.id }, 202);
});
```

Import `evaluateNarrativeSite` from `./narrative/cross-page-engine.js` at the top.

- [ ] **Step 2: Add `POST /evaluate-site` to `server/visual-routes.ts`**

Same pattern but uses `evaluateVisualSite` from `./visual/cross-page-engine.js`, job kind `"visual-site-eval"`, page `"/visual"`.

- [ ] **Step 3: Commit**

```bash
git add server/narrative-routes.ts server/visual-routes.ts
git commit -m "feat: add evaluate-site endpoints for multi-page evaluation"
```

---

## Task 8: Shared Page Filter Component

**Files:**
- Create: `www/shared/page-filter.js`
- Create: `www/shared/page-filter.css`

- [ ] **Step 1: Create `www/shared/page-filter.css`**

Styles for the page filter accordion, URL groups, checkboxes, glob input, count badge. Reuse the same design tokens as the customize accordion (`.customize-accordion`, `.customize-toggle`, `.customize-body` patterns).

Key classes: `.url-group`, `.url-group-header`, `.url-items`, `.url-item`, `.filter-input`, `.filter-summary`, `.filter-help`.

- [ ] **Step 2: Create `www/shared/page-filter.js`**

Reusable `PageFilter` class:

```js
import { esc } from '/shared/utils.js';

export class PageFilter {
  constructor({ container, onSelectionChange }) { ... }

  // Public API
  getSelectedUrls()    // string[]
  isMultiPageMode()    // boolean — true if >1 URL selected
  reset()              // clear URLs, collapse
  getButtonLabel()     // "Evaluate" or "Evaluate N Pages"

  // Internal
  _render()            // renders accordion HTML into container
  _discover()          // POST /api/crawl → SSE → populate URL list
  _groupUrls(urls)     // group by first path segment
  _applyGlob(pattern)  // filter URLs by glob pattern
  _updateCount()       // update the "N of M selected" badge
}
```

Implementation details:
- **Accordion:** Same HTML structure as Customize (`.customize-accordion` > `.customize-toggle` + `.customize-body`)
- **Discover button:** Reads URL from `document.getElementById('page-url').value`. POST to `/api/crawl`. Track via SSE (`EventSource`). On complete, fetch full job result, populate URL tree.
- **URL grouping:** Group by first path segment (`/`, `/products`, `/blog`, etc.). Each group has a header checkbox that toggles all children.
- **Glob filter:** Input with placeholder. On input, apply include/exclude patterns. `!` prefix = exclude. Simple glob: `*` matches any characters. Filter in real-time.
- **Glob help tooltip:** Small `?` icon next to input with title attribute explaining syntax.
- **Count badge:** "N of M pages selected" — updates on every change.
- **onSelectionChange callback:** Fires on every checkbox/glob change with `selectedUrls[]`.
- **Cancel:** If crawl takes >5s, show cancel link. Cancel closes EventSource.
- **Discover while running:** Disable button during crawl.
- **0 results:** Show inline error in accordion.

- [ ] **Step 3: Commit**

```bash
git add www/shared/page-filter.js www/shared/page-filter.css
git commit -m "feat: add shared page filter component for multi-page evaluation"
```

---

## Task 9: Shared Cross-Page Report Renderer

**Files:**
- Create: `www/shared/cross-page-report.js`

- [ ] **Step 1: Create `www/shared/cross-page-report.js`**

Shared renderer used by both /narrative and /visual for cross-page reports:

```js
import { esc } from '/shared/utils.js';

// Import renderMarkdown from whichever page loaded it, or inline a copy
// Since both pages define renderMarkdown identically, extract it here too

export function renderCrossPageReport(report, container, renderMarkdown) { ... }
```

Renders the full `CrossPageEvalReport`:

**Section A: Individual Page Evaluations** (`report.perPageReports[]`):
- Each page as an expandable card
- Header: URL (truncated), grade badge, score percentage
- Body (expandable): the full single-page report (narrative/assessment, dimension cards)
- First page expanded, rest collapsed
- Use `<details>` for expand/collapse

**Section B: Holistic Cross-Page Analysis:**

1. **Per-page role table** (collapsed `<details>`):
   - `report.pages[]` rendered as table rows: URL, role, funnel stage, brief assessment

2. **Cross-page issue cards** (`report.crossPageIssues[]`, open):
   - Each card: type badge (styled by type), severity badge, title, affected pages as links, description (renderMarkdown), recommendation (renderMarkdown)
   - Sorted: errors first, then warnings

3. **Prioritized actions** (`report.prioritizedActions[]`):
   - Numbered ordered list

4. **Cross-page dimension scores** (`report.dimensions[]`, collapsed `<details>`):
   - Same dimension card style as single-page (score pips, findings, suggestions)

5. **Site-level narrative** (`report.siteNarrative`):
   - Rendered with `renderMarkdown()` in a `.narrative-block` div

**Styling:** Reuse existing CSS classes (`.dimension-card`, `.grade-a` through `.grade-f`, `.narrative-block`). Add minimal new styles for issue cards inline.

- [ ] **Step 2: Commit**

```bash
git add www/shared/cross-page-report.js
git commit -m "feat: add shared cross-page report renderer"
```

---

## Task 10: Integrate into /narrative and /visual Pages

**Files:**
- Modify: `www/narrative/index.html`
- Modify: `www/narrative/js/main.js`
- Modify: `www/visual/index.html`
- Modify: `www/visual/js/main.js`

- [ ] **Step 1: Add page-filter placeholder to both HTML files**

In both `www/narrative/index.html` and `www/visual/index.html`, add:
- `<link rel="stylesheet" href="/shared/page-filter.css">` in the `<head>`
- `<div id="page-filter-section"></div>` after the URL input row and before the Customize accordion

- [ ] **Step 2: Update `www/narrative/js/main.js`**

Add imports:
```js
import { PageFilter } from '/shared/page-filter.js';
import { renderCrossPageReport } from '/shared/cross-page-report.js';
```

Initialize the filter:
```js
const filter = new PageFilter({
  container: document.getElementById('page-filter-section'),
  onSelectionChange: (urls) => {
    evalBtn.textContent = filter.isMultiPageMode() ? `Evaluate ${urls.length} Pages` : 'Evaluate';
  },
});
```

Update the evaluate button click handler:
- If `filter.isMultiPageMode()`:
  - POST to `/api/narrative/evaluate-site` with `{ urls: filter.getSelectedUrls(), ...gatherConfig() }`
  - Track via SSE, on complete render with `renderCrossPageReport()`
- Else: existing single-page flow (unchanged)

Update session restore (init):
```js
const lastSingle = await EvalStore.loadLast('narrative');
const lastSite = await EvalStore.loadLast('narrative-site-eval');
const last = [lastSingle, lastSite].filter(Boolean).sort((a, b) => b.savedAt - a.savedAt)[0];
```

Update `saveSession()` to include `crawlResult` and `selectedUrls` for multi-page sessions.

- [ ] **Step 3: Update `www/visual/js/main.js`**

Exact same changes as narrative but:
- POST to `/api/visual/evaluate-site`
- `loadLast('visual')` and `loadLast('visual-site-eval')`
- Mode `'visual-site-eval'` for multi-page saves

- [ ] **Step 4: Commit**

```bash
git add www/narrative/ www/visual/ www/shared/page-filter.css
git commit -m "feat: integrate multi-page evaluation into narrative and visual pages"
```

---

## Task 11: Integration Testing

- [ ] **Step 1: Run existing test suite**

```bash
npx vitest run
```

Expected: All 284 existing tests pass.

- [ ] **Step 2: Start server and smoke test**

```bash
npm start
```

Test crawl:
1. Navigate to `/narrative`
2. Enter `https://verdigris.co` in URL input
3. Expand "Page Filtering" accordion
4. Click "Discover Pages" — verify SSE progress, URL list appears
5. Select/deselect pages, verify count badge updates
6. Button should say "Evaluate N Pages"

Test multi-page evaluation:
7. Click "Evaluate N Pages" — verify SSE progress
8. Verify results show: individual page cards (expandable) + cross-page issue cards + site narrative
9. Navigate away and back — verify session restores

Test single-page mode:
10. Collapse Page Filtering, evaluate a single URL — verify existing behavior unchanged

Repeat steps 1-10 on `/visual`.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration testing fixes for multi-page evaluation"
```
