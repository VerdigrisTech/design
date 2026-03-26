# Categories — Designer Start Here

This folder contains **medium-specific visual guidelines**. Each subfolder covers a different surface where Verdigris design appears.

## Where to Put Things

| Folder | What Goes Here | Status |
|--------|---------------|--------|
| `web-components/` | Button, card, form, nav, data display patterns from Patina | Phase 2 |
| `photography/` | Photo style, mood boards, composition rules, crop guidance | Needs content |
| `illustration/` | Icon style, line weight, diagram conventions, color usage | Needs content |
| `3d-and-spline/` | WebGL waveform spec, Three.js patterns, perf budgets | Needs content |
| `animation/` | Scroll-reveal, hover states, page transitions, reduced-motion | Phase 2 |
| `ads-and-templates/` | LinkedIn/Google Display specs, sales leave-behinds | Needs content |
| `physical-goods/` | Trade show, merchandise, print color specs | Needs content |

## How to Contribute a Category Guide

1. Pick a folder above (or create a new one if the medium isn't listed)
2. Add a `guidelines.md` using the [guide template](_guide-template.md)
3. Add reference images in an `assets/` subfolder (see format guide below)
4. Include at least 2 good and 2 bad examples with explanations
5. Reference tokens from `tokens/` by name — don't hardcode color/size values
6. Open a PR

## Asset Format Guide

| Type | Preferred Format | Max Size | Naming |
|------|-----------------|----------|--------|
| Icons & illustrations | SVG | — | `icon-{name}.svg` |
| UI screenshots | PNG | 2x resolution, max 2400px wide | `{good\|bad}-{description}.png` |
| Photos & mood boards | WebP or JPG | Max 1600px wide, <500KB | `photo-{description}.webp` |
| Diagrams | SVG or PNG | — | `diagram-{description}.svg` |
| Videos/GIFs | MP4 or GIF | <5MB, max 10s | `demo-{description}.mp4` |

**Naming rules:**
- Lowercase, hyphens (no spaces or underscores)
- Prefix with `good-` or `bad-` for example images
- Keep names descriptive: `good-hero-dark-teal-bg.png`, not `screenshot1.png`

## What Makes a Good Category Guide

A guide should answer:
- **What does "on-brand" look like** for this medium? (mood, tone, examples)
- **What are the constraints?** (sizes, formats, platform limits)
- **What tokens apply?** (which colors, fonts, spacing from `tokens/`)
- **What to avoid** — with visual examples of common mistakes
- **Templates or starting points** if applicable (Figma links, starter files)

## Questions?

Check `foundations/` for the rationale behind token values, or open an issue.
