# Evaluation Engine — Design Spec

**Date:** 2026-04-03
**Status:** Draft (pending skeptic approval)
**Revision:** 2.0 — corrected against researcher findings

## Overview

A strict compliance checker that takes any image/media asset and scores it against the complete Verdigris design system. Returns a detailed compliance report with per-category scores, violations with severity, and remediation suggestions.

## Dual Evaluation Strategy

Two strategies depending on source availability:

### Strategy 1: `source_first` (SVG/HTML platforms — nakkas, claude-svg, excalidraw, stitch)

1. **Deterministic source analysis** — Parse SVG/HTML source, extract colors (hex/OKLch), fonts, spacing values, border-radius values. Compare against token spec using exact matching and deltaE.
2. **Pixel sampling** — Render to PNG, extract dominant colors via Sharp + k-means clustering. Cross-validate against source analysis findings.
3. **Vision model** — Send rendered PNG to gpt-4o for subjective categories only (composition, brand alignment, overall polish). Deterministic results override vision results on conflict.

**Confidence tiers:**
- Source parsing: 1.0 (deterministic, ground truth)
- Pixel sampling: 0.95 (high confidence)
- Vision model: model-reported (0.0-1.0)

### Strategy 2: `visual_only` (Raster platforms — recraft, fal-ai)

1. **Pixel sampling** — Extract dominant colors via Sharp + k-means clustering. Compute deltaE against all 16 brand palette stops + neutral scale.
2. **Vision model** — Send image to gpt-4o for all categories including typography (Tier 1 visual only — font family detection is low-confidence, weight/size are medium-confidence).

**Weight redistribution for raster:** Typography category weight is halved and redistributed to Color Accuracy and Composition, since font family cannot be verified deterministically from pixels.

## Scoring Categories

### Core Categories (always evaluated)

| # | Category | Description |
|---|----------|-------------|
| 1 | **Color Accuracy** | Colors match the 16-stop brand palette, neutral scale, status colors. No banned colors. DeltaE < 5 in OKLch for brand matches. |
| 2 | **WCAG Contrast** | Text/background contrast meets 4.5:1 (normal), 3.0:1 (large/UI). Brand teal NEVER as text on white/light. |
| 3 | **Typography** | Font families (Inter body, Lato display/www, JetBrains Mono code). Sizes: H1=4rem, H2=3rem, H3=2rem. Weights: headings=700, body=400, buttons/CTAs=600. Line-height: headings 1.1-1.3, body 1.6. Letter-spacing: H1/H2=-0.02em. |
| 4 | **Spacing & Grid** | All spacing on 4px grid. Container max-width 1280px (80rem). Section padding 4rem standard, 8rem hero/feature. |
| 5 | **Dark Mode** | Background near-black (neutral.950), NOT pure #000000. Borders semi-transparent white oklch(1 0 0 / 10%). Inputs at 15% opacity. Primary inverted. Destructive softened. |
| 6 | **Motion & Animation** | prefers-reduced-motion fallback REQUIRED (hard error). Hover transforms gated behind compound media query: `(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)`. Duration tokens respected (fast=150ms, normal=200ms, moderate=300ms, slow=500ms, spin=800ms). Only animate transform and opacity (+ box-shadow exception for hover-lift). |
| 7 | **Border Radius** | Canonical radius: 0.625rem (10px). Scale: sm=~6px, md=~8px, lg=10px, xl=~14px, full=9999px. Button radius: 0.375rem (6px) for www legacy. |
| 8 | **Accessibility** | Alt text on images, ARIA labels on interactive elements, focus indicators (2px solid outline, 2px offset), 44px min touch targets, color not sole information conveyor. |
| 9 | **Brand Alignment** | Overall adherence to brand pillars (Precision, Masterful, Refined, Pioneering). Zinc-tinted neutrals (hue ~286). Semantic token usage over primitives. |
| 10 | **Composition** | Visual hierarchy, whitespace, alignment, overall polish. Appropriate for the asset type. |

### Asset-Type-Specific Rubrics

Different asset types get different category subsets and weight distributions:

#### marketing_banner
| Category | Weight |
|----------|--------|
| Color Accuracy | 20% |
| WCAG Contrast | 15% |
| Typography | 20% |
| Spacing & Grid | 10% |
| Dark Mode | 5% |
| Motion & Animation | 5% |
| Border Radius | 5% |
| Brand Alignment | 10% |
| Composition | 10% |

