---
layout: visual
title: Resolution Comparison
maturity: convention
---

# Resolution Comparison

A single-axis slider that scrubs sampling rate from 1 Hz to 8 kHz, simultaneously animating a time-domain waveform panel and a frequency-domain health-analysis panel. At 1 Hz, the waveform is sparse dots and the health analysis reads "NO HEALTH DATA." At 8 kHz, the full waveform appears with a computed H5 / H7 health ratio revealing degradation.

**Argument carried by this visualization:** the insight is the user's own discovery. They drag the slider, they see diagnostic capability appear. It's the product demo in one interaction.

## When to use

- Product pages where the entire thesis is "sampling resolution changes what's knowable" (`/platform/signals`, `/hardware/ev2`, `/hardware/ev2-pro`)
- Narrative pivots ("turn" role in the composition arc) where the reader needs to FEEL the resolution gap, not just read about it
- Demo decks and sales collateral as an interactive centerpiece
- Blog posts teaching Nyquist, aliasing, or the physics of equipment degradation detection

## When NOT to use

- More than once per page — the argument is carried once; repeating it dilutes
- In narrow columns where the canvas width drops below 500 px (the twin-panel layout needs room)
- On pages whose thesis is unrelated to sampling or signal analysis

## Prop contract

Source: `www/client/src/components/visualizations/ResolutionComparison.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `width` | `number` (px) | `640` | Max canvas width. Auto-shrinks below this if container is narrower. |
| `height` | `number` (px) | `320` | Canvas height. Fixed; does not scale responsively. |
| `className` | `string` | `undefined` | Pass-through for container styling |
| `bareFrame` | `boolean` | `false` | When `true`, suppresses internal chrome so the component can be wrapped by `<CanvasFrame>`. See below. |

## Framing note

ResolutionComparison currently ships with its own internal chrome (dark rounded container, padded header, caption band). When placed inside a `<CanvasFrame>`, this double-nests. The `bareFrame` prop (planned for v3.2.0 consumer release) removes internal chrome so the external frame owns the container; for standalone usage the default remains `false`.

## Tokens consumed

- `viz.trace.primary` — active waveform + spectrum bars + slider fill + thumb
- `viz.trace.fault` — H7 upward arrow (harmonic rising beyond healthy)
- `viz.trace.warning` — H5 downward arrow (harmonic decreasing)
- `viz.bg.canvas.dark` — canvas background + slider thumb border
- `viz.grid` — crosshair, panel divider, bar outlines, slider track background
- `viz.guideline.dark` — faded healthy-baseline overlay at full resolution
- `viz.text.label` — panel headings (RAW ELECTRICAL SIGNAL, HEALTH ANALYSIS)
- `viz.text.meta` — status text, labels, health ratio annotation
- `durations.revealLong` + `easings.revealCubic` — viewport-entry 8k → 1 → 8k scrub
- Slider styling from [`categories/web-components/brand-slider.md`](../web-components/brand-slider.md)

## Accessibility

- `role="img"` on canvas
- `aria-label` dynamic — reflects current sampling rate AND current status text: "Waveform and harmonic spectrum at {rate} samples per second. {statusText}"
- Slider: `aria-label="Sampling rate"` + `aria-valuetext="{rate} samples per second"` updated on change
- Focus ring: 2 px solid `viz.trace.primary`, 4 px offset
- Keyboard: arrow keys increment/decrement log-scale; pg-up/pg-down jump to endpoints
- `prefers-reduced-motion: reduce` — skips the viewport-entry scrub; renders at 8 kHz immediately; slider thumb has no transition

## Interaction affordance

When the viewport-entry animation completes and the user has not yet interacted, a pulsing text prompt appears above the slider: `← drag to reduce resolution →`. The pulse uses `durations.slow` + `easings.default`. The prompt hides on first interaction and never returns during the session.

## Anti-patterns

1. **Split-screen drag (left vs. right)** — was tried in an earlier version and rejected. The single-axis slider pattern (one value, both panels respond) is the canonical interaction.
2. **Smooth dashed interpolation at low sampling rates** — implies reconstruction, contradicts the "insufficient data" argument. Use faint dots only.
3. **Health-ratio annotation at every resolution** — only makes sense at 8 kHz. At low resolutions, the right panel shows "NO HEALTH DATA" with explanatory text.
4. **Multiple instances on one page** — the scrub draws attention; two on-page instances compete. If a page needs two sampling stories, use two different visualizations (e.g., waveform-trace + resolution-comparison).
5. **Hardcoded teal color in consumer code** — per the `COLORS` drift that motivated v3.2.0, consumers must read from `viz.trace.primary`, never hardcode `#0fc8c3`.

## Source of truth

`www/client/src/components/visualizations/ResolutionComparison.tsx`

Live example: [`/platform/signals`](https://verdigris.co/platform/signals) — "Why standard monitoring misses this" section.
