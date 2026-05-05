# Narrative & Visual Evaluation — Design Spec

**Date:** 2026-04-08
**Status:** Approved
**Goal:** Help Verdigris improve its website to have bigger impact and get more customers by evaluating webpage narrative effectiveness and visual-narrative alignment.

---

## Overview

Two new independent pages added to the Asset Refinement Studio:

- **`/narrative`** — Evaluates whether a webpage's copy tells the right story, is cohesive, and is compelling enough to convert visitors.
- **`/visual`** — Evaluates whether a webpage's imagery supports the narrative, is visually cohesive, and drives the user toward action.

Both pages accept any URL (not Verdigris-specific). Guidelines are toggleable. Personas and tone presets are selectable. Each page includes a "Generate Fix Brief" section that produces actionable improvement suggestions.

A combined workflow that runs design-system + narrative + visual evaluation on a single URL is planned for v2.

---

## Architecture: Separate Engines, Shared Infrastructure (Approach B)

```
server/shared/
  page-fetcher.ts        — Playwright fetch: screenshot + above-fold + HTML
  personas.ts            — Selectable buyer personas
  tone-presets.ts         — Tone/style string union
  scoring.ts             — Shared scoring math (weighted average → grade)

server/narrative/
  engine.ts              — Narrative evaluation engine
  guidelines.ts          — Toggleable narrative evaluation dimensions
  fix-generator.ts       — Copy rewrite generator

server/visual/
  engine.ts              — Visual evaluation engine
  guidelines.ts          — Toggleable visual evaluation dimensions
  fix-generator.ts       — Annotated screenshot generator

server/
  narrative-routes.ts    — /api/narrative/* endpoints
  visual-routes.ts       — /api/visual/* endpoints
  job-manager.ts         — (existing) add "narrative-eval", "visual-eval" to JobKind

www/narrative/
  index.html             — Narrative evaluation page
  js/main.js             — Client-side logic

www/visual/
  index.html             — Visual evaluation page
  js/main.js             — Client-side logic
```

---

## 1. Shared Infrastructure

### Page Fetcher (`server/shared/page-fetcher.ts`)

```ts
interface PageFetchResult {
  screenshot: Buffer;          // full-page PNG
  aboveFoldScreenshot: Buffer; // first viewport only (1280x800)
  html: string;                // page.content()
  title: string;               // document.title
}

async function fetchPage(url: string): Promise<PageFetchResult>
```

- Reuses existing `getBrowser()` from `renderer.ts`
- Handles viewport (1280x800), networkidle wait, 30s timeout, SSRF check via `isPublicUrl()`
- Takes above-fold screenshot FIRST, then full-page (same navigation, no double fetch)
- In-memory URL cache (60s TTL) so narrative + visual evals on the same URL share one fetch
- Returns raw buffers — persistence is the caller's responsibility

### Personas (`server/shared/personas.ts`)

```ts
interface Persona {
  id: string;
  label: string;
  promptDescription: string;  // one paragraph, prompt-ready prose
}
```

Predefined personas (multi-selectable on frontend):
- **Facility Manager** — "You are a facility manager responsible for 12 commercial buildings. You need to justify software purchases to your CFO with clear ROI data."
- **Sustainability Director** — "You are a sustainability director tasked with hitting ESG targets. You evaluate vendors on measurable environmental impact."
- **C-Suite / VP Operations** — "You are a VP of Operations making a six-figure software decision. You care about business outcomes, not technical details."
- **Technical Evaluator** — "You are an engineer evaluating integration complexity, API quality, and data accuracy."

Custom personas can be added via custom instructions field.

### Tone Presets (`server/shared/tone-presets.ts`)

TypeScript string union:
```ts
type TonePreset = "authoritative" | "technical" | "conversational" | "data-forward";
```

Each preset maps to a prompt instruction:
- **Authoritative + Accessible** (default) — "Direct, confident, outcome-focused. Uses concrete numbers. Not jargon-heavy, not dumbed down."
- **Technical + Precise** — "Detailed, specification-oriented. Assumes technical literacy. Values accuracy over persuasion."
- **Conversational + Approachable** — "Warm, human, relatable. Short sentences. Questions to the reader."
- **Data-Forward** — "Numbers-first. Charts, stats, benchmarks. Every claim has a metric."

