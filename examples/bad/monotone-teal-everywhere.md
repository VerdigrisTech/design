---
layout: visual
title: "Bad: Monotone Teal Everywhere"
category: color
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div style="display:grid;gap:0;border-radius:0.625rem;overflow:hidden;">
    <div style="background:oklch(0.141 0.005 285.823);padding:2rem;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Technology</span>
      <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">Platform features</h3>
      <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Teal accent &mdash; correct for technology</p>
    </div>
    <div style="background:oklch(0.141 0.005 285.823);padding:2rem;border-top:1px solid oklch(1 0 0 / 10%);">
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Detection</span>
      <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">Fault detection</h3>
      <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Also teal &mdash; should use energy palette (purple/magenta)</p>
    </div>
    <div style="background:oklch(0.141 0.005 285.823);padding:2rem;border-top:1px solid oklch(1 0 0 / 10%);">
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Results</span>
      <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">$2.4M saved</h3>
      <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Still teal &mdash; should use results palette (yellow/orange)</p>
    </div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Bad: Monotone Teal Everywhere

## Category
color

## Classification
bad

## What to Notice
- Every section uses the same teal accent regardless of content category
- No visual differentiation between technology, detection, and results sections
- The page feels flat and monotone — 14 of 16 brand colors sit unused
- Violates `color.palette-semantics.no-monotone` rule: homepage must use at least 2 palette regions beyond teal + neutrals

## Tokens Referenced
- `color.brand.verdigris` — used correctly for technology, incorrectly for detection and results
- `color.palette-semantics.energy` — should be used for detection content
- `color.palette-semantics.results` — should be used for metrics content

## Fix
Apply palette semantic regions:
- **Technology** → trust region (teal) — correct as-is
- **Detection** → energy region (purple/magenta) — use `oklch(0.495 0.1708 336.72 / 12%)` as section tint
- **Results** → results region (yellow/orange) — use `oklch(0.87 0.1786 92.23 / 8%)` as section tint

Add neutral breathing-room sections between colored sections.

## Code Example

```css
/* Instead of teal everywhere: */
.section-detection .label { color: oklch(0.495 0.1708 336.72); }  /* energy */
.section-results .label { color: oklch(0.87 0.1786 92.23); }      /* results */
```

</details>
