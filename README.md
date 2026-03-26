# Verdigris Design System

Canonical design tokens, guidelines, and visual rules for all Verdigris surfaces — web, sales collateral, ads, and physical goods.

> This repo replaces the legacy `design.verdigris.co` styleguide.

## Quick Start

```bash
npm install @verdigristech/design-tokens
```

### Use in CSS (OKLch — recommended)
```css
@import '@verdigristech/design-tokens/css/oklch';

.hero { color: var(--color-brand-verdigris); }
```

### Use in CSS (HSL — legacy)
```css
@import '@verdigristech/design-tokens/css/hsl';
```

### Use in Tailwind
```js
// tailwind.config.js
import designPreset from '@verdigristech/design-tokens/tailwind';

export default {
  presets: [designPreset],
  // ...
};
```

### Use hex values (email, print, Figma)
```js
import { hexColors } from '@verdigristech/design-tokens';
// hexColors['color.brand.verdigris'] → '#0fc8c3'
```

## What's Inside

```
tokens/           Machine-readable tokens (W3C DTCG JSON format)
  color/          Brand palette, semantic light/dark mappings
  typography/     Font families, scale, weights
  spacing/        4px grid, layout tokens
  motion/         Duration, easing
  elevation/      Shadows, z-index (Phase 2)

foundations/      Human-readable docs with rationale
  color.md        Palette, OKLch rationale, WCAG, dark mode
  typography.md   Scale, font evaluation (Inter+Lato vs alternatives)
  spacing.md      Grid, radius, breakpoints
  motion.md       Animation philosophy, specs, reduced-motion
  accessibility.md WCAG AA requirements
  dark-mode.md    Strategy, Patina hue shift
  elevation.md    Shadow + z-index systems (Phase 2)

categories/       Medium-specific guides (Phase 2-3)
examples/         Annotated good/bad visual examples
rules/            Machine-enforceable visual rules (YAML)
build/            Token build pipeline + generated outputs
```

## Building

```bash
npm install
npm run build      # generates build/dist/ with all formats
npm run validate   # checks token JSON for broken references
```

## Output Formats

| Format | File | Consumer |
|--------|------|----------|
| OKLch CSS vars | `css/oklch.css` | Patina, modern browsers |
| HSL CSS vars | `css/hsl.css` | www site (until migrated) |
| Hex JSON | `hex/colors.json` | Email, print, Figma |
| Tailwind preset | `tailwind/preset.js` | Both codebases |

## Source of Truth

**Patina is the reference implementation.** When this repo makes design decisions, Patina's existing implementation is the default. The www site converges toward Patina, not the other way around.

Deviations from Patina are documented in the relevant foundation docs with explicit rationale.

## Architecture

OKLch is the canonical color space. The build pipeline reads token JSON and generates all other formats:

```
tokens/color/base.json (OKLch)
  ↓ build/config.ts
  ├── css/oklch.css     (for Patina, modern browsers)
  ├── css/hsl.css       (for www, legacy)
  ├── hex/colors.json   (for email, print, Figma)
  └── tailwind/preset.js (for both codebases)
```

## Relationship to brand_rules.yml

The `design` section of `verdigriswww/rules/brand_rules.yml` is **deprecated**. This repo is the canonical source for visual tokens. Migration plan:

1. **Phase 1** (now): Design repo is canonical. brand_rules.yml keeps its design section with deprecation notice.
2. **Phase 2**: Evaluator loads visual rules from `@verdigristech/design-tokens/rules/visual-rules.yml`.
3. **Phase 3**: Remove design section from brand_rules.yml. It retains only vocabulary/tone/terminology.

## For Designers

New to this repo? Here's where to start:

- **Browse `foundations/`** — read the rationale behind color, typography, spacing, and motion decisions
- **Go to `categories/`** — each subfolder is a medium (photography, illustration, ads, etc.). See [`categories/README.md`](categories/README.md) for what goes where and how to add assets
- **Use `categories/_guide-template.md`** to create a new category guide
- **Check `examples/`** for annotated good/bad visual references

You don't need to run any code to contribute guidelines or assets — just add markdown and images via PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## AI Agents

See [AGENTS.md](AGENTS.md) for instructions on using this repo as context for AI-generated design work.
