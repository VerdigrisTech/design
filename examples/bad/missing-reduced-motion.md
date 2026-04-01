---
layout: visual
title: "Bad: Animation Without Reduced-Motion Fallback"
category: motion
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div class="v-label">Incorrect: slide-in animation runs unconditionally -- no reduced-motion check</div>
  <div style="background:#f5f5f5; padding:2rem; border-radius:0.625rem;">
    <style>
      @keyframes demo-slide-bad { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    </style>
    <div style="background:#fff; padding:1.5rem; border-radius:0.625rem; border:2px dashed #ef4444; max-width:320px; animation:demo-slide-bad 600ms ease-out;">
      <h3 style="margin:0 0 0.25rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem; color:#0a0a0a;">Weekly Summary</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:0.875rem; color:#404040;">Total consumption: 2,891 kWh</p>
      <span style="display:block; margin-top:0.5rem; font-family:monospace; font-size:0.75rem; color:#ef4444;">No prefers-reduced-motion query</span>
    </div>
  </div>
</div>

<div class="v-demo" style="margin-top:1rem;">
  <span class="v-badge v-badge-pass">PASS</span>
  <div class="v-label">Corrected: animation gated behind prefers-reduced-motion: no-preference</div>
  <div style="background:#f5f5f5; padding:2rem; border-radius:0.625rem;">
    <style>
      @keyframes demo-slide-good { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      .demo-panel-good { opacity:1; transform:translateY(0); }
      @media (prefers-reduced-motion:no-preference) { .demo-panel-good { animation:demo-slide-good 500ms ease-out; } }
    </style>
    <div class="demo-panel-good" style="background:#fff; padding:1.5rem; border-radius:0.625rem; border:2px solid #22c55e; max-width:320px;">
      <h3 style="margin:0 0 0.25rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem; color:#0a0a0a;">Weekly Summary</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:0.875rem; color:#404040;">Total consumption: 2,891 kWh</p>
      <span style="display:block; margin-top:0.5rem; font-family:monospace; font-size:0.75rem; color:#22c55e;">Respects prefers-reduced-motion</span>
    </div>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

# Bad: Animation Without Reduced-Motion Fallback

## Category
motion

## Classification
bad

## What to Notice
- A slide-in animation runs unconditionally on page load with no reduced-motion check
- Users with vestibular disorders or motion sensitivity cannot opt out
- The `prefers-reduced-motion` media query is entirely absent
- This violates WCAG 2.1 SC 2.3.3 (Animation from Interactions) at AAA level
- The design system requires a reduced-motion fallback for every animation

## Tokens Referenced
- `motion.reduced_motion.required` -- all animations must include a reduced-motion fallback
- `motion.duration.normal` -- 500ms (the base duration that should be zeroed out for reduced motion)

## Code Example (What NOT to Do)

```css
/* DO NOT do this -- no reduced-motion fallback */
.panel {
  animation: slide-in 600ms ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

```html
<div class="panel">
  <h2>Weekly Summary</h2>
  <p>Total consumption: 2,891 kWh</p>
</div>
```

## Fix
Wrap the animation in a `prefers-reduced-motion: no-preference` query so it only runs for users who have not requested reduced motion. Alternatively, add a `prefers-reduced-motion: reduce` block that removes or replaces the animation. The second approach is preferred because it makes the fallback explicit.

```css
/* Correct: animation gated behind motion preference */
.panel {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: no-preference) {
  .panel {
    animation: slide-in 500ms ease-out;
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

</details>
