---
layout: visual
title: Toasts
---

<p class="v-label">Toast Variants</p>
<div class="v-demo">
  <div class="v-comp-demo" style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 22rem; margin: 0 auto;">
    <div class="v-toast">
      <span style="font-size: 0.875rem;">Event has been created</span>
    </div>
    <div class="v-toast">
      <span class="v-toast-icon" style="color: #22c55e;">&#9679;</span>
      <span style="font-size: 0.875rem;">Saved successfully</span>
    </div>
    <div class="v-toast">
      <span class="v-toast-icon" style="color: #ef4444;">&#9679;</span>
      <span style="font-size: 0.875rem;">Something went wrong</span>
    </div>
    <div class="v-toast">
      <span class="v-toast-icon" style="color: #eab308;">&#9679;</span>
      <span style="font-size: 0.875rem;">Check your connection</span>
    </div>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Toasts

Source file: `sonner.tsx`

Note: `toast.tsx` and `toaster.tsx` do not exist in the current Patina build. Toast functionality is provided entirely by the Sonner library.

---

## Sonner (Toast)

**File:** `sonner.tsx`
**Primitive:** `sonner` library (`Toaster` component)
**Dependencies:** `next-themes`

Global toast notification provider. Theme-aware -- reads the current theme from `useTheme()` and passes it to Sonner for automatic light/dark styling.

### Setup

The `Toaster` component should be rendered once at the application root (typically in a layout file). It acts as the portal target for all toast notifications.

```tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

Toasts are triggered imperatively via the `toast()` function from the `sonner` package:

```tsx
import { toast } from "sonner"

toast("Event has been created")
toast.success("Saved successfully")
toast.error("Something went wrong")
```

### Severity variants

| Variant | Icon | Usage |
|---|---|---|
| `default` | None | General notifications, neutral information |
| `success` | `CircleCheckIcon` | Confirmations, completed actions |
| `error` | `OctagonXIcon` | Failures, validation errors |
| `warning` | `TriangleAlertIcon` | Caution states, non-blocking issues |
| `info` | `InfoIcon` | Contextual information, tips |
| `loading` | `Loader2Icon` (`animate-spin`) | In-progress operations |

### Placement

| Property | Value |
|---|---|
| Default position | Bottom-right |
| Configurable | Via `position` prop on `Toaster` |
| Available positions | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` |

### Duration and auto-dismiss

| Property | Value |
|---|---|
| Default duration | 4000ms (4 seconds) |
| Configurable | Via `duration` prop on `Toaster` or per-toast via `toast("msg", { duration: 5000 })` |
| Persistent | Set `duration: Infinity` for toasts that require manual dismissal |
| Hover behavior | Auto-dismiss timer pauses on hover |

### Stacking

Multiple toasts stack vertically from the placement edge. Newer toasts appear closest to the edge, pushing older toasts further away. Sonner collapses older toasts visually to reduce screen usage.

### Animation

| State | Animation |
|---|---|
| Enter | Slide-in from placement edge + fade-in |
| Exit (dismiss) | Slide-out toward placement edge + fade-out |
| Exit (swipe) | Swipe-to-dismiss in the direction of the gesture |

Animations are handled internally by Sonner and use CSS transforms for smooth 60fps transitions.

### Dismiss behavior

| Trigger | Behavior |
|---|---|
| Auto-dismiss | After `duration` elapses (default 4000ms) |
| Close button | Visible on hover, dismisses the toast |
| Swipe | Swipe toward the edge to dismiss |
| Programmatic | `toast.dismiss(toastId)` |

### Action buttons

Toasts support an optional action button and cancel button:

```tsx
toast("File deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreFile(),
  },
})
```

Action buttons inherit button styling from the Sonner theme configuration.

### Accessibility

| Attribute | Value | Notes |
|---|---|---|
| `role` | `"status"` | Toasts are status messages, not alerts |
| `aria-live` | `"polite"` | Screen readers announce toasts without interrupting current task |
| `aria-atomic` | `"true"` | Entire toast is read as a single unit |

For error toasts that require immediate attention, Sonner uses `role="alert"` and `aria-live="assertive"` to interrupt the screen reader.

### Token usage (via CSS custom properties)

Sonner maps Patina semantic tokens to its internal CSS custom properties:

| CSS variable | Maps to | Purpose |
|---|---|---|
| `--normal-bg` | `var(--popover)` | Toast background |
| `--normal-text` | `var(--popover-foreground)` | Toast text color |
| `--normal-border` | `var(--border)` | Toast border |
| `--border-radius` | `var(--radius)` | Toast corner radius |

The toast surface uses the `popover` / `popover-foreground` semantic pair, consistent with other floating elements (Popover, HoverCard, DropdownMenu).

### Icons token usage

| Icon state | Token classes |
|---|---|
| `success` | `CircleCheckIcon` with Sonner default success color |
| `error` | `OctagonXIcon` with Sonner default error color |
| `warning` | `TriangleAlertIcon` with Sonner default warning color |
| `info` | `InfoIcon` with Sonner default info color |
| `loading` | `Loader2Icon` with `animate-spin` (uses `duration.spin` -- 800ms) |

### Exports

- `Toaster` -- the global toast provider component (place once at app root)

Toast triggering is done via the `toast` function exported from the `sonner` package directly, not from the Patina component file.

</details>
