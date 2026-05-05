# Generation Pipeline — Design Spec

**Date:** 2026-04-03
**Status:** Draft (pending skeptic approval)
**Revision:** 2.0 — corrected against researcher findings

## Overview

A system that generates design-system-compliant visual assets by wrapping the existing adapter architecture with an evaluate-remediate loop. Integrates with the Evaluation Engine to achieve 95%+ compliance scores automatically.

## Architecture

```
User prompt
  │
  ▼
┌─────────────────────┐
│  Pipeline Orchestrator │
│  (new)                │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Existing Adapter    │────▶│  Evaluation Engine   │
│  (nakkas, recraft,   │     │  (new)               │
│   fal-ai, etc.)      │     └──────┬──────────────┘
└─────────────────────┘            │
       ▲                           │ score < threshold?
       │                           ▼
       └───── remediation ◄── Remediation Builder
              prompt              (new)
```

### Zero Breaking Changes

The pipeline wraps existing adapters — it does NOT modify them. Each adapter's `generate()` method is called exactly as before. The pipeline adds:

1. **Pre-generation prompt enrichment** — Injects design system constraints into the user prompt
2. **Post-generation evaluation** — Runs the Evaluation Engine on each output
3. **Remediation loop** — If score < threshold, builds a targeted remediation prompt and re-generates

## Prompt Enrichment

### Design System Preamble (injected before user prompt)

```
DESIGN SYSTEM CONSTRAINTS (you MUST follow these):

COLORS — Use ONLY from the Verdigris palette:
- Primary brand: #0fc8c3 (teal) — decorative only on light backgrounds, OK for text on dark
- Accents: midnight purple, pastel red (#e85d3a), cyber yellow (#d4c520)
- Neutrals: zinc-tinted grays (hue ~286). Background dark: neutral.950 (oklch 0.141), NOT pure black
- Dark mode borders: semi-transparent white at 10% opacity (oklch(1 0 0 / 10%))
- BANNED: #ff0000, #00ff00, #0000ff, #000000 as background, #ff00ff, #800080, #ffa500, #008000

TYPOGRAPHY:
- Headings: weight 700 (bold), NOT 600
- H1: 4rem (64px), line-height 1.1, letter-spacing -0.02em
- H2: 3rem (48px), line-height 1.2, letter-spacing -0.02em
- H3: 2rem (32px), line-height 1.3
- Body: weight 400, line-height 1.6
- Buttons/CTAs: weight 600 (semibold), NOT 700
- Font: Inter for body, Lato for display headings (www only), JetBrains Mono for code

SPACING:
- All spacing on 4px grid
- Container max-width: 1280px (80rem)
- Section padding: 64px (4rem) standard, 128px (8rem) for hero sections

BORDER RADIUS:
- Canonical: 0.625rem (10px)
- Buttons (www): 0.375rem (6px)

MOTION (if generating HTML/CSS):
- REQUIRED: @media (prefers-reduced-motion: reduce) fallback for ALL animations
- REQUIRED: Hover transforms wrapped in @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)
- Only animate transform and opacity
- Max user-triggered transition: 500ms

ACCESSIBILITY:
- Text contrast: 4.5:1 minimum (normal text), 3.0:1 (large text/UI)
- Brand teal on white = 2.8:1 — FAILS. Never use as text on light backgrounds.
- Focus indicators required on all interactive elements
- Alt text on all images
```

### Platform-Specific Additions

**SVG platforms (nakkas, claude-svg, excalidraw):**
- Include full color hex values inline
- Specify exact font-weight numbers
- Require `font-family` attributes on text elements

