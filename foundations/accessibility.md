---
layout: visual
title: Accessibility
---

<div class="v-demo">
  <div class="v-label">Contrast Ratio — Brand Teal</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1.25rem;">Brand teal passes on dark backgrounds but fails on white.</p>

  <style>
    .a11y-contrast-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: stretch;
    }
    .a11y-contrast-box {
      flex: 1;
      min-width: 12rem;
      padding: 1.25rem;
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .a11y-contrast-text {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 700;
      color: #0fc8c3;
    }
    .a11y-contrast-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .a11y-contrast-ratio {
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
  </style>

  <div class="a11y-contrast-row">
    <div class="a11y-contrast-box" style="background:#0a0a0b; border:1px solid rgba(255,255,255,0.1);">
      <span class="a11y-contrast-text">Verdigris Teal</span>
      <div class="a11y-contrast-meta">
        <span class="v-badge v-badge-pass">PASS</span>
        <span class="a11y-contrast-ratio" style="color:#fafafa;">12.3 : 1</span>
      </div>
      <span style="font-family:var(--font-mono); font-size:0.625rem; color:rgba(255,255,255,0.5);">teal on neutral.950</span>
    </div>
    <div class="a11y-contrast-box" style="background:#ffffff; border:1px solid #e5e5e5;">
      <span class="a11y-contrast-text">Verdigris Teal</span>
      <div class="a11y-contrast-meta">
        <span class="v-badge v-badge-fail">FAIL</span>
        <span class="a11y-contrast-ratio" style="color:#0a0a0b;">2.9 : 1</span>
      </div>
      <span style="font-family:var(--font-mono); font-size:0.625rem; color:rgba(0,0,0,0.4);">teal on white</span>
    </div>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Focus Indicator</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1.25rem;">All interactive elements must show a visible focus ring.</p>

  <style>
    .a11y-focus-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      line-height: 1;
      background: var(--neutral-900, #171717);
      color: var(--neutral-50, #fafafa);
      outline: 2px solid #0fc8c3;
      outline-offset: 2px;
    }
    html.dark .a11y-focus-btn {
      background: var(--neutral-200, #e5e5e5);
      color: var(--neutral-900, #171717);
    }
  </style>

  <div style="display:flex; align-items:center; gap:1rem;">
    <button class="a11y-focus-btn" type="button">Focused Button</button>
    <span style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--muted-fg);">2px solid, 2px offset</span>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Touch Target Size</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1.25rem;">Interactive elements must be at least 44 x 44 px (WCAG 2.5.5).</p>

  <style>
    .a11y-target {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      font-family: var(--font-mono);
      font-size: 0.625rem;
      font-weight: 600;
    }
    .a11y-target-pass {
      width: 44px;
      height: 44px;
      background: oklch(0.45 0.15 145 / 15%);
      border: 2px solid oklch(0.45 0.15 145);
      color: oklch(0.45 0.15 145);
    }
    .a11y-target-fail {
      width: 32px;
      height: 32px;
      background: oklch(0.577 0.245 27.325 / 15%);
      border: 2px solid oklch(0.577 0.245 27.325);
      color: oklch(0.577 0.245 27.325);
    }
  </style>

  <div style="display:flex; flex-wrap:wrap; gap:1.5rem; align-items:flex-end;">
    <div style="text-align:center;">
      <div class="a11y-target a11y-target-pass">44px</div>
      <div style="margin-top:0.5rem;">
        <span class="v-badge v-badge-pass">PASS</span>
      </div>
      <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--muted-fg); display:block; margin-top:0.25rem;">minimum</span>
    </div>
    <div style="text-align:center;">
      <div class="a11y-target a11y-target-fail">32px</div>
      <div style="margin-top:0.5rem;">
        <span class="v-badge v-badge-fail">FAIL</span>
      </div>
      <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--muted-fg); display:block; margin-top:0.25rem;">too small</span>
    </div>
  </div>
</div>

<div class="v-gradient"></div>

<details class="v-details">
<summary>Documentation</summary>

# Accessibility

## Standards

All Verdigris design decisions must meet **WCAG 2.1 Level AA** at minimum.

## Color Contrast

| Requirement | Ratio | Applies to |
|------------|-------|------------|
| Normal text | 4.5:1 | Body text, labels, links |
| Large text (18px+ bold, 24px+ regular) | 3:1 | Headings, hero text |
| UI components | 3:1 | Borders, icons, focus indicators |
| Decorative | — | Brand color in backgrounds, illustrations |

### Brand Teal Contrast

The bright brand teal (`oklch(0.75 0.1286 191.57)` / `#0fc8c3`) has a contrast ratio of ~2.8:1 against white — **insufficient for normal text**. Solutions:

- **www approach:** Darken to `hsl(178, 86%, 28%)` for text use (~4.9:1)
- **Patina approach:** Use neutral.900 (near-black) for text, reserve brand teal for decorative use
- **Recommendation:** Follow Patina — use brand teal decoratively, dark neutrals for text

## Focus Indicators

- All interactive elements must have visible focus indicators
- Both codebases use `outline-ring/50` (Patina) or `--ring` (www) for focus rings
- Focus must be visible in both light and dark modes
- Never use `outline: none` without a custom focus indicator

## Reduced Motion

All animations must be wrapped in:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animation here */
}
```

Or disabled in the reduce case:
```css
@media (prefers-reduced-motion: reduce) {
  .animated { animation: none; }
}
```

## Hover vs Touch

Hover effects should be gated:
```css
@media (hover: hover) and (pointer: fine) {
  /* hover effects */
}
```

This prevents "sticky hover" on touch devices.

## Alt Text & ARIA

- All images require meaningful `alt` text (not "image of..." — describe what it conveys)
- Interactive components require `aria-label` or visible label
- Icon-only buttons require `aria-label`
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`) — not `<div onclick>`

## Color Independence

Never communicate information through color alone. Always pair color with:
- Text labels
- Icons or patterns
- Position/shape differences

Example: Error states use red color AND an error icon AND descriptive text.

</details>
