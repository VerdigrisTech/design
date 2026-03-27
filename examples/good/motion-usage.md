# Good: Proper Hover-Lift Animation

## Category
motion

## Classification
good

## What to Notice
- Transition duration is 500ms with ease timing -- smooth without feeling sluggish
- Hover lifts the element with `translateY(-4px)` -- subtle enough to feel intentional, not distracting
- Animation is gated behind `(hover: hover) and (pointer: fine)` -- prevents activation on touch devices
- A `prefers-reduced-motion: reduce` fallback disables the transform entirely
- The shadow deepens on hover to reinforce the "lift" affordance

<!-- Screenshot placeholder: Card in default state and hovered state showing subtle vertical lift -->

## Tokens Referenced
- `motion.duration.normal` -- 500ms for interactive transitions
- `motion.easing.default` -- ease curve
- `motion.hover.translateY` -- -4px vertical lift
- `motion.reduced_motion.required` -- reduced-motion fallback is mandatory
- `elevation.shadow.md` -- deeper shadow on hover state

## Why This Works
The hover-lift pattern gives users clear feedback that an element is interactive. Gating it behind media queries ensures touch users (who cannot hover) are not affected, and users who experience motion sickness see no animation at all. The 500ms duration sits in the sweet spot -- fast enough to feel responsive, slow enough to be perceived as a smooth transition rather than a jump.

## Code Example

```css
.card-interactive {
  transition: transform 500ms ease, box-shadow 500ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .card-interactive:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-interactive {
    transition: none;
  }
  .card-interactive:hover {
    transform: none;
  }
}
```

```html
<a href="/dashboard" class="card card-interactive">
  <h3>View Dashboard</h3>
  <p>Real-time energy monitoring for all circuits.</p>
</a>
```

<!-- Screenshot placeholder: Two-frame comparison of card at rest and card in hover-lift state -->
