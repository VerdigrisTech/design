# Narrative & Visual Evaluation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new evaluation pages (/narrative and /visual) that analyze webpage copy effectiveness and visual-narrative alignment, with toggleable guidelines, persona selection, tone presets, and "Generate Fix Brief" output.

**Architecture:** Separate engines (`server/narrative/`, `server/visual/`) share infrastructure (`server/shared/`). Both use Playwright for page fetching, GPT-4o for analysis, and the existing job queue for background processing with SSE progress. Each page is a standalone HTML+JS module following existing /evaluate patterns.

**Tech Stack:** Hono, Playwright, OpenAI GPT-4o, TypeScript (server), vanilla JS (client), IndexedDB (session persistence)

**Spec:** `docs/superpowers/specs/2026-04-08-narrative-visual-eval-design.md`

---

## File Map

### New files to create:

```
server/shared/
  page-fetcher.ts          — Playwright page fetch with caching
  personas.ts              — Persona definitions
  tone-presets.ts           — Tone preset definitions + prompt text
  scoring.ts               — Weighted average scoring + grade calculation

server/narrative/
  guidelines.ts            — 12 narrative evaluation dimensions
  engine.ts                — Narrative evaluation engine (text extraction + LLM analysis)
  fix-generator.ts         — Copy rewrite generator

server/visual/
  guidelines.ts            — 10 visual evaluation dimensions
  engine.ts                — Visual evaluation engine (image extraction + deterministic + LLM)
  fix-generator.ts         — Annotated screenshot generator

server/
  narrative-routes.ts      — Hono routes for /api/jobs/narrative-eval, /api/jobs/narrative-fix
  visual-routes.ts         — Hono routes for /api/jobs/visual-eval, /api/jobs/visual-fix

www/shared/
  diff.js                  — Extracted highlightDiff() for reuse across pages

www/narrative/
  index.html               — Narrative evaluation page
  js/main.js               — Client-side logic

www/visual/
  index.html               — Visual evaluation page
  js/main.js               — Client-side logic
```

### Existing files to modify:

```
server/job-manager.ts      — Add new JobKind values, configurable timeout
www/server.ts              — Register new routes + static serving + page routes
www/evaluate/js/main.js    — Extract highlightDiff() to shared
www/*/index.html (all 7)   — Add Narrative + Visual nav links
```

---

## Task 1: Shared Infrastructure — Types & Scoring

**Files:**
- Create: `server/shared/scoring.ts`
- Create: `server/shared/personas.ts`
- Create: `server/shared/tone-presets.ts`

- [ ] **Step 1: Create `server/shared/` directory**

```bash
mkdir -p server/shared
```

- [ ] **Step 2: Create `server/shared/scoring.ts`**

```ts
/**
 * Shared scoring math for narrative and visual evaluations.
 * Weighted average of dimension scores → overall score → letter grade.
 */

export interface DimensionResult {
  id: string;
  name: string;
  score: number;        // 1-5
  weight: number;       // 1-3
  method: "text" | "vision" | "deterministic" | "hybrid";
  findings: string;
  suggestions: string;
  severity: "error" | "warning";
}

export interface EvalReport {
  kind: "narrative" | "visual";
  evaluatedUrl: string;
  pageScreenshot: string;
  overallScore: number;   // 0-1
  overallGrade: string;   // A/B/C/D/F
  summary: string;
  dimensions: DimensionResult[];
  config: {
    guidelines: string[];
    personas: string[];
    tone: string;
    customInstructions: string;
  };
  metadata: {
    evaluatedAt: string;
    modelUsed: string;
  };
}

export function computeOverallScore(dimensions: DimensionResult[]): number {
  if (dimensions.length === 0) return 0;
  const weightedSum = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const maxPossible = dimensions.reduce((sum, d) => sum + 5 * d.weight, 0);
  return maxPossible > 0 ? weightedSum / maxPossible : 0;
}

export function scoreToGrade(score: number): string {
  if (score >= 0.85) return "A";
  if (score >= 0.70) return "B";
  if (score >= 0.55) return "C";
  if (score >= 0.40) return "D";
  return "F";
}
```

- [ ] **Step 3: Create `server/shared/personas.ts`**

```ts
export interface Persona {
  id: string;
  label: string;
  promptDescription: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "facility_manager",
    label: "Facility Manager",
    promptDescription: "You are a facility manager responsible for 12 commercial buildings. You need to justify software purchases to your CFO with clear ROI data. You care about operational efficiency, cost savings, and ease of implementation.",
  },
  {
    id: "sustainability_director",
    label: "Sustainability Director",
    promptDescription: "You are a sustainability director tasked with hitting ESG targets and reducing your organization's carbon footprint. You evaluate vendors on measurable environmental impact and reporting capabilities.",
  },
  {
    id: "c_suite",
    label: "C-Suite / VP Operations",
    promptDescription: "You are a VP of Operations making a six-figure software decision. You care about business outcomes, competitive advantage, and vendor credibility. You skim pages quickly and need the value proposition immediately.",
  },
  {
    id: "technical_evaluator",
    label: "Technical Evaluator",
    promptDescription: "You are an engineer evaluating integration complexity, API quality, data accuracy, and system reliability. You want to see technical specifications, architecture details, and documentation quality.",
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function buildPersonaPrompt(personaIds: string[]): string {
  const selected = personaIds
    .map(getPersonaById)
    .filter((p): p is Persona => p !== undefined);
  if (selected.length === 0) return "";
  return selected
    .map((p) => `Evaluate from this perspective: ${p.promptDescription}`)
    .join("\n\n");
}
```

- [ ] **Step 4: Create `server/shared/tone-presets.ts`**

```ts
export type TonePreset = "authoritative" | "technical" | "conversational" | "data-forward";

export const TONE_PROMPTS: Record<TonePreset, string> = {
  authoritative:
    "The ideal tone is direct, confident, and outcome-focused. Uses concrete numbers. Not jargon-heavy, not dumbed down. Professional authority without corporate stiffness.",
  technical:
    "The ideal tone is detailed and specification-oriented. Assumes technical literacy. Values accuracy over persuasion. Includes data, metrics, and precise language.",
  conversational:
    "The ideal tone is warm, human, and relatable. Short sentences. Questions to the reader. Accessible language that doesn't feel like a sales pitch.",
  "data-forward":
    "The ideal tone is numbers-first. Charts, stats, benchmarks. Every claim is backed by a metric. Data is the persuasion mechanism, not rhetoric.",
};

export const DEFAULT_TONE: TonePreset = "authoritative";
```

- [ ] **Step 5: Commit**

```bash
git add server/shared/
git commit -m "feat: add shared scoring, personas, tone presets for narrative/visual eval"
```

---

## Task 2: Page Fetcher with Caching

**Files:**
- Create: `server/shared/page-fetcher.ts`

- [ ] **Step 1: Create `server/shared/page-fetcher.ts`**

