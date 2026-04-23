---
layout: visual
title: Waveform Trace
maturity: convention
---

# Waveform Trace

A time-domain electrical signal showing a 60 Hz fundamental plus harmonic structure. At 8 kHz sampling, the trace carries enough information to reveal the harmonic signatures that diagnose equipment state. At 1 Hz, it's invisible.

**Argument carried by this visualization:** the density of samples is itself the evidence. A 60 Hz sine with one dot per second cannot reconstruct what an 8 kHz trace shows in a fraction of a cycle.

## When to use

- Teaching posts explaining Nyquist, aliasing, or why sampling rate matters
- Product detail pages that answer "what does the hardware capture?"
- As a section separator where the trace itself becomes the dividing rule
- Ambient background (low-opacity, non-interactive) for hero sections where a subtle electrical motif fits the page

## When NOT to use

- As generic decoration on non-technical pages — this is a literal waveform, not abstract art
- When the page discusses something other than signal capture or analysis
- In situations where the harmonic content isn't the point — a simple sine with no harmonic structure is an off-brand cliché

## Prop contract

Source: `www/client/src/components/visualizations/WaveformTrace.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `harmonicAmplitudes` | `number[]` | (load profile) | Array of per-harmonic amplitudes (index = harmonic order - 1). Drives the shape. |
| `samplingRate` | `number` (Hz) | `8000` | Samples per second. 1 = sparse dots. 8000 = continuous curve. Interpolates between. |
| `animated` | `boolean` | `true` | Trace scrolls left-to-right on viewport entry |
| `theme` | `'dark'\|'light'` | `'dark'` | Oscilloscope vs. technical illustration |
| `showSamplingIndicator` | `boolean` | `false` | Renders sample-point dots overlaid on the trace |

## Tokens consumed

- `viz.trace.primary` — main curve
- `viz.bg.canvas.{dark,light}` — canvas background
- `viz.grid` — crosshair / time axis
- `viz.text.label` — axis labels (RAW ELECTRICAL SIGNAL, time markers)
- `durations.reveal` + `easings.revealCubic` — scroll-on animation

## Accessibility

- `role="img"`
- `aria-label` describes the waveform in plain language: "Electrical waveform showing 60 Hz fundamental with harmonic structure at {samplingRate} samples per second"
- `prefers-reduced-motion: reduce` — renders the full trace immediately, no scroll

## Anti-patterns

1. **Smooth dashed interpolation between sparse dots** — visually suggests reconstruction; breaks the "you can't see what you didn't sample" argument. At low sampling rates, render dots only or very-low-opacity dashed.
2. **Using without a harmonic profile** — a pure sine with no harmonic content is not a brand visualization, it's a stock asset
3. **Decorative overlay behind dense text** — the trace competes with reading; use as separator or background only with clear contrast budget
4. **Animating the scroll on every page visit** — once-per-session; subsequent visits render the static full trace

## Source of truth

`www/client/src/components/visualizations/WaveformTrace.tsx`

Live example surface: pending — planned for `/hardware/ev2` ("Show what EV2 captures at 8 kHz").
