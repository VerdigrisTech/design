# Per-Image Visual Evaluation — Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Goal:** Extract and individually evaluate every significant image on a page, scoring each on narrative relevance, quality, and brand alignment. Show results as a side-by-side view: annotated page screenshot on the left, scrollable image cards on the right.

---

## Overview

Add an "Image Analysis" section to the /visual page results. After the existing page-level visual evaluation, the system extracts individual images from the page via Playwright, evaluates each with GPT-4o vision (in context of its surrounding section text), and presents per-image scores with the actual images visible.

This makes visual feedback actionable — instead of "hero image doesn't match narrative" the user sees the actual hero image, scored 2/5, with "This stock bokeh photo has no connection to the energy monitoring value proposition stated in the heading 'Detect Equipment Degradation'."

---

## Architecture

### Reuses existing infrastructure:

- `renderer.ts` `getBrowser()` — singleton Playwright browser instance
- `shared/cost-tracker.ts` — `CostAccumulator`, `CostEntry`, `CostSummary` types
- `audit-crawler.ts` — reference for patterns (scrolling, element screenshot), but NOT direct function imports (see note below)

### NOT reused (build fresh in `image-analyzer.ts`):

- `audit-crawler.ts:extractImgAsset()` — this is a private (non-exported) function that returns `PageAsset | null`, not `ExtractedPageImage`. The image analyzer implements its own extraction with the correct type, narrative context, and position data.
- `evaluation/engine.ts:evaluateAsset()` — this evaluates against design system tokens, not narrative relevance. The image analyzer uses its own GPT-4o vision prompt specialized for per-image narrative/quality evaluation.

### Playwright Lifecycle (IMPORTANT):

`fetchPage()` closes the Playwright page in a `finally` block. Its cached `PageFetchResult` only contains screenshot buffers + HTML — NOT a live `Page` object. The image analyzer **must open its own Playwright page** via `getBrowser()`, navigate to the URL, and manage its own page lifecycle. The `fetchPage()` cache MAY be used for the full-page screenshot in the UI overlay — but NOT for any Playwright element operations.

### New files:

```
server/visual/
  image-analyzer.ts        — orchestrates per-image extraction + evaluation
  image-types.ts           — ExtractedPageImage, ImageEvalResult, ImageAnalysisResult types

www/shared/
  image-analysis.js        — side-by-side UI renderer (shared component)
  image-analysis.css       — styles for the image analysis section
```

### Modified files:

```
server/visual-routes.ts    — add POST /analyze-images endpoint
server/job-manager.ts      — add "visual-image-eval" to JobKind
www/visual/index.html      — add image-analysis-section placeholder (after #fix-section, before </div> <!-- .content -->) + CSS import
www/visual/js/main.js      — wire "Analyze Images" button + render results
```

---

## 1. Image Extraction

The image analyzer opens its own Playwright page via `getBrowser()` and navigates to the URL independently:

1. `const browser = await getBrowser(); const page = await browser.newPage();`
2. `await page.setViewportSize({ width: 1280, height: 800 });`
3. Navigate: `await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });`
4. Take full-page screenshot for the left panel overlay
5. Scroll to trigger lazy loading (same scroll pattern as `audit-crawler.ts:scrollForLazyContent` — scroll down in increments, wait 500ms)
6. Find all `<img>` elements: `const images = await page.locator('img').all();`
7. For each image locator:
   - Check visibility: `if (!(await loc.isVisible())) continue;`
   - Get bounding box: `const box = await loc.boundingBox(); if (!box) continue;`
   - Skip if too small: `if (box.width * box.height < 10000) continue;` (100×100px threshold)
   - Skip tracking pixels: `if (box.width <= 1 || box.height <= 1) continue;`
   - Screenshot the element: `const buf = await loc.screenshot({ type: 'png' });`
   - Extract narrative context:
     ```js
     const ctx = await loc.evaluate(el => ({
       src: el.src,
       alt: el.alt,
       sectionHeading: el.closest('section,article,[class*="section"],[class*="hero"]')?.querySelector('h1,h2,h3')?.textContent?.trim() || null,
       nearestParagraph: el.closest('section,article,[class*="section"]')?.querySelector('p')?.textContent?.trim()?.slice(0, 300) || null,
       cssSelector: (() => { /* inline CSS path builder — see audit-crawler.ts:cssPath for reference pattern */ })(),
     }));
     ```
8. Close the page in a `finally` block
9. Save each captured image to disk: `visual-evals/{jobId}/image-{imageId}.png`
10. Populate `screenshotUrl` with the disk path

### Output type (`server/visual/image-types.ts`):

