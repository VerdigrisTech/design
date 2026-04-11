---
layout: visual
title: Buttons
---

<p class="v-label">Button Variants</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div class="v-comp-row">
      <button class="v-btn v-btn-default">Default</button>
      <button class="v-btn v-btn-destructive">Destructive</button>
      <button class="v-btn v-btn-outline">Outline</button>
      <button class="v-btn v-btn-secondary">Secondary</button>
      <button class="v-btn v-btn-ghost">Ghost</button>
      <button class="v-btn v-btn-link">Link</button>
    </div>
  </div>
</div>

<p class="v-label">Ghost on Dark (Hero CTA)</p>
<div class="v-demo">
  <div class="v-comp-demo" style="background: oklch(0.21 0.006 285.885); padding: 2rem; border-radius: 0.625rem;">
    <div class="v-comp-row">
      <button class="v-btn v-btn-default" style="background: oklch(0.21 0.006 285.885); color: white; border: 1px solid oklch(1 0 0 / 0.6); font-weight: 600;">Ghost on Dark</button>
      <button class="v-btn v-btn-default" style="background: oklch(1 0 0 / 0.1); color: white; border: 1px solid oklch(1 0 0 / 0.6); font-weight: 600;">Ghost on Dark (hover)</button>
    </div>
  </div>
</div>

<p class="v-label">Button Sizes</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div class="v-comp-row" style="align-items: center;">
      <button class="v-btn v-btn-default" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; height: 1.5rem;">XS</button>
      <button class="v-btn v-btn-default v-btn-sm">SM</button>
      <button class="v-btn v-btn-default">Default</button>
      <button class="v-btn v-btn-default v-btn-lg">LG</button>
    </div>
  </div>
</div>

<p class="v-label">Disabled State</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div class="v-comp-row">
      <button class="v-btn v-btn-default" disabled style="opacity: 0.5; cursor: not-allowed;">Default (disabled)</button>
      <button class="v-btn v-btn-destructive" disabled style="opacity: 0.5; cursor: not-allowed;">Destructive (disabled)</button>
      <button class="v-btn v-btn-outline" disabled style="opacity: 0.5; cursor: not-allowed;">Outline (disabled)</button>
    </div>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Buttons

Source files: `button.tsx`, `button-group.tsx`

---

## Button

**File:** `button.tsx`
**Primitive:** Native `<button>` (or Radix `Slot.Root` when `asChild`)
**CVA:** `buttonVariants`

### Variants

| Variant | Token classes |
|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90` (dark: `bg-destructive/60`) |
| `outline` | `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` (dark: `bg-input/30`) |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` (dark: `hover:bg-accent/50`) |
| `ghost-on-dark` | `bg-transparent text-white border-white/60 hover:bg-white/10` (dark context only) |
| `link` | `text-primary underline-offset-4 hover:underline` |

### Sizes

| Size | Dimensions |
|---|---|
| `default` | `h-9 px-4 py-2` (icon slots: `px-3`) |
| `xs` | `h-6 px-2 text-xs rounded-md` (icon slots: `px-1.5`, svg: `size-3`) |
| `sm` | `h-8 px-3 rounded-md` (icon slots: `px-2.5`) |
| `lg` | `h-10 px-6 rounded-md` (icon slots: `px-4`) |
| `icon` | `size-9` |
| `icon-xs` | `size-6 rounded-md` (svg: `size-3`) |
| `icon-sm` | `size-8` |
| `icon-lg` | `size-10` |

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "ghost-on-dark" \| "link"` | `"default"` | |
| `size` | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` | |
| `asChild` | `boolean` | `false` | Renders children as the root element via Radix Slot |

### Token usage

- **Background:** `primary`, `destructive`, `secondary`, `accent`, `background`, `input`
- **Text:** `primary-foreground`, `accent-foreground`, `secondary-foreground`
- **Border radius:** `rounded-md` (base)
- **Focus ring:** `ring`, `border-ring`, `ring-ring/50`
- **Invalid state:** `destructive`, `ring-destructive/20`
- **Data attributes:** `data-slot="button"`, `data-variant`, `data-size`

### Exports

- `Button` -- the component
- `buttonVariants` -- CVA function, reused by other components (Pagination, Calendar, Sidebar)

---

## ButtonGroup

**File:** `button-group.tsx`
**Primitive:** Native `<div>`

Groups buttons into a connected strip, removing inner border-radii and duplicate borders.

### Sub-components

| Component | Purpose |
|---|---|
| `ButtonGroup` | Container with `role="group"` |
| `ButtonGroupText` | Static text slot styled like a button (supports `asChild`) |
| `ButtonGroupSeparator` | Visual separator using `Separator` primitive |

### Variants (ButtonGroup)

| Variant | Value | Effect |
|---|---|---|
| `orientation` | `horizontal` (default) | Strips left radius/border on non-first children, right on non-last |
| `orientation` | `vertical` | Same logic but for top/bottom |

### Token usage

- `bg-muted` (ButtonGroupText background)
- `bg-input` (ButtonGroupSeparator)
- `shadow-xs` (ButtonGroupText)

### Data attributes

- `data-slot="button-group"`, `data-orientation`
- `data-slot="button-group-separator"`

</details>
