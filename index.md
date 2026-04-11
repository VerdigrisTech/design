---
layout: visual
title: Home
---

<div class="v-demo" style="padding-top:3rem">
  <p class="v-label">Design System</p>
  <h1 style="font-family:var(--font-display);font-size:3rem;font-weight:700;letter-spacing:-0.02em;line-height:1.1;margin-bottom:0.75rem">Verdigris Visual Identity</h1>
  <p style="font-size:1.125rem;color:var(--muted-fg);max-width:40rem;line-height:1.6">Canonical tokens, guidelines, and visual rules for all Verdigris surfaces. Every color, font, and spacing value in one place.</p>
  <div class="v-gradient" style="margin-top:1.5rem"></div>
</div>

<div class="v-demo">
  <p class="v-label">Brand Palette</p>
  <div class="v-swatches" style="margin-bottom:1rem">
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.75 0.1286 191.57)"></div><div class="v-swatch-name">Verdigris<br>#0fc8c3</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.29 0.1506 289.33)"></div><div class="v-swatch-name">Midnight Purple</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.7 0.1909 24.11)"></div><div class="v-swatch-name">Pastel Red</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.87 0.1786 92.23)"></div><div class="v-swatch-name">Cyber Yellow</div></div>
  </div>
  <div class="v-swatches">
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.985 0 0)"></div><div class="v-swatch-name">50</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.92 0.004 286.32)"></div><div class="v-swatch-name">200</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.552 0.016 285.938)"></div><div class="v-swatch-name">500</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.21 0.006 285.885)"></div><div class="v-swatch-name">900</div></div>
    <div class="v-swatch"><div class="v-swatch-color" style="background:oklch(0.141 0.005 285.823)"></div><div class="v-swatch-name">950</div></div>
  </div>
  <p style="margin-top:0.75rem"><a href="foundations/color" style="font-size:0.875rem">Full color system &rarr;</a></p>
</div>

<div class="v-demo">
  <p class="v-label">Palette Semantics</p>
  <p style="font-size:0.875rem;color:var(--muted-fg);margin-bottom:1rem;max-width:40rem;line-height:1.6">Colors have meaning. 70% teal + neutrals, max 2 accent regions per page. Color is earned, not automatic.</p>
  <!-- Live rendered page scroll showing palette in use -->
  <div style="border-radius:0.625rem;overflow:hidden;border:1px solid var(--border);">
    <!-- Hero: dark, teal accent -->
    <div style="background:oklch(0.141 0.005 285.823);padding:1.5rem 2rem 1.25rem;">
      <div style="font-family:var(--font-mono);font-size:0.5625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Trust &middot; Technology</div>
      <div style="font-family:Lato,sans-serif;font-size:1.25rem;font-weight:700;color:oklch(0.985 0 0);margin-top:0.375rem;letter-spacing:-0.02em;">Electrical Intelligence for AI Data Centers</div>
      <div style="font-size:0.75rem;color:oklch(0.705 0.015 286.067);margin-top:0.25rem;">Brand teal anchors 70%+ of the page. The default register.</div>
    </div>
    <!-- Light content flow: white → neutral.100 → white (gentle tonal shift, not dark/light strobe) -->
    <div style="background:white;padding:0.875rem 2rem;">
      <div style="font-family:var(--font-mono);font-size:0.5625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.552 0.016 285.938);">Neutral &middot; Platform</div>
      <div style="font-size:0.75rem;color:oklch(0.21 0.006 285.885);margin-top:0.125rem;">Platform capabilities. No accent needed — every element earns its place.</div>
    </div>
    <div style="background:oklch(0.967 0.001 286.375);padding:0.875rem 2rem;">
      <div style="font-family:var(--font-mono);font-size:0.5625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.552 0.016 285.938);">Neutral &middot; Data quality</div>
      <div style="font-size:0.75rem;color:oklch(0.21 0.006 285.885);margin-top:0.125rem;">Teal label, neutral background. Gentle tonal shift — white to neutral.100, not dark to light.</div>
    </div>
    <!-- One earned dark accent: energy region for detection -->
    <div style="background:oklch(0.141 0.005 285.823);padding:1rem 2rem;position:relative;">
      <div style="position:absolute;inset:0;background:oklch(0.495 0.1708 336.72 / 12%)"></div>
      <div style="position:relative;">
        <div style="font-family:var(--font-mono);font-size:0.5625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.495 0.1708 336.72);">Energy &middot; Detection</div>
        <div style="font-size:0.75rem;color:oklch(0.985 0 0);margin-top:0.125rem;">Real-time fault detection. The one dark accent moment — earned, not automatic.</div>
      </div>
    </div>
    <!-- Back to light, gentle exit -->
    <div style="background:white;padding:0.875rem 2rem;">
      <div style="font-family:var(--font-mono);font-size:0.5625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Trust &middot; Results</div>
      <div style="font-size:0.75rem;color:oklch(0.21 0.006 285.885);margin-top:0.125rem;">Proof points. Teal accent, light background — restraint over variety.</div>
    </div>
  </div>
  <p style="margin-top:0.75rem;font-size:0.75rem;color:var(--muted-fg);line-height:1.5;">Dark hero → light content flow → one dark accent → light exit. <a href="foundations/color" style="font-size:0.75rem">Full palette semantics &rarr;</a></p>
</div>