```ts
import type { CostEntry, CostSummary } from "../shared/cost-tracker.js";

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedPageImage {
  id: string;                    // randomUUID()
  src: string;                   // original src URL
  alt: string;
  screenshotUrl: string;         // disk path after saving (NO Buffer in this type)
  position: ImagePosition;
  visualArea: number;            // width * height
  isAboveFold: boolean;          // position.y + position.height < 800
  narrativeContext: {
    sectionHeading: string | null;
    nearestParagraph: string | null;
  };
  cssSelector: string;
  type: "img" | "svg" | "css-background";
}
```

**Note:** `screenshotBuffer` is NOT stored in the type. The analyzer saves the buffer to disk immediately and only stores the `screenshotUrl` path. This ensures the result type is JSON-serializable for job persistence and IndexedDB storage.

---

## 2. Per-Image Evaluation

For each extracted image (filtered to significant ones), run a GPT-4o vision evaluation.

### Evaluation dimensions (per image, scored 1-5):

| Dimension | Weight | Description |
|---|---|---|
| `narrative_relevance` | 3 | Does this image support the message of the section it's in? |
| `context_fit` | 2 | Is this the right TYPE of image for this section? |
| `visual_quality` | 1 | Resolution, composition, cropping quality |
| `brand_alignment` | 1 | Does it match the brand's visual identity? |
| `authenticity` | 1 | Custom/specific vs recognizable stock imagery |

### Overall score formula:

```
weightedSum = (narrative_relevance × 3) + (context_fit × 2) + visual_quality + brand_alignment + authenticity
maxPossible = (5 × 3) + (5 × 2) + 5 + 5 + 5 = 40
overallScore = weightedSum / maxPossible  // → 0.0–1.0
```

### Verdict thresholds:
- `overallScore >= 0.80` → `"strong"`
- `overallScore >= 0.60` → `"adequate"`
- `overallScore >= 0.40` → `"weak"`
- `overallScore < 0.40` → `"replace"`

### Evaluation prompt:

```
You are evaluating a single image from a B2B SaaS marketing page.

The image appears in this section:
- Section heading: "{sectionHeading || 'Unknown section'}"
- Nearby text: "{nearestParagraph || 'No text context available'}"
- Alt text: "{alt || 'No alt text'}"
- Position: {isAboveFold ? "above the fold (high visibility)" : "below the fold"}

Score this image on 5 dimensions (1-5 each, where 1=poor and 5=excellent):

1. narrative_relevance (weight 3): Does this image support the section's message? Is it specific to the topic, or generic filler?
2. context_fit (weight 2): Is this the right TYPE of image for this section? (e.g., data chart for features = good, handshake stock for technical = bad)
3. visual_quality (weight 1): Resolution, composition, cropping, compression artifacts
4. brand_alignment (weight 1): Does it fit a cohesive brand visual identity?
5. authenticity (weight 1): Does it feel custom/specific, or is it recognizable stock imagery?

Respond with this exact JSON schema:
{
  "narrative_relevance": { "score": <1-5>, "finding": "<1-2 sentences>" },
  "context_fit": { "score": <1-5>, "finding": "<1-2 sentences>" },
  "visual_quality": { "score": <1-5>, "finding": "<1-2 sentences>" },
  "brand_alignment": { "score": <1-5>, "finding": "<1-2 sentences>" },
  "authenticity": { "score": <1-5>, "finding": "<1-2 sentences>" },
  "recommendation": "<What should replace this image? Be specific about subject, style, and composition. Empty string if all scores >= 4.>"
}
```

### Model constant:

```ts
const IMAGE_EVAL_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
```

### GPT-4o vision API call (CRITICAL — must send the image):

The image buffer is sent as a base64 `image_url` content part alongside the text prompt:

```ts
const costs = new CostAccumulator();
const client = new OpenAI();

// Read the saved image file back as base64
const imageBase64 = (await readFile(image.screenshotUrl)).toString("base64");

const response = await client.chat.completions.create({
  model: IMAGE_EVAL_MODEL,
  temperature: 0,
  max_tokens: 1024,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: systemPrompt },  // the evaluation prompt above
    {
      role: "user",
      content: [
        { type: "text", text: `Evaluate this image from ${image.cssSelector}:` },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${imageBase64}`,
            detail: "high",
          },
        },
      ],
    },
  ],
});

