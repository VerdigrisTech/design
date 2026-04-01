---
layout: visual
title: Animation Guidelines
---

<div class="v-demo">
  <div class="v-label">Visual Mood — "Purposeful, not decorative."</div>
  <div class="v-swatches">
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.75 0.1286 191.57)"></div>
      <div class="v-swatch-name">Verdigris</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.141 0.005 285.823)"></div>
      <div class="v-swatch-name">neutral.950</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.552 0.016 285.938)"></div>
      <div class="v-swatch-name">neutral.500</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.985 0 0)"></div>
      <div class="v-swatch-name">neutral.50</div>
    </div>
  </div>
  <div class="v-gradient" style="height: 4px; background: linear-gradient(to right, oklch(0.75 0.1286 191.57), oklch(0.141 0.005 285.823))"></div>
  <div class="v-card" style="margin-top: 1rem; padding: 1.5rem; background: oklch(0.985 0 0); border-left: 3px solid oklch(0.75 0.1286 191.57)">
    <div class="v-card-title" style="font-family: Lato, sans-serif; font-weight: 700; font-size: 1.25rem">Purposeful, not decorative.</div>
    <div class="v-card-desc">Feedback, orientation, brand. Every animation must pass all three gates before it ships.</div>
  </div>
</div>

<details class="v-details"><summary>Guidelines</summary>

# Animation Guidelines

## Overview

Animation at Verdigris serves three specific purposes: **feedback** (confirming user actions), **orientation** (helping users understand spatial relationships), and **brand** (reinforcing the "electrical intelligence" identity). Animation is never decorative for its own sake. Every animation must pass the three gates before it ships.

## The Three Gates

Before adding any animation to a Verdigris surface, it must pass all three checks:

### Gate 1: Purpose

> "What job does this animation do?"

The answer must be one of:

| Purpose | Example | If you can't answer... |
|---------|---------|----------------------|
| **Feedback** | Button hover state confirms the element is interactive | Remove the animation |
| **Orientation** | Slide-up reveals content hierarchy on scroll | Remove the animation |
| **Brand** | Waveform visualization reinforces electrical intelligence | Remove the animation |

If the answer is "it looks nice" or "the competitor does it," the animation fails Gate 1.

### Gate 2: Duration Appropriate?

> "Is the timing fast enough to feel responsive but slow enough to be perceived?"

Use the duration decision tree below. If the animation would need a duration outside the token scale (longer than `duration.spin` at 800ms), reconsider whether it belongs.

### Gate 3: Reduced-Motion Fallback

> "What happens when `prefers-reduced-motion: reduce` is active?"

Every animation must have a defined fallback. See [reduced-motion.md](reduced-motion.md) for the full guide. If you cannot define a graceful fallback, the animation fails Gate 3.

## Duration Decision Tree

Use design tokens from `tokens/motion/duration.json`:

```
Is the animation responding to direct user input (hover, click, focus)?
├── YES: Is it a simple state change (opacity, color, focus ring)?
│   ├── YES → duration.fast (150ms)
│   └── NO: Does it involve spatial movement (translate, scale)?
│       ├── Small movement (button hover, input focus) → duration.normal (200ms)
│       └── Larger movement (card lift, image zoom) → duration.moderate (300ms)
└── NO: Is it an entrance/reveal animation?
    ├── YES: Single element (hero heading, section title) → duration.slow (500ms)
    │         Staggered group (card grid, feature list) → duration.slow (500ms) per item, staggered
    └── NO: Is it continuous/looping (spinner, progress)?
        └── YES → duration.spin (800ms) with easing.linear
```

### Token Reference

| Token | Value | Use |
|-------|-------|-----|
| `duration.fast` | 150ms | Micro-interactions: opacity, focus rings, color shifts |
| `duration.normal` | 200ms | Button hover, input focus, color transitions |
| `duration.moderate` | 300ms | Card hover-lift, image zoom, panel reveal |
| `duration.slow` | 500ms | Hero entrance, page transitions, scroll reveals |
| `duration.spin` | 800ms | Loading spinners (continuous) |

## Easing Decision Tree

Use design tokens from `tokens/motion/easing.json`:

```
Is the element entering the viewport?
├── YES → easing.out (ease-out) — fast start, gentle landing
└── NO: Is the animation continuous/looping?
    ├── YES → easing.linear (linear) — constant speed, no acceleration
    └── NO → easing.default (ease) — general purpose for state transitions
```

### Token Reference

| Token | Value | Use |
|-------|-------|-----|
| `easing.default` | `ease` | Hover states, color transitions, general interactions |
| `easing.out` | `ease-out` | Entrance animations (slide-up, fade-in, scale-in) |
| `easing.linear` | `linear` | Spinners, progress bars, continuous rotation |

