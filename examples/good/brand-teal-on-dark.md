# Good: Brand Teal on Dark Backgrounds

## Category
color

## Classification
good

## What to Notice
- `color.brand.verdigris` (`#0fc8c3`) on `neutral.950` (`#0a0a0a`) achieves ~12.3:1 contrast ratio
- Passes WCAG AA and AAA for both normal and large text
- The bright teal retains its full vibrancy because dark backgrounds provide natural contrast

<!-- Screenshot placeholder: Side-by-side showing brand teal heading on neutral.950 background -->

## Tokens Referenced
- `color.brand.verdigris` -- the canonical brand teal
- `color.neutral.950` -- near-black background for dark surfaces
- `color.contrast` rules -- minimum 4.5:1 for normal text, 3:1 for large text

## Why This Works
On dark backgrounds the bright brand teal has plenty of contrast without any lightness adjustment. This is the preferred way to use `color.brand.verdigris` as a text or heading color -- pair it with a dark surface rather than darkening the teal itself.

## Code Example

```css
.hero-dark {
  background-color: var(--color-neutral-950);   /* #0a0a0a */
  color: var(--color-brand-verdigris);           /* #0fc8c3 */
}
```

```html
<section class="hero-dark">
  <h1>Monitor your energy in real time</h1>
</section>
```

<!-- Screenshot placeholder: Rendered hero section with teal heading on near-black background -->
