---
layout: visual
title: "Bad: Incorrect Font Weights for Headings and Body"
category: typography
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div class="v-label">Incorrect: H2 at weight 600, body at weight 500 -- hierarchy collapses</div>
  <div style="background:#fff; padding:1.5rem 2rem; border-radius:0.625rem; border:1px solid #e5e5e5;">
    <h2 style="margin:0 0 0.5rem; font-family:Lato,sans-serif; font-weight:600; font-size:2rem; color:#0a0a0a;">Energy Savings Report</h2>
    <p style="margin:0; font-family:Inter,sans-serif; font-weight:500; font-size:1rem; color:#0a0a0a;">Your facility reduced consumption by 12% this quarter compared to the baseline period.</p>
  </div>
</div>

<div class="v-demo" style="margin-top:1rem;">
  <span class="v-badge v-badge-pass">PASS</span>
  <div class="v-label">Corrected: H2 at weight 700, body at weight 400 -- clear hierarchy</div>
  <div style="background:#fff; padding:1.5rem 2rem; border-radius:0.625rem; border:1px solid #e5e5e5;">
    <h2 style="margin:0 0 0.5rem; font-family:Lato,sans-serif; font-weight:700; font-size:2rem; color:#0a0a0a;">Energy Savings Report</h2>
    <p style="margin:0; font-family:Inter,sans-serif; font-weight:400; font-size:1rem; color:#0a0a0a;">Your facility reduced consumption by 12% this quarter compared to the baseline period.</p>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

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

</details>