#### illustration / icon
| Category | Weight |
|----------|--------|
| Color Accuracy | 30% |
| WCAG Contrast | 5% |
| Typography | 0% (N/A) |
| Spacing & Grid | 5% |
| Dark Mode | 10% |
| Border Radius | 10% |
| Brand Alignment | 20% |
| Composition | 20% |

#### data_viz
| Category | Weight |
|----------|--------|
| Color Accuracy | 25% |
| WCAG Contrast | 20% |
| Typography | 10% |
| Spacing & Grid | 5% |
| Dark Mode | 10% |
| Accessibility | 15% |
| Brand Alignment | 5% |
| Composition | 10% |

#### photo
| Category | Weight |
|----------|--------|
| Color Accuracy | 15% |
| WCAG Contrast | 5% |
| Typography | 0% (N/A — overlays only) |
| Dark Mode | 5% |
| Brand Alignment | 30% |
| Composition | 35% |
| Accessibility | 10% |

#### ui_component
| Category | Weight |
|----------|--------|
| Color Accuracy | 15% |
| WCAG Contrast | 15% |
| Typography | 15% |
| Spacing & Grid | 15% |
| Dark Mode | 10% |
| Motion & Animation | 5% |
| Border Radius | 10% |
| Accessibility | 10% |
| Composition | 5% |

#### ad_unit / presentation_slide / 3d_scene
Custom rubrics with appropriate weight distributions defined per type.

## Deterministic Pre-Checks (Source-First)

Before calling the vision model, run these deterministic checks on SVG/HTML source:

### Color Check
```typescript
import { parse as parseColor, differenceEuclidean } from 'culori';

const deltaE = differenceEuclidean('oklch');

function checkColorCompliance(extractedColors: string[], palette: OKLchColor[]): ColorViolation[] {
  const violations: ColorViolation[] = [];
  for (const hex of extractedColors) {
    const parsed = parseColor(hex);
    if (!parsed) continue;
    
    // Check banned colors
    if (BANNED_COLORS.includes(hex.toLowerCase())) {
      violations.push({ color: hex, severity: 'error', reason: 'Banned color', fix: `Replace with nearest brand token` });
      continue;
    }
    
    // Find nearest brand color
    const nearest = palette.reduce((best, token) => {
      const d = deltaE(parsed, token.oklch);
      return d < best.distance ? { token, distance: d } : best;
    }, { token: palette[0], distance: Infinity });
    
    if (nearest.distance > 15) {
      violations.push({ color: hex, severity: 'error', reason: `No matching brand token (deltaE=${nearest.distance.toFixed(1)})`, fix: `Use ${nearest.token.name} (${nearest.token.hex})` });
    } else if (nearest.distance > 5) {
      violations.push({ color: hex, severity: 'warning', reason: `Approximate match to ${nearest.token.name} (deltaE=${nearest.distance.toFixed(1)})`, fix: `Use exact value ${nearest.token.hex}` });
    }
  }
  return violations;
}
```

### Typography Check (Source Only)
```typescript
function checkTypography(source: string): TypographyViolation[] {
  const violations: TypographyViolation[] = [];
  
  // Font family
  const fontFamilies = extractFontFamilies(source); // CSS font-family values
  const allowedFamilies = ['Inter', 'Lato', 'JetBrains Mono', '-apple-system', 'Roboto', 'sans-serif', 'monospace'];
  for (const font of fontFamilies) {
    if (!allowedFamilies.some(a => font.includes(a))) {
      violations.push({ severity: 'error', property: 'font-family', found: font, expected: 'Inter, Lato, or JetBrains Mono' });
    }
  }
  
  // Heading weights — MUST be 700
  // Button/CTA weights — MUST be 600
  // Body weights — MUST be 400
  // H1=4rem, H2=3rem, H3=2rem
  // H1/H2 letter-spacing=-0.02em
  // Heading line-height: H1=1.1, H2=1.2, H3=1.3
  // Body line-height=1.6
  
  return violations;
}
```

### Pixel Sampling (Both Strategies)
```typescript
import sharp from 'sharp';

async function extractDominantColors(imageBuffer: Buffer, k = 8): Promise<string[]> {
  // Resize to 100x100 for fast sampling
  const { data, info } = await sharp(imageBuffer)
    .resize(100, 100, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Simple k-means clustering on RGB pixels
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  
  const centroids = kMeansClustering(pixels, k);
  return centroids.map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
}
```

