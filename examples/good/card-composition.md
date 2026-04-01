---
layout: visual
title: "Good: On-Brand Card Composition"
category: component
classification: good
---

<div class="v-demo">
  <span class="v-badge v-badge-pass">PASS</span>
  <div style="background:#f5f5f5; padding:2rem; border-radius:0.625rem;">
    <div style="background:#fff; padding:1.5rem; border-radius:0.625rem; border:1px solid #e5e5e5; box-shadow:0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); max-width:320px;">
      <h3 style="margin:0 0 0.5rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem; color:#0a0a0a;">Monthly Usage</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:1rem; color:#404040;">1,247 kWh consumed across 14 circuits.</p>
    </div>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

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

</details>
