# Feedback

Source files: `alert.tsx`, `alert-dialog.tsx`, `dialog.tsx`, `draggable-dialog.tsx`, `sheet.tsx`, `popover.tsx`, `hover-card.tsx`, `sonner.tsx`

Note: `toast.tsx` and `toaster.tsx` do not exist in the current Patina build. Toast functionality is provided by Sonner.

---

## Alert

**File:** `alert.tsx`
**CVA:** `alertVariants`

Inline notification banner with optional icon.

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Alert` | Container with `role="alert"` | CSS Grid: `grid-cols-[calc(var(--spacing)*4)_1fr]` when icon present |
| `AlertTitle` | Heading | `font-medium tracking-tight` |
| `AlertDescription` | Body text | `text-muted-foreground text-sm` |

### Variants

| Variant | Token classes |
|---|---|
| `default` | `bg-card text-card-foreground` |
| `destructive` | `text-destructive bg-card` (description: `text-destructive/90`) |

---

## AlertDialog

**File:** `alert-dialog.tsx`
**Primitive:** `@radix-ui/react-alert-dialog`

Modal confirmation dialog. No dismiss-on-overlay-click (forces explicit action).

### Sub-components

| Component | Purpose |
|---|---|
| `AlertDialog` | Root |
| `AlertDialogTrigger` | Trigger |
| `AlertDialogContent` | Centered modal (`max-w-lg`, portaled with overlay) |
| `AlertDialogHeader` | Title + description container |
| `AlertDialogFooter` | Action buttons container (flex-row on desktop, flex-col-reverse on mobile) |
| `AlertDialogTitle` | `text-lg font-semibold` |
| `AlertDialogDescription` | `text-muted-foreground text-sm` |
| `AlertDialogAction` | Confirm button (uses `buttonVariants()` -- default variant) |
| `AlertDialogCancel` | Cancel button (uses `buttonVariants({ variant: "outline" })`) |
| `AlertDialogOverlay` | `bg-black/50` backdrop |
| `AlertDialogPortal` | Portal wrapper |

### Token usage

- `bg-background` (content)
- `bg-black/50` (overlay)
- Animations: `fade-in/out`, `zoom-in/out-95`

---

## Dialog

**File:** `dialog.tsx`
**Primitive:** `@radix-ui/react-dialog`

General-purpose modal dialog with close button.

### Sub-components

| Component | Purpose |
|---|---|
| `Dialog` | Root |
| `DialogTrigger` | Trigger |
| `DialogClose` | Close primitive |
| `DialogContent` | Centered modal with `X` close button (`max-w-lg`) |
| `DialogHeader` | Title area |
| `DialogFooter` | Action area |
| `DialogTitle` | `text-lg font-semibold` |
| `DialogDescription` | `text-muted-foreground text-sm` |
| `DialogOverlay` | `bg-black/50` backdrop |
| `DialogPortal` | Portal wrapper |

### Token usage

- `bg-background` (content)
- `bg-black/50` (overlay)
- `ring-offset-background`, `ring` (close button focus)
- `bg-accent`, `text-muted-foreground` (close button open state)

---

## DraggableDialog

**File:** `draggable-dialog.tsx`
**Primitive:** `@radix-ui/react-dialog` (uses `forwardRef` pattern)

Dialog that can be repositioned by dragging a handle element. Supports maximize/restore.

### Sub-components

| Component | Purpose |
|---|---|
| `DraggableDialog` | Root |
| `DraggableDialogTrigger` | Trigger |
| `DraggableDialogClose` | Close primitive |
| `DraggableDialogContent` | Draggable + maximizable modal |
| `DraggableDialogHeader` | Drag handle (has `data-drag-handle`, `cursor-grab`) |
| `DraggableDialogFooter` | Action area |
| `DraggableDialogTitle` | `text-lg font-semibold select-none` |
| `DraggableDialogDescription` | `text-muted-foreground text-sm` |
| `DraggableDialogOverlay` | `bg-black/80` backdrop |
| `DraggableDialogPortal` | Portal wrapper |

### Props (DraggableDialogContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `dragHandle` | CSS selector string | `"[data-drag-handle]"` | Identifies draggable area |
| `maximizable` | `boolean` | `false` | Shows maximize/minimize button |

### Behavior

- Drag position stored in a ref (no re-renders during drag)
- Maximize toggles to `100vw-2rem` x `100vh-2rem`
- Stored position is restored on un-maximize
- Disables text selection and sets `cursor: grabbing` during drag

---

## Sheet

**File:** `sheet.tsx`
**Primitive:** Radix `Dialog` (used as sheet)

Slide-in panel from any edge.

### Sub-components

| Component | Purpose |
|---|---|
| `Sheet` | Root |
| `SheetTrigger` | Trigger |
| `SheetClose` | Close primitive |
| `SheetContent` | Slide-in panel with close button |
| `SheetHeader` | Header area (`p-4`) |
| `SheetFooter` | Footer area (`mt-auto p-4`) |
| `SheetTitle` | `font-semibold` |
| `SheetDescription` | `text-muted-foreground text-sm` |

### SheetContent props

| Prop | Type | Default |
|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` |
| `showCloseButton` | `boolean` | `true` |

### Dimensions by side

| Side | Dimensions |
|---|---|
| `right` / `left` | `w-3/4 sm:max-w-sm h-full` |
| `top` / `bottom` | `w-full h-auto` |

### Hook: `useSheet()`

From `SheetProvider`: returns `{ state, open, setOpen }`.

### Token usage

- `bg-background` (content)
- `bg-black/50` (overlay)
- `ring-offset-background`, `ring` (close button focus)
- Slide animations: `slide-in-from-right`, `slide-out-to-left`, etc.
- Transition: `duration-300` close, `duration-500` open

---

## Popover

**File:** `popover.tsx`
**Primitive:** `@radix-ui/react-popover`

### Sub-components

| Component | Purpose |
|---|---|
| `Popover` | Root |
| `PopoverTrigger` | Trigger |
| `PopoverContent` | Portaled content (`w-72 p-4 rounded-md`) |
| `PopoverAnchor` | Anchor element |

### Props (PopoverContent)

| Prop | Type | Default |
|---|---|---|
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `sideOffset` | `number` | `4` |

### Token usage

- `bg-popover`, `text-popover-foreground` (content)
- Animations: `fade-in/out`, `zoom-in/out-95`, `slide-in-from-*`

---

## HoverCard

**File:** `hover-card.tsx`
**Primitive:** `@radix-ui/react-hover-card`

### Sub-components

| Component | Purpose |
|---|---|
| `HoverCard` | Root |
| `HoverCardTrigger` | Trigger |
| `HoverCardContent` | Portaled content (`w-64 p-4 rounded-md`) |

### Token usage

Same pattern as Popover: `bg-popover`, `text-popover-foreground`. Same animations.

---

## Sonner (Toast)

**File:** `sonner.tsx`
**Primitive:** `sonner` library (`Toaster` component)
**Dependencies:** `next-themes`

Global toast provider. Theme-aware (reads `useTheme()`).

### Icons

| Type | Icon |
|---|---|
| `success` | `CircleCheckIcon` |
| `info` | `InfoIcon` |
| `warning` | `TriangleAlertIcon` |
| `error` | `OctagonXIcon` |
| `loading` | `Loader2Icon` (with `animate-spin`) |

### Token usage (via CSS custom properties)

| CSS variable | Maps to |
|---|---|
| `--normal-bg` | `var(--popover)` |
| `--normal-text` | `var(--popover-foreground)` |
| `--normal-border` | `var(--border)` |
| `--border-radius` | `var(--radius)` |
