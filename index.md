---
layout: default
title: Home
---

# Verdigris Design System

Canonical design tokens, guidelines, and visual rules for all Verdigris surfaces -- web, sales collateral, ads, and physical goods.

**Patina is the reference implementation.** When this repo makes design decisions, Patina's existing implementation is the default. The www site converges toward Patina, not the other way around.

---

## Foundations

Core design decisions with rationale.

- [Color](foundations/color.md) -- Palette, OKLch rationale, WCAG, dark mode
- [Typography](foundations/typography.md) -- Scale, font stacks, weight rules
- [Spacing](foundations/spacing.md) -- 4px grid, radius, breakpoints
- [Motion](foundations/motion.md) -- Animation philosophy, specs, reduced-motion
- [Accessibility](foundations/accessibility.md) -- WCAG AA requirements
- [Dark Mode](foundations/dark-mode.md) -- Strategy, Patina hue shift
- [Elevation](foundations/elevation.md) -- Shadow and z-index systems

---

## Categories

Medium-specific visual guidelines.

### Web Components
- [Buttons](categories/web-components/buttons.md)
- [Cards](categories/web-components/cards.md)
- [Data Display](categories/web-components/data-display.md)
- [Feedback](categories/web-components/feedback.md)
- [Forms](categories/web-components/forms.md)
- [Layout](categories/web-components/layout.md)
- [Navigation](categories/web-components/navigation.md)

### Animation
- [Guidelines](categories/animation/guidelines.md)
- [Hover States](categories/animation/hover-states.md)
- [Reduced Motion](categories/animation/reduced-motion.md)
- [Scroll Reveal](categories/animation/scroll-reveal.md)

### Other Categories
- [3D and Spline](categories/3d-and-spline/) -- WebGL waveform spec, Three.js patterns
- [Ads and Templates](categories/ads-and-templates/) -- LinkedIn/Google Display specs
- [Illustration](categories/illustration/) -- Icon style, diagram conventions
- [Photography](categories/photography/) -- Photo style, composition rules
- [Physical Goods](categories/physical-goods/) -- Trade show, merchandise, print

> See [categories/README.md](categories/README.md) for contribution guidance.

---

## Tokens

Machine-readable design tokens in [W3C DTCG format](https://design-tokens.github.io/community-group/format/).

### Color
- [Base palette](tokens/color/base.json)
- [Semantic -- Light](tokens/color/semantic-light.json)
- [Semantic -- Dark](tokens/color/semantic-dark.json)

### Typography
- [Font families](tokens/typography/font-family.json)
- [Type scale](tokens/typography/scale.json)

### Spacing
- [Base spacing](tokens/spacing/base.json)
- [Layout spacing](tokens/spacing/layout.json)

### Motion
- [Durations](tokens/motion/duration.json)
- [Easing curves](tokens/motion/easing.json)

### Elevation
- [Shadows](tokens/elevation/shadow.json)
- [Z-index](tokens/elevation/z-index.json)

### Other
- [Breakpoints](tokens/breakpoints.json)
- [Border radius](tokens/radius.json)

---

## Rules

Machine-enforceable visual rules for evaluator pipelines.

- [Visual Rules (YAML)](rules/visual-rules.yml)

---

## Examples

Annotated good and bad visual references.

### Good
- [Color WCAG darkened teal](examples/good/color-wcag-darkened-teal.md)
- [Dark mode translucent borders](examples/good/dark-mode-translucent-borders.md)

### Bad
- [Brand rules wrong sizes](examples/bad/brand-rules-wrong-sizes.md)
- [Bright teal as text](examples/bad/bright-teal-as-text.md)

---

## Using the Tokens

```bash
npm install @verdigristech/design-tokens
```

```css
/* OKLch (recommended) */
@import '@verdigristech/design-tokens/css/oklch';
.hero { color: var(--color-brand-verdigris); }
```

```js
// Tailwind
import designPreset from '@verdigristech/design-tokens/tailwind';
export default { presets: [designPreset] };
```

See the [README](README.md) for all output formats and the [Contributing guide](CONTRIBUTING.md) for how to add tokens, docs, or examples.