```ts
/**
 * Shared page fetcher — Playwright screenshot + HTML extraction with caching.
 * Used by both narrative and visual evaluation engines.
 */

import { getBrowser } from "../renderer.js";
import { isPublicUrl } from "../utils.js";

export interface PageFetchResult {
  screenshot: Buffer;
  aboveFoldScreenshot: Buffer;
  html: string;
  title: string;
}

// In-memory cache with 60s TTL
const cache = new Map<string, { result: PageFetchResult; ts: number }>();
const CACHE_TTL_MS = 60_000;

function getCached(url: string): PageFetchResult | null {
  const entry = cache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(url);
    return null;
  }
  return entry.result;
}

export async function fetchPage(url: string): Promise<PageFetchResult> {
  // Check cache first
  const cached = getCached(url);
  if (cached) return cached;

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!parsed.protocol.startsWith("http")) {
    throw new Error("URL must use http or https");
  }
  if (!isPublicUrl(url)) {
    throw new Error("URL targets a private/internal address");
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Check content type before full navigation
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    if (!response) {
      throw new Error("No response from page");
    }

    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("application/pdf")) {
      throw new Error("URL is not an HTML page (detected: application/pdf)");
    }

    if (response.status() >= 400) {
      throw new Error(`Page returned HTTP ${response.status()}`);
    }

    // Check for empty/gated pages
    const bodyText = await page.evaluate(() => document.body?.innerText || "");
    const title = await page.evaluate(() => document.title || "");

    // Above-fold screenshot FIRST (current viewport)
    const aboveFoldScreenshot = Buffer.from(
      await page.screenshot({ type: "png" })
    );

    // Full-page screenshot
    const screenshot = Buffer.from(
      await page.screenshot({ fullPage: true, type: "png" })
    );

    const html = await page.content();

    const result: PageFetchResult = {
      screenshot,
      aboveFoldScreenshot,
      html,
      title,
    };

    // Cache the result
    cache.set(url, { result, ts: Date.now() });

    // Warn if page appears empty
    if (bodyText.trim().length < 50) {
      console.warn(`[page-fetcher] Page appears empty or login-gated: ${url}`);
    }

    return result;
  } finally {
    await page.close();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/shared/page-fetcher.ts
git commit -m "feat: add shared page fetcher with caching for narrative/visual eval"
```

---

## Task 3: Job Manager Updates

**Files:**
- Modify: `server/job-manager.ts`

- [ ] **Step 1: Add new job kinds to `JobKind` union**

In `server/job-manager.ts`, update the `JobKind` type (around line 11):

```ts
export type JobKind =
  | "evaluate"
  | "evaluate-page"
  | "preview"
  | "compliant-gen"
  | "audit"
  | "generate"
  | "refine"
  | "narrative-eval"
  | "visual-eval"
  | "narrative-fix"
  | "visual-fix";
```

- [ ] **Step 2: Make timeout configurable in `run()`**

Update the `run()` method signature and timeout logic (around line 81):

Change:
```ts
run(id: string, fn: (job: Job, emit: (msg: string, pct?: number) => void) => Promise<unknown>): void {
```
To:
```ts
run(id: string, fn: (job: Job, emit: (msg: string, pct?: number) => void) => Promise<unknown>, timeoutMs = 120_000): void {
```

And update the timeout Promise (around line 95):
```ts
const timeout = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error(`Job timed out (${Math.round(timeoutMs / 1000)}s)`)), timeoutMs),
);
```

- [ ] **Step 3: Commit**

```bash
git add server/job-manager.ts
git commit -m "feat: add narrative/visual job kinds, configurable timeout to job manager"
```

---

## Task 4: Narrative Guidelines

**Files:**
- Create: `server/narrative/guidelines.ts`

- [ ] **Step 1: Create `server/narrative/` directory**

```bash
mkdir -p server/narrative
```

- [ ] **Step 2: Create `server/narrative/guidelines.ts`**

```ts
export interface Guideline {
  id: string;
  enabled: boolean;
  weight: 1 | 2 | 3;
  severity: "error" | "warning";
  label: string;
  description: string;
  tier: 1 | 2 | 3;
}

export const NARRATIVE_GUIDELINES: Guideline[] = [
  // Tier 1 — always on, weight 3
  {
    id: "value_prop_clarity",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Value Prop Clarity",
    description: "Can you tell what the company does in 5 seconds? H1 conveys outcome, not just product name.",
    tier: 1,
  },
  {
    id: "headline_hook",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Headline Hook",
    description: "Headline is outcome-focused, not feature-focused. No vague verbs (enable, empower, leverage).",
    tier: 1,
  },
  {
    id: "cta_quality",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "CTA Quality",
    description: "One clear primary CTA with specific text (not 'Learn more'), present above fold and repeated.",
    tier: 1,
  },
  {
    id: "specificity",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Specificity",
    description: "Numbers, named outcomes, case studies present. No marketing superlatives without proof.",
    tier: 1,
  },
  {
    id: "story_arc",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Story Arc",
    description: "Page follows Problem → Solution → Proof → CTA in logical order.",
    tier: 1,
  },
  // Tier 2 — on by default, weight 2
  {
    id: "social_proof_placement",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Social Proof Placement",
    description: "Customer logos, testimonials, or case study references placed near the first CTA, not buried.",
    tier: 2,
  },
  {
    id: "objection_handling",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Objection Handling",
    description: "Page addresses common buyer pushbacks (complexity, integration, cost, switching risk).",
    tier: 2,
  },
  {
    id: "reading_level",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Reading Level",
    description: "Flesch-Kincaid grade 8-10 is optimal for B2B. Not too technical, not too simple.",
    tier: 2,
  },
  {
    id: "hero_guide_framing",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Hero/Guide Framing",
    description: "The buyer is positioned as the hero, not the company. Company is the guide/enabler.",
    tier: 2,
  },
  // Tier 3 — off by default, weight 1
  {
    id: "urgency_stakes",
    enabled: false,
    weight: 1,
    severity: "warning",
    label: "Urgency / Stakes",
    description: "Time-sensitive pressures mentioned (compliance deadlines, rising costs, competitive risk).",
    tier: 3,
  },
  {
    id: "competitive_diff",
    enabled: false,
    weight: 1,
    severity: "warning",
    label: "Competitive Differentiation",
    description: "Page distinguishes from alternatives (spreadsheets, generic BMS, competitors).",
    tier: 3,
  },
  {
    id: "content_cohesion",
    enabled: false,
    weight: 1,
    severity: "warning",
    label: "Content Cohesion",
    description: "Every section connects to the previous one with a consistent through-line concept.",
    tier: 3,
  },
];

export type NarrativePreset = "landing_page" | "case_study" | "product_overview" | "blog_post";

export const NARRATIVE_PRESETS: Record<NarrativePreset, { label: string; enabledIds: string[]; weightOverrides?: Record<string, 1 | 2 | 3> }> = {
  landing_page: {
    label: "Landing Page",
    enabledIds: ["value_prop_clarity", "headline_hook", "cta_quality", "specificity", "story_arc", "social_proof_placement", "objection_handling", "reading_level", "hero_guide_framing"],
  },
  case_study: {
    label: "Case Study",
    enabledIds: ["value_prop_clarity", "specificity", "story_arc", "social_proof_placement", "reading_level", "content_cohesion"],
    weightOverrides: { specificity: 3, story_arc: 3, content_cohesion: 2 },
  },
  product_overview: {
    label: "Product Overview",
    enabledIds: ["value_prop_clarity", "headline_hook", "cta_quality", "specificity", "story_arc", "objection_handling", "reading_level"],
  },
  blog_post: {
    label: "Blog Post",
    enabledIds: ["headline_hook", "specificity", "reading_level", "content_cohesion"],
    weightOverrides: { headline_hook: 3, reading_level: 2, content_cohesion: 2 },
  },
};

export function applyPreset(preset: NarrativePreset): Guideline[] {
  const config = NARRATIVE_PRESETS[preset];
  return NARRATIVE_GUIDELINES.map((g) => ({
    ...g,
    enabled: config.enabledIds.includes(g.id),
    weight: config.weightOverrides?.[g.id] ?? g.weight,
  }));
}
```