### Guidelines Format

TypeScript objects (not YAML — no new dependency, type-safe, fail at import time):

```ts
interface Guideline {
  id: string;
  enabled: boolean;       // default state
  weight: 1 | 2 | 3;     // importance multiplier
  severity: "error" | "warning";
  label: string;          // human-readable name
  description: string;    // shown in UI tooltip
  tier: 1 | 2 | 3;       // display grouping
}
```

### Page Presets

Pre-configure toggle states + weights for common page types:

**Narrative presets:** Landing Page, Case Study, Product Overview, Blog Post
**Visual presets:** Hero-heavy, Icon-led, Photography-forward, Data-viz page

Selecting a preset auto-sets guidelines. User can then tweak individual toggles. When a user modifies any toggle after selecting a preset, the preset chip shows "(modified)" and a "Reset to preset" link appears.

### Report Format

```ts
interface EvalReport {
  kind: "narrative" | "visual";
  evaluatedUrl: string;
  pageScreenshot: string;           // URL to saved screenshot
  overallScore: number;             // 0-1
  overallGrade: string;             // A/B/C/D/F
  summary: string;                  // 2-3 paragraph written critique (shown FIRST)
  dimensions: DimensionResult[];
  config: {
    guidelines: string[];           // IDs of enabled guidelines
    personas: string[];             // IDs of selected personas
    tone: TonePreset;
    customInstructions: string;
  };
  metadata: {
    evaluatedAt: string;
    modelUsed: string;
  };
}

interface DimensionResult {
  id: string;
  name: string;
  score: number;                    // 1-5
  weight: number;                   // 1-3
  method: "text" | "vision" | "deterministic" | "hybrid";
  findings: string;                 // what was observed
  suggestions: string;              // concrete, copy-pasteable fix
  severity: "error" | "warning";
}
```

### Frontend Layout (both pages)

Linear top-to-bottom, matching existing pages (max-width 80rem):

1. **URL input row** — same pattern as /evaluate webpage mode
2. **"Customize" accordion** (closed by default):
   - Preset row (chips/buttons)
   - Guidelines toggle grid (grouped by tier)
   - Persona selector (multi-select chips)
   - Tone preset (single-select radio)
   - Custom instructions (textarea)
3. **Evaluate button** — disabled until URL valid
4. **Results section** (hidden until complete):
   - Written summary (2-3 paragraphs) — shown FIRST
   - Score badge + grade
   - Dimension cards grid (sorted by score ascending — worst first)
   - Each card: name, score (1-5), weight, findings, suggestion
5. **Generate Fix Brief section** (hidden until evaluation complete)

### Scoring Math (`server/shared/scoring.ts`)

```
weightedSum = sum(score_i * weight_i) for enabled dimensions only
maxPossible = sum(5 * weight_i) for enabled dimensions only
overallScore = weightedSum / maxPossible  // → 0.0–1.0
```

Grade cutoffs:
- A >= 0.85
- B >= 0.70
- C >= 0.55
- D >= 0.40
- F < 0.40

Disabled dimensions are excluded from both numerator and denominator.

### API Contracts

**`POST /api/narrative/evaluate`** (or via job queue: `POST /api/jobs/narrative-eval`)
```ts
// Request body
{
  url: string;                      // required
  guidelines?: string[];            // IDs of enabled guidelines (default: all tier 1+2)
  personas?: string[];              // IDs of selected personas (default: ["facility_manager"])
  tone?: TonePreset;                // default: "authoritative"
  customInstructions?: string;      // max 2000 chars, injected after persona before guidelines
  preset?: string;                  // optional preset ID — overrides guidelines/tone
}

// Response: 202 { jobId } (async) or 200 EvalReport (sync)
```

**`POST /api/visual/evaluate`** — same shape.

