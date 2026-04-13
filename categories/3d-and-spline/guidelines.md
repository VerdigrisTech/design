---
layout: visual
title: 3D & Spline Guidelines
status: partial
status_note: Needs rendered scene captures and starter implementation references before this category is complete.
---

<div class="v-demo">
  <div class="v-label">Visual Mood — "Polished, futuristic, grounded."</div>
  <div class="v-swatches">
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.75 0.1286 191.57)"></div>
      <div class="v-swatch-name">Verdigris</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.141 0.005 285.823)"></div>
      <div class="v-swatch-name">neutral.950</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.52 0.1396 240.45)"></div>
      <div class="v-swatch-name">mix-2</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.985 0 0)"></div>
      <div class="v-swatch-name">neutral.50</div>
    </div>
  </div>
  <div class="v-gradient" style="height: 4px; background: linear-gradient(to right, oklch(0.75 0.1286 191.57), oklch(0.52 0.1396 240.45), oklch(0.29 0.1506 289.33))"></div>
  <div class="v-card" style="margin-top: 1rem; padding: 1.5rem; background: oklch(0.141 0.005 285.823); border-left: 3px solid oklch(0.75 0.1286 191.57)">
    <div class="v-card-title" style="font-family: Lato, sans-serif; font-weight: 700; font-size: 1.25rem; color: oklch(0.985 0 0)">Polished, futuristic, grounded.</div>
    <div class="v-card-desc" style="color: oklch(0.92 0.004 286.32)">Energy intelligence, not sci-fi. Clean materials, controlled lighting, deliberate camera angles.</div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Guidelines</summary>

# 3D & Spline Guidelines

## Overview

3D elements at Verdigris are a **premium treatment**, not a default. Use them for hero visuals, product showcases, and data visualizations where three-dimensional representation communicates information or brand identity that flat design cannot. Every 3D element must justify its render cost: if the same message works as a 2D illustration or static image, use that instead.

Spline is the primary authoring tool. All 3D scenes ship as WebGL embeds with mandatory fallbacks for devices and browsers that cannot run them.

## Mood & Style

**Polished, futuristic, grounded.** Think "energy intelligence," not "sci-fi." The visual language should feel like precision engineering — clean materials, controlled lighting, deliberate camera angles.

Key attributes:

- **Materials:** Smooth, lightly reflective surfaces. Favor glass, brushed metal, and matte finishes over cartoon shading or hyper-realistic textures. Subtle environment reflections are acceptable; heavy specular highlights are not.
- **Lighting:** Soft directional lighting with a single key light and gentle ambient fill. Use brand teal (`color.brand.verdigris`) as an accent light color sparingly — it should tint, not flood.
- **Camera:** Controlled, deliberate angles. Gentle orbits and slow parallax are appropriate. Erratic camera movement or fast zooms undermine the "grounded" tone.
- **Geometry:** Clean topology, minimal polygon counts. Prefer geometric and abstract forms over photorealistic models. Organic shapes are acceptable when representing energy flows or data streams.
- **Atmosphere:** Dark scene backgrounds are strongly preferred. Match `color.neutral.950` for scene backgrounds to integrate seamlessly with the page.

## Specifications

### Tooling

| Property | Value | Notes |
|----------|-------|-------|
| Primary tool | Spline (spline.design) | All new 3D work starts here |
| Export format | Spline web embed or glTF/GLB | Prefer Spline runtime for interactive scenes |
| Fallback format | Static PNG or WebP (2x resolution) | Required for every 3D element |
| Canvas renderer | WebGL 2.0 | WebGL 1.0 as automatic fallback |

### Performance Budgets

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Frame rate | 60fps on mid-range devices | Never below 30fps |
| Initial 3D bundle | Under 1.5MB | 2MB absolute maximum |
| Total scene textures | Under 1MB compressed | Resize or compress beyond this |
| Time to interactive | 3D must not block page TTI | Lazy-load only |
| Memory footprint | Under 150MB GPU memory | Profile on integrated GPUs |

### Canvas Sizing

| Context | Max Canvas Size | Aspect Ratio |
|---------|----------------|--------------|
| Hero section (full-width) | 1920 x 1080 CSS pixels | 16:9 |
| Product showcase (contained) | 800 x 600 CSS pixels | 4:3 |
| Inline data visualization | 600 x 400 CSS pixels | 3:2 |
| Mobile (any context) | 375 x 300 CSS pixels | Match container |

Render at the device pixel ratio but cap at `2x` — rendering at `3x` on high-DPI phones is wasteful and tanks frame rate.

### Loading Strategy

All 3D content must be lazy-loaded behind an Intersection Observer. The page must be fully interactive before any 3D asset begins downloading.

