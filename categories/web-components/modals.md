# Modals

Source files: `dialog.tsx`, `alert-dialog.tsx`, `draggable-dialog.tsx`, `sheet.tsx`

This guide covers overlay patterns shared by all modal components: focus trapping, dismiss behavior, z-index layering, and animation. For inline alerts (non-modal), see [Feedback](feedback.md).

---

## Dialog

**File:** `dialog.tsx`
**Primitive:** `@radix-ui/react-dialog`

General-purpose modal dialog with a close button. Dismisses on Escape key or backdrop click.

### Sub-components

| Component | Purpose |
|---|---|
| `Dialog` | Root (controlled via `open` / `onOpenChange`) |
| `DialogTrigger` | Trigger element |
| `DialogClose` | Close primitive |
| `DialogContent` | Centered modal with `X` close button |
| `DialogHeader` | Title area |
| `DialogFooter` | Action area (flex-row on desktop, flex-col-reverse on mobile) |
| `DialogTitle` | `text-lg font-semibold` |
| `DialogDescription` | `text-muted-foreground text-sm` |
| `DialogOverlay` | `bg-black/50` backdrop |
| `DialogPortal` | Portal wrapper |

### Sizes

| Constraint | Value |
|---|---|
| Max width | `max-w-lg` (default) |
| Padding | `p-6` |
| Gap | `gap-4` (between header/body/footer) |

### Dismiss behavior

| Trigger | Behavior |
|---|---|
| Escape key | Closes dialog |
| Backdrop click | Closes dialog |
| Close button (`X`) | Closes dialog |
| Programmatic | `onOpenChange(false)` |

### Animation

| State | Animation |
|---|---|
| Overlay enter | `fade-in` (`duration.normal` -- 200ms) |
| Overlay exit | `fade-out` (`duration.normal` -- 200ms) |
| Content enter | `fade-in` + `zoom-in-95` |
| Content exit | `fade-out` + `zoom-out-95` |

### Accessibility

- `aria-modal="true"` (set by Radix primitive)
- `aria-labelledby` auto-linked to `DialogTitle`
- `aria-describedby` auto-linked to `DialogDescription`
- Focus trapped within dialog while open
- Focus returns to trigger on close

### Token usage

- `bg-background` (content surface)
- `bg-black/50` (overlay)
- `ring-offset-background`, `ring` (close button focus)
- `bg-accent`, `text-muted-foreground` (close button hover/open state)
- `shadow-lg` (`shadow.lg`)
- `z-50` (`zIndex.overlay`)

### Exports

- `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`
- `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- `DialogOverlay`, `DialogPortal`

---

## AlertDialog

**File:** `alert-dialog.tsx`
**Primitive:** `@radix-ui/react-alert-dialog`

Modal confirmation dialog for destructive or irreversible actions. Unlike Dialog, it does **not** dismiss on backdrop click -- forces an explicit user action.

### Sub-components

| Component | Purpose |
|---|---|
| `AlertDialog` | Root |
| `AlertDialogTrigger` | Trigger |
| `AlertDialogContent` | Centered modal (`max-w-lg`, portaled with overlay) |
| `AlertDialogHeader` | Title + description container |
| `AlertDialogFooter` | Action buttons (flex-row on desktop, flex-col-reverse on mobile) |
| `AlertDialogTitle` | `text-lg font-semibold` |
| `AlertDialogDescription` | `text-muted-foreground text-sm` |
| `AlertDialogAction` | Confirm button (uses `buttonVariants()` -- default variant) |
| `AlertDialogCancel` | Cancel button (uses `buttonVariants({ variant: "outline" })`) |
| `AlertDialogOverlay` | `bg-black/50` backdrop |
| `AlertDialogPortal` | Portal wrapper |

### Dismiss behavior

| Trigger | Behavior |
|---|---|
| Escape key | Closes dialog (triggers cancel) |
| Backdrop click | **Does not close** -- user must choose an action |
| Action button | Closes dialog, fires action callback |
| Cancel button | Closes dialog |

### Animation

Same as Dialog: `fade-in/out` overlay, `zoom-in/out-95` content.

### Accessibility

- `role="alertdialog"` (set by Radix primitive)
- `aria-modal="true"`
- `aria-labelledby` auto-linked to `AlertDialogTitle`
- `aria-describedby` auto-linked to `AlertDialogDescription`
- Focus trapped -- initial focus goes to Cancel button by default
- Focus returns to trigger on close

### Token usage

- `bg-background` (content surface)
- `bg-black/50` (overlay)
- `shadow-lg` (`shadow.lg`)
- `z-50` (`zIndex.overlay`)
- Action button inherits `primary`, `primary-foreground`
- Cancel button inherits `outline` variant tokens (`border`, `bg-background`, `shadow-xs`)

### Exports

- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`
- `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`
- `AlertDialogAction`, `AlertDialogCancel`
- `AlertDialogOverlay`, `AlertDialogPortal`

