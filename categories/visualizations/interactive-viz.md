---
layout: visual
title: Interactive Visualization Framing
maturity: convention
---

# Interactive Visualization Framing

When a Canvas-based visualization (phase portrait, waveform, harmonic spectrum, resolution comparison) appears in a page or blog post, it needs visible chrome that signals "this is a designed element you can interact with" — not a raw dark rectangle dropped into the page.

**Why this spec exists.** On `feat/visual-signature-components` (www repo, Z2O-1182), the first placement of Lissajous figures and ResolutionComparison on `/platform/signals` was rejected: "jarring in the middle of the page... no bordering or signaling visually to illustrate that it's something that should be interacted with." Every subsequent visualization author then re-derived the same framing decisions (border radius, padding, caption placement, interaction affordance). This spec codifies those decisions so the next author doesn't re-derive them and so review effort moves to content, not container chrome.

**Maturity: `convention`** — the pattern passed one adversarial review round on Signals. Graduate to `rule` after it lands on a second real surface without substantive revision.

## Container chrome

```
border:        1px solid var(--viz-grid)         /* color.viz.grid — neutral-800 */
border-radius: 0.75rem
padding:       1.5rem                             /* desktop */
               1rem                               /* mobile (<768px) */
background:    var(--viz-bg-canvas-dark)          /* color.viz.bg.canvas.dark by default */
               var(--viz-bg-canvas-light)         /* alternative for light-surface pages */
```

The frame's background is ONE of the two Canvas surfaces — never an ad-hoc gray. If the visualization is rendering on a light page, the whole frame goes light. Mixing a dark Canvas inside a light frame, or vice versa, is rejected (see "Light vs. dark placement" below).

## Minimum Canvas size

| Use case | Minimum edge | Notes |
|----------|-------------|-------|
| Grouped specimens (e.g., 3 × Lissajous) | **180 px square** | 140 px was tried and rejected — too small for trace detail |
| Single hero visualization | **320 px wide** | Width-bounded by container, height by viz type |
| Inline blog asset | **240 px wide** | Reading-surface scale; caption carries the argument |

These are **minimums**, not targets. When space allows, render larger.

## Interaction affordance

If the visualization accepts user input (slider, drag, hover-driven reveal), there MUST be a visible prompt that the interaction exists. Required:

1. **Pulsing text prompt** visible before first interaction, hidden after. Examples:
   - `← drag to reduce resolution →` (ResolutionComparison)
   - `move the slider` (sampling-rate controls)
   - `drag to compare` (before/after splits)
2. **Pulse animation** uses `durations.slow` or `durations.moderate`, easing `easings.default`. Opacity oscillates 0.4 ↔ 1.0.
3. **Disappears on first interaction** — once the user has engaged, the prompt never returns during the session.
4. **Reduced-motion fallback** — when `prefers-reduced-motion: reduce`, the prompt is rendered static (no pulse), text unchanged.

## Caption

Every interactive visualization MUST have a caption below the Canvas. The caption is the argument. The visualization is the evidence.

- **Voice**: plain-language, present tense, no title-case, no marketing copy
- **Length**: 1–2 sentences
- **Typography**: Inter 0.8125rem, `color.viz.text.meta` on dark, `color.neutral.500` on light
- **Placement**: directly below Canvas, separated by `0.75rem` padding-top with a `1px` top border in `var(--viz-grid)`
- **Dynamic captions**: when the visualization's state changes (e.g., slider moves), the caption updates to reflect current state — the caption is not static

## Accessibility

All items required, not optional:

- `role="img"` on the `<canvas>` element
- `aria-label` that reflects the **current state** (not a fixed description). Updates when state changes.
- For interactive controls: `aria-valuetext` on sliders, describing the current value in human terms (e.g., `"8000 samples per second"`)
- Focus ring on any interactive control: `2px solid var(--viz-trace-primary)`, `4px` offset
- Keyboard parity: anything a mouse/touch can do, keyboard can do (arrow keys on sliders, tab to focus)
- Respects `prefers-reduced-motion: reduce` — on-entry animations become instant; pulse prompts become static; slider thumb has no transition

## Light vs. dark placement — the adjacency rule

**Never stack a light-surface viz frame directly adjacent to a dark-surface viz frame within the same section.** This produces the "visual whiplash" observed on Signals where three light-background Lissajous figures sat inches above a dark-background ResolutionComparison.

Correct approaches:

1. **Pick one treatment per section.** If the section's background is light, all visualizations inside it use `viz.bg.canvas.light`. If the section is dark, all use `viz.bg.canvas.dark`.
2. **Use a section boundary.** If you need to change treatment, put the adjacent viz in a separate section with its own composition role (Evidence → Turn, or Evidence → Proof). The background change then reads as intentional narrative beat, not accident.
3. **Use the same frame chrome.** Whatever the Canvas background, the frame (border, radius, padding) stays identical — consistency of chrome is what communicates "these are the same kind of element."

## When to NOT use this framing

- **Static SVG diagrams** — they don't need interaction affordance; use the illustration category rules instead
- **Decorative waveforms in hero backgrounds** — they're part of page chrome, not a discrete element; no frame
- **Sparkline-sized charts inline in prose** — too small for a frame; inherit from surrounding prose typography

## Related tokens

| Token | Purpose |
|-------|---------|
| `color.viz.bg.canvas.{dark,light}` | Frame background |
| `color.viz.grid` | Frame border + in-Canvas grid |
| `color.viz.trace.primary` | Focus ring + slider fill + interaction prompt color |
| `color.viz.text.{label,meta}` | In-Canvas typography + caption |
| `durations.slow` / `durations.moderate` | Pulse prompt cycle |
| `easings.default` | Pulse prompt easing |
| `durations.reveal` / `durations.revealLong` | Viewport-entry animation |
| `easings.revealCubic` | Viewport-entry animation easing |

## Source-of-truth implementations

| Specimen | Current React source | Page |
|----------|---------------------|------|
| Phase portrait (Lissajous) | `LissajousFigure.tsx` in www | `/platform/signals` |
| Waveform trace | `WaveformTrace.tsx` in www | (not yet placed) |
| Harmonic spectrum | `HarmonicSpectrum.tsx` in www | (not yet placed) |
| Resolution comparison | `ResolutionComparison.tsx` in www | `/platform/signals` |

See individual specimen docs in this folder for per-viz specifications.

## Anti-patterns

1. **Dark Canvas on white page with no frame** — reads as a foreign object, not a designed element
2. **Inline `<figure style={{background: '#f5f5f5', ...}}>` in MDX** — bypasses the tokens entirely; use the `<CanvasFrame>` component in www or equivalent
3. **Different border-radius per visualization** — breaks the "same kind of element" signal
4. **Missing or generic captions** ("Figure 1", "chart showing data") — the caption carries the argument; if you don't know what to write, the visualization shouldn't ship yet
5. **Interaction without affordance** — a slider that's not obviously a slider is a broken design, not a minimalist one