- [ ] **Step 3: Commit**

```bash
git add server/narrative/
git commit -m "feat: add narrative evaluation guidelines with presets"
```

---

## Task 5: Visual Guidelines

**Files:**
- Create: `server/visual/guidelines.ts`

- [ ] **Step 1: Create `server/visual/` directory and guidelines**

```bash
mkdir -p server/visual
```

- [ ] **Step 2: Create `server/visual/guidelines.ts`**

```ts
export interface Guideline {
  id: string;
  enabled: boolean;
  weight: 1 | 2 | 3;
  severity: "error" | "warning";
  label: string;
  description: string;
  tier: 1 | 2 | 3;
}

export const VISUAL_GUIDELINES: Guideline[] = [
  // Tier 1 — always on, weight 3
  {
    id: "hero_narrative_alignment",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Hero-Narrative Alignment",
    description: "Hero image reinforces the headline's core claim, not generic stock imagery.",
    tier: 1,
  },
  {
    id: "product_evidence",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Product Evidence",
    description: "Actual product screenshots or demos are visible on the page (high trust signal for SaaS).",
    tier: 1,
  },
  {
    id: "image_accessibility",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "Image Accessibility",
    description: "All <img> have meaningful alt text, SVGs have ARIA labels, no color-only information.",
    tier: 1,
  },
  {
    id: "cta_visual_hierarchy",
    enabled: true,
    weight: 3,
    severity: "error",
    label: "CTA Visual Hierarchy",
    description: "Primary CTA has dominant visual weight in its section — size, color, whitespace.",
    tier: 1,
  },
  // Tier 2 — on by default, weight 2
  {
    id: "icon_consistency",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Icon/Illustration Consistency",
    description: "All icons share the same style family (stroke weight, fill, corners). No mixed icon sets.",
    tier: 2,
  },
  {
    id: "photo_coherence",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Photography Style Coherence",
    description: "No mix of stock photo eras, isometric vs. real photography, or inconsistent lighting.",
    tier: 2,
  },
  {
    id: "visual_social_proof",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Visual Social Proof",
    description: "Customer logos, testimonial photos, or certification badges are visible and recognizable.",
    tier: 2,
  },
  {
    id: "color_palette_adherence",
    enabled: true,
    weight: 2,
    severity: "warning",
    label: "Color Palette Adherence",
    description: "Dominant colors in imagery match the brand palette. No off-brand reds, blues, or greens.",
    tier: 2,
  },
  // Tier 3 — off by default, weight 1
  {
    id: "image_performance",
    enabled: false,
    weight: 1,
    severity: "warning",
    label: "Image Loading Performance",
    description: "Below-fold images use loading='lazy', all images have width/height attrs, srcset for responsive.",
    tier: 3,
  },
  {
    id: "whitespace_composition",
    enabled: false,
    weight: 1,
    severity: "warning",
    label: "Whitespace & Composition",
    description: "Adequate breathing room around images and CTAs. Visual hierarchy guides the eye logically.",
    tier: 3,
  },
];

export type VisualPreset = "hero_heavy" | "icon_led" | "photo_forward" | "data_viz";

export const VISUAL_PRESETS: Record<VisualPreset, { label: string; enabledIds: string[]; weightOverrides?: Record<string, 1 | 2 | 3> }> = {
  hero_heavy: {
    label: "Hero-heavy",
    enabledIds: ["hero_narrative_alignment", "product_evidence", "image_accessibility", "cta_visual_hierarchy", "photo_coherence", "visual_social_proof", "color_palette_adherence"],
    weightOverrides: { hero_narrative_alignment: 3, cta_visual_hierarchy: 3 },
  },
  icon_led: {
    label: "Icon-led",
    enabledIds: ["hero_narrative_alignment", "product_evidence", "image_accessibility", "cta_visual_hierarchy", "icon_consistency", "color_palette_adherence"],
    weightOverrides: { icon_consistency: 3, color_palette_adherence: 3 },
  },
  photo_forward: {
    label: "Photography-forward",
    enabledIds: ["hero_narrative_alignment", "product_evidence", "image_accessibility", "cta_visual_hierarchy", "photo_coherence", "visual_social_proof", "color_palette_adherence"],
    weightOverrides: { photo_coherence: 3, visual_social_proof: 3 },
  },
  data_viz: {
    label: "Data-viz page",
    enabledIds: ["hero_narrative_alignment", "product_evidence", "image_accessibility", "cta_visual_hierarchy", "color_palette_adherence", "whitespace_composition"],
    weightOverrides: { product_evidence: 3, color_palette_adherence: 3 },
  },
};

export function applyPreset(preset: VisualPreset): Guideline[] {
  const config = VISUAL_PRESETS[preset];
  return VISUAL_GUIDELINES.map((g) => ({
    ...g,
    enabled: config.enabledIds.includes(g.id),
    weight: config.weightOverrides?.[g.id] ?? g.weight,
  }));
}
```

- [ ] **Step 3: Commit**

```bash
git add server/visual/
git commit -m "feat: add visual evaluation guidelines with presets"
```

---

## Task 6: Narrative Evaluation Engine

**Files:**
- Create: `server/narrative/engine.ts`

- [ ] **Step 1: Create `server/narrative/engine.ts`**

