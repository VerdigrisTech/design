---
layout: visual
title: "Good: Palette Semantic Usage"
category: color
classification: good
---

<div class="v-demo">
  <span class="v-badge v-badge-pass">PASS</span>
  <div style="display:grid;gap:0;border-radius:0.625rem;overflow:hidden;">
    <!-- Detection section using energy palette -->
    <div style="background:oklch(0.141 0.005 285.823);position:relative;padding:2rem;">
      <div style="position:absolute;inset:0;background:oklch(0.495 0.1708 336.72 / 12%)"></div>
      <div style="position:relative;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.495 0.1708 336.72);">Detection &amp; Alerting</span>
        <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">Real-time fault detection</h3>
        <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Energy palette region — content matches semantic role</p>
      </div>
    </div>
    <!-- Neutral breathing room -->
    <div style="background:oklch(0.967 0.001 286.375);padding:1.5rem;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.552 0.016 285.938);">Neutral Section</span>
      <p style="color:oklch(0.21 0.006 285.885);font-size:0.875rem;margin:0.25rem 0 0;">Breathing room between colored sections prevents chromatic fatigue</p>
    </div>
    <!-- Results section using results palette -->
    <div style="background:oklch(0.141 0.005 285.823);position:relative;padding:2rem;">
      <div style="position:absolute;inset:0;background:oklch(0.87 0.1786 92.23 / 8%)"></div>
      <div style="position:relative;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.87 0.1786 92.23);">Metrics &amp; Outcomes</span>
        <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">$2.4M recovered annually</h3>
        <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Results palette region — warm tones for proof points</p>
      </div>
    </div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Good: Palette Semantic Usage

## Category
color

## Classification
good

## What to Notice
- Each section uses a palette region that matches its content category (detection = energy, metrics = results)
- A neutral section provides visual breathing room between colored sections
- Dark mode tints use appropriate opacity (12% for energy, 8% for results) per `color.palette-semantics` rules
- Section labels use the palette accent color for the region, reinforcing the semantic mapping

## Tokens Referenced
- `color.palette-semantics.energy` — purple/magenta region for detection content
- `color.palette-semantics.results` — yellow region for metrics and outcomes
- `color.palette-semantics.neutral` — breathing room between colored sections
- `color.neutral.950` — dark section backgrounds
- `color.neutral.100` — light neutral background

## Why This Works
The palette creates visual rhythm as the user scrolls — each section has a distinct identity tied to its content, not arbitrary color assignment. An AI agent building this page can look up "what color for detection content?" and get a concrete answer from the semantic mapping. The neutral section between colored sections prevents the page from feeling like a rainbow.

## Code Example

```css
/* Detection section — energy palette region */
.section-detection {
  background: var(--color-neutral-950);
  position: relative;
}
.section-detection::before {
  content: '';
  position: absolute;
  inset: 0;
  background: oklch(0.495 0.1708 336.72 / 12%); /* mp-step-2 at 12% */
}
.section-detection .label {
  color: oklch(0.495 0.1708 336.72); /* energy accent */
}
```

</details>
