# Bad: Bright Brand Teal as Body Text

## Category
color

## Classification
bad

## What to Notice
- Using `color.brand.verdigris` (`oklch(0.75 0.1286 191.57)` / `#0fc8c3`) directly as text color on white background
- Contrast ratio is only ~2.8:1 — fails WCAG AA for normal text (requires 4.5:1)
- Fails WCAG AA even for large text (requires 3:1)

## Tokens Referenced
- `color.brand.verdigris` — should NOT be used for text on light backgrounds

## Fix
Use the darkened teal for text (`color.legacy.www-primary-light`) or use the brand teal only on dark backgrounds where contrast is sufficient. Alternatively, use it for decorative elements (backgrounds, icons, illustrations) where text contrast requirements don't apply.