### Border Radius Check (Source Only)
```typescript
function checkBorderRadius(source: string): BorderRadiusViolation[] {
  const violations: BorderRadiusViolation[] = [];
  const radiusValues = extractBorderRadiusValues(source);
  
  const ALLOWED_RADII = [
    0,                  // none
    0.375,              // 6px — button legacy
    0.375,              // ~6px — radius.sm (0.625 - 4px)
    0.5,                // ~8px — radius.md (0.625 - 2px)
    0.625,              // 10px — radius.base/lg (CANONICAL)
    0.875,              // ~14px — radius.xl (0.625 + 4px)
    9999,               // pill
  ];
  
  for (const { value, element } of radiusValues) {
    const remValue = pxToRem(value); // normalize to rem
    if (!ALLOWED_RADII.some(a => Math.abs(a - remValue) < 0.01)) {
      violations.push({
        severity: 'warning',
        element,
        found: `${value}`,
        expected: '0.625rem (10px canonical) or scale value',
      });
    }
  }
  return violations;
}
```

### Motion Check (Source Only — HTML/CSS)
```typescript
function checkMotion(source: string): MotionViolation[] {
  const violations: MotionViolation[] = [];
  
  // HARD REQUIREMENT: prefers-reduced-motion
  const hasAnimation = /animation|transition|@keyframes/i.test(source);
  const hasReducedMotion = /prefers-reduced-motion/i.test(source);
  
  if (hasAnimation && !hasReducedMotion) {
    violations.push({
      severity: 'error',
      reason: 'Animation detected without prefers-reduced-motion fallback',
      fix: 'Add @media (prefers-reduced-motion: reduce) { ... } with animation-duration: 0.01ms !important',
    });
  }
  
  // HARD REQUIREMENT: hover transform gate
  const hasHoverTransform = /@media.*hover.*transform|:hover.*transform/i.test(source);
  const hasCompoundQuery = /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*and\s*\(prefers-reduced-motion:\s*no-preference\)/i.test(source);
  
  if (hasHoverTransform && !hasCompoundQuery) {
    violations.push({
      severity: 'error',
      reason: 'Hover transform without compound media query gate',
      fix: 'Wrap in @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) { ... }',
    });
  }
  
  // Duration check
  const durations = extractTransitionDurations(source);
  for (const { value, context } of durations) {
    if (value > 500 && context === 'user-triggered') {
      violations.push({
        severity: 'error',
        reason: `User-triggered transition exceeds 500ms (found ${value}ms)`,
        fix: 'Use duration tokens: fast=150ms, normal=200ms, moderate=300ms, slow=500ms',
      });
    }
  }
  
  return violations;
}
```

## Vision Model Prompt

The vision model receives the rendered image and a structured prompt. The prompt varies by evaluation strategy and asset type.

### System Prompt (shared)