```ts
/**
 * Narrative evaluation engine.
 * Extracts text from page HTML, runs dual analysis (text + vision),
 * and produces a scored evaluation report.
 */

import OpenAI from "openai";
import type { PageFetchResult } from "../shared/page-fetcher.js";
import { computeOverallScore, scoreToGrade } from "../shared/scoring.js";
import type { DimensionResult, EvalReport } from "../shared/scoring.js";
import { buildPersonaPrompt } from "../shared/personas.js";
import { TONE_PROMPTS, type TonePreset } from "../shared/tone-presets.js";
import { NARRATIVE_GUIDELINES, type Guideline } from "./guidelines.js";

export interface NarrativeEvalRequest {
  page: PageFetchResult;
  url: string;
  screenshotUrl: string;
  guidelines: Guideline[];
  personas: string[];
  tone: TonePreset;
  customInstructions: string;
  emit: (msg: string, pct?: number) => void;
}

interface ExtractedText {
  headings: { level: number; text: string }[];
  aboveFoldText: string;
  ctaButtons: { text: string; href: string }[];
  metaTitle: string;
  metaDescription: string;
  bodyText: string;
  bodyWordCount: number;
}

function extractText(html: string): ExtractedText {
  const headings: ExtractedText["headings"] = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = headingRegex.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1]), text: m[2].replace(/<[^>]+>/g, "").trim() });
  }

  const ctaButtons: ExtractedText["ctaButtons"] = [];
  const btnRegex = /<(?:a|button)[^>]*(?:class="[^"]*(?:btn|cta|button)[^"]*"|role="button")[^>]*>([\s\S]*?)<\/(?:a|button)>/gi;
  while ((m = btnRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    const href = m[0].match(/href="([^"]+)"/)?.[1] || "";
    if (text) ctaButtons.push({ text, href });
  }

  const metaTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1]?.trim() || "";

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] || html;
  const bodyText = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Approximate above-fold: first 800 chars of body text
  const aboveFoldText = bodyText.slice(0, 800);

  return {
    headings,
    aboveFoldText,
    ctaButtons,
    metaTitle,
    metaDescription: metaDesc,
    bodyText: bodyText.slice(0, 15000),
    bodyWordCount: bodyText.split(/\s+/).length,
  };
}

export async function evaluateNarrative(req: NarrativeEvalRequest): Promise<EvalReport> {
  const { page, url, screenshotUrl, guidelines, personas, tone, customInstructions, emit } = req;

  emit("Extracting text content...", 25);
  const extracted = extractText(page.html);
  const enabledGuidelines = guidelines.filter((g) => g.enabled);

  const personaPrompt = buildPersonaPrompt(personas);
  const tonePrompt = TONE_PROMPTS[tone] || TONE_PROMPTS.authoritative;
  const customBlock = customInstructions
    ? `\nAdditional context from the user: ${customInstructions.slice(0, 2000)}\n`
    : "";

  const guidelinesBlock = enabledGuidelines
    .map((g) => `- ${g.id} (weight:${g.weight}, severity:${g.severity}): ${g.description}`)
    .join("\n");

  const textContext = `
Page URL: ${url}
Page Title: ${extracted.metaTitle}
Meta Description: ${extracted.metaDescription}
Word Count: ${extracted.bodyWordCount}

Headings (in order):
${extracted.headings.map((h) => `  H${h.level}: ${h.text}`).join("\n")}

CTA Buttons found:
${extracted.ctaButtons.map((b) => `  "${b.text}" → ${b.href}`).join("\n") || "  (none found)"}

Above-fold text:
${extracted.aboveFoldText}

Full page text (truncated):
${extracted.bodyText}
`.trim();

  const systemPrompt = `You are an expert B2B SaaS conversion copywriter and web strategist. Evaluate the following webpage's narrative effectiveness.

${personaPrompt}

Ideal tone for this page: ${tonePrompt}
${customBlock}

Evaluate ONLY these dimensions (skip any not listed):
${guidelinesBlock}

For each dimension, provide:
- score: 1-5 (1=missing/harmful, 2=poor, 3=adequate, 4=good, 5=exemplary)
- findings: what you observed (be specific, quote the actual copy)
- suggestions: a concrete, copy-pasteable fix. For text dimensions, provide rewritten text. For layout dimensions, describe the specific change.

Also write a 2-3 paragraph executive summary of the page's narrative effectiveness.

Respond in JSON:
{
  "summary": "2-3 paragraph critique...",
  "dimensions": [
    { "id": "dimension_id", "score": 1-5, "findings": "...", "suggestions": "..." }
  ]
}`;

  emit("Analyzing narrative with AI...", 50);
  const client = new OpenAI();

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: textContext },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${page.aboveFoldScreenshot.toString("base64")}` },
        },
      ],
    },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    temperature: 0,
    response_format: { type: "json_object" },
    messages,
  });

  emit("Scoring dimensions...", 80);
  const content = response.choices[0]?.message?.content || "{}";
  let parsed: { summary?: string; dimensions?: Array<{ id: string; score: number; findings: string; suggestions: string }> };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { summary: "Failed to parse AI response.", dimensions: [] };
  }

  const dimensionResults: DimensionResult[] = enabledGuidelines.map((g) => {
    const aiResult = parsed.dimensions?.find((d) => d.id === g.id);
    return {
      id: g.id,
      name: g.label,
      score: aiResult?.score ?? 3,
      weight: g.weight,
      method: "hybrid" as const,
      findings: aiResult?.findings ?? "No analysis available.",
      suggestions: aiResult?.suggestions ?? "No suggestions available.",
      severity: g.severity,
    };
  });

  emit("Generating report...", 90);
  const overallScore = computeOverallScore(dimensionResults);

  const report: EvalReport = {
    kind: "narrative",
    evaluatedUrl: url,
    pageScreenshot: screenshotUrl,
    overallScore,
    overallGrade: scoreToGrade(overallScore),
    summary: parsed.summary || "Evaluation completed but no summary was generated.",
    dimensions: dimensionResults,
    config: {
      guidelines: enabledGuidelines.map((g) => g.id),
      personas,
      tone,
      customInstructions,
    },
    metadata: {
      evaluatedAt: new Date().toISOString(),
      modelUsed: "gpt-4o",
    },
  };

  emit("Complete!", 100);
  return report;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/narrative/engine.ts
git commit -m "feat: add narrative evaluation engine with text extraction + GPT-4o analysis"
```

---

## Task 7: Visual Evaluation Engine

**Files:**
- Create: `server/visual/engine.ts`

- [ ] **Step 1: Create `server/visual/engine.ts`**

```ts
/**
 * Visual evaluation engine.
 * Extracts image metadata from HTML, runs deterministic checks + vision analysis,
 * and produces a scored evaluation report.
 */

import OpenAI from "openai";
import type { PageFetchResult } from "../shared/page-fetcher.js";
import { computeOverallScore, scoreToGrade } from "../shared/scoring.js";
import type { DimensionResult, EvalReport } from "../shared/scoring.js";
import { buildPersonaPrompt } from "../shared/personas.js";
import { TONE_PROMPTS, type TonePreset } from "../shared/tone-presets.js";
import { VISUAL_GUIDELINES, type Guideline } from "./guidelines.js";

export interface VisualEvalRequest {
  page: PageFetchResult;
  url: string;
  screenshotUrl: string;
  guidelines: Guideline[];
  personas: string[];
  tone: TonePreset;
  customInstructions: string;
  emit: (msg: string, pct?: number) => void;
}

interface ExtractedImage {
  src: string;
  alt: string;
  hasAlt: boolean;
  loading: string;
  hasSrcset: boolean;
  hasWidthHeight: boolean;
  type: "img" | "svg" | "css-background" | "video" | "picture";
}

function extractImages(html: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];

  // <img> elements
  const imgRegex = /<img([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    const attrs = m[1];
    const src = attrs.match(/src="([^"]+)"/)?.[1] || "";
    const alt = attrs.match(/alt="([^"]*)"/)?.[1] ?? "";
    const hasAlt = /alt=/.test(attrs);
    const loading = attrs.match(/loading="([^"]+)"/)?.[1] || "";
    const hasSrcset = /srcset=/.test(attrs);
    const hasWH = /width=/.test(attrs) && /height=/.test(attrs);
    images.push({ src, alt, hasAlt, loading, hasSrcset, hasWidthHeight: hasWH, type: "img" });
  }

  // <svg> elements (inline)
  const svgCount = (html.match(/<svg[\s>]/gi) || []).length;
  for (let i = 0; i < svgCount; i++) {
    images.push({ src: "(inline-svg)", alt: "", hasAlt: false, loading: "", hasSrcset: false, hasWidthHeight: false, type: "svg" });
  }

  // <video> elements
  const videoCount = (html.match(/<video[\s>]/gi) || []).length;
  for (let i = 0; i < videoCount; i++) {
    images.push({ src: "(video)", alt: "", hasAlt: false, loading: "", hasSrcset: false, hasWidthHeight: false, type: "video" });
  }

  return images;
}

