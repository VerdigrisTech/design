# Hover State Patterns

## Overview

Hover states provide **feedback**: they confirm that an element is interactive before the user clicks. At Verdigris, hover effects are gated behind a compound media query that ensures they only fire on devices with a real pointer and no motion sensitivity. Touch devices get no hover effects, which is the correct behavior.

## The Required Media Query Gate

Every hover animation in the Verdigris system must be wrapped in this compound media query:

```css
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  /* hover effects go here */
}
```

This query does three things:

| Condition | What it checks | What it excludes |
|-----------|---------------|-----------------|
| `hover: hover` | Device has a hover-capable input | Touchscreens, stylus-only devices |
| `pointer: fine` | Pointer has fine accuracy (mouse, trackpad) | Coarse pointers (finger on glass) |
| `prefers-reduced-motion: no-preference` | User has not requested reduced motion | Users with vestibular disorders, motion sensitivity |

All three conditions must be true for hover effects to activate. This is the pattern used throughout the www codebase.

### Why All Three?

- `hover: hover` alone is not enough. Some touch devices report hover capability but implement it as "long press," which creates a confusing stuck-hover state.
- `pointer: fine` alone misses the motion sensitivity check.
- `prefers-reduced-motion` alone does not filter touch devices.

The compound query is the only reliable way to serve hover effects only to users who can actually benefit from them.

## Touch Device Behavior

When the media query does not match (touch devices, reduced-motion users), elements should:

1. **Show no hover effect.** The base transition declaration is harmless (it applies to the non-hovered state), but the `:hover` rule never fires.
2. **Rely on `:active` for feedback.** A brief opacity change or background shift on `:active` (tap) is sufficient.
3. **Remain fully functional.** Hover is enhancement, not requirement. No content or functionality should be hidden behind hover.

```css
/* Base: transition is declared but hover rule is gated */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Active state for all devices (including touch) */
.card:active {
  opacity: 0.9;
}

/* Hover only for capable devices */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
}
```

## Patterns

### Hover-Lift (Card Elevation Change)

The primary hover pattern at Verdigris. Cards translate upward and gain a shadow, simulating physical elevation.

**Tokens:** `duration.moderate` (300ms) + `easing.default` (ease)

```css
/* From www index.css */
@utility hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
}
```

| Property | Value | Token |
|----------|-------|-------|
| Duration | 300ms | `duration.moderate` |
| Easing | `ease` | `easing.default` |
| Translate Y | -4px | (fixed, not tokenized) |
| Shadow | `elevation.shadow.xl` | See `tokens/elevation/shadow.json` |

**When to use:** Blog post cards, case study cards, feature cards, any clickable surface that represents a distinct content item.

### Hover-Scale (Container Zoom)

The entire card or container scales up subtly. Used for less prominent interactive surfaces.

**Tokens:** `duration.slow` (500ms) + `easing.default` (ease)

```css
/* From www index.css */
@utility hover-scale {
  transition: transform 0.5s ease;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .hover-scale:hover {
    transform: scale(1.02);
  }
}
```

| Property | Value | Token |
|----------|-------|-------|
| Duration | 500ms | `duration.slow` |
| Easing | `ease` | `easing.default` |
| Scale | 1.02 | (fixed) |

**When to use:** Secondary interactive areas, partner logos, navigation tiles. The slower duration and smaller scale make this feel more subtle than hover-lift.

### Hover-Scale-Img (Image Zoom)

Images within a container scale on hover, creating a "peek" effect. The container must have `overflow: hidden` to clip the scaled image.

**Tokens:** `duration.moderate` (300ms) + `easing.default` (ease)

```css
/* From www index.css */
@utility hover-scale-img {
  transition: transform 0.3s ease;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .group:hover .hover-scale-img {
    transform: scale(1.05);
  }
}
```

Note: The hover trigger is on the `.group` parent, not the image itself. This allows hovering anywhere on the card to zoom the image.

| Property | Value | Token |
|----------|-------|-------|
| Duration | 300ms | `duration.moderate` |
| Easing | `ease` | `easing.default` |
| Scale | 1.05 | (fixed) |

**When to use:** Blog listing cards, case study thumbnails, any card with a hero image.

#### Linked Image Zoom (Prose Content)

For images inside links within prose content (e.g., a diagram that links to a blog post):

```css
/* From www index.css */
.prose-linked-img-zoom a:has(> img) {
  display: block;
  overflow: hidden;
  border-radius: 0.5rem;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
}

.prose-linked-img-zoom a:has(> img) img {
  transition: transform 0.3s ease;
  display: block;
  width: 100%;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .prose-linked-img-zoom a:has(> img):hover img {
    transform: scale(1.05);
  }
}
```

### Color/Opacity Transitions

For elements where spatial movement would be distracting (buttons, links, navigation items), use color or opacity shifts.

**Tokens:** `duration.normal` (200ms) + `easing.default` (ease)

```css
/* From www index.css — button hover */
.button-primary {
  transition: all 0.2s ease; /* duration.normal + easing.default */
}

.button-primary:hover {
  background-color: hsl(153 67% 32%); /* Darkened primary */
}

.button-secondary {
  transition: all 0.2s ease;
}

.button-secondary:hover {
  background-color: hsl(var(--secondary));
}
```

Note: Button hover does not require the compound media query because color changes are not motion-based. They affect neither spatial position nor vestibular response. However, if you combine a color change with a transform, the compound query is required.

