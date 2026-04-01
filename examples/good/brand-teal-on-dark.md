---
layout: visual
title: "Good: Brand Teal on Dark Backgrounds"
category: color
classification: good
---

<div class="v-demo">
  <span class="v-badge v-badge-pass">PASS</span>
  <div style="background:#0a0a0a; color:#0fc8c3; padding:1.5rem 2rem; border-radius:0.625rem; font-family:Lato,sans-serif;">
    <h2 style="margin:0 0 0.25rem; font-size:2rem; font-weight:700;">Monitor your energy in real time</h2>
    <p style="margin:0; font-size:1rem; opacity:0.85;">Brand teal on neutral.950 &mdash; 12.3 : 1 contrast</p>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Good: Brand Teal on Dark Backgrounds

## Category
color

## Classification
good

## What to Notice
- `color.brand.verdigris` (`#0fc8c3`) on `neutral.950` (`#0a0a0a`) achieves ~12.3:1 contrast ratio
- Passes WCAG AA and AAA for both normal and large text
- The bright teal retains its full vibrancy because dark backgrounds provide natural contrast

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

</details>
