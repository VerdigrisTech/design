# Bad: Incorrect Font Weights for Headings and Body

## Category
typography

## Classification
bad

## What to Notice
- H2 rendered at weight 600 (semi-bold) instead of the required 700 (bold)
- Body text rendered at weight 500 (medium) instead of the required 400 (regular)
- The reduced heading weight makes H2 look timid and less distinct from body text
- The heavier body weight creates visual noise and reduces readability in long passages
- Both deviations narrow the contrast between heading and body, collapsing the hierarchy

<!-- Screenshot placeholder: Page showing H2 at weight 600 and body at weight 500, looking muddled together -->

## Tokens Referenced
- `typography.fontWeight.bold` -- 700, required for all headings (H1-H3)
- `typography.fontWeight.regular` -- 400, required for body text
- `typography.weight_rules` -- defines the permitted weight pairings

## Code Example (What NOT to Do)

```css
/* DO NOT do this */
h2 {
  font-family: var(--font-display);
  font-weight: 600;  /* Wrong: should be 700 */
  font-size: var(--font-size-h2);
}

body {
  font-family: var(--font-body);
  font-weight: 500;  /* Wrong: should be 400 */
}
```

```html
<h2>Energy Savings Report</h2>
<p>Your facility reduced consumption by 12% this quarter compared to the baseline period.</p>
```

## Fix
Use `font-weight: 700` for all headings and `font-weight: 400` for body text. These values come from the `typography.fontWeight` tokens. The 300-point gap between heading and body weights is intentional -- it creates a clear visual hierarchy that lets users scan the page structure at a glance.

```css
/* Correct */
h2 {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);    /* 700 */
  font-size: var(--font-size-h2);
}

body {
  font-family: var(--font-body);
  font-weight: var(--font-weight-regular); /* 400 */
}
```

<!-- Screenshot placeholder: Corrected version with H2 at 700 and body at 400 showing clear hierarchy -->
