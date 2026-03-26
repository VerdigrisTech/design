# Dark Mode

## Strategy

Both codebases use the same dark mode mechanism:

1. **CSS custom properties** define semantic color tokens (background, foreground, primary, etc.)
2. **`:root`** sets light mode values
3. **`.dark`** class on `<html>` overrides to dark mode values
4. **Tailwind's `dark:` variant** maps to `.dark` via `@custom-variant dark (&:is(.dark *))`

This is the **class-based** strategy (not `prefers-color-scheme` media query), giving users explicit control.

## Token Swaps

| Semantic Token | Light Mode | Dark Mode | Notes |
|----------------|-----------|-----------|-------|
| background | white | neutral.950 | Near-black, not pure black |
| foreground | neutral.950 | neutral.50 | Near-white |
| primary | neutral.900 | neutral.200 | Inverted for contrast |
| secondary | neutral.100 | neutral.800 | |
| card | white | neutral.900 | Slightly lifted from bg |
| border | neutral.200 (solid) | white/10% (translucent) | Glass effect in dark |
| input | neutral.200 (solid) | white/15% (translucent) | Slightly brighter than border |
| destructive | Vivid red | Softer red | Reduced intensity in dark |

## Patina's Hue Shift

In dark mode, Patina's chart colors shift hue for better contrast against dark backgrounds:

- Light chart-1: `oklch(0.646 0.222 41.116)` (warm orange)
- Dark chart-1: `oklch(0.488 0.243 264.376)` (cool blue)

This isn't a simple inversion — it's a deliberate palette rotation to maintain visual interest and readability on dark surfaces. The brand palette (verdigris, midnight-purple, pastel-red, cyber-yellow) remains constant across modes.

## Implementation

```css
/* Define variables in :root (light) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  /* ... */
}

/* Override in .dark */
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... */
}

/* Tailwind integration */
@custom-variant dark (&:is(.dark *));
```

## Sidebar Consistency

The sidebar primary color (`pastel-red`) is **the same in both modes**. This is intentional — it provides a consistent brand anchor that doesn't shift between themes.

## Background Choices

**Not pure black.** Both codebases use near-black (`oklch(0.141...)` in Patina, `hsl(0,0%,4%)` in www) rather than `#000000`. Pure black creates excessive contrast and eye strain on OLED displays.
