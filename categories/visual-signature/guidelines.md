---
layout: visual
title: Visual Signature
---

<p class="v-label">Canonical Brand Visualizations</p>
<div class="v-demo">
  <p style="font-size: 0.8125rem; color: var(--muted-fg); margin-bottom: 1rem;">The Verdigris visual signature derives from the product: 8kHz electrical data made visible. These are not illustrations. They are data patterns that only an electrical intelligence company can produce.</p>
  <div class="v-grid-2">
    <div class="v-card">
      <div class="v-card-title">Phase Portrait (Lissajous)</div>
      <div class="v-card-desc">V-I relationship as XY figure. Each load type produces a unique shape. Primary brand mark.</div>
      <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">Use: card icons, hero illustrations, loading states, favicon</div>
    </div>
    <div class="v-card">
      <div class="v-card-title">Harmonic Spectrum</div>
      <div class="v-card-desc">Frequency-domain bars showing harmonic content. 64 bars from 60Hz fundamental through the 32nd harmonic.</div>
      <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">Use: section dividers (2-4px), card top borders, dashboard headers</div>
    </div>
    <div class="v-card">
      <div class="v-card-title">Waveform Trace</div>
      <div class="v-card-desc">Time-domain 60Hz signal with 3rd, 5th, 7th harmonics. Must show real harmonic structure, not a generic sine.</div>
      <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">Use: section separators, ambient background, resolution comparisons</div>
    </div>
    <div class="v-card">
      <div class="v-card-title">Resolution Comparison</div>
      <div class="v-card-desc">Same electrical event at 1/min vs 8kHz. The fault is invisible at low resolution. The product story in one image.</div>
      <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">Use: evidence sections, product demos, slide decks</div>
    </div>
  </div>
</div>

<p class="v-label">Named Text Effects</p>
<div class="v-demo">
  <p style="font-size: 0.8125rem; color: var(--muted-fg); margin-bottom: 1rem;">Three specified effects for the Technology/Signal page (<a href="../../foundations/composition" style="color: var(--brand-teal);">Demonstrate x Web Page</a> composition cell). Exclusive to this page type. <a href="../../visual-signature-demo" style="color: var(--brand-teal);">See interactive demos.</a></p>

  <div style="margin-bottom: 1.5rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg);">
    <div style="font-weight: 600; margin-bottom: 0.25rem;">1. Measurement Bar Reveal</div>
    <div style="font-size: 0.875rem; color: var(--muted-fg); margin-bottom: 0.5rem;">Characters materialize from 1px teal cursor bars. Oscilloscope measurement metaphor.</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.5rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">
      <span>Duration: 800ms</span>
      <span>Stagger: 35ms/char</span>
      <span>Easing: ease-out</span>
      <span>Section: Hook, Close</span>
      <span>Max: 1 per page</span>
      <span>Legibility: within 600ms</span>
    </div>
  </div>

  <div style="margin-bottom: 1.5rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg);">
    <div style="font-weight: 600; margin-bottom: 0.25rem;">2. Harmonic Typography</div>
    <div style="font-size: 0.875rem; color: var(--muted-fg); margin-bottom: 0.5rem;">Large digits as clipping masks over three-phase waveforms. Text reveals the data.</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.5rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">
      <span>Phases: teal / purple / yellow</span>
      <span>Speed: 1 cycle per 500ms</span>
      <span>Font: Lato 700, 5-12rem</span>
      <span>Section: Evidence</span>
      <span>Max: 1 per page</span>
      <span>Fallback: CSS gradient-clip</span>
    </div>
  </div>

  <div style="margin-bottom: 0; padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg);">
    <div style="font-weight: 600; margin-bottom: 0.25rem;">3. Waveform-to-Text Reveal</div>
    <div style="font-size: 0.875rem; color: var(--muted-fg); margin-bottom: 0.5rem;">Heading starts as oscilloscope trace, resolves into text with palette sweep ending at section accent.</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.5rem; font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg);">
      <span>Duration: 1200ms</span>
      <span>Easing: ease-out</span>
      <span>Structure: 60Hz + harmonics</span>
      <span>Section: Turn only</span>
      <span>Max: 1 per page</span>
      <span>Legibility: within 800ms</span>
    </div>
  </div>
</div>