```js
// Canonical loading pattern
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      loadSplineScene(entry.target);
      observer.unobserve(entry.target);
    }
  },
  { rootMargin: '200px' } // Start loading slightly before viewport
);

observer.observe(document.querySelector('.spline-container'));
```

While the 3D scene loads, display the static fallback image. Fade from the fallback to the live canvas using `duration.moderate` (300ms) with `easing.out` once the scene is ready.

## Token Usage

### Colors

3D scenes must use brand palette colors as material colors and light tints. Never introduce colors that exist outside the token system.

| Role | Token | Usage |
|------|-------|-------|
| Accent light / emissive | `color.brand.verdigris` | Primary teal glow, rim lighting, accent highlights |
| Secondary accent | `color.brand.midnight-purple` | Deep shadows, secondary emissive |
| Warm highlight | `color.brand.cyber-yellow` | Sparingly, for data visualization emphasis |
| Alert / energy spike | `color.brand.pastel-red` | Sparingly, for status or threshold indicators |
| Scene background | `color.neutral.950` | Default dark scene background |
| Ambient fill | `color.neutral.800` | Subtle fill light on dark surfaces |
| Light material surface | `color.neutral.50` | Glass or light-colored geometry in light mode contexts |

For gradient steps between brand colors (e.g., teal-to-purple transitions on geometry), use the `color.brand.mix-step-*` tokens rather than creating custom gradients.

### Typography

3D scenes should not contain rendered text. If labels are necessary for data visualization, overlay them as HTML elements positioned above the canvas — never bake text into the 3D scene. Overlaid labels follow standard typography tokens:

- Body labels: Inter at `font.size.sm` or `font.size.base`
- Value callouts: JetBrains Mono at `font.size.lg` for numerical data

### Spacing

- Maintain at least `spacing.6` (24px) padding between the canvas edge and any adjacent page content.
- Hero 3D sections use `spacing.0` (flush) for full-bleed layouts, with content overlays inset by `spacing.8` (32px) minimum.

## Do's

1. **Do:** Use Spline as the primary tool for all hero 3D content. It provides optimized WebGL export, built-in interaction handling, and a consistent authoring pipeline.

2. **Do:** Lazy-load every 3D scene with Intersection Observer. No 3D asset should appear in the critical rendering path or block first contentful paint.

3. **Do:** Provide a static fallback image for every 3D element. The fallback must be a representative screenshot of the scene, exported at 2x resolution as PNG or WebP, and displayed while the scene loads or when WebGL is unavailable.

4. **Do:** Match the scene background to `color.neutral.950` so the canvas integrates with the page rather than appearing as a foreign rectangle.

5. **Do:** Respect `prefers-reduced-motion`. When the user has requested reduced motion, pause all 3D animations and present a static camera angle. Continuous orbits, particle effects, and auto-play animations must stop.

   ```css
   @media (prefers-reduced-motion: reduce) {
     .spline-container canvas {
       /* Scene loaded but animations paused via Spline API */
     }
     .spline-fallback {
       display: block; /* Show static image instead */
     }
   }
   ```

6. **Do:** Test 3D scenes on integrated GPUs (Intel, Apple M-series integrated) and mid-range Android devices. Performance that only works on discrete GPUs is not acceptable for production.

## Don'ts

1. **Don't:** Auto-play heavy 3D scenes on mobile. Mobile devices have constrained GPU, memory, and battery budgets. On viewports below 768px, prefer the static fallback image with an optional "View in 3D" tap-to-load interaction.

2. **Don't:** Use 3D for content that communicates effectively in 2D. A chart that works as an SVG bar graph does not need a 3D treatment. 3D must earn its render cost.

3. **Don't:** Block page render on 3D asset loading. The page must be fully interactive (text readable, links clickable, forms usable) before any 3D content begins to load. No loading spinners that gate page content behind a 3D scene.

4. **Don't:** Use colors outside the brand palette in 3D materials or lighting. Every color in the scene must trace back to a design token. Custom colors introduce drift that is impossible to maintain across surfaces.

5. **Don't:** Exceed the 2MB bundle budget for 3D assets. If a scene exceeds this, reduce texture resolution, simplify geometry, or split into progressive loading stages. Large assets on slow connections create dead zones where users see nothing.

6. **Don't:** Render text inside the 3D canvas. Text in WebGL is not accessible to screen readers, cannot be selected or translated, and renders poorly at non-native resolutions. Use HTML overlays.

7. **Don't:** Use heavy post-processing effects (bloom, depth of field, screen-space reflections) without profiling on target devices first. These effects are GPU-intensive and often unnecessary for the clean aesthetic Verdigris targets.

## Performance

### Loading Lifecycle

