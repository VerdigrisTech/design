---
layout: visual
title: Visualizations
---

# Visualizations

Canvas-rendered brand visualizations. These are the official visual signature elements — each grounded in real electrical engineering, each producing a shape only Verdigris can produce. They appear on marketing pages, in Remotion videos, and as design system specimens.

Companion spec: [`interactive-viz.md`](./interactive-viz.md) — the framing pattern that wraps every viz when placed on a page.

## The seven brand visualizations

| Visualization | What it shows | Graduation | Primary surface |
|--------------|---------------|------------|-----------------|
| [Phase Portrait (Lissajous)](./phase-portrait.md) | V-I relationship as XY figure. Each load type produces a unique shape. | `convention` | `/platform/signals` |
| [Waveform Trace](./waveform-trace.md) | Time-domain 60 Hz signal with harmonic structure. | `convention` | (pending — EV2 page) |
| [Harmonic Spectrum](./harmonic-spectrum.md) | Frequency-domain bars showing harmonic content. | `convention` | (pending — Signals evidence) |
| [Resolution Comparison](./resolution-comparison.md) | Same data at different sample rates (1 Hz vs 8 kHz). | `convention` | `/platform/signals` |
| Circuit Topology Map | Network diagram with animated particle flow through distribution. | `experimental` | (pending — Data Center page) |
| Training Pulse Animation | GPU activation cycle visualization. | `experimental` | (pending — AI Factory page) |
| Measurement Bar Reveal | Per-character Canvas text effect. | `experimental` | (pending — Signals hero) |

**Graduation criteria:**
- `experimental` → `convention`: shipped on 1 real surface; passed one adversarial review pass
- `convention` → `rule`: shipped on 2+ real surfaces; 30 days without substantive revision

The four at `convention` have shipped their React implementations in the www repo but only two (Phase Portrait, Resolution Comparison) are placed on a live page as of v3.2.0. Their graduation is pending a second surface.

## Source of truth

Each visualization's authoritative implementation lives in the www repo:

```
www/client/src/components/visualizations/
  LissajousFigure.tsx          — Phase portrait
  WaveformTrace.tsx            — Waveform trace
  HarmonicSpectrum.tsx         — Harmonic spectrum
  ResolutionComparison.tsx     — Resolution comparison
  CircuitTopologyMap.tsx       — Circuit topology map
  TrainingPulseAnimation.tsx   — Training pulse
  MeasurementBarReveal.tsx     — Measurement bar reveal
```

Individual specimen docs in this folder describe the brand intent, prop contract, and when-to-use. The code itself is the reference implementation — don't duplicate it in docs.

## If you know, you know

These are not generic data-viz shapes. Each carries an engineering insight that, once understood, is hard to un-see:

- A **Lissajous** is a voltage-against-current XY plot. The curve's shape is the load's electrical fingerprint. Operators who understand this can identify a motor vs. a GPU vs. a degrading bearing from the curve alone.
- A **waveform trace** at 8 kHz reveals harmonic structure that 1 Hz BMS monitoring cannot see. The density of samples is itself the argument.
- A **harmonic spectrum** makes the waveform's harmonic content legible — the H5/H7 ratio is the health metric for 6-pulse rectifiers.
- The **resolution comparison** puts the previous three insights into one interaction: drag the sampling rate, watch diagnostic capability appear.

Use these visualizations only when they're additive to the argument. Decorative Canvas is an anti-pattern — generic sine waves with no harmonic content, particle systems not derived from electrical data, and abstract gradient meshes (the Stripe look) are explicitly off-brand per `rules/visual-rules.yml` brand rejections.

## Token scope

All Canvas visualizations consume tokens from the `color.viz.*` group (defined in `tokens/color/data-viz.json`) plus motion tokens (`durations`, `easings`) from `tokens/motion/`. See individual specimen docs for per-viz token usage.

## Related

- [`foundations/composition.md`](../../foundations/composition.md) — the Canonical Brand Visualizations taxonomy and "what is NOT a brand visualization" rules
- [`interactive-viz.md`](./interactive-viz.md) — framing and placement rules
- [`categories/web-components/brand-slider.md`](../web-components/brand-slider.md) — the brand range-input used by Resolution Comparison
