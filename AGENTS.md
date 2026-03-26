# AI Agent Instructions — Verdigris Design System

This file provides context for AI coding agents generating on-brand Verdigris visuals.

## How to Use This Repo

When generating UI components, pages, or visual assets for Verdigris:

1. **Read `tokens/color/base.json`** — the canonical brand palette in OKLch
2. **Read `tokens/typography/`** — font families and scale
3. **Read `foundations/`** docs for rationale behind decisions
4. **Check `rules/visual-rules.yml`** for machine-enforceable constraints
5. **Review `examples/`** for annotated good/bad references

## Quick Reference: Brand Colors

| Name | OKLch | Hex | Usage |
|------|-------|-----|-------|
| Verdigris (primary teal) | `oklch(0.75 0.1286 191.57)` | #0fc8c3 | Decorative brand color |
| Midnight Purple | `oklch(0.29 0.1506 289.33)` | ~#1a0a4a | Deep accent |
| Pastel Red | `oklch(0.7 0.1909 24.11)` | ~#e85d3a | Warm accent |
| Cyber Yellow | `oklch(0.87 0.1786 92.23)` | ~#d4c520 | Highlight |

**Do NOT use brand teal as text on white** — it fails WCAG AA (2.8:1 ratio). Use near-black (`oklch(0.21 0.006 285.885)`) for text.

## Quick Reference: Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Body text | Inter | 1rem (16px) | 400 |
| Headings (marketing) | Lato | 4rem/3rem/2rem | 700 |
| Headings (app) | Inter | (Tailwind defaults) | 700 |
| Code/metrics | JetBrains Mono | — | 400 |
| Buttons | Inter | 1rem | 600 |

## Quick Reference: Spacing

- **Grid:** 4px base (0.25rem increments)
- **Container max-width:** 80rem (1280px)
- **Page padding:** 2.5rem (40px), 1.5rem on mobile
- **Section padding:** 4rem vertical (standard), 8rem (large)
- **Border radius:** 0.625rem (10px) — Patina canonical

## Rules for Generating On-Brand Output

### Colors
- Use OKLch values from `tokens/color/base.json`
- Neutral scale has a zinc tint (hue ~286) — not pure gray
- Dark mode: near-black background (not pure `#000000`)
- Dark mode borders: semi-transparent white (`oklch(1 0 0 / 10%)`)

### Typography
- Body: Inter, headings (marketing): Lato
- H1: 4rem with -0.02em letter-spacing and weight 700
- All body text: 1.6 line-height
- `brand_rules.yml` typography values are WRONG — use values from this repo

### Components
- Use shadcn/ui + Radix UI patterns
- Dark mode via `.dark` class + CSS custom properties
- Radius: 0.625rem base

### Animation
- Gate hover effects behind `(hover: hover) and (pointer: fine)`
- Always provide `prefers-reduced-motion: reduce` fallback
- Entrance: `ease-out`, 500ms. Interaction: `ease`, 200ms.

### Accessibility
- WCAG 2.1 AA minimum
- All images need `alt` text
- All interactive elements need focus indicators
- Never communicate with color alone

## Token Files

| File | Contains |
|------|----------|
| `tokens/color/base.json` | Primitive palette (OKLch) |
| `tokens/color/semantic-light.json` | Light mode semantic mappings |
| `tokens/color/semantic-dark.json` | Dark mode overrides |
| `tokens/typography/font-family.json` | Font stacks |
| `tokens/typography/scale.json` | Sizes, weights, line-heights |
| `tokens/spacing/base.json` | 4px grid scale |
| `tokens/spacing/layout.json` | Container, sections, hero |
| `tokens/motion/duration.json` | Animation durations |
| `tokens/motion/easing.json` | Easing curves |
| `tokens/radius.json` | Border radius scale |
| `tokens/breakpoints.json` | Responsive breakpoints |
| `rules/visual-rules.yml` | Machine-enforceable rules |

## Patina as Reference

Patina (the application UI) is the primary source of truth. When in doubt about a design decision, default to Patina's implementation. The www marketing site converges toward Patina, not the other way around.

Justified deviations from Patina:
- Lato as display font (Patina has no display font — marketing needs font contrast)
- Hero/marketing-specific patterns (Patina is an app dashboard)
- Ad/collateral templates (Patina has no ads)

All deviations must be documented in `foundations/` docs.
