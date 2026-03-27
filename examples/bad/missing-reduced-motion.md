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

<!-- Screenshot placeholder: Browser DevTools showing animation CSS with no prefers-reduced-motion query -->

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

<!-- Screenshot placeholder: DevTools showing corrected CSS with prefers-reduced-motion query highlighted -->
