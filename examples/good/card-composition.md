# Good: On-Brand Card Composition

## Category
component

## Classification
good

## What to Notice
- Shadow uses `elevation.shadow.sm` -- subtle depth without floating off the page
- Border radius uses `radius.base` (`0.625rem` / 10px) -- consistent with all Patina surfaces
- Padding uses `spacing.6` (`1.5rem` / 24px) -- generous breathing room on the 4px grid
- Border color uses `neutral.200` in light mode, `neutral.800` in dark mode -- quiet separation
- All values come from tokens, nothing hardcoded

<!-- Screenshot placeholder: Card component in light mode showing shadow, radius, padding, and border -->

## Tokens Referenced
- `elevation.shadow.sm` -- card shadow
- `radius.base` -- 0.625rem corner radius
- `spacing.6` -- 1.5rem internal padding
- `color.neutral.200` -- light mode border
- `color.neutral.800` -- dark mode border

## Why This Works
The card follows Patina's composition pattern: subtle shadow for depth, consistent radius for brand cohesion, token-based spacing for grid alignment, and adaptive border colors for both modes. The result feels grounded and intentional rather than arbitrary.

## Code Example

```css
.card {
  padding: var(--spacing-6);                /* 1.5rem */
  border-radius: var(--radius-base);        /* 0.625rem */
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-0);
}

@media (prefers-color-scheme: dark) {
  .card {
    border-color: var(--color-neutral-800);
    background: var(--color-neutral-900);
  }
}
```

```html
<div class="card">
  <h3>Monthly Usage</h3>
  <p>1,247 kWh consumed across 14 circuits.</p>
</div>
```

<!-- Screenshot placeholder: Card in both light and dark mode side by side -->
