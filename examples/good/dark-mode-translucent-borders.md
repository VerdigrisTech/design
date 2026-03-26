# Good: Translucent Borders in Dark Mode

## Category
color

## Classification
good

## What to Notice
- Patina uses `oklch(1 0 0 / 10%)` for borders in dark mode — semi-transparent white
- This creates a subtle glass effect that adapts to any background color
- More maintainable than defining separate dark-mode border colors for every surface

## Tokens Referenced
- `color.semantic.border` (dark mode override)

## Why This Works
Semi-transparent borders in dark mode are more resilient than opaque ones. If the background changes (e.g., a card on a slightly different shade), the border automatically adjusts. Patina uses 10% for borders and 15% for inputs — the slight difference makes inputs more visible without being heavy.
