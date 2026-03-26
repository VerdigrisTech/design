# Good: WCAG-Darkened Teal for Text

## Category
color

## Classification
good

## What to Notice
- The www site darkened the brand teal from 42% to 28% lightness for text use, achieving ~4.9:1 contrast on white
- The bright teal is preserved as `--brand-teal` for decorative/non-text use (backgrounds, accents)
- Two separate tokens serve two purposes — one for contrast-sensitive text, one for decorative brand presence

## Tokens Referenced
- `color.legacy.www-primary-light` — the darkened text-safe teal
- `color.brand.verdigris` — the bright decorative teal

## Why This Works
Separating "text-safe" from "decorative" versions of the same brand color is a common accessibility pattern. It lets you keep the vibrant brand identity while meeting WCAG requirements where contrast matters.
