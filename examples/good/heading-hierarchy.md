# Good: Proper Heading Hierarchy

## Category
typography

## Classification
good

## What to Notice
- H1 uses Lato at 700 weight and `4rem` (64px) -- the largest display size
- H2 uses Lato at 700 weight and `3rem` (48px) -- clear visual step-down from H1
- H3 uses Lato at 700 weight and `2rem` (32px) -- still distinct from body text
- Body text uses Inter at 400 weight and `1rem` (16px) -- optimized for reading
- The weight contrast between headings (700) and body (400) creates clear hierarchy

<!-- Screenshot placeholder: Page section showing H1, H2, H3, and body text in correct sizes and weights -->

## Tokens Referenced
- `typography.fontFamily.display` -- Lato for headings
- `typography.fontFamily.body` -- Inter for body text
- `typography.fontWeight.bold` -- 700 for all headings
- `typography.fontWeight.regular` -- 400 for body
- `typography.fontSize.h1` -- 4rem
- `typography.fontSize.h2` -- 3rem
- `typography.fontSize.h3` -- 2rem
- `typography.fontSize.body` -- 1rem

## Why This Works
Each heading level is visually distinct from the next, creating a scannable page structure. Lato's geometric shapes give headings a confident, modern feel, while Inter's open apertures make body text easy to read at smaller sizes. The consistent 700 weight across all headings avoids the common mistake of varying weights between heading levels.

## Code Example

```css
h1, h2, h3 {
  font-family: var(--font-display);   /* Lato */
  font-weight: var(--font-weight-bold);  /* 700 */
}

h1 { font-size: var(--font-size-h1); }  /* 4rem */
h2 { font-size: var(--font-size-h2); }  /* 3rem */
h3 { font-size: var(--font-size-h3); }  /* 2rem */

body {
  font-family: var(--font-body);         /* Inter */
  font-weight: var(--font-weight-regular); /* 400 */
  font-size: var(--font-size-body);        /* 1rem */
}
```

```html
<article>
  <h1>Energy Analytics Platform</h1>
  <h2>Real-Time Monitoring</h2>
  <h3>Circuit-Level Breakdown</h3>
  <p>Track energy consumption at the individual circuit level with sub-minute granularity.</p>
</article>
```

<!-- Screenshot placeholder: Rendered article showing full heading hierarchy with body text -->
