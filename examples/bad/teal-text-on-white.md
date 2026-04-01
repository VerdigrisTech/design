---
layout: visual
title: "Bad: Brand Teal as Text on White Background"
category: color
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div class="v-label">Incorrect: teal text on white -- 2.9 : 1 contrast (fails WCAG AA)</div>
  <div style="background:#ffffff; padding:1.5rem 2rem; border-radius:0.625rem; border:1px solid #e5e5e5;">
    <p style="margin:0; font-family:Inter,sans-serif; font-size:1rem; color:#0fc8c3;">
      Save up to 30% on your energy bill with real-time monitoring.
    </p>
  </div>
</div>

<div class="v-demo" style="margin-top:1rem;">
  <span class="v-badge v-badge-pass">PASS</span>
  <div class="v-label">Corrected: neutral.900 text on white -- readable, accessible</div>
  <div style="background:#ffffff; padding:1.5rem 2rem; border-radius:0.625rem; border:1px solid #e5e5e5;">
    <p style="margin:0; font-family:Inter,sans-serif; font-size:1rem; color:#171717;">
      Save up to 30% on your energy bill with real-time monitoring.
    </p>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

# Bad: Brand Teal as Text on White Background

## Category
color

## Classification
bad

## What to Notice
- Brand teal `#0fc8c3` used directly as text color on white (`#ffffff`) background
- Contrast ratio is approximately 2.9:1 -- fails WCAG AA for normal text (requires 4.5:1)
- Also fails WCAG AA for large text (requires 3:1)
- The text appears washed out and difficult to read, especially at body sizes

## Tokens Referenced
- `color.brand.verdigris` -- `#0fc8c3`, not safe for text on light backgrounds
- `color.brand_teal.never_as_text_on_white` -- explicit rule prohibiting this usage

## Code Example (What NOT to Do)

```css
/* DO NOT do this */
.highlight-text {
  color: var(--color-brand-verdigris);  /* #0fc8c3 */
  background: #ffffff;
}
```

```html
<p class="highlight-text">
  Save up to 30% on your energy bill with real-time monitoring.
</p>
```

## Fix
Use `color.brand.verdigris` only on dark backgrounds (`neutral.950`) where it passes WCAG AA. For teal-tinted text on light backgrounds, use the darkened variant (`color.legacy.www-primary-light`) which achieves ~4.9:1 contrast. Alternatively, use the brand teal for decorative, non-text elements like backgrounds, borders, or icons where contrast requirements do not apply.

```css
/* Correct: darkened teal for text on light backgrounds */
.highlight-text {
  color: var(--color-text-teal-safe);
  background: #ffffff;
}

/* Correct: brand teal for text on dark backgrounds */
.highlight-text-dark {
  color: var(--color-brand-verdigris);
  background: var(--color-neutral-950);
}
```

</details>