## Performance Budgets

### CSS Animations

- **Animate only `transform` and `opacity`.** These properties are compositor-friendly and do not trigger layout or paint. Animating `width`, `height`, `margin`, `padding`, `top`, `left`, or `box-shadow` alone causes layout thrashing.
- **Exception:** `box-shadow` may be transitioned alongside `transform` for hover-lift effects (the shadow change is perceived as part of the elevation shift, and the transform is the primary animation). This is the pattern used in the www codebase:

```css
/* From www index.css — box-shadow transitions alongside transform */
@utility hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
```

- **Maximum simultaneous animations:** Keep to 3 or fewer elements animating concurrently on mobile. Stagger large groups.
- **No animation on page-blocking resources.** Hero slide-up uses `animation: slide-up 0.5s ease-out both` which is CSS-only and does not block JS parsing.

### WebGL / Three.js

For the waveform background (WavesBackground component):

| Budget | Target |
|--------|--------|
| Frame rate | 60fps on mid-range devices |
| Bundle size | Lazy-loaded (~882KB), never in critical path |
| Fallback | Static gradient for low-power devices or `prefers-reduced-motion` |
| Mount strategy | Deferred via `useState(false) + useEffect` to avoid SSR crashes |

### Measurement

Use the browser Performance panel to verify:
- No layout shifts caused by animations (CLS impact = 0)
- Animation frames stay under 16ms (60fps target)
- No forced synchronous layouts in animation callbacks

## Common Patterns

The Verdigris system uses a small set of repeatable animation patterns. Each is documented in its own file:

| Pattern | File | Token Combination |
|---------|------|-------------------|
| Scroll reveal (fade-in, slide-up, scale-in) | [scroll-reveal.md](scroll-reveal.md) | `duration.slow` + `easing.out` |
| Hover states (lift, scale, color) | [hover-states.md](hover-states.md) | `duration.moderate` + `easing.default` |
| Loading spinners | (inline) | `duration.spin` + `easing.linear` |
| Hero entrance | [scroll-reveal.md](scroll-reveal.md) | `duration.slow` + `easing.out` |

### Spinner Pattern (from Patina)

```css
@keyframes spin-around {
  0%   { transform: rotate(-90deg); }
  100% { transform: rotate(270deg); }
}

.spinner {
  animation: spin-around 800ms linear infinite; /* duration.spin + easing.linear */
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    /* Show a static indicator instead — e.g., a pulsing opacity or static icon */
  }
}
```

### Button Hover (from www)

```css
.button-primary {
  transition: all 0.2s ease; /* duration.normal + easing.default */
}

.button-primary:hover {
  background-color: hsl(153 67% 32%); /* Darkened primary */
}
```

## Do's

1. **Do:** Use the token scale for all durations. Never hardcode a timing value that does not correspond to a token.

2. **Do:** Combine `transform` and `opacity` for entrance animations. The hero slide-up is the canonical example:
   ```css
   @keyframes slide-up {
     from { opacity: 0; transform: translateY(30px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   ```

3. **Do:** Gate all hover animations behind the compound media query (see [hover-states.md](hover-states.md)).

4. **Do:** Test every animation with `prefers-reduced-motion: reduce` enabled before shipping.

## Don'ts

1. **Don't:** Animate `width`, `height`, `margin`, or `padding`. These trigger layout recalculation on every frame.

2. **Don't:** Use animation durations longer than 800ms (`duration.spin`). If the animation feels like it needs more time, break it into staggered steps.

3. **Don't:** Add animation without a `prefers-reduced-motion` fallback. This is a hard requirement, not a suggestion.

4. **Don't:** Use `animation-delay` values greater than 300ms for interactive feedback. Users perceive delays over 300ms as broken, not animated.

5. **Don't:** Use JavaScript-driven animation libraries (Framer Motion, GSAP) for effects achievable with CSS transitions and keyframes. The www codebase replaced Framer Motion with CSS `slide-up` for hero animations specifically to eliminate JS from the critical paint path.

## Related

- [foundations/motion.md](../../foundations/motion.md) — Token rationale and philosophy
- [foundations/accessibility.md](../../foundations/accessibility.md) — WCAG requirements
- [scroll-reveal.md](scroll-reveal.md) — Intersection Observer patterns
- [hover-states.md](hover-states.md) — Hover interaction patterns
- [reduced-motion.md](reduced-motion.md) — Accessibility fallbacks
- [tokens/motion/duration.json](../../tokens/motion/duration.json) — Duration tokens
- [tokens/motion/easing.json](../../tokens/motion/easing.json) — Easing tokens

</details>
