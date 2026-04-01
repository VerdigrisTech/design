---
layout: visual
title: Cards
---

<p class="v-label">Card Examples</p>
<div class="v-demo">
  <div class="v-grid-2">
    <div class="v-card">
      <div class="v-card-title">Analytics Overview</div>
      <div class="v-card-desc">View real-time energy consumption metrics across all monitored circuits and panels.</div>
    </div>
    <div class="v-card">
      <div class="v-card-title">Recent Alerts</div>
      <div class="v-card-desc">3 new alerts detected in the past 24 hours requiring your attention.</div>
    </div>
  </div>
</div>

<p class="v-label">Card with Accent Bar</p>
<div class="v-demo">
  <div style="max-width: 360px;">
    <div class="v-card" style="border-top: 3px solid var(--color-brand-teal, #0fc8c3); padding-top: 1.25rem;">
      <div class="v-card-title">Energy Savings</div>
      <div class="v-card-desc">Your facility saved 12% on energy costs this month compared to the rolling baseline.</div>
    </div>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Cards

Source file: `card.tsx`

---

## Card

**Primitive:** Native `<div>` elements throughout
**No CVA** -- single visual style, customizable via `className`.

### Sub-components

| Component | Element | Purpose | Key classes |
|---|---|---|---|
| `Card` | `div` | Outer container | `bg-card text-card-foreground rounded-xl border py-6 shadow-sm` |
| `CardHeader` | `div` | Title + description + optional action | CSS Grid: `grid-cols-[1fr_auto]` when action present |
| `CardTitle` | `div` | Heading | `font-semibold leading-none` |
| `CardDescription` | `div` | Subtitle / help text | `text-muted-foreground text-sm` |
| `CardAction` | `div` | Top-right action area | `col-start-2 row-span-2 row-start-1` |
| `CardContent` | `div` | Main body | `px-6` |
| `CardFooter` | `div` | Bottom bar | `flex items-center px-6` |

### Anatomy

```
Card
  CardHeader
    CardTitle
    CardDescription
    CardAction (optional, auto-positioned top-right)
  CardContent
  CardFooter
```

### Token usage

- **Background:** `card`
- **Text:** `card-foreground`, `muted-foreground`
- **Border:** default border color (inherits `border`)
- **Border radius:** `rounded-xl`
- **Shadow:** `shadow-sm`
- **Spacing:** `gap-6` (between sections), `px-6` (horizontal padding)
- Contextual border classes: `[.border-b]:pb-6` on header, `[.border-t]:pt-6` on footer -- activated by adding `border-b` / `border-t` to the Card

### Data attributes

Each sub-component emits `data-slot="card"`, `data-slot="card-header"`, etc. The `CardAction` slot enables the grid layout via `has-data-[slot=card-action]:grid-cols-[1fr_auto]` on `CardHeader`.

</details>
