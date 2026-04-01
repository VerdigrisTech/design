---
layout: visual
title: "Good: Correct Dark Mode Implementation"
category: color
classification: good
---

<div class="v-demo">
  <span class="v-badge v-badge-pass">PASS</span>
  <div style="background:#0a0a0a; padding:2rem; border-radius:0.625rem; color:#fafafa;">
    <div style="background:#171717; padding:1.5rem; border-radius:0.625rem; border:1px solid rgba(255,255,255,0.1);">
      <h3 style="margin:0 0 0.25rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem; color:#fafafa;">Circuit Overview</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:0.875rem; color:#a3a3a3;">Last updated 3 minutes ago</p>
    </div>
  </div>
</div>

<details class="v-details"><summary>Documentation</summary>

# Good: Correct Dark Mode Implementation

## Category
color

## Classification
good

## What to Notice
- Background uses `neutral.950` (`#0a0a0a`) -- near-black, not pure `#000000`
- Card surfaces use `neutral.900` to create layered depth against the page background
- Borders use semi-transparent white (`oklch(1 0 0 / 10%)`) that adapts to any surface
- Foreground text swaps to `neutral.50` for primary and `neutral.400` for secondary
- The overall feel is warm and layered, not flat and stark

## Tokens Referenced
- `color.neutral.950` -- page background in dark mode
- `color.neutral.900` -- elevated surface background
- `color.semantic.border` (dark override) -- semi-transparent border
- `color.neutral.50` -- primary text in dark mode
- `color.neutral.400` -- secondary/muted text in dark mode

## Why This Works
Pure black (`#000000`) creates harsh contrast against white text, causing eye strain and a "hole in the screen" effect on OLED displays. Near-black (`neutral.950`) softens the contrast while still reading as dark. Semi-transparent borders adapt automatically to any background shade, reducing the number of tokens needed and creating a cohesive glass-like aesthetic that Patina uses throughout.

## Code Example

```css
:root[data-theme="dark"] {
  --page-bg: var(--color-neutral-950);          /* #0a0a0a */
  --surface-bg: var(--color-neutral-900);       /* #171717 */
  --text-primary: var(--color-neutral-50);      /* #fafafa */
  --text-secondary: var(--color-neutral-400);   /* #a3a3a3 */
  --border-color: oklch(1 0 0 / 10%);          /* semi-transparent white */
}

.page { background: var(--page-bg); color: var(--text-primary); }
.card { background: var(--surface-bg); border: 1px solid var(--border-color); }
.muted { color: var(--text-secondary); }
```

```html
<body class="page" data-theme="dark">
  <div class="card">
    <h2>Circuit Overview</h2>
    <p class="muted">Last updated 3 minutes ago</p>
  </div>
</body>
```

</details>
