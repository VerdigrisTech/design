---
layout: visual
title: Motion & Animation
---

<div class="v-demo">
  <div class="v-label">Duration Scale</div>
  <style>
    .motion-bar-track {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .motion-bar-label {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--muted-fg);
      width: 6rem;
      text-align: right;
      flex-shrink: 0;
    }
    .motion-bar-bg {
      flex: 1;
      height: 1.5rem;
      background: var(--muted);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    .motion-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0;
      background: var(--brand-teal);
      border-radius: 4px;
      opacity: 0.85;
    }
    .motion-bar-track:hover .motion-bar-fill {
      animation: barFill var(--dur) ease forwards;
    }
    @keyframes barFill {
      from { width: 0; }
      to { width: 100%; }
    }

    /* Easing balls */
    .easing-track-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .easing-track-label {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--muted-fg);
      width: 5rem;
      text-align: right;
      flex-shrink: 0;
    }
    .easing-track {
      flex: 1;
      height: 2rem;
      background: var(--muted);
      border-radius: 9999px;
      position: relative;
      overflow: hidden;
    }
    .easing-ball {
      position: absolute;
      top: 50%;
      left: 0.25rem;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: var(--brand-teal);
      transform: translateY(-50%);
    }
    .easing-track-row:hover .easing-ball {
      animation: slideBall 1s var(--ease) forwards;
    }
    @keyframes slideBall {
      from { left: 0.25rem; }
      to { left: calc(100% - 1.75rem); }
    }

    /* Hover-lift card */
    .hover-lift-demo {
      display: inline-block;
      padding: 1.25rem 2rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      transition: transform 300ms ease, box-shadow 300ms ease;
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--fg);
    }
    @media (hover: hover) and (pointer: fine) {
      .hover-lift-demo:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      }
    }

    /* Spinner */
    .spinner-demo {
      width: 1.5rem;
      height: 1.5rem;
      border: 2.5px solid var(--muted);
      border-top-color: var(--brand-teal);
      border-radius: 50%;
      animation: spinAround 800ms linear infinite;
    }
    @keyframes spinAround {
      0% { transform: rotate(-90deg); }
      100% { transform: rotate(270deg); }
    }
  </style>

  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1rem;">Hover each bar to play the animation at its actual duration.</p>

  <div class="motion-bar-track">
    <span class="motion-bar-label">fast 150ms</span>
    <div class="motion-bar-bg"><div class="motion-bar-fill" style="--dur:150ms;"></div></div>
  </div>
  <div class="motion-bar-track">
    <span class="motion-bar-label">normal 200ms</span>
    <div class="motion-bar-bg"><div class="motion-bar-fill" style="--dur:200ms;"></div></div>
  </div>
  <div class="motion-bar-track">
    <span class="motion-bar-label">moderate 300ms</span>
    <div class="motion-bar-bg"><div class="motion-bar-fill" style="--dur:300ms;"></div></div>
  </div>
  <div class="motion-bar-track">
    <span class="motion-bar-label">slow 500ms</span>
    <div class="motion-bar-bg"><div class="motion-bar-fill" style="--dur:500ms;"></div></div>
  </div>
  <div class="motion-bar-track">
    <span class="motion-bar-label">spin 800ms</span>
    <div class="motion-bar-bg"><div class="motion-bar-fill" style="--dur:800ms;"></div></div>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Easing Comparison</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1rem;">Hover each row to see the easing curve in action.</p>

  <div class="easing-track-row">
    <span class="easing-track-label">ease</span>
    <div class="easing-track"><div class="easing-ball" style="--ease:ease;"></div></div>
  </div>
  <div class="easing-track-row">
    <span class="easing-track-label">ease-out</span>
    <div class="easing-track"><div class="easing-ball" style="--ease:ease-out;"></div></div>
  </div>
  <div class="easing-track-row">
    <span class="easing-track-label">linear</span>
    <div class="easing-track"><div class="easing-ball" style="--ease:linear;"></div></div>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Hover Lift</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1rem;">Hover the card (pointer devices only).</p>
  <div class="hover-lift-demo">Card with hover lift</div>
</div>

<div class="v-demo">
  <div class="v-label">Spinner — 800ms linear infinite</div>
  <div style="display:flex; align-items:center; gap:0.75rem;">
    <div class="spinner-demo"></div>
    <span style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--muted-fg);">Loading...</span>
  </div>
</div>

<div class="v-gradient"></div>

<details class="v-details">
<summary>Documentation</summary>

# Motion & Animation

## Philosophy

Animation at Verdigris serves three purposes:
1. **Feedback** — confirm user actions (button press, hover state)
2. **Orientation** — help users understand spatial relationships (slide-in, reveal)
3. **Brand** — reinforce the "electrical intelligence" identity (waveform visualization)

Animation should never be decorative for its own sake. Every animation should have a clear purpose.

## Duration Scale

| Token | Value | Use |
|-------|-------|-----|
| `fast` | 150ms | Micro-interactions: opacity changes, focus rings |
| `normal` | 200ms | Button hover, input focus, color transitions |
| `moderate` | 300ms | Card hover-lift, image zoom, panel reveal |
| `slow` | 500ms | Hero entrance, page transitions, complex reveals |
| `spin` | 800ms | Loading spinners (continuous) |

**Rule of thumb:** interactions that respond to direct user input (hover, click) should be `fast` or `normal`. Animations that establish spatial context (slide-in, reveal) should be `moderate` or `slow`.

## Easing Curves

| Token | Value | Use |
|-------|-------|-----|
| `default` | `ease` | General-purpose transitions |
| `out` | `ease-out` | Entrance animations — fast start, gentle landing |
| `linear` | `linear` | Continuous animations (spinners, progress bars) |

## Common Patterns

### Hover Lift (www)
Cards and interactive elements lift on hover with a shadow increase:
```css
transition: transform 300ms ease, box-shadow 300ms ease;
/* on hover: */
transform: translateY(-4px);
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Hero Slide-Up (www)
Content enters from below on page load:
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: slide-up 500ms ease-out both;
```

### Image Zoom on Hover (www)
Images scale subtly when their container is hovered:
```css
transition: transform 300ms ease;
/* on hover: */
transform: scale(1.05);
```

### Spinner (Patina)
Continuous rotation for loading states:
```css
@keyframes spin-around {
  0% { transform: rotate(-90deg); }
  100% { transform: rotate(270deg); }
}
animation: spin-around 800ms linear infinite;
```

## Reduced Motion

**All animations must respect `prefers-reduced-motion`.** Both codebases already implement this:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up { animation: none; opacity: 1; }
  .animate-pulse, .animate-spin, .animate-bounce, .animate-ping { animation: none; }
}
```

Additionally, hover effects should be gated behind `(hover: hover) and (pointer: fine)` to avoid triggering on touch devices:

```css
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .hover-lift:hover { transform: translateY(-4px); /* ... */ }
}
```

## WebGL / Waveform Animation

The waveform background (from Patina's `WavesBackground` component) is the most complex animation in the system. It uses Three.js with custom shaders. Performance budgets:

- **Target:** 60fps on mid-range devices
- **Fallback:** Static gradient for low-power devices or `prefers-reduced-motion`
- **Bundle:** Lazy-loaded (~882KB Three.js) — never in critical path
- **Mount:** Deferred via `useState(false) + useEffect` to avoid SSR crashes

See `categories/3d-and-spline/` for full WebGL guidelines (Phase 2).

</details>