function runDeterministicChecks(images: ExtractedImage[]): DimensionResult[] {
  const results: DimensionResult[] = [];
  const imgElements = images.filter((i) => i.type === "img");

  // image_accessibility
  const missingAlt = imgElements.filter((i) => !i.hasAlt);
  const emptyAlt = imgElements.filter((i) => i.hasAlt && i.alt === "");
  const altScore = imgElements.length === 0 ? 5 :
    missingAlt.length === 0 ? 5 :
    missingAlt.length <= 1 ? 4 :
    missingAlt.length <= 3 ? 3 :
    missingAlt.length <= 5 ? 2 : 1;

  results.push({
    id: "image_accessibility",
    name: "Image Accessibility",
    score: altScore,
    weight: 3,
    method: "deterministic",
    findings: `${imgElements.length} images found. ${missingAlt.length} missing alt attribute, ${emptyAlt.length} have empty alt.`,
    suggestions: missingAlt.length > 0
      ? `Add descriptive alt text to ${missingAlt.length} image(s): ${missingAlt.slice(0, 3).map((i) => i.src).join(", ")}`
      : "All images have alt attributes.",
    severity: missingAlt.length > 0 ? "error" : "warning",
  });

  // image_performance
  const missingLazy = imgElements.filter((i) => i.loading !== "lazy");
  const missingDims = imgElements.filter((i) => !i.hasWidthHeight);
  const missingSrcset = imgElements.filter((i) => !i.hasSrcset);
  const perfIssues = missingLazy.length + missingDims.length + missingSrcset.length;
  const perfScore = perfIssues === 0 ? 5 : perfIssues <= 2 ? 4 : perfIssues <= 5 ? 3 : perfIssues <= 10 ? 2 : 1;

  results.push({
    id: "image_performance",
    name: "Image Loading Performance",
    score: perfScore,
    weight: 1,
    method: "deterministic",
    findings: `${missingLazy.length} images without lazy loading, ${missingDims.length} without width/height, ${missingSrcset.length} without srcset.`,
    suggestions: perfIssues > 0
      ? `Add loading="lazy" to below-fold images. Add width/height attributes to prevent CLS. Use srcset for responsive images.`
      : "Image loading is well-optimized.",
    severity: "warning",
  });

  return results;
}

export async function evaluateVisual(req: VisualEvalRequest): Promise<EvalReport> {
  const { page, url, screenshotUrl, guidelines, personas, tone, customInstructions, emit } = req;

  emit("Extracting image metadata...", 25);
  const images = extractImages(page.html);
  const enabledGuidelines = guidelines.filter((g) => g.enabled);

  // Run deterministic checks
  const deterministicIds = new Set(["image_accessibility", "image_performance"]);
  const deterministicResults = runDeterministicChecks(images)
    .filter((r) => enabledGuidelines.some((g) => g.id === r.id));

  // Vision-based guidelines
  const visionGuidelines = enabledGuidelines.filter((g) => !deterministicIds.has(g.id));

  let visionResults: DimensionResult[] = [];
  if (visionGuidelines.length > 0) {
    emit("Analyzing visuals with AI...", 50);
    const personaPrompt = buildPersonaPrompt(personas);
    const tonePrompt = TONE_PROMPTS[tone] || TONE_PROMPTS.authoritative;
    const customBlock = customInstructions
      ? `\nAdditional context from the user: ${customInstructions.slice(0, 2000)}\n`
      : "";

    const guidelinesBlock = visionGuidelines
      .map((g) => `- ${g.id} (weight:${g.weight}, severity:${g.severity}): ${g.description}`)
      .join("\n");

    const imageContext = `Page URL: ${url}
Images found: ${images.length} (${images.filter((i) => i.type === "img").length} img, ${images.filter((i) => i.type === "svg").length} svg, ${images.filter((i) => i.type === "video").length} video)
${images.length === 0 ? "WARNING: No images found on this page." : ""}`;

    const systemPrompt = `You are an expert visual designer and B2B SaaS conversion strategist. Evaluate the visual effectiveness of this webpage.

${personaPrompt}

Ideal tone context: ${tonePrompt}
${customBlock}

Evaluate ONLY these visual dimensions (skip any not listed):
${guidelinesBlock}

${imageContext}

For each dimension, provide:
- score: 1-5 (1=missing/harmful, 2=poor, 3=adequate, 4=good, 5=exemplary)
- findings: what you observed in the visual design
- suggestions: concrete change to make. For vision dimensions, describe the specific visual change needed.

Also write a 2-3 paragraph executive summary of the page's visual effectiveness.

Respond in JSON:
{
  "summary": "2-3 paragraph critique...",
  "dimensions": [
    { "id": "dimension_id", "score": 1-5, "findings": "...", "suggestions": "..." }
  ]
}`;

    const client = new OpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Evaluate the visual design of this webpage:" },
            { type: "image_url", image_url: { url: `data:image/png;base64,${page.screenshot.toString("base64")}` } },
            { type: "image_url", image_url: { url: `data:image/png;base64,${page.aboveFoldScreenshot.toString("base64")}` } },
          ],
        },
      ],
    });

    emit("Scoring dimensions...", 80);
    const content = response.choices[0]?.message?.content || "{}";
    let parsed: { summary?: string; dimensions?: Array<{ id: string; score: number; findings: string; suggestions: string }> };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: "Failed to parse AI response.", dimensions: [] };
    }

    visionResults = visionGuidelines.map((g) => {
      const aiResult = parsed.dimensions?.find((d) => d.id === g.id);
      // Auto-score missing images dimensions low
      const autoLowScore = images.length === 0 && (g.id === "hero_narrative_alignment" || g.id === "product_evidence");
      return {
        id: g.id,
        name: g.label,
        score: autoLowScore ? 1 : (aiResult?.score ?? 3),
        weight: g.weight,
        method: "vision" as const,
        findings: autoLowScore ? "No images found on page." : (aiResult?.findings ?? "No analysis available."),
        suggestions: autoLowScore ? "Add relevant imagery to support the page narrative." : (aiResult?.suggestions ?? "No suggestions available."),
        severity: g.severity,
      };
    });

    // Store summary for later
    (req as any)._visionSummary = parsed.summary;
  }

  emit("Generating report...", 90);
  const allDimensions = [...deterministicResults, ...visionResults];
  const overallScore = computeOverallScore(allDimensions);

  const report: EvalReport = {
    kind: "visual",
    evaluatedUrl: url,
    pageScreenshot: screenshotUrl,
    overallScore,
    overallGrade: scoreToGrade(overallScore),
    summary: (req as any)._visionSummary || "Visual evaluation completed.",
    dimensions: allDimensions,
    config: {
      guidelines: enabledGuidelines.map((g) => g.id),
      personas,
      tone,
      customInstructions,
    },
    metadata: {
      evaluatedAt: new Date().toISOString(),
      modelUsed: "gpt-4o",
    },
  };

  emit("Complete!", 100);
  return report;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/visual/engine.ts
