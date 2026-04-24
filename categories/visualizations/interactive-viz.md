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

## Width patterns

Body text follows the 65-68ch measure (see [`foundations/typography.md` § Body Measure](../../foundations/typography.md#body-measure-line-length)). Visualizations don't have to honor the reading column — in fact, most shouldn't. Canvas data is dense, needs horizontal room to breathe, and gets diminished when clamped to 520-580px.

Three canonical patterns let figures escape the prose column without abandoning its center-line. Each viz declares which pattern it uses; consumers don't invent new widths.

### Pattern 1: Inline

Matches the prose measure exactly. The figure flows with the text.

**When to use:**
- Small figures or thumbnails that should read as part of the paragraph
- Inline formulas or equations
- Code blocks
- Sparklines smaller than ~240px

**CSS:**
```css
.viz-inline { width: 100%; max-width: 100%; }
/* The viz inherits the prose column's 65-68ch */
```

### Pattern 2: Breakout

Widens to the content column (~896px, matching `categories/web-components/page-sections.md` standard), centered on the viewport. Common editorial pattern — text narrow, figures wider, explicit visual signal of "this is evidence, not body text."

**When to use:**
- Canvas visualizations with internal structure (LissajousFigure grid, HarmonicSpectrum bars)
- Interactive widgets (ResolutionComparison slider)
- Tables with 4+ columns
- Comparison diagrams
- Screenshots and product imagery

**CSS:**
```css
.viz-breakout {
  width: 100%;
  max-width: min(896px, calc(100vw - 2rem));
  /* Break out of the narrow parent without destroying the center line */
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
```

**This is the default for `<CanvasFrame>`** on platform/case-study pages. Honors the 75ch body rule (text stays narrow) while giving figures the horizontal room Canvas data needs.

### Pattern 3: Full-bleed

Spans the full viewport width edge-to-edge.

**When to use:**
- Demonstrate-arc pages (Technology, Signals deep-dive sections)
- Pretext text effects where the heading IS the visualization
- Dark evidence sections with ambient Canvas layers behind content
- Hero moments that want to feel cinematic

**CSS:** Use the existing `<FullBleedSection>` component. Don't reinvent.

### Decision framework

Answer three questions, in order:

1. **Is the figure smaller than the prose measure?** → **Inline.** Don't widen something that doesn't need to be wider.
2. **Does the figure carry narrative weight — is it evidence the reader is expected to stop and examine?** If yes, → **Breakout.** Give it room. If no (it's decoration or reference), → Inline.
3. **Is this the narrative climax of the section — the moment the page earns its point?** Very rare. → **Full-bleed.** But only if the page's composition arc is on the Demonstrate track. If it's Persuade/Convert/Inform, breakout is the right ceiling.

### Anti-patterns

1. **Ad-hoc widths.** If a viz is 800px wide on one page, 940px on another, 720px on a third, that's drift. Pick one of the three patterns and commit.
2. **Full-bleed on Persuade/Convert pages.** Full-bleed is tonal — it says "stop and look." Using it on a conversion surface competes with the CTA. Reserve for editorial/demonstrate moments.
3. **Breakout stacked against breakout.** Two breakout figures in the same section effectively create a wide "block" surrounded by narrow text. Usually reads as one composite figure. If that's intentional, use `<FullBleedSection>` as a single wrapping element. If not, space them out or inline one.
4. **Breakout without a real viz inside.** If the "figure" is a stock image, a generic graphic, or text-heavy content, it probably belongs in the prose column. Breakout is for dense Canvas data.

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

## One argument per chapter

Every canonical brand visualization carries a **specific argument**. The argument, not the shape, is what belongs to each page.

| Visualization | Argument |
|---------------|----------|
| **Phase Portrait (Lissajous)** | "Every load has a unique electrical fingerprint." General; reusable where fingerprinting is the point. |
| **Resolution Comparison** | "1 Hz misses what 8 kHz reveals — diagnostic analysis requires the resolution to exist." Specific; reserved for Intelligence/analysis pages. |
| **Waveform Trace** | "The meter captures real harmonic structure at high sampling density." Specific; reserved for Hardware / measurement pages. |
| **Harmonic Spectrum** | "The frequency-domain reveals what the time-domain hides." Specific; reserved for diagnostic / analysis pages. |
| **Circuit Topology Map** | "Monitoring spans the full power chain hierarchy, with fault propagation visible at every node." Specific; reserved for Infrastructure / system pages. |
| **Training Pulse Animation** | "AI workloads have unpredictable power demands that standard metering can't track." Specific; reserved for AI-factory / GPU pages. |
| **Measurement Bar Reveal** | "The measurement IS the meaning." Brand signature; reserved for demonstrate-arc moments. |

**Rule:** when placing a visualization on a page, the visualization's argument and the page's argument must match. Reusing a visualization on a second page is only legitimate if its argument genuinely applies to both — not because the visual looks cool in that slot.

### Why this matters

The site is a narrative. Each chapter (page) makes a specific argument. If two chapters use the same visualization to carry the same claim, the reader moving from one to the other reads the same paragraph twice — the second chapter feels like filler, the first chapter feels less earned.

Concrete example from a real adversarial review (2026-04-24): we placed `ResolutionComparison` on both `/platform/signals` and `/hardware/ev2`. Both pages had the "1 Hz vs 8 kHz" framing, but:
- **Signals** needed the diagnostic payoff (health ratio revealing aging). That's ResolutionComparison's argument.
- **EV2** needed the sampling-density story (the hardware captures real structure). That's `WaveformTrace`'s argument.

Borrowing ResolutionComparison for EV2 stole Signals' punchline to make a hardware point that didn't actually need it. Fix: WaveformTrace on EV2, ResolutionComparison stays exclusive to Signals. The two pages now each own their distinct argument, and a reader moving from EV2 → Signals experiences earned escalation ("we showed you what we capture; now let's show you what we can find").

### General-argument visualizations can appear on multiple pages

`LissajousFigure` is general — "every load has a unique fingerprint" applies anywhere that fingerprinting is relevant. Appearing on Signals + on the homepage + in a blog post about load classification is fine.

Specific-argument visualizations (ResolutionComparison, WaveformTrace, CircuitTopologyMap, TrainingPulseAnimation) are single-page until explicit design review concludes otherwise.

### Enforcement

See `rules/visual-rules.yml` → `viz.one-argument-per-chapter` for the machine-enforceable rule. An evaluator pass compares each viz's canonical argument (from the table above) against the surrounding page copy's argument; duplicates on different pages with the same argument fail the rule.

## Anti-patterns

1. **Dark Canvas on white page with no frame** — reads as a foreign object, not a designed element
2. **Inline `<figure style={{background: '#f5f5f5', ...}}>` in MDX** — bypasses the tokens entirely; use the `<CanvasFrame>` component in www or equivalent
3. **Different border-radius per visualization** — breaks the "same kind of element" signal
4. **Missing or generic captions** ("Figure 1", "chart showing data") — the caption carries the argument; if you don't know what to write, the visualization shouldn't ship yet
5. **Interaction without affordance** — a slider that's not obviously a slider is a broken design, not a minimalist one
6. **Same viz argument reused across chapters** — see "One argument per chapter" above. If you catch yourself placing the same interactive twice to make the same point, one of the two placements is wrong.