**`POST /api/jobs/narrative-fix`** and **`POST /api/jobs/visual-fix`**
```ts
// Request body
{
  evalJobId: string;                // ID of the completed evaluation job (to get the report + page data)
}

// Response: 202 { jobId }
// Job result for narrative: { original: string, rewritten: string }  — client renders diff
// Job result for visual: { annotatedScreenshot: string (base64), changes: ChangeItem[] }
```

### Custom Instructions

- Max 2000 characters
- Injected into the LLM prompt AFTER persona descriptions, BEFORE guideline criteria
- HTML-escaped before injection (no prompt injection via angle brackets)
- Example: "This is a case study page — product screenshots should show real customer data"

### Screenshot Persistence

Screenshots saved to:
- `narrative-evals/{jobId}/screenshot.png` and `narrative-evals/{jobId}/above-fold.png`
- `visual-evals/{jobId}/screenshot.png` and `visual-evals/{jobId}/above-fold.png`

Static serving routes added to `server.ts`:
```ts
app.use("/narrative-evals/*", serveStatic({ root: ROOT }));
app.use("/visual-evals/*", serveStatic({ root: ROOT }));
```

### Job Queue Integration

- Add `"narrative-eval"`, `"visual-eval"`, `"narrative-fix"`, `"visual-fix"` to `JobKind` in `job-manager.ts`
- Make `JobManager.run()` accept an optional `timeoutMs` parameter (default 120s, narrative/visual use 180s)
- SSE progress streaming with defined messages:
  - "Fetching page..." (10%)
  - "Extracting content..." (25%)
  - "Analyzing narrative..." / "Analyzing visuals..." (50%)
  - "Scoring dimensions..." (80%)
  - "Generating report..." (90%)
  - "Complete!" (100%)
- Session persistence via existing `EvalStore` (IndexedDB)

### Edge Cases

- **PDF URL:** `fetchPage()` checks Content-Type header before navigating. If not `text/html`, return error: "URL is not an HTML page (detected: application/pdf)".
- **Login-gated / empty page:** After `page.goto()`, check `page.content()` length. If body text content < 50 characters, return warning: "Page appears empty or login-gated. Results may be unreliable."
- **SPA with client-side rendering:** `networkidle` wait handles most SPAs. The spec relies on Playwright's existing behavior.
- **No images on page (visual eval):** If `extractedImages` is empty, `product_evidence` and `hero_narrative_alignment` dimensions auto-score 1/5 with finding "No images found on page." Other vision dimensions still evaluate the screenshot.
- **All dimensions score >= 3/5:** "Generate Fix Brief" button shows as "No critical issues found" (disabled). A subtle link "Generate suggestions anyway" allows running it if desired.

### Error States

- **Page fetch fails:** Show error message with retry button. No partial report.
- **LLM call fails after page fetch:** Show partial report with available deterministic results. Vision dimensions show "Analysis unavailable" with a retry button.
- **Job timeout:** Show "Evaluation timed out" with suggestion to try a simpler page.

### Diff Rendering

The `highlightDiff()` function is **client-side** (in `www/evaluate/js/main.js`). The narrative fix brief API returns `{ original, rewritten }` as plain strings. The client renders the diff using the same `highlightDiff()` pattern — extract it to `www/shared/diff.js` for reuse.

### Suggestion Guidance by Dimension Type

Each dimension's `suggestions` field must follow these patterns:

- **Text dimensions** (headline_hook, specificity, etc.): Provide a rewritten sentence/phrase. "Replace 'We enable digital transformation' with 'Cut your building's energy costs 34% in 90 days'"
- **Vision dimensions** (hero_alignment, icon_consistency): Provide a visual direction note. "Replace hero stock photo with a product screenshot showing the Patina dashboard energy graph"
- **Deterministic dimensions** (image_accessibility, image_performance): Provide the exact fix. "Add alt='Energy consumption chart for Q3 2025' to the hero image element"
- **Hybrid dimensions** (social_proof, cta_quality): Provide both content and placement. "Move the customer logo bar above the first CTA. Add 2-3 recognizable logos from the commercial real estate sector."

---

## 2. Narrative Evaluation (`/narrative`)

### Pipeline