**Raster platforms (recraft, fal-ai):**
- Focus on color palette description (visual, not code)
- Emphasize overall composition and brand feel
- Skip typography specifics (can't be enforced in raster)

**HTML platform (stitch):**
- Include motion requirements (reduced-motion, hover gate)
- Include dark mode semantic token mappings
- Include component patterns from Patina reference

## Compliance Loop

```typescript
interface ComplianceLoopConfig {
  maxIterations: number;      // default: 3
  targetScore: number;        // default: 0.85 (calibrated)
  earlyExitScore: number;     // default: 0.95 (stop if excellent)
  strategy: 'source_first' | 'visual_only'; // based on platform
}

async function complianceLoop(
  adapter: GenerationAdapter,
  prompt: string,
  config: ComplianceLoopConfig,
  session: Session,
): Promise<{ result: GenerateResult; report: EvaluationReport; iterations: number }> {
  
  let bestResult: GenerateResult | null = null;
  let bestReport: EvaluationReport | null = null;
  let bestScore = 0;
  
  // Enrich prompt with design system preamble
  let currentPrompt = enrichPrompt(prompt, adapter.platform);
  
  for (let i = 0; i < config.maxIterations; i++) {
    // Generate
    const result = await adapter.generate({
      prompt: currentPrompt,
      session,
      // ... other params
    });
    
    // Evaluate
    const report = await evaluationEngine.evaluate(result, {
      strategy: config.strategy,
      assetType: detectAssetType(prompt, result),
    });
    
    // Track best
    if (report.overallScore > bestScore) {
      bestScore = report.overallScore;
      bestResult = result;
      bestReport = report;
    }
    
    // Early exit if excellent
    if (report.overallScore >= config.earlyExitScore) {
      return { result, report, iterations: i + 1 };
    }
    
    // Pass if good enough
    if (report.overallScore >= config.targetScore && !report.hasErrorSeverityViolations) {
      return { result, report, iterations: i + 1 };
    }
    
    // Build remediation prompt for next iteration
    if (i < config.maxIterations - 1) {
      currentPrompt = buildRemediationPrompt(prompt, report);
    }
  }
  
  // Return best result even if under threshold
  return { result: bestResult!, report: bestReport!, iterations: config.maxIterations };
}
```

## Remediation Prompt Builder

```typescript
function buildRemediationPrompt(
  originalPrompt: string,
  report: EvaluationReport,
): string {
  const violations = report.categories
    .flatMap(c => c.violations.filter(v => v.severity === 'error'))
    .sort((a, b) => (a.deterministic ? -1 : 1)); // deterministic first
  
  const fixInstructions = violations.map(v => `- FIX: ${v.fix}`).join('\n');
  
  return `${enrichPrompt(originalPrompt, report.platform)}

PREVIOUS ATTEMPT HAD THESE VIOLATIONS — YOU MUST FIX THEM:
${fixInstructions}

SPECIFIC CORRECTIONS REQUIRED:
${report.remediation.join('\n')}

Generate the asset again with ALL violations fixed. Do not introduce new violations.`;
}
```

## Strategy Selection

```typescript
function selectStrategy(platform: Platform): 'source_first' | 'visual_only' {
  switch (platform) {
    case 'nakkas':
    case 'claude-svg':
    case 'excalidraw':
    case 'stitch':
      return 'source_first';
    case 'recraft':
    case 'fal-ai':
      return 'visual_only';
  }
}
```

## API Endpoints

### `POST /api/generate-compliant`

Generates a design-system-compliant asset using the compliance loop.

```typescript
// Request
{
  prompt: string;
  platform: Platform;
  assetType?: AssetType;  // auto-detected if omitted
  maxIterations?: number; // default 3
  targetScore?: number;   // default 0.85
}

// Response (SSE stream)
{ type: 'iteration_start', data: { iteration: 1, maxIterations: 3 } }
{ type: 'generation_complete', data: { iteration: 1 } }
{ type: 'evaluation_complete', data: { iteration: 1, score: 0.72, violations: [...] } }
{ type: 'remediation_start', data: { iteration: 2, fixes: [...] } }
{ type: 'generation_complete', data: { iteration: 2 } }
{ type: 'evaluation_complete', data: { iteration: 2, score: 0.91, violations: [] } }
{ type: 'pipeline_complete', data: { finalScore: 0.91, iterations: 2, report: {...} } }
```

### `POST /api/evaluate`

Standalone evaluation of any image.

```typescript
// Request (multipart/form-data)
{
  image: File;               // the image to evaluate
  source?: string;           // SVG/HTML source (optional, enables source_first)
  assetType?: AssetType;     // auto-detected if omitted
}

// Response
{
  overallScore: number;
  overallPass: boolean;
  categories: { ... };
  deterministicViolations: [...];
  remediation: [...];
}
```

## Integration with Existing Systems

### Batch Generation (`/generate` page)

The existing batch generation page calls adapters directly. Adding a toggle:
- **"Raw" mode** (default, current behavior) — Direct adapter call, no evaluation
- **"Compliant" mode** (new) — Uses compliance loop, shows iteration progress per platform

### Refinement Studio (`/refine`)

The existing refinement loop can optionally run evaluation after each generation:
- Show compliance score badge on each version thumbnail
- Highlight violations in the annotation view
- Auto-suggest annotations based on evaluation violations

### Gallery

Gallery items can be evaluated on demand:
- "Evaluate" button on each gallery card
- Shows compliance score overlay
- Links to detailed violation report

## Cost Controls

1. **Deterministic pre-check skip** — If source analysis finds 3+ error-severity violations, skip the vision model call entirely. The asset fails regardless.
2. **Max 3 iterations** — Hard cap prevents runaway costs.
3. **Early exit at 0.95** — Don't waste iterations once excellent.
4. **Pixel sampling before vision** — If dominant colors are all off-palette (deltaE > 20 for all), skip vision.
5. **Cache evaluation results** — Same image + same source = same score. Hash-based cache with 1-hour TTL.

## Dependencies

- Evaluation Engine (this project)
- All existing adapters (unchanged)
- `culori` (via Evaluation Engine)
- `sharp` (already a dependency)
- `openai` (already a dependency)