git commit -m "feat: add visual evaluation engine with deterministic + GPT-4o vision analysis"
```

---

## Task 8: Narrative Fix Generator

**Files:**
- Create: `server/narrative/fix-generator.ts`

- [ ] **Step 1: Create `server/narrative/fix-generator.ts`**

```ts
/**
 * Narrative fix generator — rewrites above-fold copy for failing dimensions.
 */

import OpenAI from "openai";
import { buildPersonaPrompt } from "../shared/personas.js";
import { TONE_PROMPTS, type TonePreset } from "../shared/tone-presets.js";
import type { EvalReport } from "../shared/scoring.js";

export interface NarrativeFixResult {
  original: string;
  rewritten: string;
}

export async function generateNarrativeFix(
  report: EvalReport,
  pageHtml: string,
  emit: (msg: string, pct?: number) => void,
): Promise<NarrativeFixResult> {
  emit("Identifying failing dimensions...", 10);

  const failingDimensions = report.dimensions.filter((d) => d.score < 3);
  if (failingDimensions.length === 0) {
    return { original: "", rewritten: "All dimensions scored adequately. No rewrites needed." };
  }

  // Extract above-fold text approximation
  const bodyMatch = pageHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] || pageHtml;
  const aboveFold = bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .slice(0, 3000);

  const original = aboveFold
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);

  emit("Generating rewritten copy...", 40);
  const personaPrompt = buildPersonaPrompt(report.config.personas);
  const tonePrompt = TONE_PROMPTS[report.config.tone as TonePreset] || TONE_PROMPTS.authoritative;

  const failingContext = failingDimensions
    .map((d) => `- ${d.name} (${d.score}/5): ${d.findings}\n  Fix: ${d.suggestions}`)
    .join("\n");

  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `You are a B2B SaaS conversion copywriter. Rewrite the above-fold content to fix the failing dimensions below. Keep the same general structure and message, but improve the copy quality.

${personaPrompt}
Ideal tone: ${tonePrompt}

Failing dimensions to fix:
${failingContext}

Return ONLY the rewritten text content (no HTML tags). Preserve paragraph breaks. Do not add content that wasn't there — improve what exists.`,
      },
      {
        role: "user",
        content: `Original above-fold text:\n\n${original}`,
      },
    ],
  });

  emit("Complete!", 100);
  const rewritten = response.choices[0]?.message?.content || original;
  return { original, rewritten };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/narrative/fix-generator.ts
git commit -m "feat: add narrative fix generator for copy rewrites"
```

---

## Task 9: Visual Fix Generator

**Files:**
- Create: `server/visual/fix-generator.ts`

- [ ] **Step 1: Create `server/visual/fix-generator.ts`**

```ts
/**
 * Visual fix generator — produces annotated screenshot directions.
 */

import OpenAI from "openai";
import type { EvalReport } from "../shared/scoring.js";

export interface ChangeItem {
  element: string;
  currentState: string;
  recommendedChange: string;
  fixesDimension: string;
}

export interface VisualFixResult {
  changes: ChangeItem[];
  briefSummary: string;
}