<p class="v-label">Constraints</p>
<div class="v-demo">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem;">
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">Attention Budget</div>
      <div class="v-card-desc">Max 2 animated elements visible in any viewport. Ambient waveform counts when opacity > 10%.</div>
    </div>
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">Reading Constraint</div>
      <div class="v-card-desc">Text legible within 600ms (&lt;40 chars) or 800ms (40+ chars). Effects continue after but text resolves first.</div>
    </div>
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">Page Exclusivity</div>
      <div class="v-card-desc">Named effects appear only on the Technology/Signal page (Demonstrate cell). Not on homepage or product pages.</div>
    </div>
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">Canvas Fallback</div>
      <div class="v-card-desc">Every Canvas text has identical HTML fallback. Shown for reduced-motion. role="img" + aria-label required.</div>
    </div>
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">Synthetic Data</div>
      <div class="v-card-desc">Must be labeled "Representative electrical data." Synthetic faults acceptable but not claimed as real measurements.</div>
    </div>
    <div class="v-card" style="border-left: 3px solid oklch(0.577 0.245 27.325);">
      <div class="v-card-title" style="font-size: 0.875rem;">No Generic Waves</div>
      <div class="v-card-desc">Waveforms must have real harmonic structure (3rd, 5th, 7th of 60Hz). A plain sine wave is not a brand element.</div>
    </div>
  </div>
</div>

<div class="v-gradient"></div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Visual Signature

## Overview

The Verdigris visual signature is a family of data-derived patterns that only an electrical intelligence company can produce. It is not a logo treatment, an illustration style, or a color scheme. It is the product's data, made visible.

The full specification lives in `foundations/composition.md` under "Visual Signature" and the corresponding rules in `rules/visual-rules.yml` under `composition.visual-signature`, `composition.canvas-text`, `composition.named-effects`, `composition.ambient-waveform`, and `composition.demonstrate-web-page`.

## Interactive Demos

See the [Visual Signature Demo](../../visual-signature-demo) page for interactive Canvas demonstrations of the three named effects and the canonical visualizations.

## What Is a Brand Visualization

A brand visualization derives from real electrical engineering concepts and could only belong to Verdigris:

- Phase portraits (V-I Lissajous figures) showing load fingerprints
- Harmonic spectra showing frequency content of electrical loads
- Waveform traces with real 60Hz + harmonic structure
- Resolution comparisons (1/min vs 8kHz)

## What Is NOT a Brand Visualization

- Generic sine waves with no harmonic content
- Particle systems not derived from electrical data
- Abstract gradient meshes
- Network/node graphs that don't represent circuit topology
- Waveforms used as decoration without connection to content

## The Three Named Effects

These are exclusive to the Technology/Signal page (Demonstrate x Web Page composition cell). They do not appear on any other page.

### 1. Measurement Bar Reveal

Characters materialize from 1px teal cursor bars. The oscilloscope-to-text metaphor: measurement becomes meaning.

- 800ms total, 35ms stagger per character, ease-out
- Use on: H1 in Hook section, optionally reprised in Close
- Text must be fully legible within 600ms

### 2. Harmonic Typography

Large digits where the letterforms are windows into three-phase waveforms scrolling behind them.

- Phase A: teal, Phase B: purple, Phase C: yellow
- One 60Hz cycle per 500ms
- Use on: key stat numbers in Evidence sections
- Reduced-motion: CSS `background-clip: text` with gradient

### 3. Waveform-to-Text Reveal

Section heading starts as a continuous oscilloscope trace, resolves into readable text.

- 1200ms total, ease-out
- Palette sweep terminates at the Turn section's accent color
- The trace must be a continuous sinusoidal with harmonics, not per-character noise
- Use on: H2 at the Turn section only
- Text must be fully legible within 800ms

## Ambient Waveform Layer

A persistent 60Hz sine wave behind dark-background sections. Dark sections only -- off on light backgrounds.

See `foundations/composition.md` for the opacity and harmonics table by section role.

## Canvas Text Rules

When using Canvas to render text (via Pretext or similar):

1. HTML fallback required (same font, weight, size, color)
2. `prefers-reduced-motion: reduce` shows HTML fallback, hides Canvas
3. Canvas element must have `role="img"` and `aria-label`
4. Never render body copy to Canvas -- display headings only
5. Not in the critical rendering path -- fonts first, Canvas after

## Related

- [Composition](../../foundations/composition) -- full Visual Signature spec, Demonstrate cell, ambient waveform
- [Animation Guidelines](../animation/guidelines) -- Three Gates, duration decision tree
- [Motion](../../foundations/motion) -- duration tokens, easing curves
- [Color](../../foundations/color) -- palette semantics, the 16-stop gradient
- [Visual Rules](../../rules/visual-rules.yml) -- machine-consumable rules

</details>
