---
layout: visual
title: "Good: Proper Hover-Lift Animation"
category: motion
classification: good
---

<div class="v-demo">
  <span class="v-badge v-badge-pass">PASS</span>
  <div style="background:#f5f5f5; padding:2rem; border-radius:0.625rem; text-align:center;">
    <style>
      .demo-btn-lift {
        display:inline-block; padding:0.75rem 2rem; background:#0fc8c3; color:#0a0a0a;
        border:none; border-radius:0.625rem; font-family:Lato,sans-serif; font-weight:700;
        font-size:1rem; cursor:pointer; text-decoration:none;
        transition: transform 500ms ease, box-shadow 500ms ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      @media (hover:hover) and (pointer:fine) {
        .demo-btn-lift:hover { transform:translateY(-4px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
      }
      @media (prefers-reduced-motion:reduce) {
        .demo-btn-lift { transition:none; }
        .demo-btn-lift:hover { transform:none; }
      }
    </style>
    <a href="#" class="demo-btn-lift" onclick="return false;">View Dashboard</a>
    <p style="margin:0.75rem 0 0; font-family:Inter,sans-serif; font-size:0.8rem; color:#737373;">Hover to see the lift effect (pointer devices only)</p>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

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

</details>
