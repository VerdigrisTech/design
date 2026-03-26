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