```
URL → fetchPage() → extract structured text from DOM → parallel analysis:
  A. Text analysis (LLM): copy quality, story arc, specificity, reading level, tone
  B. Layout analysis (LLM vision + screenshots): CTA placement, above-fold, hierarchy
→ merge scores → hybrid report
```

### Text Extraction (from HTML DOM)

```ts
interface ExtractedText {
  headings: { level: number; text: string; position: "above-fold" | "below-fold" }[];
  aboveFoldText: string;
  ctaButtons: { text: string; position: "above-fold" | "below-fold"; href: string }[];
  metaTitle: string;
  metaDescription: string;
  testimonials: { text: string; attribution: string }[];
  bulletLists: string[][];
  bodyWordCount: number;
}
```

### Evaluation Dimensions (12)

**Tier 1 — Always on, weight 3, severity: error**

| ID | Dimension | Method | Checks |
|---|---|---|---|
| `value_prop_clarity` | Value Prop Clarity | Vision + Text | Can you tell what the company does in 5 seconds? H1 conveys outcome, not product name |
| `headline_hook` | Headline Hook | Text | Outcome-focused, not feature-focused. No vague verbs (enable, empower, leverage) |
| `cta_quality` | CTA Quality | Text + DOM | One clear primary CTA, specific text (not "Learn more"), above fold + repeated |
| `specificity` | Specificity | Text | Numbers, named outcomes, case studies present. No marketing superlatives without proof |
| `story_arc` | Story Arc | Text | Page follows Problem → Solution → Proof → CTA in logical order |

**Tier 2 — On by default, weight 2, severity: warning**

| ID | Dimension | Method |
|---|---|---|
| `social_proof_placement` | Social Proof Placement | Vision + DOM |
| `objection_handling` | Objection Handling | Text |
| `reading_level` | Reading Level | Text (Flesch-Kincaid grade 8-10 optimal) |
| `hero_guide_framing` | Hero/Guide Framing | Text (buyer is hero, not company) |

**Tier 3 — Off by default, weight 1, severity: warning**

| ID | Dimension | Method |
|---|---|---|
| `urgency_stakes` | Urgency / Stakes | Text |
| `competitive_diff` | Competitive Differentiation | Text |
| `content_cohesion` | Content Cohesion | Text |

### Tone Validation

Selected tone preset injected into LLM prompt. Analysis flags copy that violates:
- Passive voice overuse (weakens authority)
- Superlatives without proof ("industry-leading")
- Feature-focus without outcome framing
- Buyer-as-spectator vs buyer-as-hero framing

### Persona Lens

Selected personas shape the evaluation perspective. Each persona's `promptDescription` is injected: "Evaluate this page as if you are [persona description]. Would this page convince you to take the next step?"

---

## 3. Visual Evaluation (`/visual`)

### Pipeline

```
URL → fetchPage() → extract image metadata from DOM → parallel analysis:
  A. Deterministic checks: alt text, loading attrs, srcset, color palette
  B. Vision analysis (LLM + screenshots): hero alignment, icon consistency, composition
→ merge scores → hybrid report
```

### Image Extraction (from HTML DOM)

```ts
interface ExtractedImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading: string;          // "lazy" | "eager" | ""
  hasSrcset: boolean;
  hasWidthHeight: boolean;  // prevents layout shift
  position: "above-fold" | "below-fold";
  type: "img" | "svg" | "css-background" | "video" | "picture";
  visualArea: number;       // width * height
}
```

### Evaluation Dimensions (10)

**Tier 1 — Always on, weight 3, severity: error**

| ID | Dimension | Method | Checks |
|---|---|---|---|
| `hero_narrative_alignment` | Hero-Narrative Alignment | Vision | Hero image reinforces headline's core claim, not generic stock |
| `product_evidence` | Product Evidence | Vision + DOM | Actual product screenshots/demos visible (high trust for SaaS) |
| `image_accessibility` | Image Accessibility | Deterministic | Alt text on all `<img>`, ARIA labels on SVGs, color independence |
| `cta_visual_hierarchy` | CTA Visual Hierarchy | Vision | Primary CTA has dominant visual weight in its section |

**Tier 2 — On by default, weight 2, severity: warning**

