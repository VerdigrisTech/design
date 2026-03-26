# Accessibility

## Standards

All Verdigris design decisions must meet **WCAG 2.1 Level AA** at minimum.

## Color Contrast

| Requirement | Ratio | Applies to |
|------------|-------|------------|
| Normal text | 4.5:1 | Body text, labels, links |
| Large text (18px+ bold, 24px+ regular) | 3:1 | Headings, hero text |
| UI components | 3:1 | Borders, icons, focus indicators |
| Decorative | — | Brand color in backgrounds, illustrations |

### Brand Teal Contrast

The bright brand teal (`oklch(0.75 0.1286 191.57)` / `#0fc8c3`) has a contrast ratio of ~2.8:1 against white — **insufficient for normal text**. Solutions:

- **www approach:** Darken to `hsl(178, 86%, 28%)` for text use (~4.9:1)
- **Patina approach:** Use neutral.900 (near-black) for text, reserve brand teal for decorative use
- **Recommendation:** Follow Patina — use brand teal decoratively, dark neutrals for text

## Focus Indicators

- All interactive elements must have visible focus indicators
- Both codebases use `outline-ring/50` (Patina) or `--ring` (www) for focus rings
- Focus must be visible in both light and dark modes
- Never use `outline: none` without a custom focus indicator

## Reduced Motion

All animations must be wrapped in:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animation here */
}
```

Or disabled in the reduce case:
```css
@media (prefers-reduced-motion: reduce) {
  .animated { animation: none; }
}
```

## Hover vs Touch

Hover effects should be gated:
```css
@media (hover: hover) and (pointer: fine) {
  /* hover effects */
}
```

This prevents "sticky hover" on touch devices.

## Alt Text & ARIA

- All images require meaningful `alt` text (not "image of..." — describe what it conveys)
- Interactive components require `aria-label` or visible label
- Icon-only buttons require `aria-label`
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`) — not `<div onclick>`

## Color Independence

Never communicate information through color alone. Always pair color with:
- Text labels
- Icons or patterns
- Position/shape differences

Example: Error states use red color AND an error icon AND descriptive text.
