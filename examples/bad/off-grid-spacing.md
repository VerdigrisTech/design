# Bad: Off-Grid Spacing Values

## Category
spacing

## Classification
bad

## What to Notice
- Padding set to `15px` -- not on the 4px grid (closest valid values: 12px or 16px)
- Margin set to `1.1rem` -- not a token value (closest token: `spacing.4` at `1rem` or `spacing.5` at `1.25rem`)
- Hardcoded pixel/rem values instead of referencing spacing tokens
- Inconsistent spacing makes the layout feel off-balance and unpredictable
- These values will not align with adjacent components that use the token scale

<!-- Screenshot placeholder: Card with 15px padding next to a card with token-based padding, showing misalignment -->

## Tokens Referenced
- `spacing.grid.allowed_scale` -- defines the valid spacing steps (multiples of 4px)
- `spacing.3` -- 0.75rem (12px)
- `spacing.4` -- 1rem (16px)
- `spacing.5` -- 1.25rem (20px)
- `spacing.6` -- 1.5rem (24px)

## Code Example (What NOT to Do)

```css
/* DO NOT do this */
.card {
  padding: 15px;      /* Not on 4px grid */
  margin-bottom: 1.1rem;  /* Not a token value */
}

.sidebar {
  padding: 13px 18px;  /* Neither value is on the grid */
}
```

```html
<div class="card">
  <p>Circuit A: 342 kWh</p>
</div>
```

## Fix
Always use spacing tokens that follow the 4px grid. The spacing scale provides values at `0.25rem` (4px) increments up to `spacing.6`, then larger steps beyond. Never hardcode pixel or rem values -- reference the token so that global spacing adjustments propagate automatically.

```css
/* Correct: use spacing tokens */
.card {
  padding: var(--spacing-4);        /* 1rem = 16px */
  margin-bottom: var(--spacing-4);  /* 1rem = 16px */
}

.sidebar {
  padding: var(--spacing-3) var(--spacing-5);  /* 12px 20px */
}
```

<!-- Screenshot placeholder: Corrected card with token-based padding aligned to the 4px grid -->
