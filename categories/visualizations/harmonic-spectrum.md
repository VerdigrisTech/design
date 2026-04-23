---
layout: visual
title: Harmonic Spectrum
maturity: convention
---

# Harmonic Spectrum

Frequency-domain bars showing the harmonic content of an electrical signal. Each bar represents the amplitude of a specific harmonic order (H1 fundamental, H3, H5, H7, H9, H11, H13). The H5 / H7 ratio is the diagnostic metric for 6-pulse rectifier health — shifts in this ratio signal capacitor aging well before any alarm threshold fires.

**Argument carried by this visualization:** the waveform doesn't scream "fault." The *analysis* of the waveform does. This view makes the harmonic content legible.

## When to use

- Evidence sections that name a specific diagnostic metric (e.g., H5/H7 ratio, THD, crest factor)
- Before/after comparisons (healthy baseline vs. degrading signal overlaid)
- Dashboard-style surfaces that teach what Signals detects
- Card top borders (2-4 px high) as texture — the bar structure reads as "technical" without decoration

## When NOT to use

- When the page isn't discussing frequency-domain analysis or harmonic content
- As a generic bar chart for non-harmonic data — that's misusing a semantic visualization
- Without diagnostic meaning — the bars should encode something real (harmonic amplitudes), not arbitrary values

## Prop contract

Source: `www/client/src/components/visualizations/HarmonicSpectrum.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `harmonics` | `number[]` | (required) | Amplitude per harmonic order. Array index 0 = fundamental (H1), 2 = H3, 4 = H5, etc. |
| `healthyBaseline` | `number[]` \| `undefined` | `undefined` | Optional comparison — renders as dim outline behind current bars |
| `highlightOrders` | `number[]` | `[]` | Harmonic orders to emphasize (e.g., `[5, 7]` for 6-pulse rectifier diagnosis). Highlighted bars render at higher opacity with glow |
| `thd` | `number` \| `undefined` | `undefined` | Optional total-harmonic-distortion value rendered in the header |
| `animated` | `boolean` | `true` | Bars grow on viewport entry |
| `severityColoring` | `boolean` | `false` | When true, bars exceeding normal thresholds flip to `viz.trace.warning` (amber) or `viz.trace.fault` (red) |

## Tokens consumed

- `viz.trace.primary` — default bar color
- `viz.trace.warning` — elevated bars when `severityColoring` enabled
- `viz.trace.fault` — critical bars when `severityColoring` enabled
- `viz.bg.canvas.dark` — canvas background
- `viz.grid` — bar outlines + axis
- `viz.text.label` — H1, H3, H5... labels
- `viz.text.meta` — amplitude values, THD annotation
- `durations.reveal` + `easings.revealCubic` — bar-grow animation

## Accessibility

- `role="img"`
- `aria-label` describes the spectrum: "Harmonic spectrum showing {N} harmonic orders; dominant harmonics at H{order}, H{order}"
- When `healthyBaseline` is provided, a11y label includes the comparison: "...with healthy baseline for comparison"
- `prefers-reduced-motion: reduce` — bars render at full height immediately

## Anti-patterns

1. **Arbitrary number of bars** — stick to the canonical odd-harmonic series (H1, H3, H5, H7, H9, H11, H13). Custom bar counts break the "this is a harmonic spectrum, not a generic chart" signal.
2. **Highlighting without diagnostic justification** — `highlightOrders` should encode real diagnostic meaning (e.g., H5+H7 for 6-pulse rectifiers, H3 for single-phase nonlinear loads). Highlighting for visual interest is an anti-pattern.
3. **Severity coloring on non-diagnostic spectrums** — if the bars don't represent a signal being evaluated against a healthy baseline, don't color by severity. It implies an alarm state that isn't there.
4. **Bars beyond the plotted range** — if amplitudes exceed the max, clip visibly or add a break; don't silently truncate.

## Source of truth

`www/client/src/components/visualizations/HarmonicSpectrum.tsx`

Live example surface: pending — planned for `/platform/signals` evidence section and blog posts on harmonic distortion.