export async function generateVisualFix(
  report: EvalReport,
  emit: (msg: string, pct?: number) => void,
): Promise<VisualFixResult> {
  emit("Identifying visual issues...", 10);

  const failingDimensions = report.dimensions.filter((d) => d.score < 3);
  if (failingDimensions.length === 0) {
    return { changes: [], briefSummary: "All visual dimensions scored adequately. No changes needed." };
  }

  emit("Generating visual fix brief...", 40);
  const failingContext = failingDimensions
    .map((d) => `- ${d.name} (${d.score}/5): ${d.findings}\n  Suggestion: ${d.suggestions}`)
    .join("\n");

  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a visual design director creating a fix brief for a web page. Based on the failing visual dimensions, create a specific, actionable list of visual changes.

For each change, specify:
- element: what page element to change (e.g., "Hero image", "CTA button", "Icon set in features section")
- currentState: what it looks like now
- recommendedChange: exactly what to do
- fixesDimension: which evaluation dimension this fixes

Also write a brief 1-paragraph summary of the overall visual improvement strategy.

Respond in JSON:
{
  "briefSummary": "...",
  "changes": [
    { "element": "...", "currentState": "...", "recommendedChange": "...", "fixesDimension": "..." }
  ]
}`,
      },
      {
        role: "user",
        content: `Page: ${report.evaluatedUrl}\n\nFailing visual dimensions:\n${failingContext}`,
      },
    ],
  });

  emit("Complete!", 100);
  const content = response.choices[0]?.message?.content || "{}";
  let parsed: { briefSummary?: string; changes?: ChangeItem[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { briefSummary: "Failed to generate fix brief.", changes: [] };
  }

  return {
    changes: parsed.changes || [],
    briefSummary: parsed.briefSummary || "Visual fix brief generated.",
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/visual/fix-generator.ts
git commit -m "feat: add visual fix generator for annotated change briefs"
```

---

## Task 10: Server Routes — Narrative

**Files:**
- Create: `server/narrative-routes.ts`

- [ ] **Step 1: Create `server/narrative-routes.ts`**

```ts
/**
 * Narrative evaluation API routes.
 * All evaluation runs as background jobs via the job manager.
 */

import { Hono } from "hono";
import { jobManager } from "./job-manager.js";
import { fetchPage } from "./shared/page-fetcher.js";
import { evaluateNarrative } from "./narrative/engine.js";
import { generateNarrativeFix } from "./narrative/fix-generator.js";
import { NARRATIVE_GUIDELINES, applyPreset, type NarrativePreset } from "./narrative/guidelines.js";
import type { TonePreset } from "./shared/tone-presets.js";

export function narrativeRoutes(root: string) {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof SyntaxError) return c.json({ error: "Invalid request body" }, 400);
    console.error("[narrative]", err);
    return c.json({ error: "Internal server error" }, 500);
  });

  // POST /evaluate — submit narrative evaluation job
  app.post("/evaluate", async (c) => {
    const body = await c.req.json<{
      url?: string;
      guidelines?: string[];
      personas?: string[];
      tone?: string;
      customInstructions?: string;
      preset?: string;
    }>();

    if (!body.url) return c.json({ error: "url is required" }, 400);

    const job = jobManager.create("narrative-eval", {
      label: body.url,
      page: "/narrative",
      url: body.url,
    });

    jobManager.run(job.id, async (_job, emit) => {
      emit("Fetching page...", 10);
      const page = await fetchPage(body.url!);

      // Save screenshot
      const { randomUUID } = await import("node:crypto");
      const { mkdir, writeFile } = await import("node:fs/promises");
      const { resolve } = await import("node:path");
      const evalId = randomUUID();
      const evalDir = resolve(root, "narrative-evals", evalId);
      await mkdir(evalDir, { recursive: true });
      await writeFile(resolve(evalDir, "screenshot.png"), page.screenshot);
      await writeFile(resolve(evalDir, "above-fold.png"), page.aboveFoldScreenshot);
      const screenshotUrl = `/narrative-evals/${evalId}/screenshot.png`;

      // Resolve guidelines
      let guidelines = NARRATIVE_GUIDELINES.map((g) => ({ ...g }));
      if (body.preset) {
        guidelines = applyPreset(body.preset as NarrativePreset);
      } else if (body.guidelines) {
        const enabledSet = new Set(body.guidelines);
        guidelines = guidelines.map((g) => ({ ...g, enabled: enabledSet.has(g.id) }));
      }

      return evaluateNarrative({
        page,
        url: body.url!,
        screenshotUrl,
        guidelines,
        personas: body.personas || ["facility_manager"],
        tone: (body.tone as TonePreset) || "authoritative",
        customInstructions: (body.customInstructions || "").slice(0, 2000),
        emit,
      });
    }, 180_000);

    return c.json({ jobId: job.id }, 202);
  });

  // POST /fix — submit narrative fix brief job
  app.post("/fix", async (c) => {
    const body = await c.req.json<{ evalJobId?: string }>();
    if (!body.evalJobId) return c.json({ error: "evalJobId is required" }, 400);

    const evalJob = jobManager.get(body.evalJobId);
    if (!evalJob || evalJob.status !== "complete") {
      return c.json({ error: "Evaluation job not found or not complete" }, 404);
    }

    const job = jobManager.create("narrative-fix", {
      label: "Fix brief",
      page: "/narrative",
    });

    jobManager.run(job.id, async (_job, emit) => {
      const report = evalJob.result as any;
      // Re-fetch page HTML (should be cached)
      const page = await fetchPage(report.evaluatedUrl);
      return generateNarrativeFix(report, page.html, emit);
    }, 120_000);

    return c.json({ jobId: job.id }, 202);
  });

  return app;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/narrative-routes.ts
git commit -m "feat: add narrative evaluation API routes with job queue integration"
```

---

## Task 11: Server Routes — Visual

**Files:**
- Create: `server/visual-routes.ts`

- [ ] **Step 1: Create `server/visual-routes.ts`**

```ts
/**
 * Visual evaluation API routes.
 */

import { Hono } from "hono";
import { jobManager } from "./job-manager.js";
import { fetchPage } from "./shared/page-fetcher.js";
import { evaluateVisual } from "./visual/engine.js";
import { generateVisualFix } from "./visual/fix-generator.js";
import { VISUAL_GUIDELINES, applyPreset, type VisualPreset } from "./visual/guidelines.js";
import type { TonePreset } from "./shared/tone-presets.js";

export function visualRoutes(root: string) {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof SyntaxError) return c.json({ error: "Invalid request body" }, 400);
    console.error("[visual]", err);
    return c.json({ error: "Internal server error" }, 500);
  });

  // POST /evaluate — submit visual evaluation job
  app.post("/evaluate", async (c) => {
    const body = await c.req.json<{
      url?: string;
      guidelines?: string[];
      personas?: string[];
      tone?: string;
      customInstructions?: string;
      preset?: string;
    }>();

    if (!body.url) return c.json({ error: "url is required" }, 400);

    const job = jobManager.create("visual-eval", {
      label: body.url,
      page: "/visual",
      url: body.url,
    });

    jobManager.run(job.id, async (_job, emit) => {
      emit("Fetching page...", 10);
      const page = await fetchPage(body.url!);

      const { randomUUID } = await import("node:crypto");
      const { mkdir, writeFile } = await import("node:fs/promises");
      const { resolve } = await import("node:path");
      const evalId = randomUUID();
      const evalDir = resolve(root, "visual-evals", evalId);
      await mkdir(evalDir, { recursive: true });
      await writeFile(resolve(evalDir, "screenshot.png"), page.screenshot);
      await writeFile(resolve(evalDir, "above-fold.png"), page.aboveFoldScreenshot);
      const screenshotUrl = `/visual-evals/${evalId}/screenshot.png`;

      let guidelines = VISUAL_GUIDELINES.map((g) => ({ ...g }));
      if (body.preset) {
        guidelines = applyPreset(body.preset as VisualPreset);
      } else if (body.guidelines) {
        const enabledSet = new Set(body.guidelines);
        guidelines = guidelines.map((g) => ({ ...g, enabled: enabledSet.has(g.id) }));
      }

      return evaluateVisual({
        page,
        url: body.url!,
        screenshotUrl,
        guidelines,
        personas: body.personas || ["facility_manager"],
        tone: (body.tone as TonePreset) || "authoritative",
        customInstructions: (body.customInstructions || "").slice(0, 2000),
        emit,
      });
    }, 180_000);

    return c.json({ jobId: job.id }, 202);
  });

  // POST /fix — submit visual fix brief job
  app.post("/fix", async (c) => {
    const body = await c.req.json<{ evalJobId?: string }>();
    if (!body.evalJobId) return c.json({ error: "evalJobId is required" }, 400);

    const evalJob = jobManager.get(body.evalJobId);
    if (!evalJob || evalJob.status !== "complete") {
      return c.json({ error: "Evaluation job not found or not complete" }, 404);
    }

    const job = jobManager.create("visual-fix", {
      label: "Visual fix brief",
      page: "/visual",
    });

    jobManager.run(job.id, async (_job, emit) => {
      return generateVisualFix(evalJob.result as any, emit);
    }, 120_000);

    return c.json({ jobId: job.id }, 202);
  });

  return app;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/visual-routes.ts
git commit -m "feat: add visual evaluation API routes with job queue integration"
```

---

## Task 12: Server Registration

**Files:**
- Modify: `www/server.ts`

- [ ] **Step 1: Add imports to `www/server.ts`**

After the existing imports (around line 22), add:
```ts
import { narrativeRoutes } from "../server/narrative-routes.js";
import { visualRoutes } from "../server/visual-routes.js";
```

- [ ] **Step 2: Register API routes**

After the existing `app.route("/api/jobs", ...)` line, add:
```ts
app.route("/api/narrative", narrativeRoutes(ROOT));
app.route("/api/visual", visualRoutes(ROOT));
```

- [ ] **Step 3: Add page routes**

After the existing `/compliant` route, add:
```ts
app.get("/narrative", async (c) => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(resolve(__dirname, "narrative", "index.html"), "utf-8");
  return c.html(html);
});

app.get("/visual", async (c) => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(resolve(__dirname, "visual", "index.html"), "utf-8");
  return c.html(html);
});
```

- [ ] **Step 4: Add static JS and eval data routes**

After the existing static JS routes (around line 101), add:
```ts
app.use("/narrative/js/*", serveStatic({ root: resolve(__dirname, "narrative", "js"), rewriteRequestPath: (path) => path.replace("/narrative/js", "") }));
app.use("/visual/js/*", serveStatic({ root: resolve(__dirname, "visual", "js"), rewriteRequestPath: (path) => path.replace("/visual/js", "") }));
```

After the existing `/evaluations/*` static route, add:
```ts
app.use("/narrative-evals/*", serveStatic({ root: ROOT }));
app.use("/visual-evals/*", serveStatic({ root: ROOT }));
```

- [ ] **Step 5: Update console log**

Add to the routes listing:
```ts
console.log("    /narrative   — Narrative evaluation");
console.log("    /visual      — Visual evaluation");
```

- [ ] **Step 6: Commit**

```bash
git add www/server.ts
git commit -m "feat: register narrative and visual evaluation routes in server"
```

---

## Task 13: Extract Shared `highlightDiff()` 

**Files:**
- Create: `www/shared/diff.js`
- Modify: `www/evaluate/js/main.js`

- [ ] **Step 1: Create `www/shared/diff.js`**

Extract the `highlightDiff()` function from `www/evaluate/js/main.js` into a shared module:

```js
import { esc } from '/shared/utils.js';

export function highlightDiff(originalText, fixedText) {
  const origLines = originalText.split('\n');
  const fixedLines = fixedText.split('\n');
  const maxLen = Math.max(origLines.length, fixedLines.length);

  let origHtml = '';
  let fixedHtml = '';
  let changedCount = 0;

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i] ?? '';
    const fixedLine = fixedLines[i] ?? '';
    const lineNum = String(i + 1).padStart(4, ' ');
    const gutterStyle = 'color:#3f3f46;user-select:none;-webkit-user-select:none;margin-right:0.5em;';

    if (origLine !== fixedLine) {
      changedCount++;
      const origWords = origLine.split(/(\s+)/);
      const fixedWords = fixedLine.split(/(\s+)/);
      let origInner = '';
      let fixedInner = '';
      const maxW = Math.max(origWords.length, fixedWords.length);
      for (let w = 0; w < maxW; w++) {
        const ow = origWords[w] ?? '';
        const fw = fixedWords[w] ?? '';
        if (ow !== fw) {
          if (ow) origInner += '<span style="background:rgba(239,68,68,0.35);border-radius:2px;">' + esc(ow) + '</span>';
          if (fw) fixedInner += '<span style="background:rgba(34,197,94,0.35);border-radius:2px;">' + esc(fw) + '</span>';
        } else {
          origInner += esc(ow);
          fixedInner += esc(fw);
        }
      }
      origHtml += '<span style="background:rgba(239,68,68,0.1);display:block;"><span style="' + gutterStyle + 'color:#ef4444;">' + lineNum + '</span>' + origInner + '</span>';
      fixedHtml += '<span style="background:rgba(34,197,94,0.1);display:block;"><span style="' + gutterStyle + 'color:#22c55e;">' + lineNum + '</span>' + fixedInner + '</span>';
    } else {
      origHtml += '<span style="display:block;"><span style="' + gutterStyle + '">' + lineNum + '</span>' + esc(origLine) + '</span>';
      fixedHtml += '<span style="display:block;"><span style="' + gutterStyle + '">' + lineNum + '</span>' + esc(fixedLine) + '</span>';
    }
  }

  return { origHtml, fixedHtml, changedCount, totalLines: maxLen };
}
```

- [ ] **Step 2: Update `www/evaluate/js/main.js`**

Add import at top:
```js
import { highlightDiff } from '/shared/diff.js';
```

Remove the inline `highlightDiff()` function definition (the one starting with `// ── Diff highlighting with word-level changes`).

- [ ] **Step 3: Commit**

```bash
git add www/shared/diff.js www/evaluate/js/main.js
git commit -m "refactor: extract highlightDiff to shared module for reuse"
```

---

## Task 14: Frontend — Narrative Page HTML

**Files:**
- Create: `www/narrative/index.html`

- [ ] **Step 1: Create directories**

```bash
mkdir -p www/narrative/js
```

- [ ] **Step 2: Create `www/narrative/index.html`**

Follow the exact same structure as `/evaluate` — page header, nav links, content area. Include the Customize accordion with presets, guidelines toggles, persona chips, tone radio, and custom instructions textarea. Results section with summary + scorecard + dimension cards. Fix Brief section at the bottom.

The HTML should be ~400 lines following the exact patterns from `www/evaluate/index.html` (same CSS classes, same shared styles import, same nav structure). Add `<script type="module" src="/narrative/js/main.js"></script>` and `<script type="module" src="/shared/job-bar.js"></script>` before `</body>`.

Add nav links for Narrative (active) and Visual to match the existing nav pattern.

- [ ] **Step 3: Commit**

```bash
git add www/narrative/
git commit -m "feat: add narrative evaluation page HTML"
```

---

## Task 15: Frontend — Narrative Page JS

**Files:**
- Create: `www/narrative/js/main.js`

- [ ] **Step 1: Create `www/narrative/js/main.js`**

Implement the full client-side logic:
- URL input validation + evaluate button
- Customize accordion with preset chips, guideline toggles, persona multi-select, tone radio, custom instructions textarea
- Submit to `POST /api/narrative/evaluate` → get jobId → track via SSE
- Render results: summary first, then score badge, then dimension cards sorted worst-first
- Fix Brief button → submit to `POST /api/narrative/fix` → track via SSE → render diff using `highlightDiff()` from `/shared/diff.js`
- Session persistence via `EvalStore`
- Job bar integration via `window.JobBar.track()`

Follow the same patterns from `www/evaluate/js/main.js` for SSE handling, error states, and session restore.

- [ ] **Step 2: Commit**

```bash
git add www/narrative/js/main.js
git commit -m "feat: add narrative evaluation page client-side logic"
```

---

## Task 16: Frontend — Visual Page HTML + JS

**Files:**
- Create: `www/visual/index.html`
- Create: `www/visual/js/main.js`

- [ ] **Step 1: Create directories**

```bash
mkdir -p www/visual/js
```

- [ ] **Step 2: Create `www/visual/index.html`**

Same structure as the narrative page, but with visual-specific presets (Hero-heavy, Icon-led, etc.), visual guidelines toggles, and visual evaluation branding. The Fix Brief section shows a structured change list table instead of a text diff.

- [ ] **Step 3: Create `www/visual/js/main.js`**

Same patterns as narrative/main.js but:
- Submits to `POST /api/visual/evaluate`
- Fix Brief submits to `POST /api/visual/fix`
- Fix Brief renders as a table of changes (`element | current | recommended | fixes dimension`) instead of a text diff

- [ ] **Step 4: Commit**

```bash
git add www/visual/
git commit -m "feat: add visual evaluation page HTML + client-side logic"
```

---

## Task 17: Navigation Links Update

**Files:**
- Modify: All 7 existing `index.html` files + 2 new ones

- [ ] **Step 1: Add Narrative + Visual nav links to all pages**

In every page's `.nav-links` div, add:
```html
<a href="/narrative" class="nav-link">Narrative</a>
<a href="/visual" class="nav-link">Visual</a>
```

Files to update:
- `www/index.html`
- `www/evaluate/index.html`
- `www/compliant/index.html`
- `www/audit/index.html`
- `www/generate/index.html`
- `www/refine/index.html`
- `www/validated/index.html`

- [ ] **Step 2: Commit**

```bash
git add www/*/index.html www/index.html
git commit -m "feat: add Narrative + Visual nav links to all pages"
```

---

## Task 18: Integration Testing

- [ ] **Step 1: Run existing test suite**

```bash
npx vitest run
```

Expected: All 284 existing tests pass (no regressions).

- [ ] **Step 2: Start server and smoke test**

```bash
npm start
```

Test each new endpoint manually:
1. Navigate to `http://localhost:3333/narrative`
2. Enter a URL (e.g., `https://verdigris.co`)
3. Click Evaluate — verify SSE progress, results render, score badge + dimension cards
4. Click Generate Fix Brief — verify diff renders
5. Navigate to `http://localhost:3333/visual`
6. Repeat steps 2-4 for visual evaluation
7. Navigate away and back — verify session persistence
8. Check notification bar appears on other pages during evaluation

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration testing fixes for narrative/visual eval"
```
