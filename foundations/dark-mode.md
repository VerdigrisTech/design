---
layout: visual
title: Dark Mode
---

<div class="v-demo">
  <div class="v-label">Light vs Dark Token Swaps</div>
  <p style="font-size:0.8125rem; color:var(--muted-fg); margin-bottom:1.25rem;">Side-by-side comparison showing how semantic tokens resolve in each mode.</p>

  <style>
    .dm-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      max-width: 36rem;
    }
    @media (max-width: 600px) {
      .dm-comparison { grid-template-columns: 1fr; }
    }
    .dm-card {
      border-radius: var(--radius);
      padding: 1.25rem;
      border: 1px solid;
      font-family: var(--font-body);
      font-size: 0.8125rem;
    }
    .dm-card-light {
      background: #ffffff;
      color: #0a0a0b;
      border-color: #e5e5e5;
    }
    .dm-card-dark {
      background: #0a0a0b;
      color: #fafafa;
      border-color: rgba(255,255,255,0.1);
    }
    .dm-card-heading {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      opacity: 0.6;
    }
    .dm-swatch-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .dm-swatch-row:last-child { margin-bottom: 0; }
    .dm-swatch {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 4px;
      flex-shrink: 0;
      border: 1px solid rgba(128,128,128,0.2);
    }
    .dm-swatch-name {
      font-family: var(--font-mono);
      font-size: 0.625rem;
    }
  </style>

  <div class="dm-comparison">
    <!-- Light mode card -->
    <div class="dm-card dm-card-light">
      <div class="dm-card-heading" style="color:#0a0a0b;">Light Mode</div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#ffffff;"></div>
        <span class="dm-swatch-name" style="color:#0a0a0b;">background — white</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#0a0a0b;"></div>
        <span class="dm-swatch-name" style="color:#0a0a0b;">foreground — neutral.950</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#ffffff; border:1px solid #e5e5e5;"></div>
        <span class="dm-swatch-name" style="color:#0a0a0b;">card — white</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#f5f5f5;"></div>
        <span class="dm-swatch-name" style="color:#0a0a0b;">muted — neutral.100</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#e5e5e5;"></div>
        <span class="dm-swatch-name" style="color:#0a0a0b;">border — neutral.200</span>
      </div>
    </div>

    <!-- Dark mode card -->
    <div class="dm-card dm-card-dark">
      <div class="dm-card-heading" style="color:#fafafa;">Dark Mode</div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#0a0a0b;"></div>
        <span class="dm-swatch-name" style="color:#fafafa;">background — neutral.950</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#fafafa;"></div>
        <span class="dm-swatch-name" style="color:#fafafa;">foreground — neutral.50</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#171717;"></div>
        <span class="dm-swatch-name" style="color:#fafafa;">card — neutral.900</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:#262626;"></div>
        <span class="dm-swatch-name" style="color:#fafafa;">muted — neutral.800</span>
      </div>
      <div class="dm-swatch-row">
        <div class="dm-swatch" style="background:rgba(255,255,255,0.1);"></div>
        <span class="dm-swatch-name" style="color:#fafafa;">border — white/10%</span>
      </div>
    </div>
  </div>
</div>

<div class="v-gradient"></div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Dark Mode

## Strategy

Both codebases use the same dark mode mechanism:

1. **CSS custom properties** define semantic color tokens (background, foreground, primary, etc.)
2. **`:root`** sets light mode values
3. **`.dark`** class on `<html>` overrides to dark mode values
4. **Tailwind's `dark:` variant** maps to `.dark` via `@custom-variant dark (&:is(.dark *))`

This is the **class-based** strategy (not `prefers-color-scheme` media query), giving users explicit control.

## Token Swaps

| Semantic Token | Light Mode | Dark Mode | Notes |
|----------------|-----------|-----------|-------|
| background | white | neutral.950 | Near-black, not pure black |
| foreground | neutral.950 | neutral.50 | Near-white |
| primary | neutral.900 | neutral.200 | Inverted for contrast |
| secondary | neutral.100 | neutral.800 | |
| card | white | neutral.900 | Slightly lifted from bg |
| border | neutral.200 (solid) | white/10% (translucent) | Glass effect in dark |
| input | neutral.200 (solid) | white/15% (translucent) | Slightly brighter than border |
| destructive | Vivid red | Softer red | Reduced intensity in dark |

## Patina's Hue Shift

In dark mode, Patina's chart colors shift hue for better contrast against dark backgrounds:

- Light chart-1: `oklch(0.646 0.222 41.116)` (warm orange)
- Dark chart-1: `oklch(0.488 0.243 264.376)` (cool blue)

This isn't a simple inversion — it's a deliberate palette rotation to maintain visual interest and readability on dark surfaces. The brand palette (verdigris, midnight-purple, pastel-red, cyber-yellow) remains constant across modes.

## Implementation

```css
/* Define variables in :root (light) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  /* ... */
}

/* Override in .dark */
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... */
}

/* Tailwind integration */
@custom-variant dark (&:is(.dark *));
```

## Sidebar Consistency

The sidebar primary color (`pastel-red`) is **the same in both modes**. This is intentional — it provides a consistent brand anchor that doesn't shift between themes.

## Background Choices

**Not pure black.** Both codebases use near-black (`oklch(0.141...)` in Patina, `hsl(0,0%,4%)` in www) rather than `#000000`. Pure black creates excessive contrast and eye strain on OLED displays.

</details>
