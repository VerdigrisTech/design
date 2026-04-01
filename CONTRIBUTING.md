---
title: Contributing
---

# Contributing to the Design System

## How to Add Design Tokens

1. Edit the relevant JSON file in `tokens/` — follow [W3C DTCG format](https://design-tokens.github.io/community-group/format/):
   ```json
   {
     "token-name": {
       "$value": "...",
       "$type": "color",
       "$description": "What this token is for"
     }
   }
   ```
2. Run `npm run build` to regenerate outputs
3. Run `npm run validate` to check for broken references
4. PR with before/after screenshots if the change is visual

## How to Add Examples (Good/Bad)

1. Create a new `.md` file in `examples/good/` or `examples/bad/`
2. Follow `examples/_template.md` format:
   - What makes it good/bad (specific tokens or rules referenced)
   - For bad examples: the fix (what it should look like instead)
3. Screenshots go alongside the markdown file

## How to Add Foundation Docs

1. Edit the relevant `.md` file in `foundations/`
2. Keep token values in sync — if a value changes, update both the JSON token and the markdown doc
3. Include rationale ("why") not just specification ("what")
4. If deviating from Patina, add a "Deviation from Patina" section explaining why

## How to Add a Category Guide

1. See [`categories/README.md`](categories/README.md) for which folder to use
2. Copy `categories/_guide-template.md` → `categories/{your-medium}/guidelines.md`
3. Fill in each section: mood/style, specs, token usage, do's/don'ts
4. Add reference images in `categories/{your-medium}/assets/` (see asset format guide below)
5. Include at least 2 good and 2 bad examples with screenshots
6. Reference specific tokens from `tokens/` by name — don't hardcode color or size values
7. Open a PR

## Asset Format Guide

| Type | Preferred Format | Max Size | Naming |
|------|-----------------|----------|--------|
| Icons & illustrations | SVG | — | `icon-{name}.svg` |
| UI screenshots | PNG | 2x resolution, max 2400px wide | `{good\|bad}-{description}.png` |
| Photos & mood boards | WebP or JPG | Max 1600px wide, <500KB | `photo-{description}.webp` |
| Diagrams | SVG or PNG | — | `diagram-{description}.svg` |

**Naming:** lowercase, hyphens, no spaces. Prefix example images with `good-` or `bad-`. Keep names descriptive (`good-hero-dark-teal-bg.png`, not `screenshot1.png`).

## Review Process

- All changes via PR
- Visual changes require before/after screenshots
- Token changes require `npm run build` output committed (in `build/dist/`)
- Foundation/category changes require at least 1 reviewer

## Deviation Protocol

If a design decision differs from Patina's implementation:

1. The foundation doc MUST include a "Deviation from Patina" section
2. Explain why the deviation is necessary
3. Deviations should be rare — Patina is battle-tested with 60+ components

**Justified deviations:** marketing-specific needs (display font, photography style), ad templates, physical goods specs.

**Unjustified deviations:** changing brand teal, using a different component library, different dark mode strategy.

## Running the Build

```bash
npm install
npm run validate   # check token JSON integrity
npm run build      # generate build/dist/ outputs
```
