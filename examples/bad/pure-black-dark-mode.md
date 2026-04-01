---
layout: visual
title: "Bad: Pure Black Background in Dark Mode"
category: color
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div class="v-label">Incorrect: #000000 background -- harsh contrast, OLED pixel-off artifact</div>
  <div style="background:#000000; padding:2rem; border-radius:0.625rem; color:#ffffff;">
    <div style="background:#111111; padding:1.5rem; border-radius:0.625rem; border:1px solid #222;">
      <h3 style="margin:0 0 0.25rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem;">Facility Overview</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:0.875rem; opacity:0.7;">Monitoring 47 circuits across 3 buildings.</p>
    </div>
  </div>
</div>

<div class="v-demo" style="margin-top:1rem;">
  <span class="v-badge v-badge-pass">PASS</span>
  <div class="v-label">Corrected: neutral.950 (#0a0a0a) background -- warm, layered, easy on eyes</div>
  <div style="background:#0a0a0a; padding:2rem; border-radius:0.625rem; color:#fafafa;">
    <div style="background:#171717; padding:1.5rem; border-radius:0.625rem; border:1px solid rgba(255,255,255,0.1);">
      <h3 style="margin:0 0 0.25rem; font-family:Lato,sans-serif; font-weight:700; font-size:1.25rem;">Facility Overview</h3>
      <p style="margin:0; font-family:Inter,sans-serif; font-size:0.875rem; color:#a3a3a3;">Monitoring 47 circuits across 3 buildings.</p>
    </div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Bad: Pure Black Background in Dark Mode

## Category
color

## Classification
bad

## What to Notice
- Background set to `#000000` (pure black) instead of `neutral.950` (`#0a0a0a`)
- Pure black creates a "hole in the screen" effect on OLED displays where pixels turn fully off
- White text on `#000000` produces maximum contrast (21:1), which causes eye strain during extended reading
- Borders and card edges disappear against pure black, flattening the visual hierarchy
- The design system explicitly prohibits pure black backgrounds

## Tokens Referenced
- `color.dark_mode.never_pure_black` -- explicit rule: never use `#000000` as a background
- `color.neutral.950` -- the correct near-black background (`#0a0a0a`)
- `color.neutral.900` -- elevated surface background for layered depth

## Code Example (What NOT to Do)

```css
/* DO NOT do this */
:root[data-theme="dark"] {
  --page-bg: #000000;       /* Pure black -- prohibited */
  --surface-bg: #111111;    /* Arbitrary dark gray -- not a token */
}

.page {
  background: var(--page-bg);
  color: #ffffff;
}
```

```html
<body class="page" data-theme="dark">
  <div class="card">
    <h2>Facility Overview</h2>
    <p>Monitoring 47 circuits across 3 buildings.</p>
  </div>
</body>
```

## Fix
Use `neutral.950` (`#0a0a0a`) for the page background and `neutral.900` (`#171717`) for elevated surfaces. The slight warmth in near-black reduces eye strain and preserves the layered depth that dark mode requires. On OLED displays, `#0a0a0a` still appears nearly black while avoiding the pixel-off artifact.

```css
/* Correct: near-black from tokens */
:root[data-theme="dark"] {
  --page-bg: var(--color-neutral-950);    /* #0a0a0a */
  --surface-bg: var(--color-neutral-900); /* #171717 */
}

.page {
  background: var(--page-bg);
  color: var(--color-neutral-50);
}
```

</details>
