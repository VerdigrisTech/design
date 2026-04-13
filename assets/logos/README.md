# Verdigris Logo Assets

## Files

### Icon (hexagonal mark only)

| File | Color | Use on |
|------|-------|--------|
| `icon-teal.svg` | Brand teal (#0FC8C3) | Light backgrounds, primary usage |
| `icon-white.svg` | White (#FFFFFF) | Dark backgrounds |
| `icon-dark.svg` | Neutral.950 (#1C1917) | Light backgrounds, formal/print contexts |

### Full Lockup (icon + wordmark)

| File | Color | Use on |
|------|-------|--------|
| `lockup-teal.svg` | Brand teal | Light backgrounds, primary usage |
| `lockup-white.svg` | White | Dark backgrounds |
| `lockup-dark.svg` | Neutral.950 | Light backgrounds, formal/print contexts |

### Legacy (original Sketch exports)

| File | Notes |
|------|-------|
| `brand/logo-green.svg` | Original Sketch export, includes drop shadow filter. Use lockup-teal.svg instead. |
| `brand/logo-white.svg` | Original Sketch export, includes drop shadow filter. Use lockup-white.svg instead. |

## Color Reference

The canonical brand teal in OKLch: `oklch(0.75 0.1286 191.57)`

Web fallbacks:
- Hex: `#0FC8C3`
- HSL: `hsl(178, 85%, 42%)`
- RGB: `rgb(15, 200, 195)`

See `tokens/color/base.json` for the full palette.

## Usage Rules

- Minimum clear space: 1x the icon height on all sides
- Minimum display size: 24px height (icon), 80px width (lockup)
- Do not rotate, stretch, recolor, or add effects
- Do not place teal logo on teal backgrounds
- On busy or photographic backgrounds, use white variant with a dark overlay
- See `rules/visual-rules.yml` -> `color.brand-teal` for brand color constraints

## PNG Generation

SVGs are the source of truth. To generate PNGs at specific sizes:

```bash
# Requires Inkscape or rsvg-convert
rsvg-convert -w 200 icon-teal.svg > icon-teal-200.png
rsvg-convert -w 400 icon-teal.svg > icon-teal-400.png
rsvg-convert -w 48 icon-teal.svg > icon-teal-48.png   # favicon size
```

Standard sizes for export: 48px, 96px, 200px, 400px, 800px.
