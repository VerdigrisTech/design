# Scroll Reveal Patterns

## Overview

Scroll reveals animate content into view as the user scrolls down the page. At Verdigris, they serve the **orientation** purpose: they signal "new content is arriving" and establish visual hierarchy. The www codebase uses CSS keyframe animations triggered by Intersection Observer, not JS animation libraries.

## Intersection Observer Setup

### Basic Pattern

Use a single observer instance per page. Observe elements with a shared class, and toggle a visibility class when they enter the viewport.

```typescript
// Recommended: one observer, many targets
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once, then stop observing
      }
    });
  },
  {
    threshold: 0.1,    // trigger when 10% visible
    rootMargin: '0px 0px -50px 0px', // start slightly before element reaches viewport bottom
  }
);

// Observe all reveal targets
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
```

### Key Decisions

| Parameter | Value | Why |
|-----------|-------|-----|
| `threshold` | `0.1` | Triggers early enough that the animation completes before the user reaches the element |
| `rootMargin` | `0px 0px -50px 0px` | Adds a 50px buffer at the bottom so elements animate in slightly before they hit the viewport edge |
| `unobserve` after trigger | Yes | Animate once. Re-triggering on scroll-back feels jittery and wastes CPU |

### React Component Pattern

```tsx
import { useEffect, useRef, useState } from 'react';

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion: show immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

Usage:

```tsx
function FeatureCard({ title, description }: Props) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

## Reveal Animations

All reveals use `duration.slow` (500ms) + `easing.out` (ease-out). The element starts in its "hidden" state and transitions to its "visible" state.

### Fade-In

The simplest reveal. Content fades from transparent to opaque.

```css
.reveal-fade {
  opacity: 0;
  transition: opacity 500ms ease-out; /* duration.slow + easing.out */
}

.reveal-fade.is-visible {
  opacity: 1;
}
```

### Slide-Up (Canonical Pattern)

The primary reveal pattern at Verdigris. Used on the www hero and section headings. Content slides up 30px while fading in.

```css
/* From www index.css */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out both; /* duration.slow + easing.out */
}
```

For scroll-triggered (non-hero) usage with the Intersection Observer pattern:

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
```

### Scale-In

Content scales from slightly smaller to full size. Use for cards, images, and contained elements. Avoid on text-only blocks (scaling text feels wrong).

```css
.reveal-scale {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.reveal-scale.is-visible {
  opacity: 1;
  transform: scale(1);
}
```

### Slide-In from Side

Use sparingly for split-layout sections where left and right content should feel like they're coming together.

```css
.reveal-slide-left {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.reveal-slide-left.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.reveal-slide-right {
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.reveal-slide-right.is-visible {
  opacity: 1;
  transform: translateX(0);
}
```

## Stagger Timing for Lists and Grids

When revealing a group of items (card grid, feature list, stat row), stagger the reveal so items animate in sequence rather than all at once.

### CSS Custom Property Approach

Use `--stagger-index` set on each item to calculate a progressive delay:

```css
.reveal-stagger {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
  transition-delay: calc(var(--stagger-index, 0) * 100ms);
}

.reveal-stagger.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

```html
<div class="grid">
  <div class="reveal-stagger" style="--stagger-index: 0">Card 1</div>
  <div class="reveal-stagger" style="--stagger-index: 1">Card 2</div>
  <div class="reveal-stagger" style="--stagger-index: 2">Card 3</div>
  <div class="reveal-stagger" style="--stagger-index: 3">Card 4</div>
</div>
```

### React Stagger Pattern

```tsx
function StaggerGrid({ items }: { items: Item[] }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="grid grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`reveal-stagger ${isVisible ? 'is-visible' : ''}`}
          style={{ '--stagger-index': i } as React.CSSProperties}
        >
          <Card {...item} />
        </div>
      ))}
    </div>
  );
}
```

### Stagger Rules

| Rule | Value | Why |
|------|-------|-----|
| Delay per item | 100ms | Fast enough to feel sequential, slow enough to perceive the wave |
| Maximum total stagger | 400ms (4 items visible) | Beyond 400ms total delay, users lose patience |
| Cap visible items | Stagger only the first 4-6 items in view | Items below the fold don't need stagger |
| Minimum group size | 3 items | Staggering 2 items looks like a bug, not a pattern |

If a grid has more than 6 items visible at once, stagger the first 4-6 and reveal the rest simultaneously.

## Hero Entrance

The hero is a special case: it animates on page load, not on scroll. Use the CSS `animation` property (not transitions triggered by class toggle) so it runs immediately.

```css
/* From www index.css — this is the canonical hero pattern */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out both;
}
```

For staggered hero elements (heading, then subtitle, then CTA):

```css
.hero-heading  { animation: slide-up 0.5s ease-out both; }
.hero-subtitle { animation: slide-up 0.5s ease-out 0.1s both; }
.hero-cta      { animation: slide-up 0.5s ease-out 0.2s both; }
```

## Reduced-Motion Fallback

All scroll reveals must show content immediately when reduced-motion is active. Never leave content invisible.

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up {
    animation: none;
    opacity: 1;
  }

  .reveal-fade,
  .reveal-slide-up,
  .reveal-scale,
  .reveal-slide-left,
  .reveal-slide-right,
  .reveal-stagger {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

The React hook shown above checks `prefers-reduced-motion` and sets `isVisible = true` immediately, skipping the observer entirely.

See [reduced-motion.md](reduced-motion.md) for the full reduced-motion guide.

## Do's

1. **Do:** Unobserve elements after they animate in. One-shot reveals are less jarring and more performant than re-triggering.

2. **Do:** Use `both` as the `animation-fill-mode` for keyframe animations. This ensures the element stays in its final state after the animation completes.

3. **Do:** Keep translate distances small (20-30px). Large translate distances (100px+) feel like the content is flying in from off-screen, which is disorienting.

4. **Do:** Use the same reveal pattern consistently within a page. Mixing slide-up, scale-in, and fade on the same page creates visual noise.

## Don'ts

1. **Don't:** Stagger more than 6 items. Long stagger chains make users wait to see content they've already scrolled to.

2. **Don't:** Animate content that is above the fold on initial load via Intersection Observer. Above-the-fold content should either be immediately visible or use the hero entrance pattern (CSS animation, no observer).

3. **Don't:** Re-trigger reveals when scrolling back up. The `unobserve` pattern ensures one-shot behavior.

4. **Don't:** Use `translateY` distances greater than 40px. Larger distances make the animation feel heavy and slow.

5. **Don't:** Forget to set `opacity: 1` in the reduced-motion fallback. Without it, content using reveal classes stays invisible for users with motion preferences.

## Related

- [guidelines.md](guidelines.md) — Three gates, duration/easing decision trees
- [reduced-motion.md](reduced-motion.md) — Full accessibility fallback guide
- [hover-states.md](hover-states.md) — Interaction-triggered animations
- [foundations/motion.md](../../foundations/motion.md) — Token rationale