<div class="v-demo">
  <p class="v-label">Typography</p>
  <div style="margin-bottom:1rem">
    <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:700;letter-spacing:-0.02em;line-height:1.1">Electrical Intelligence</div>
    <div style="font-size:0.75rem;color:var(--muted-fg);font-family:var(--font-mono);margin-top:0.25rem">Lato 700 &middot; Display</div>
  </div>
  <div style="margin-bottom:1rem">
    <div style="font-size:1.125rem;line-height:1.6">Verdigris captures sub-cycle electrical data and applies physics-based analysis to detect instability invisible to traditional monitoring.</div>
    <div style="font-size:0.75rem;color:var(--muted-fg);font-family:var(--font-mono);margin-top:0.25rem">Inter 400 &middot; Body</div>
  </div>
  <div>
    <div style="font-family:var(--font-mono);font-size:0.875rem">8kHz &middot; oklch(0.75 0.1286 191.57) &middot; 48hr early warning</div>
    <div style="font-size:0.75rem;color:var(--muted-fg);font-family:var(--font-mono);margin-top:0.25rem">JetBrains Mono 400 &middot; Code / Data</div>
  </div>
  <p style="margin-top:0.75rem"><a href="foundations/typography" style="font-size:0.875rem">Full type scale &rarr;</a></p>
</div>

<div class="v-demo">
  <p class="v-label">Components</p>
  <div class="v-comp-row" style="margin-bottom:1rem">
    <button class="v-btn v-btn-default">Primary</button>
    <button class="v-btn v-btn-outline">Outline</button>
    <button class="v-btn v-btn-secondary">Secondary</button>
    <button class="v-btn v-btn-ghost">Ghost</button>
    <button class="v-btn v-btn-destructive">Destructive</button>
  </div>
  <div class="v-grid-2" style="margin-bottom:1rem">
    <div class="v-card">
      <div class="v-card-title">Energy Intelligence</div>
      <div class="v-card-desc">Sub-cycle electrical monitoring for AI data centers.</div>
    </div>
    <div class="v-card">
      <div class="v-card-title">Stranded Capacity</div>
      <div class="v-card-desc">Identify megawatts that exist on paper but aren't usable.</div>
    </div>
  </div>
  <p><a href="categories/web-components/buttons" style="font-size:0.875rem">All components &rarr;</a></p>
</div>

<div class="v-demo">
  <p class="v-label">For Partners</p>
  <div class="v-grid-3">
    <div class="v-card" style="padding:1rem">
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.375rem">Brand Teal</div>
      <div style="font-family:var(--font-mono);font-size:0.875rem">#0fc8c3</div>
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);margin-top:0.125rem">PMS 3262 C</div>
    </div>
    <div class="v-card" style="padding:1rem">
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.375rem">Fonts</div>
      <div style="font-size:0.875rem">Inter &middot; Lato &middot; JetBrains Mono</div>
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);margin-top:0.125rem">Google Fonts (OFL)</div>
    </div>
    <div class="v-card" style="padding:1rem">
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.375rem">Package</div>
      <div style="font-family:var(--font-mono);font-size:0.8125rem">@verdigristech/design-tokens</div>
      <div style="font-family:var(--font-mono);font-size:0.625rem;color:var(--muted-fg);margin-top:0.125rem">v0.4.0 &middot; npm</div>
    </div>
  </div>
  <p style="margin-top:0.75rem"><a href="specimen" style="font-size:0.875rem">Full brand specimen &rarr;</a></p>
</div>

<details class="v-details" markdown="1">
<summary>Documentation &amp; Developer Resources</summary>

## Foundations

- [Color](foundations/color.md) -- Palette, OKLch rationale, WCAG, dark mode
- [Typography](foundations/typography.md) -- Scale, font stacks, weight rules
- [Spacing](foundations/spacing.md) -- 4px grid, radius, breakpoints
- [Motion](foundations/motion.md) -- Animation philosophy, specs, reduced-motion
- [Accessibility](foundations/accessibility.md) -- WCAG AA requirements
- [Dark Mode](foundations/dark-mode.md) -- Strategy, Patina hue shift
- [Elevation](foundations/elevation.md) -- Shadow and z-index systems

## Categories

- [Photography](categories/photography/guidelines.md) -- Photo style, composition rules <span class="status-pill status-pill-partial">Partial</span>
- [Illustration](categories/illustration/guidelines.md) -- Icon style, diagram conventions <span class="status-pill status-pill-partial">Partial</span>
- [3D and Spline](categories/3d-and-spline/guidelines.md) -- WebGL waveform spec <span class="status-pill status-pill-partial">Partial</span>
- [Ads and Templates](categories/ads-and-templates/guidelines.md) -- Ad specs, collateral <span class="status-pill status-pill-partial">Partial</span>
- [Physical Goods](categories/physical-goods/guidelines.md) -- Trade show, print <span class="status-pill status-pill-partial">Partial</span>

Status reflects documentation completeness. `Partial` means guidance exists today, but examples, source assets, or templates are still being filled in.

## Tokens (JSON)

- [Color / Base](tokens/color/base.json) &middot; [Light](tokens/color/semantic-light.json) &middot; [Dark](tokens/color/semantic-dark.json)
- [Typography](tokens/typography/font-family.json) &middot; [Scale](tokens/typography/scale.json)
- [Spacing](tokens/spacing/base.json) &middot; [Layout](tokens/spacing/layout.json)
- [Motion](tokens/motion/duration.json) &middot; [Easing](tokens/motion/easing.json)
- [Elevation](tokens/elevation/shadow.json) &middot; [Z-index](tokens/elevation/z-index.json)
- [Radius](tokens/radius.json) &middot; [Breakpoints](tokens/breakpoints.json)

## Install

```bash
npm install @verdigristech/design-tokens
```

```css
@import '@verdigristech/design-tokens/css/oklch';
```

```js
import designPreset from '@verdigristech/design-tokens/tailwind';
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add tokens, docs, or examples.

</details>