```
You are a design system compliance evaluator for the Verdigris Design System.

REFERENCE VALUES (ground truth — use these, not approximations):

BRAND PALETTE (16-stop hue rotation):
- Verdigris teal: oklch(0.75 0.1286 191.57) / #0fc8c3 — PRIMARY. Decorative only on light backgrounds (2.8:1 contrast on white — fails WCAG AA). OK as text on dark backgrounds (12.3:1 on neutral.950).
- Midnight purple: oklch(0.29 0.1506 289.33) — deep accent
- Pastel red: oklch(0.7 0.1909 24.11) — warm accent, sidebar active
- Cyber yellow: oklch(0.87 0.1786 92.23) — highlight, attention
- Plus 12 interpolation stops (see full palette reference)

NEUTRAL SCALE (zinc-tinted, hue ~286):
- neutral.50: oklch(0.985 0 0) — near-white
- neutral.100: oklch(0.967 0.001 286.375) — secondary bg light
- neutral.200: oklch(0.92 0.004 286.32) — borders light
- neutral.400: oklch(0.705 0.015 286.067) — muted dark, ring light
- neutral.500: oklch(0.552 0.016 285.938) — muted light, ring dark
- neutral.800: oklch(0.274 0.006 286.033) — secondary dark
- neutral.900: oklch(0.21 0.006 285.885) — primary light, card dark
- neutral.950: oklch(0.141 0.005 285.823) — foreground light, bg dark

TYPOGRAPHY:
- Sans: Inter (-apple-system, Roboto, sans-serif fallback)
- Display: Lato (www/marketing headings ONLY — Inter for app)
- Mono: JetBrains Mono (ui-monospace fallback)
- H1: 4rem (64px), weight 700, line-height 1.1, letter-spacing -0.02em
- H2: 3rem (48px), weight 700, line-height 1.2, letter-spacing -0.02em
- H3: 2rem (32px), weight 700, line-height 1.3, letter-spacing 0
- Body: 1rem (16px), weight 400, line-height 1.6, letter-spacing 0
- Buttons/CTAs: weight 600 (NOT 700)

SPACING:
- 4px base grid (all spacing multiples of 4px)
- Container max-width: 80rem (1280px)
- Section padding: 4rem (standard), 8rem (hero/feature), 5rem (secondary)

BORDER RADIUS:
- Canonical: 0.625rem (10px) — Patina reference
- Scale: sm ~6px, md ~8px, lg 10px, xl ~14px, full 9999px (pill)
- Button (www legacy): 0.375rem (6px)

DARK MODE:
- Background: neutral.950 (near-black, NEVER pure #000000)
- Borders: semi-transparent white oklch(1 0 0 / 10%)
- Input borders: oklch(1 0 0 / 15%)
- Primary: inverted from near-black to light gray

MOTION (if applicable):
- prefers-reduced-motion: reduce fallback REQUIRED for all animations
- Hover transforms require compound media query: (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)
- Only animate transform and opacity (box-shadow exception for hover-lift)
- Duration tokens: fast=150ms, normal=200ms, moderate=300ms, slow=500ms, spin=800ms
- User-triggered transitions MUST NOT exceed 500ms

BANNED COLORS: #ff0000, #00ff00, #0000ff, #000000 (as bg), #ff00ff, #800080, #ffa500, #008000, rgb equivalents

Evaluate the image against ONLY the categories relevant to this asset type. Return a JSON object.
```

### Response Format

```json
{
  "assetType": "marketing_banner",
  "evaluationStrategy": "source_first",
  "overallScore": 0.87,
  "overallPass": true,
  "categories": {
    "color_accuracy": {
      "score": 0.92,
      "confidence": 0.95,
      "pass": true,
      "violations": [],
      "notes": "All colors within deltaE 5 of brand palette"
    },
    "wcag_contrast": {
      "score": 0.85,
      "confidence": 1.0,
      "pass": true,
      "violations": [
        {
          "severity": "warning",
          "element": "subtitle text",
          "found": "4.8:1",
          "expected": "7.0:1 (AAA aspirational)",
          "fix": "Darken text or lighten background",
          "deterministic": false
        }
      ]
    },
    "typography": {
      "score": 0.90,
      "confidence": 1.0,
      "pass": true,
      "violations": [
        {
          "severity": "error",
          "property": "heading weight",
          "found": "600",
          "expected": "700",
          "fix": "Set font-weight: 700 on all h1/h2/h3 elements",
          "deterministic": true
        }
      ]
    }
  },
  "deterministicViolations": [
    { "category": "typography", "severity": "error", "detail": "H2 weight is 600, must be 700" }
  ],
  "remediation": [
    "Change heading font-weight from 600 to 700",
    "Consider increasing subtitle contrast for AAA compliance"
  ]
}
```

## Scoring Rules

1. **Any `error`-severity deterministic violation** caps the category score at 0.5 max.
2. **Any `error`-severity violation** (deterministic or vision) caps overall score at 0.85 max.
3. **Overall score** is weighted average of category scores using asset-type-specific weights.
4. **Pass threshold**: 0.80 (calibrated against 14 known good/bad examples from design.verdigris.co).
5. **Hysteresis band**: Once an asset reaches 0.85+, it stays "passing" unless it drops below 0.78 (prevents flapping during remediation loops).

## Calibration Examples (14 from design.verdigris.co)

### Good examples (expected score >= 0.85)
1. WCAG-darkened teal for text — correct color usage
2. Translucent borders in dark mode — correct dark mode
3. Brand teal on dark backgrounds — correct contrast
4. Heading hierarchy (4rem/3rem/2rem, Lato 700, Inter 400 body) — correct typography
5. Card composition (shadow-sm, radius.base, spacing.6) — correct component
6. Dark mode (neutral.950, semi-transparent borders) — correct dark mode
7. Motion with compound media query + reduced-motion fallback — correct motion