### Ghost-on-Dark Hover

The `ghost-on-dark` button variant transitions from transparent to white at 10% opacity on hover. Used for secondary CTAs on dark hero sections.

**Tokens:** `duration.normal` (200ms) + `easing.default` (ease)

```css
.ghost-on-dark {
  background: transparent;
  color: white;
  border: 1px solid oklch(1 0 0 / 0.6);
  transition: background 0.2s ease;
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .ghost-on-dark:hover {
    background: oklch(1 0 0 / 0.1);
  }
}
```

This is a color-only transition, so the compound media query is technically not required. It is used here for consistency because ghost-on-dark buttons appear alongside transform-based effects on dark hero sections.

See `categories/web-components/buttons.md` for the full ghost-on-dark variant spec. See `rules/visual-rules.yml` -> `components.buttons.ghost-on-dark` for machine rules.

### CTA Arrow-Link Hover (Gap Expansion)

Inline CTA links with a trailing arrow (`→`) use gap expansion for their hover effect. The gap between text and arrow widens from 0.25rem to 0.5rem. This is distinct from the `cta-link` pattern, which uses underline hover.

**Tokens:** `duration.normal` (200ms) + `easing.default` (ease)

```css
.cta-arrow-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  text-decoration: none;
  transition: gap 0.2s ease;
}

.cta-arrow-link span[aria-hidden] {
  /* Arrow is decorative, not content */
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .cta-arrow-link:hover {
    gap: 0.5rem;
  }
}
```

| Property | Value | Token |
|----------|-------|-------|
| Duration | 200ms | `duration.normal` |
| Easing | `ease` | `easing.default` |
| Default gap | 0.25rem | (fixed) |
| Hover gap | 0.5rem | (fixed) |

**When to use:** Section-level secondary CTAs where a full button is too heavy. Placed at the end of content sections to guide the reader forward.

The compound media query is required because `gap` is a layout property that triggers reflow, and the animation should not fire on touch devices or for reduced-motion users.

See `categories/web-components/page-sections.md` for usage context. See `rules/visual-rules.yml` -> `components.cta-arrow-link` for machine rules.

### Team Member Photo Reveal

A specialized pattern: static photo cross-fades to an animated GIF on hover. Used on the About page.

**Tokens:** `duration.moderate` (300ms) + `easing.default` (ease)

```css
/* From www index.css */
.team-member-hover {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.team-member-static {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@media (hover: hover) {
  .group:hover .team-member-static {
    opacity: 0;
  }
  .group:hover .team-member-hover {
    opacity: 1;
  }
}
```

Note: This pattern uses `@media (hover: hover)` without `pointer: fine` or `prefers-reduced-motion`. This is an intentional deviation because the effect is an opacity crossfade (not spatial motion), making it safe for reduced-motion users. The hover gate alone is sufficient to prevent the stuck-hover problem on touch devices.

### Reference Line Label (Patina)

A subtle opacity hover used on chart annotations in the Patina app:

```css
/* From Patina globals.css */
.reference-line-label {
  transition: opacity 150ms ease-out; /* duration.fast + easing.out */
  cursor: pointer;
}

.reference-line-label:hover {
  opacity: 0.15 !important;
}
```

This lowers the label's opacity so the underlying chart data becomes visible. The `!important` overrides inline styles set by the charting library.

## Do's

1. **Do:** Always use the compound media query `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)` for any hover effect that involves `transform`.

2. **Do:** Declare the `transition` property on the base element (outside the media query). The transition smooths both the hover-in and hover-out. If the transition is only inside the media query, the hover-out will be instant on devices that stop matching mid-interaction.

3. **Do:** Use the `.group:hover .child` pattern for image zoom. This ensures the entire card is the hover target, not just the image.

4. **Do:** Provide an `overflow: hidden` container for any `scale()` hover. Without it, the scaled image overflows its bounds.

5. **Do:** Use `translateY(-4px)` for hover-lift, not larger values. Larger values (e.g., -8px, -12px) make the card feel like it is jumping rather than lifting.

## Don'ts

1. **Don't:** Put hover effects outside the compound media query if they involve `transform` or `animation`. Color-only transitions are the exception.

2. **Don't:** Use `:hover` to reveal content that is not accessible any other way. Hover is not available on touch devices, and content hidden behind hover is invisible to those users.

3. **Don't:** Combine hover-lift and hover-scale on the same element. Pick one. The combination creates competing transforms and feels over-animated.

4. **Don't:** Add hover effects to non-interactive elements. If an element is not clickable/tappable, hover feedback is misleading.

5. **Don't:** Use `transition: all` on elements with many properties. It can accidentally animate layout properties during resize. Be explicit: `transition: transform 0.3s ease, box-shadow 0.3s ease`.

## Related

- [guidelines.md](guidelines.md) — Three gates, duration/easing decision trees
- [scroll-reveal.md](scroll-reveal.md) — Entrance animations
- [reduced-motion.md](reduced-motion.md) — Full accessibility fallback guide
- [foundations/motion.md](../../foundations/motion.md) — Token rationale
- [tokens/motion/duration.json](../../tokens/motion/duration.json) — Duration tokens
- [tokens/motion/easing.json](../../tokens/motion/easing.json) — Easing tokens
- [tokens/elevation/shadow.json](../../tokens/elevation/shadow.json) — Shadow tokens
