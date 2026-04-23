---
layout: visual
title: Brand Slider (range input)
maturity: convention
---

# Brand Slider

A styled native `<input type="range">` used inside interactive Canvas visualizations and on surfaces where a Radix-based slider is not appropriate (standalone HTML specimens, Remotion compositions, SSR-critical paths).

**Different from the Patina forms slider.** [`forms.md` § Slider](./forms.md#slider) covers the Radix-based `@radix-ui/react-slider` component used for form inputs inside Patina. This doc covers the brand range input used on marketing-site Canvas visualizations — native element, heavier visual treatment, teal glow, built for the ResolutionComparison scrub pattern. They share tokens, not implementation.

## When to use the Brand Slider (not the Patina Slider)

- Inside a Canvas visualization where the slider controls a continuous parameter (sampling rate, opacity, time)
- In a standalone HTML specimen where a React runtime isn't available
- In Remotion compositions (Remotion doesn't tolerate Radix Slider's ref model)
- SSR paths where Radix's portal-mounted thumb causes hydration issues

For all other use cases inside Patina — especially forms — use the Patina Slider. It has accessibility, keyboard behavior, and value-tooltip features baked in that a native range input lacks.

## Track

| Property | Value |
|----------|-------|
| Height | `6px` |
| Border-radius | `3px` |
| Background | `linear-gradient(to right, {fill-color} 0%, {fill-color} {fillPct}%, {rest-color} {fillPct}%, {rest-color} 100%)` |
| Fill color | `var(--viz-trace-primary)` (`color.viz.trace.primary`, `#0fc8c3`) |
| Rest color | `var(--viz-grid)` (`color.viz.grid`, neutral-800) on dark surfaces |

Track uses a CSS gradient rather than separate progress/remainder elements so the fill percentage can be driven by a single CSS custom property from JS. The `fillPct` value must be updated in sync with the input's `value`.

## Thumb

| Property | Value |
|----------|-------|
| Diameter | `22px` (primary); `18px` (Firefox `::-moz-range-thumb`, which renders slightly larger per-browser) |
| Shape | Circle (`border-radius: 50%`) |
| Fill | `var(--viz-trace-primary)` |
| Border | `2px solid var(--viz-bg-canvas-dark)` |
| Glow shadow | `0 0 10px rgba(15, 200, 195, 0.3)` (teal at 30% alpha) + `0 0 0 1px var(--viz-grid)` (inner keyline) |
| Cursor | `pointer` |
| Vertical alignment | `margin-top: -8px` on webkit to center over the 6px track |

**Cross-browser rules are mandatory.** Firefox does not support `::-webkit-slider-thumb`; Chromium does not support `::-moz-range-thumb`. Every Brand Slider stylesheet ships both blocks.

```css
#{id}::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--viz-trace-primary);
  border: 2px solid var(--viz-bg-canvas-dark);
  box-shadow: 0 0 10px rgba(15, 200, 195, 0.3), 0 0 0 1px var(--viz-grid);
  cursor: pointer; margin-top: -8px;
}
#{id}::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--viz-trace-primary);
  border: 2px solid var(--viz-bg-canvas-dark);
  box-shadow: 0 0 10px rgba(15, 200, 195, 0.3);
  cursor: pointer;
}
```

## Focus state

Mandatory for WCAG 2.4.7 compliance. Applied via `:focus-visible`:

```css
#{id}:focus-visible {
  outline: 2px solid var(--viz-trace-primary);
  outline-offset: 4px;
  border-radius: 4px;
}
```

The outline is on the `<input>` element, not the thumb — this ensures the ring is visible at the full slider dimensions when keyboard-focused.

## Labels and ticks

Below the track, tick labels describe the value scale. For logarithmic sliders (ResolutionComparison's 1 → 8000 Hz), tick labels at `1/sec`, `10`, `100`, `1k`, `8k` are the canonical set. Each tick lights up (`viz.trace.primary`, font-weight 600) when the slider's current value falls within its range; non-active ticks stay at `viz.text.label` (neutral-500).

Ticks are NOT clickable — they're reading aids. The slider is continuous.

## Reduced motion

The slider thumb must have **no transition on position**. This is the platform default for native range inputs; document it so consumers don't re-introduce transitions thinking they're improving feel. With `prefers-reduced-motion: reduce`, the thumb snaps instantly — exactly what accessibility requires.

## Accessibility

All items required:

- `aria-label` or `<label>` associated — slider must have an accessible name
- `aria-valuetext` — human-readable value ("{n} samples per second"), updated on change
- Native `<input type="range">` provides keyboard support (arrow keys, home/end) — don't override
- Focus ring visible in both light and dark themes
- Minimum tap target: the thumb is 22 px but the track + thumb hit region together meet the 44 × 44 px WCAG 2.5.5 minimum on desktop; on touch devices, pad the surrounding container

## Anti-patterns

1. **Using two range inputs for a two-handle range picker** — native ranges don't support two thumbs; use the Patina Radix Slider instead
2. **Styling the thumb via a pseudo-element on the track** — browser support is inconsistent; always use `::-webkit-slider-thumb` + `::-moz-range-thumb`
3. **Transitioning thumb position** — re-introduces the exact motion the reduced-motion fallback is supposed to remove
4. **Applying Brand Slider styling to form sliders inside Patina** — the brand slider is heavier; use the Patina Slider for forms to stay consistent with shadcn norms

## Source of truth

Primary implementation: `www/client/src/components/visualizations/ResolutionComparison.tsx` (inline; planned extraction to `www/client/src/components/ui/brand-slider.tsx` in the v3.2.0 consumer PR).

## Related

- [`forms.md` § Slider](./forms.md#slider) — Patina Radix-based slider for forms
- [`categories/visualizations/interactive-viz.md`](../visualizations/interactive-viz.md) — the framing pattern this slider typically sits inside
- [`foundations/motion.md`](../../foundations/motion.md) — reduced-motion guidance
