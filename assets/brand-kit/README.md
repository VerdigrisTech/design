# Verdigris Brand Kit

Everything a partner, designer, or AI agent needs to represent Verdigris correctly.

## Logo

See `assets/logos/` for SVG files in teal, white, and dark variants.
Both icon-only and full lockup (icon + wordmark) are available.

## Colors

### Primary

| Name | OKLch | Hex | Use |
|------|-------|-----|-----|
| Brand Teal | oklch(0.75 0.1286 191.57) | #0FC8C3 | Primary brand color, CTAs, accents |
| Midnight Purple | oklch(0.29 0.1506 289.33) | #1A0A4A | Dark accent, depth, overlays |

### Full Palette

See `tokens/color/base.json` for the full 16-stop gradient from teal through purple to red to yellow.

### Neutrals

| Step | OKLch | Hex | Use |
|------|-------|-----|-----|
| 950 | oklch(0.141 0.005 285.823) | #1C1917 | Dark backgrounds, primary text |
| 900 | oklch(0.21 0.006 285.885) | #292524 | Dark containers, input backgrounds |
| 500 | oklch(0.552 0.016 285.938) | #78716C | Muted text, placeholders |
| 200 | oklch(0.92 0.004 286.32) | #E7E5E4 | Borders, dividers |
| 50 | oklch(0.985 0 0) | #FAFAF9 | Input backgrounds, subtle surfaces |

## Typography

| Role | Family | Weight | Source |
|------|--------|--------|--------|
| Display (headings) | Lato | 700 | Google Fonts |
| Body | Inter | 400, 500, 600 | Google Fonts |
| Code / mono | JetBrains Mono | 400 | Google Fonts |

Inter is the body font across all surfaces. Lato is the display font for marketing headings (justified deviation from Patina, which uses Inter for everything).

## Spacing

4px base grid. All spacing values are multiples of 4px.
See `tokens/spacing/base.json` for the full scale.

## Border Radius

Canonical radius: 0.625rem (10px). Used on cards, inputs, containers.
Button/input inner radius: calc(0.625rem - 2px) = 8px.

## Further Reading

- Design system docs: design.verdigris.co (if deployed)
- Specimen page: `/specimen.html`
- Visual rules: `rules/visual-rules.yml`
- Color foundations: `foundations/color.md`
- Typography foundations: `foundations/typography.md`