| ID | Dimension | Method |
|---|---|---|
| `icon_consistency` | Icon/Illustration Consistency | Vision |
| `photo_coherence` | Photography Style Coherence | Vision |
| `visual_social_proof` | Visual Social Proof | Vision + DOM |
| `color_palette_adherence` | Color Palette Adherence | Deterministic + Vision |

**Tier 3 — Off by default, weight 1, severity: warning**

| ID | Dimension | Method |
|---|---|---|
| `image_performance` | Image Loading Performance | Deterministic |
| `whitespace_composition` | Whitespace & Composition | Vision |

### Deterministic Checks

Run before vision model (fast, high-confidence):
- Alt text: every `<img>` has meaningful `alt` (empty only for decorative)
- Loading: `loading="lazy"` on below-fold images
- Dimensions: `width` and `height` attributes present (prevents CLS)
- Responsive: `srcset` or CDN image transform in use
- Color: dominant background/foreground colors checked against brand palette

### Page Presets

| Preset | Boosts | Deprioritizes |
|---|---|---|
| Hero-heavy | hero alignment, CTA hierarchy | icon consistency |
| Icon-led | icon consistency, color palette | photo coherence |
| Photo-forward | photo coherence, visual social proof | icon consistency |
| Data-viz | product evidence, color palette | photo coherence |

---

## 4. Generate Fix Brief

Appears at the bottom of both pages after evaluation completes. Button labeled **"Generate Fix Brief"** — disabled until evaluation is done. Runs as a background job with SSE progress.

### Narrative Fix Brief

- LLM rewrites above-fold content (H1, subheadline, CTA text, opening body copy)
- Only rewrites dimensions that scored below 3/5 — doesn't touch what's working
- Output: side-by-side text diff (original left, improved right, changes highlighted)
- Uses existing `highlightDiff()` function from /evaluate
- "Copy HTML" button to grab the rewritten snippet
- Respects selected tone preset and persona lens when generating rewrites

### Visual Fix Brief

- Does NOT generate new images
- Produces an annotated screenshot: overlay colored bounding boxes + text callouts on the original page screenshot
- Each annotation: what element, what's wrong, what to change
- Example: red box around hero → "Replace stock photo with Patina dashboard screenshot showing energy consumption graph"
- Structured change list underneath:

```
| Element | Current State | Recommended Change | Fixes Dimension |
|---------|--------------|-------------------|-----------------|
| Hero image | Generic stock office | Product dashboard screenshot | hero_narrative_alignment |
| CTA button | Small, below fold | 48px height, move above fold | cta_visual_hierarchy |
```

- Uses GPT-4o vision to identify element locations and generate annotation coordinates

### Session Persistence

Fix brief results saved alongside evaluation results in the existing `EvalStore` (IndexedDB). Restored when navigating back to the page.

---

## 5. Server Registration

In `www/server.ts`:
```ts
import { narrativeRoutes } from "../server/narrative-routes.js";
import { visualRoutes } from "../server/visual-routes.js";

app.route("/api/narrative", narrativeRoutes(ROOT));
app.route("/api/visual", visualRoutes(ROOT));
```

New page routes:
```ts
app.get("/narrative", async (c) => { /* serve www/narrative/index.html */ });
app.get("/visual", async (c) => { /* serve www/visual/index.html */ });
```

Static JS routes:
```ts
app.use("/narrative/js/*", serveStatic({ ... }));
app.use("/visual/js/*", serveStatic({ ... }));
```

Add `<script type="module" src="/shared/job-bar.js"></script>` to both new HTML pages.

---

## 6. Navigation

Add to all pages' nav links:
```html
<a href="/narrative" class="nav-link">Narrative</a>
<a href="/visual" class="nav-link">Visual</a>
```

---

## 7. Future Work (v2)

- Combined evaluation workflow: single URL → design + narrative + visual in one report
- A/B comparison mode: two URLs side-by-side
- Custom persona creation UI
- Guidelines editor (add/edit/delete dimensions without code changes)
- Server-side session persistence (when logins are added)
- Photography and illustration style guide creation in the design repo
