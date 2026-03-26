# Reduced Motion Guide

## Overview

`prefers-reduced-motion` is an OS-level setting that indicates the user is sensitive to motion. This includes people with vestibular disorders, motion sickness, cognitive load sensitivity, and other conditions where animation causes physical discomfort or impairs usability. Respecting this preference is not optional; it is a WCAG 2.1 AA requirement (Success Criterion 2.3.3).

At Verdigris, every animation must have a defined reduced-motion fallback. This document specifies what to disable, what to keep, and how to test.

## What to Disable

When `prefers-reduced-motion: reduce` is active, disable all animations that involve:

| Motion Type | Examples | Action |
|-------------|----------|--------|
| **Spatial movement** | `translateX`, `translateY`, `translateZ`, `rotate`, `scale` | Remove entirely |
| **Entrance animations** | Slide-up, fade-in with transform, scale-in | Show content at final state immediately |
| **Continuous animations** | Spinners, pulsing, bouncing, ping | Stop the animation |
| **Parallax scrolling** | Background scroll at different rates | Disable, use static positioning |
| **Auto-playing video/GIF** | Background videos, animated hero | Pause, show first frame or static image |
| **Hover transforms** | Hover-lift (translateY), hover-scale | Already handled by the compound media query |

## What to Keep

Not all visual change is harmful. These are safe to keep when reduced-motion is active:

| Visual Change | Why It Is Safe | Example |
|---------------|---------------|---------|
| **Color transitions** | No spatial motion, no vestibular impact | Button background-color on hover |
| **Opacity fades** (without transform) | Subtle, does not imply movement | Focus ring fade, tooltip appear |
| **Instant state changes** | No animation at all | Checkbox toggle, accordion expand |
| **Static visual indicators** | Replaces animation with equivalent info | Progress bar (filled, not animated) |

**The key distinction:** spatial motion (things moving across the screen) triggers vestibular response. Color and opacity changes do not.

## Required Fallback Patterns

### Pattern 1: Entrance Animations (Slide-Up, Scale-In)

Remove the animation entirely and show content at its final state:

```css
/* Base: animated entrance */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out both;
}

/* Reduced-motion fallback: content visible immediately */
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up {
    animation: none;
    opacity: 1;
  }
}
```

This is the exact pattern from the www `index.css`. The `opacity: 1` is critical; without it, elements using `animation-fill-mode: both` start at `opacity: 0` (the animation's `from` state) and stay there because the animation has been removed.

### Pattern 2: Scroll Reveal Classes

For transition-based reveals (not keyframe animations), reset both opacity and transform:

```css
.reveal-slide-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.reveal-slide-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Reduced-motion: skip the observer, show immediately */
@media (prefers-reduced-motion: reduce) {
  .reveal-slide-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

In the React Intersection Observer hook, check the preference before observing:

```typescript
useEffect(() => {
  const el = ref.current;
  if (!el) return;

  // Skip animation entirely for reduced-motion users
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setIsVisible(true);
    return;
  }

  const observer = new IntersectionObserver(/* ... */);
  observer.observe(el);
  return () => observer.disconnect();
}, []);
```

### Pattern 3: Continuous Animations (Spinners, Pulse, Bounce)

Stop all looping animations. For spinners, consider a static alternative:

```css
/* From www index.css */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-spin,
  .animate-bounce,
  .animate-ping {
    animation: none;
  }
}
```

For loading spinners specifically, replace with a non-animated indicator:

```css
.spinner {
  animation: spin-around 800ms linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    /* Option A: static icon (checkmark, hourglass) */
    /* Option B: opacity pulse at very slow rate — some users tolerate this */
    /* Option C: text label "Loading..." */
  }
}
```

If you choose an opacity pulse as a spinner replacement, keep the frequency very low (2s+ cycle) and the opacity range narrow (0.7 to 1.0). This is less likely to cause discomfort than spatial motion but should still be tested.

### Pattern 4: Hover Effects (Transform-Based)

Hover effects that use `transform` are already gated by the compound media query, which includes `prefers-reduced-motion: no-preference`. When reduced-motion is active, the entire hover block is skipped:

```css
/* This entire block is ignored when reduced-motion is active */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
                0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
}
```

Color-only hover effects (button background change) do not need a reduced-motion gate because they involve no spatial motion.

### Pattern 5: WebGL / Waveform Background

The WavesBackground (Three.js waveform visualization) must fall back to a static gradient:

```tsx
function WavesBackground() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(178 86% 28%), hsl(153 67% 38%))',
        }}
      />
    );
  }

  return <Canvas>{/* Three.js scene */}</Canvas>;
}
```

### Pattern 6: Staggered Reveals

When reduced-motion is active, stagger delays are meaningless because the content should appear immediately. The CSS handles this automatically:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal-stagger {
    opacity: 1;
    transform: none;
    transition: none;
    /* transition-delay is irrelevant when transition is none */
  }
}
```

## CSS Implementation Checklist

Use this as a template for any new animation. All three sections are required:

```css
/* 1. Base state (the element before animation) */
.my-animated-element {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

/* 2. Animated state */
.my-animated-element.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 3. Reduced-motion fallback (REQUIRED) */
@media (prefers-reduced-motion: reduce) {
  .my-animated-element {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Testing Reduced Motion

### Browser Settings

#### Chrome / Edge
1. Open DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "reduced motion"
4. Select "Emulate CSS prefers-reduced-motion: reduce"

#### Firefox
1. Open DevTools
2. Go to the Accessibility tab
3. Toggle "Reduce Motion" in the simulation controls

#### Safari
1. Open System Settings > Accessibility > Display
2. Enable "Reduce motion"
3. Safari respects the OS setting immediately

### OS Settings

| OS | Path |
|----|------|
| macOS | System Settings > Accessibility > Display > Reduce motion |
| Windows | Settings > Accessibility > Visual effects > Animation effects (off) |
| iOS | Settings > Accessibility > Motion > Reduce Motion |
| Android | Settings > Accessibility > Remove animations |

### Automated Testing

Add a Playwright/Cypress test that enables reduced-motion and verifies content is visible:

```typescript
// Playwright example
test('content visible with reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  // Hero content should be immediately visible (no animation delay)
  const hero = page.locator('.animate-slide-up');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveCSS('opacity', '1');
  await expect(hero).toHaveCSS('animation', 'none');
});
```

## Audit Checklist for Existing Animations

Use this checklist when reviewing a page or component for reduced-motion compliance:

### Per-Element Checks

- [ ] **Element uses `animation` or `transition`?**
  - If yes, does it have a `@media (prefers-reduced-motion: reduce)` override?
  - If the override is missing, add one.

- [ ] **Element uses `@keyframes`?**
  - Does the reduced-motion override set `animation: none`?
  - Does it also set the element to its final visible state (`opacity: 1`, `transform: none`)?

- [ ] **Element uses transform-based `:hover`?**
  - Is the hover rule inside the compound media query?
  - `@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`

- [ ] **Element uses Intersection Observer for reveal?**
  - Does the observer hook check `prefers-reduced-motion` and skip observation?
  - Is the element shown at full opacity immediately?

- [ ] **Page has auto-playing media (video, GIF, WebGL)?**
  - Is there a static fallback?
  - Does the fallback convey the same information (static gradient for waveform, first frame for video)?

### Page-Level Checks

- [ ] **Enable reduced-motion in browser DevTools.**
  - All content visible? No invisible elements waiting for an animation that will never fire?
  - No looping animations still running?

- [ ] **Tab through the page with keyboard.**
  - Focus indicators visible? (Focus rings use opacity, which is safe)
  - No focus-triggered animations that might disorient?

- [ ] **Check loading states.**
  - Spinners stopped? Alternative loading indicator visible?

### Common Failures

| Failure | Symptom | Fix |
|---------|---------|-----|
| Missing `opacity: 1` in fallback | Content invisible (stuck at `opacity: 0` from animation's `from` state) | Add `opacity: 1` to the reduced-motion override |
| Missing `transform: none` in fallback | Content offset (stuck at `translateY(30px)` from animation's `from` state) | Add `transform: none` to the reduced-motion override |
| Hover lift still active | Card lifts on hover despite reduced-motion | Move hover rule inside compound media query |
| Spinner still spinning | Continuous rotation despite reduced-motion | Add `animation: none` in reduced-motion block |
| Observer never triggers | Content waits for intersection that is irrelevant | Check `prefers-reduced-motion` in JS and show immediately |

## Do's

1. **Do:** Test with reduced-motion enabled at the OS level, not just in browser DevTools. Some edge cases only surface with the OS-level setting.

2. **Do:** Treat reduced-motion fallbacks as a first-class design state, not an afterthought. Content should look intentionally static, not broken.

3. **Do:** Keep opacity fades as a fallback for spatial animations. A simple 200ms opacity transition from 0 to 1 (no transform) is generally safe and still provides a visual cue that content appeared.

4. **Do:** Use `transition: none` (not just `animation: none`) for transition-based animations. Without it, the transition still fires, just without the class toggle timing.

## Don'ts

1. **Don't:** Assume reduced-motion means "no visual feedback." Color changes, opacity fades, and instant state changes are still appropriate.

2. **Don't:** Use `animation-duration: 0.01ms` as a "reduced motion hack." Some resources suggest this trick to fire `animationend` events without visible animation. It is fragile, confusing to maintain, and unnecessary if you structure your CSS properly.

3. **Don't:** Forget about JavaScript-driven animations. CSS `prefers-reduced-motion` only affects CSS. If you use `requestAnimationFrame`, `setInterval`, or an animation library in JS, you must check the media query in JavaScript too:
   ```typescript
   const prefersReducedMotion = window.matchMedia(
     '(prefers-reduced-motion: reduce)'
   ).matches;
   ```

4. **Don't:** Leave any animation without a fallback. This is the third gate (see [guidelines.md](guidelines.md)) and it is a hard requirement for all Verdigris surfaces.

## Related

- [guidelines.md](guidelines.md) — Three gates (Gate 3 is this document)
- [scroll-reveal.md](scroll-reveal.md) — Reduced-motion patterns for scroll reveals
- [hover-states.md](hover-states.md) — Compound media query for hover effects
- [foundations/motion.md](../../foundations/motion.md) — Motion philosophy
- [foundations/accessibility.md](../../foundations/accessibility.md) — WCAG requirements