### Bad examples (expected score <= 0.60)
1. Brand teal as body text on white (~2.8:1) — color violation
2. brand_rules.yml sizes (3.5rem H1, 600 weight H2) — typography violation
3. Teal text on white (~2.9:1) — contrast violation
4. Wrong font weights (H2=600, body=500) — typography violation
5. Off-grid spacing (15px, 1.1rem) — spacing violation
6. Missing reduced motion fallback — motion violation (HARD ERROR)
7. Pure black dark mode (#000000) — dark mode violation

## Dependencies

- `culori` — OKLch color parsing and deltaE computation
- `sharp` — Image processing, pixel sampling, k-means clustering
- `openai` — Vision model (gpt-4o) for subjective evaluation
- Existing `scripts/load-tokens.ts` — Design token loading (needs extension for full 16-stop palette)

## Integration Points

- Called by the Generation Pipeline's compliance loop
- Callable standalone via `POST /api/evaluate` endpoint
- Returns structured JSON for both programmatic and UI consumption
- UI shows per-category scores with expandable violation details

## Full 16-Color Palette Reference (for evaluator)

The evaluator must have ALL 16 stops loaded, not just the 4 anchor colors:

```typescript
const BRAND_PALETTE = [
  { name: 'brand.verdigris', oklch: 'oklch(0.75 0.1286 191.57)', hex: '#0fc8c3', hue: 191.57 },
  { name: 'brand.mix-step-1', oklch: 'oklch(0.635 0.1341 216.01)', hue: 216.01 },
  { name: 'brand.mix-step-2', oklch: 'oklch(0.52 0.1396 240.45)', hue: 240.45 },
  { name: 'brand.mix-step-3', oklch: 'oklch(0.405 0.1451 264.89)', hue: 264.89 },
  { name: 'brand.midnight-purple', oklch: 'oklch(0.29 0.1506 289.33)', hue: 289.33 },
  { name: 'brand.midnight-purple-step-1', oklch: 'oklch(0.3925 0.1607 313.03)', hue: 313.03 },
  { name: 'brand.midnight-purple-step-2', oklch: 'oklch(0.495 0.1708 336.72)', hue: 336.72 },
  { name: 'brand.midnight-purple-step-3', oklch: 'oklch(0.5975 0.1808 0.42)', hue: 0.42 },
  { name: 'brand.pastel-red', oklch: 'oklch(0.7 0.1909 24.11)', hue: 24.11 },
  { name: 'brand.pastel-red-step-1', oklch: 'oklch(0.7425 0.1878 41.14)', hue: 41.14 },
  { name: 'brand.pastel-red-step-2', oklch: 'oklch(0.785 0.1848 58.17)', hue: 58.17 },
  { name: 'brand.pastel-red-step-3', oklch: 'oklch(0.8275 0.1817 75.2)', hue: 75.2 },
  { name: 'brand.cyber-yellow', oklch: 'oklch(0.87 0.1786 92.23)', hue: 92.23 },
  { name: 'brand.cyber-yellow-step-1', oklch: 'oklch(0.8142 0.1695 113.33)', hue: 113.33 },
  { name: 'brand.cyber-yellow-step-2', oklch: 'oklch(0.7698 0.1588 137.1)', hue: 137.1 },
  { name: 'brand.cyber-yellow-step-3', oklch: 'oklch(0.7486 0.1412 163.85)', hue: 163.85 },
];

const NEUTRAL_SCALE = [
  { name: 'neutral.white', oklch: 'oklch(1 0 0)' },
  { name: 'neutral.50', oklch: 'oklch(0.985 0 0)' },
  { name: 'neutral.100', oklch: 'oklch(0.967 0.001 286.375)' },
  { name: 'neutral.200', oklch: 'oklch(0.92 0.004 286.32)' },
  { name: 'neutral.400', oklch: 'oklch(0.705 0.015 286.067)' },
  { name: 'neutral.500', oklch: 'oklch(0.552 0.016 285.938)' },
  { name: 'neutral.800', oklch: 'oklch(0.274 0.006 286.033)' },
  { name: 'neutral.900', oklch: 'oklch(0.21 0.006 285.885)' },
  { name: 'neutral.950', oklch: 'oklch(0.141 0.005 285.823)' },
  { name: 'neutral.black', oklch: 'oklch(0 0 0)' },
];

const STATUS_COLORS = [
  { name: 'status.destructive-light', oklch: 'oklch(0.577 0.245 27.325)' },
  { name: 'status.destructive-dark', oklch: 'oklch(0.704 0.191 22.216)' },
];
```
