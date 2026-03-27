# Design System Examples

Visual examples of correct and incorrect usage of the Verdigris Design System tokens and rules. Each example includes a description, relevant tokens, and a code snippet.

Screenshots are placeholders -- see `<!-- Screenshot placeholder -->` comments in each file.

---

## Good Examples

| File | Description |
|------|-------------|
| [brand-teal-on-dark.md](good/brand-teal-on-dark.md) | Brand teal on `neutral.950` passes WCAG AA at ~12.3:1 contrast |
| [heading-hierarchy.md](good/heading-hierarchy.md) | Proper heading sizes (4rem/3rem/2rem) with Lato 700 and Inter 400 body |
| [card-composition.md](good/card-composition.md) | On-brand card with `shadow-sm`, `radius.base`, `spacing.6` padding, adaptive borders |
| [dark-mode.md](good/dark-mode.md) | Near-black `neutral.950` background with semi-transparent borders and proper foreground swaps |
| [motion-usage.md](good/motion-usage.md) | Hover-lift animation gated behind `(hover: hover)` with reduced-motion fallback |
| [color-wcag-darkened-teal.md](good/color-wcag-darkened-teal.md) | Darkened teal variant for text on light backgrounds (~4.9:1 contrast) |
| [dark-mode-translucent-borders.md](good/dark-mode-translucent-borders.md) | Semi-transparent white borders that adapt to any dark surface |

## Bad Examples

| File | Description |
|------|-------------|
| [teal-text-on-white.md](bad/teal-text-on-white.md) | Brand teal as text on white fails WCAG AA (~2.9:1 contrast) |
| [wrong-font-weights.md](bad/wrong-font-weights.md) | H2 at weight 600 and body at 500 collapse the visual hierarchy |
| [off-grid-spacing.md](bad/off-grid-spacing.md) | Hardcoded `15px` padding and `1.1rem` margin are not on the 4px grid |
| [missing-reduced-motion.md](bad/missing-reduced-motion.md) | Animation without `prefers-reduced-motion` fallback violates motion rules |
| [pure-black-dark-mode.md](bad/pure-black-dark-mode.md) | `#000000` background causes eye strain and OLED artifacts |
| [brand-rules-wrong-sizes.md](bad/brand-rules-wrong-sizes.md) | Using deprecated `brand_rules.yml` values instead of design tokens |
| [bright-teal-as-text.md](bad/bright-teal-as-text.md) | Bright brand teal used directly as body text color on white |