costs.add(response, `image-eval:${image.cssSelector}`, IMAGE_EVAL_MODEL);
```

Without the `image_url` content part, GPT-4o would only see the text description and never actually look at the image. This is the core mechanism of the feature.

### Concurrency:

Evaluate images in batches of 3 (same LLM concurrency pattern as cross-page engines). `max_tokens: 1024` per image eval (short responses).

### Cost estimate:

Each image eval: ~$0.01-0.02 (small image + short response). A page with 8 significant images: ~$0.10-0.16.

---

## 3. Per-Image Result Type (`server/visual/image-types.ts`)

```ts
export interface ImageDimensionScore {
  score: number;    // 1-5
  finding: string;  // 1-2 sentences
}

export interface ImageEvalResult {
  image: ExtractedPageImage;
  scores: {
    narrative_relevance: ImageDimensionScore;
    visual_quality: ImageDimensionScore;
    brand_alignment: ImageDimensionScore;
    authenticity: ImageDimensionScore;
    context_fit: ImageDimensionScore;
  };
  overallScore: number;          // 0-1 (weighted average, see formula above)
  verdict: "strong" | "adequate" | "weak" | "replace";
  recommendation: string;        // specific replacement suggestion, or "" if strong/adequate
  cost: CostEntry;
}

export interface ImageAnalysisResult {
  evaluatedUrl: string;
  pageScreenshotUrl: string;     // full-page screenshot for the left panel
  images: ImageEvalResult[];     // sorted by overallScore ascending (worst first)
  flaggedCount: number;          // images with verdict "weak" or "replace"
  totalImages: number;           // total significant images found
  skippedCount: number;          // images below size threshold
  costs: CostSummary;
}
```

**Persistence:** All types are JSON-serializable (no Buffers). `screenshotUrl` is a relative disk path served via the existing `/visual-evals/*` static route in `www/server.ts`.

---

## 4. API

### POST /visual/analyze-images

```ts
// Request
{ url: string }

// Response: 202 { jobId }
// Job kind: "visual-image-eval"
// Job result: ImageAnalysisResult
// Job timeout: 300_000 (5 minutes — 20 images × Playwright + GPT-4o)
```

SSE progress:
- "Extracting images from page..." (10%)
- "Found 12 significant images (skipped 8 small)" (20%)
- "Evaluating image 3 of 12..." (20-80%, updates per image)
- "Scoring complete" (90%)
- "Complete!" (100%)

### Error responses:
- `400` — missing or invalid URL
- `502` — page failed to load
- `504` — page load timed out

---

## 5. UI — Side-by-Side Layout

### "Image Analysis" section in /visual results:

Appears below the fix brief section (`#fix-section`). Triggered by an "Analyze Images" button — separate from the main Evaluate to control cost. The button is labeled with estimated cost: "Analyze Images (~$0.15)".

**Why a separate button (not a checkbox):** Image analysis adds $0.10-0.20 per page in LLM costs. Making it explicit and on-demand gives the user cost control.

### Responsive behavior:
- **>= 1280px viewport:** Side-by-side layout (left: screenshot, right: cards)
- **< 1280px viewport:** Stacked vertically (screenshot on top, cards below)

### Layout (>= 1280px):

```
┌─────────────────────────────────┬──────────────────────────────────┐
│  Page Screenshot                │  Image Cards (scrollable)        │
│  (with highlighted regions)     │                                  │
│                                 │  ┌──────────────────────────┐   │
│  [full-page screenshot]         │  │ 🔴 Hero Image (2/5)      │   │
│                                 │  │ [actual image]            │   │
│  Colored boxes at each          │  │ Section: "Detect Equip.." │   │
│  image position:                │  │ [expand for details]      │   │
│  🟢 = strong (>= 0.80)         │  └──────────────────────────┘   │
│  🟡 = adequate (>= 0.60)       │                                  │
│  🔴 = weak/replace (< 0.60)    │  ┌──────────────────────────┐   │
│                                 │  │ 🟡 Feature Icon Set (3/5) │   │
│  Hover/click a box =            │  │ [actual image]            │   │
│  scrolls to + highlights        │  │ Section: "Key Features"   │   │
│  the corresponding card         │  │ [expand for details]      │   │
│                                 │  └──────────────────────────┘   │
└─────────────────────────────────┴──────────────────────────────────┘

Summary: 12 images analyzed | 3 flagged | Cost: $0.14
[Show all] [Flagged only] [Above fold only]
```

### Left panel (page screenshot):
- Full-page screenshot (from `pageScreenshotUrl`) with CSS-positioned colored overlay boxes at each image's `{ x, y, width, height }` position
- Box colors based on `overallScore`: green (>= 0.80), yellow (>= 0.60), red (< 0.60)
- Box has score badge in corner (shows overall score as percentage)
- Hovering a box highlights the corresponding card on the right + scrolls it into view (`scrollIntoView({ behavior: 'smooth', block: 'nearest' })`)
- Clicking a box scrolls to the card AND expands its details

### Right panel (image cards):
- Scrollable list (`overflow-y: auto; overscroll-behavior: contain`) sorted worst-first
- **Collapsed card (default)** shows ONLY:
  - The actual captured image thumbnail (from `screenshotUrl`)
  - Overall score badge with verdict color
  - Section heading (where this image lives on the page)
  - Verdict chip: "strong" / "adequate" / "weak" / "replace"
- **Expanded card** (click to toggle) adds:
  - Per-dimension scores as 5 small score pips with labels
  - All 5 dimension findings
  - Recommendation text (if verdict is "weak" or "replace")
  - Nearest paragraph text (section context)
  - CSS selector path (monospace, for developers)
- Hovering a card highlights the corresponding box on the left panel + scrolls the left panel to bring the box into view

### Summary bar:
- Total images found / analyzed / flagged
- Cost of the analysis
- Filter toggles (mutually combinable):
  - "Show all" (default, active) — shows all images
  - "Flagged only" — shows only verdict "weak" or "replace"
  - "Above fold only" — shows only `isAboveFold === true`
  - Filters apply to BOTH panels — left panel hides/shows overlay boxes, right panel hides/shows cards
  - Multiple filters can be active simultaneously (e.g., "Flagged + Above fold")

### Shared component:
`www/shared/image-analysis.js` — renders the side-by-side layout. Used by /visual page.

`www/shared/image-analysis.css` — styles for the split panel, image cards, overlay boxes, score badges. Includes `@media (max-width: 1279px)` for stacked layout.

---

## 6. Integration into /visual page

### HTML:

Add `<link rel="stylesheet" href="/shared/image-analysis.css">` in the `<head>` alongside existing stylesheet imports.

Insert this in the content div, after `#fix-section`:

```html
<div id="image-analysis-section" style="display:none; margin-top:1.5rem;">
  <h3>Image Analysis</h3>
  <button class="btn" id="analyze-images-btn">Analyze Individual Images (~$0.15)</button>
  <div id="image-analysis-loading" style="display:none;">
    <span class="spinner-light"></span> <span id="image-analysis-msg">...</span>
  </div>
  <div id="image-analysis-results"></div>
</div>
```

### Flow:
1. After visual evaluation completes, show the "Image Analysis" section with the "Analyze Images" button
2. User clicks → POST `/visual/analyze-images` with `{ url: currentReport.evaluatedUrl }`
3. SSE progress shown inline via `#image-analysis-msg`
4. On complete → render side-by-side view via `ImageAnalysis` component into `#image-analysis-results`

### Session persistence:
Image analysis results saved alongside the visual eval session in IndexedDB. All types are JSON-serializable. Restored on page return.

---

## 7. Filtering

### Size threshold:
- Skip images with `visualArea < 10000` (100×100px) — icons, spacers, decorative dots
- Skip tracking pixels: `width <= 1 || height <= 1`
- Skip hidden: `isVisible() === false`

### Priority:
- Above-fold images evaluated first (they matter most for first impression)
- Sort results: flagged above-fold first, then flagged below-fold, then passing images

### Cap:
- Max 20 images per page (largest by visual area if more exist)
- Prevents runaway cost on image-heavy pages

---

## 8. Edge Cases

- **No significant images found:** Show "No significant images found on this page (X small images skipped)"
- **Image screenshot failure:** Skip with note "Failed to capture — may be lazy-loaded or gated". Include in `skippedCount`.
- **SVG images:** Capture via `locator.screenshot()` (works for inline SVGs rendered in the DOM)
- **CSS background images:** Extract URL via `getComputedStyle`, get bounding box of the element, screenshot the element. `type: "css-background"`
- **Duplicate images (same `src`):** Evaluate once. Show one card but display ALL positions on the left panel (multiple colored boxes pointing to the same card). `ExtractedPageImage` is unique per position — dedup happens at the evaluation layer (skip GPT-4o call if `src` already evaluated, reuse the score).
- **Very large pages (50+ images):** Cap at 20, show "20 of 53 images analyzed (largest by area)"
- **GPT-4o returns malformed JSON:** Normalize with defaults (all scores = 3, verdict = "adequate", recommendation = ""). Log warning but don't fail the analysis.
- **All images pass:** Show the results normally with a success message: "All images scored adequate or above. No replacements recommended."

---

## 9. Static File Serving

Screenshots are saved to `visual-evals/{jobId}/image-{imageId}.png`. The existing static route in `www/server.ts` already serves `/visual-evals/*`:

```ts
app.use("/visual-evals/*", serveStatic({ root: ROOT }));
```

No additional static route needed.
