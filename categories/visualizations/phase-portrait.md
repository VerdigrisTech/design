---
layout: visual
title: Phase Portrait (Lissajous)
maturity: convention
---

# Phase Portrait (Lissajous)

A voltage-against-current XY plot. Each electrical load produces a unique Lissajous figure based on its harmonic content. The motor draws a smooth ellipse. The GPU rack adds harmonic complexity. A bearing fault distorts the shape entirely.

**This is the primary Verdigris visual signature.** Of all the brand visualizations, the Phase Portrait is the one that communicates "we understand the physics" most compactly. Use it sparingly and intentionally — frequent use dilutes its signal.

## When to use

- A page needs a one-element illustration of "every load has a unique fingerprint"
- An evidence section where the reader has just learned about electrical signatures
- Card icons, loading states, favicon candidate — any place a small brand mark reads as "technically literate"
- Grouped specimens (3 × portrait) comparing load types (motor / GPU / fault is the canonical trio)

## When NOT to use

- As generic decoration — if removing it loses no information, don't include it
- When the page's argument doesn't hinge on electrical physics — use typography instead
- At very small sizes (< 140 px) where the curve detail is illegible

## Prop contract

Source: `www/client/src/components/visualizations/LissajousFigure.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `loadType` | `'resistive'\|'motor'\|'led'\|'vfd'\|'gpu'\|'fault'` | (required) | Which load's harmonic profile to render |
| `size` | `number` (px) | `160` | Square canvas edge. 180 minimum for grouped specimens. |
| `animated` | `boolean` | `true` | One-shot viewport-entry trace draw + gentle pulse loop |
| `showLabel` | `boolean` | `true` | Render `LOAD TYPE` + power + PF metadata below canvas |
| `theme` | `'dark'\|'light'` | `'dark'` | Oscilloscope aesthetic (dark) vs technical illustration (light) |

## Tokens consumed

- `viz.trace.primary` — default curve color
- `viz.trace.fault` — curve color when `loadType="fault"` (unique load gets unique color — this is intentional)
- `viz.bg.canvas.{dark,light}` — canvas background per theme
- `viz.grid` — center crosshair + bar outlines (dark theme uses it; light theme uses `neutral.200`)
- `viz.guideline.{dark,light}` — outer unit circle (near-invisible reference geometry)
- `viz.text.label` + `viz.text.meta` — JetBrains Mono metadata
- `durations.reveal` + `easings.revealCubic` — viewport-entry animation

## Accessibility

- `role="img"` on `<canvas>`
- `aria-label` describes the load type and what the figure represents: "Lissajous phase portrait for {LABEL}: voltage plotted against current showing the unique electrical fingerprint of this load type"
- `prefers-reduced-motion: reduce` — draws the full trace immediately, no pulse loop

## Anti-patterns

1. **Using Phase Portrait as a bullet-point icon** — dilutes the brand mark into decoration
2. **Applying `loadType="fault"` outside a fault-narrative context** — the red trace is semantic (actual fault detected), not stylistic
3. **Theme-switching within the same viewport** — pick light or dark for the section; don't mix
4. **Hardcoding harmonic parameters** — the LOAD_CONFIGS table in the React source is the canonical profile set; don't invent new ones without engineering review

## Source of truth

`www/client/src/components/visualizations/LissajousFigure.tsx` (graduated from `explorations/visual-signature/` after shipping on `/platform/signals`).
