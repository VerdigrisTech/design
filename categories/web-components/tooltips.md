---
layout: visual
title: Tooltips & Overlays
---

<p class="v-label">Tooltip</p>
<div class="v-demo">
  <div class="v-comp-demo" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2.5rem 1rem 1rem;">
    <div style="background: var(--color-foreground); color: var(--color-background); font-size: 0.75rem; padding: 0.375rem 0.75rem; border-radius: 0.375rem; position: relative;">
      Copy to clipboard
      <span style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 8px; height: 8px; background: var(--color-foreground);"></span>
    </div>
    <button class="v-btn v-btn-outline" style="margin-top: 0.25rem;">Hover me</button>
  </div>
</div>

<details class="v-details">
<summary>Documentation</summary>

# Tooltips & Overlays

Source files: `tooltip.tsx`, `hover-card.tsx`, `popover.tsx`

These three components form a hierarchy of non-modal overlay patterns, ranging from simple text hints to rich interactive content.

---

## Tooltip

**File:** `tooltip.tsx`
**Primitive:** `@radix-ui/react-tooltip`

Short, non-interactive text hint that appears on hover or focus. Tooltips should contain only plain text -- never interactive elements, images, or complex markup.

### Sub-components

| Component | Purpose |
|---|---|
| `TooltipProvider` | App-level context provider (wrap once near root) |
| `Tooltip` | Root (manages open state) |
| `TooltipTrigger` | Trigger element (supports `asChild`) |
| `TooltipContent` | Portaled text label |

### Props (TooltipProvider)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `delayDuration` | `number` | `300` | Milliseconds before tooltip opens on hover |
| `skipDelayDuration` | `number` | `0` | Time window for instant open after closing another tooltip |

### Props (TooltipContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Preferred placement side |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment along the side axis |
| `sideOffset` | `number` | `4` | Gap between trigger and tooltip |
| `collisionPadding` | `number` | -- | Padding from viewport edge for collision detection |
| `avoidCollisions` | `boolean` | `true` | Flips/shifts to stay in viewport |

### Token usage

- `bg-primary`, `text-primary-foreground` (content surface)
- `text-xs` (font size)
- `rounded-md` (border radius)
- `px-3 py-1.5` (padding)
- Animations: `fade-in/out`, `zoom-in/out-95`

### Positioning & collision detection

Radix handles collision detection automatically. When the tooltip would overflow the viewport, it flips to the opposite side or shifts along the axis. The `collisionPadding` prop adds a buffer zone from the viewport edge.

### Content guidelines

- Keep text to a single line or at most two short lines
- Never include links, buttons, or interactive content
- Use for supplementary information, not essential content
- Good: "Copy to clipboard", "Edit settings", "Last updated 2 hours ago"
- Bad: Multi-paragraph descriptions, form fields, clickable links

---

## HoverCard

**File:** `hover-card.tsx`
**Primitive:** `@radix-ui/react-hover-card`

Rich preview card that appears on hover. Suitable for user profiles, link previews, or content summaries. Non-interactive content only -- users cannot reliably click into hover-triggered surfaces.

### Sub-components

| Component | Purpose |
|---|---|
| `HoverCard` | Root (manages open state) |
| `HoverCardTrigger` | Trigger element (supports `asChild`) |
| `HoverCardContent` | Portaled content panel (`w-64 p-4 rounded-md`) |

### Props (HoverCard)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `openDelay` | `number` | `700` | Milliseconds before card opens on hover |
| `closeDelay` | `number` | `300` | Milliseconds before card closes when cursor leaves |

### Props (HoverCardContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred placement side |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment along the side axis |
| `sideOffset` | `number` | `4` | Gap between trigger and card |
| `avoidCollisions` | `boolean` | `true` | Flips/shifts to stay in viewport |

### Token usage

- `bg-popover`, `text-popover-foreground` (content surface)
- `shadow-md` (elevation)
- `border` (default border color)
- `z-50` (overlay stacking)
- `rounded-md` (border radius)
- Animations: `fade-in/out`, `zoom-in/out-95`, `slide-in-from-*`

### Content guidelines

- Richer than tooltips: can include avatars, metadata, short descriptions
- Content should be read-only -- no buttons, form fields, or links
- If users need to interact with the content, use a Popover instead
- Good: user profile preview (avatar + name + role), link preview (title + description)
- Bad: edit forms, action buttons, navigation links

---

## Popover

**File:** `popover.tsx`
**Primitive:** `@radix-ui/react-popover`

Click-triggered floating panel for interactive content. The most versatile overlay -- supports forms, menus, and any rich content.

### Sub-components

| Component | Purpose |
|---|---|
| `Popover` | Root (manages open state) |
| `PopoverTrigger` | Trigger element (supports `asChild`) |
| `PopoverContent` | Portaled content panel (`w-72 p-4 rounded-md`) |
| `PopoverAnchor` | Optional anchor element for positioning |

### Props (PopoverContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred placement side |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment along the side axis |
| `sideOffset` | `number` | `4` | Gap between trigger and popover |
| `collisionPadding` | `number` | -- | Padding from viewport edge for collision detection |
| `avoidCollisions` | `boolean` | `true` | Flips/shifts to stay in viewport |

### Token usage

- `bg-popover`, `text-popover-foreground` (content surface)
- `shadow-md` (elevation)
- `border` (default border color)
- `z-50` (overlay stacking)
- `rounded-md` (border radius)
- Focus ring: `ring-ring/50`
- Animations: `fade-in/out`, `zoom-in/out-95`, `slide-in-from-*`

### Trigger behavior

- **Popover:** Click to open, click trigger again or click outside to close
- **Tooltip:** Hover/focus to open, leave to close
- **HoverCard:** Hover to open (with delay), leave to close (with delay)

Never mix trigger behaviors -- a tooltip should never require a click, and a popover should never open on hover.

### Content guidelines

- Can contain any interactive content: forms, buttons, links, selectors
- Keep focused on a single task or decision
- Good: date picker, color picker, filter controls, share options
- Bad: full page forms (use a Dialog), multi-step wizards (use a Sheet)

---

## Choosing between Tooltip, HoverCard, and Popover

| Criteria | Tooltip | HoverCard | Popover |
|---|---|---|---|
| Trigger | Hover / focus | Hover | Click |
| Content | Plain text only | Rich read-only content | Rich interactive content |
| Interactive elements | Never | Never | Yes |
| Open delay | ~300ms | ~700ms | Instant |
| z-index | `z-50` | `z-50` | `z-50` |
| Shadow | none | `shadow-md` | `shadow-md` |
| Dismissal | Cursor/focus leave | Cursor leave (with close delay) | Click outside, Escape, or explicit close |
| Accessibility | `role="tooltip"` | Supplementary | Focus-trapped when interactive |

### Exports

- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`
- `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`

</details>
