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

<!-- Screenshot placeholder: Paragraph of teal text on white background with contrast ratio overlay showing 2.9:1 -->

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

<!-- Screenshot placeholder: Corrected version showing darkened teal text on white with passing contrast ratio -->