```
Page load
  |
  v
HTML + CSS render (no 3D in critical path)
  |
  v
Page interactive (TTI)
  |
  v
Intersection Observer fires when container nears viewport
  |
  v
Fetch Spline runtime + scene file (lazy)
  |
  v
Parse scene, initialize WebGL context
  |
  v
Fade from static fallback to live canvas (duration.moderate + easing.out)
  |
  v
Scene interactive
```

### Bundle Size Budget

| Asset | Budget | Enforcement |
|-------|--------|-------------|
| Spline runtime JS | ~200KB gzipped | Version-lock in package.json |
| Scene file (.splinecode) | Under 1.3MB | Audit in CI; reject PRs exceeding limit |
| Fallback image | Under 200KB | WebP preferred, PNG acceptable |
| **Total** | **Under 2MB** | Measured as transferred bytes (gzipped) |

### FPS Monitoring

Monitor frame rate during development and in staging environments:

```js
// Development-only FPS monitor
let frames = 0;
let lastTime = performance.now();

function countFrame() {
  frames++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    const fps = Math.round(frames * 1000 / (now - lastTime));
    if (fps < 30) {
      console.warn(`[3D Performance] FPS dropped to ${fps} — investigate or simplify scene`);
    }
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(countFrame);
}

requestAnimationFrame(countFrame);
```

Strip FPS monitoring from production builds. In production, rely on Web Vitals (INP, CLS) to detect 3D-related performance regressions.

### WebGL Fallback Behavior

Not all browsers and devices support WebGL 2.0. Implement graceful degradation:

| Condition | Behavior |
|-----------|----------|
| WebGL 2.0 available | Full Spline scene |
| WebGL 1.0 only | Attempt simplified scene; fall back to static image if frame rate drops below 30fps |
| No WebGL support | Static fallback image, no attempt to initialize canvas |
| `prefers-reduced-motion: reduce` | Static camera, all animations paused |
| Low battery / power saver mode | Static fallback image (detect via Battery Status API where available) |

```js
function getWebGLSupport() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 'none';
  return gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1';
}
```

## 3D in Page Composition

3D scenes are not standalone elements. They serve narrative roles within the composition framework (`foundations/composition.md`). The role determines the scene's complexity, interaction model, and performance budget.

### Narrative Role Mapping

| Narrative role | 3D usage | Interaction | Performance budget |
|---------------|----------|-------------|-------------------|
| **Hook** (hero) | Atmospheric background (waveform, particle field) | Passive or subtle parallax on scroll | 1.5MB bundle, 60fps target |
| **Evidence** (feature section) | Product showcase (gateway exploder, component cutaway) | Scroll-driven reveal, step-by-step | 2MB bundle (max), 30fps floor |
| **Turn** (accent moment) | Data visualization (3D chart, real-time render) | Interactive (hover, rotate) | 1MB budget, lazy-loaded |
| **Proof** (credibility) | Static 3D render (product photo replacement) | None (pre-rendered image) | 0 runtime cost |

### Scroll-Driven Hardware Exploders

For product pages where the hardware is the proof (gateway, sensors, metering infrastructure). Think Apple Mac Studio scroll reveal — one layer visible per viewport, building understanding from outside in.

See `rules/visual-rules.yml` -> `three_d_composition.hardware_exploder` for machine-enforceable rules (pacing, reveal order, annotation style, exit state, fallback).

### When Not to Use 3D

- **Inform pages:** 3D adds visual weight that conflicts with the metronomic rhythm. Use diagrams and screenshots.
- **Convert pages:** 3D is a distraction from the single action. Use product photography if needed.
- **Narrate pages:** 3D may appear as a figure within an episode if the essay is about the hardware. But it never replaces prose.

## Templates & Starting Points

- **Spline scene template:** Request from the design team. Template includes pre-configured lighting rig, camera constraints, and brand-color materials matching the token palette.
- **Integration boilerplate:** See the Spline React component pattern used in the www codebase for lazy-loading, fallback image handling, and reduced-motion detection.
- **Fallback image generation:** Export a static frame from the Spline editor at 2x resolution. Save as WebP with 85% quality, PNG if transparency is needed.

## Related

- [Animation guidelines](../animation/guidelines.md) — Duration and easing tokens, reduced-motion requirements
- [Motion foundations](../../foundations/motion.md) — Token rationale, duration scale, easing philosophy
- [Accessibility foundations](../../foundations/accessibility.md) — WCAG requirements, reduced-motion obligations
- [Color foundations](../../foundations/color.md) — OKLch palette, brand color usage
- [Dark mode foundations](../../foundations/dark-mode.md) — Dark surface conventions, `color.neutral.950` usage
- [Elevation foundations](../../foundations/elevation.md) — Shadow and depth tokens for consistent layering

</details>