---

## DraggableDialog

**File:** `draggable-dialog.tsx`
**Primitive:** `@radix-ui/react-dialog` (uses `forwardRef` pattern)

Dialog that can be repositioned by dragging a handle element. Supports maximize/restore toggle.

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
| `DraggableDialogOverlay` | `bg-black/80` backdrop (darker than standard dialog) |
| `DraggableDialogPortal` | Portal wrapper |

### Props (DraggableDialogContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `dragHandle` | CSS selector string | `"[data-drag-handle]"` | Identifies draggable area |
| `maximizable` | `boolean` | `false` | Shows maximize/minimize button |

### Drag behavior

- Drag position stored in a ref (no re-renders during drag)
- Maximize toggles to `100vw-2rem` x `100vh-2rem`
- Stored position is restored on un-maximize
- Disables text selection and sets `cursor: grabbing` during drag

### Dismiss behavior

| Trigger | Behavior |
|---|---|
| Escape key | Closes dialog |
| Backdrop click | Closes dialog |
| Close button (`X`) | Closes dialog |

### Accessibility

- Same ARIA pattern as Dialog (`aria-modal`, `aria-labelledby`, `aria-describedby`)
- Focus trapped within dialog
- Drag handle uses `cursor-grab` / `cursor-grabbing` to communicate interaction affordance
- Title has `select-none` to prevent accidental text selection during drag

### Token usage

- `bg-background` (content surface)
- `bg-black/80` (overlay -- intentionally darker to provide more contrast for draggable content)
- `ring-offset-background`, `ring` (close button focus)
- `shadow-lg` (`shadow.lg`)
- `z-50` (`zIndex.overlay`)

### Exports

- `DraggableDialog`, `DraggableDialogTrigger`, `DraggableDialogClose`, `DraggableDialogContent`
- `DraggableDialogHeader`, `DraggableDialogFooter`, `DraggableDialogTitle`, `DraggableDialogDescription`
- `DraggableDialogOverlay`, `DraggableDialogPortal`

---

## Sheet

**File:** `sheet.tsx`
**Primitive:** Radix `Dialog` (used as sheet)

Slide-in panel from any edge. Used for side panels, mobile navigation, and secondary workflows.

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

### Props (SheetContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Edge the sheet slides in from |
| `showCloseButton` | `boolean` | `true` | Show/hide the close button |

### Dimensions by side

| Side | Dimensions |
|---|---|
| `right` / `left` | `w-3/4 sm:max-w-sm h-full` |
| `top` / `bottom` | `w-full h-auto` |

### Animation

| State | Animation |
|---|---|
| Overlay enter | `fade-in` |
| Overlay exit | `fade-out` |
| Content enter | `slide-in-from-{side}` (`duration.slow` -- 500ms) |
| Content exit | `slide-out-to-{side}` (`duration.moderate` -- 300ms) |

Slide direction matches the `side` prop: `slide-in-from-right`, `slide-in-from-left`, `slide-in-from-top`, `slide-in-from-bottom`.

### Dismiss behavior

| Trigger | Behavior |
|---|---|
| Escape key | Closes sheet |
| Backdrop click | Closes sheet |
| Close button (`X`) | Closes sheet |
| Programmatic | `onOpenChange(false)` or `useSheet().setOpen(false)` |

### Hook: `useSheet()`

From `SheetProvider`: returns `{ state, open, setOpen }`.

### Accessibility

- `aria-modal="true"` (inherited from Radix Dialog)
- `aria-labelledby` auto-linked to `SheetTitle`
- `aria-describedby` auto-linked to `SheetDescription`
- Focus trapped within sheet while open
- Focus returns to trigger on close

### Token usage

- `bg-background` (content surface)
- `bg-black/50` (overlay)
- `ring-offset-background`, `ring` (close button focus)
- `shadow-lg` (`shadow.lg`)
- `z-50` (`zIndex.overlay`)
- Slide animations use Tailwind `animate-in` / `animate-out` with `slide-in-from-*` / `slide-out-to-*`

### Exports

- `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`
- `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`

---

## Shared overlay patterns

All modal components in this group share common overlay patterns:

### z-index layering

All modals render at `z-50` (`zIndex.overlay`). Both the overlay backdrop and the content itself use this layer to ensure they sit above all page content, sticky headers, and raised elements.

### Shadow

All modal content surfaces use `shadow-lg` (`shadow.lg`) for high elevation, visually separating them from the page beneath the overlay.

### Focus management

- **Focus trap:** Radix primitives automatically trap focus within the modal while open. Tab and Shift+Tab cycle through focusable elements without leaving the modal.
- **Initial focus:** First focusable element receives focus on open. AlertDialog focuses the Cancel button by default.
- **Restore focus:** Focus returns to the trigger element when the modal closes.

### Portal rendering

All modals render via a portal (appended to `document.body`) to avoid z-index and overflow clipping issues from parent containers.
