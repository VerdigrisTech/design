---
layout: visual
title: Command Palette
---

<p class="v-label">Command Palette</p>
<div class="v-demo">
  <div class="v-comp-demo" style="display: flex; justify-content: center; padding: 2rem;">
    <div class="v-card" style="width: 24rem; padding: 0; overflow: hidden;">
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border);">
        <span style="color: var(--color-muted-foreground);">&#128269;</span>
        <span style="font-size: 0.875rem; color: var(--color-muted-foreground);">Type a command or search...</span>
      </div>
      <div style="padding: 0.25rem 0;">
        <div style="padding: 0.25rem 0.5rem;">
          <div style="font-size: 0.75rem; font-weight: 500; color: var(--color-muted-foreground); padding: 0.375rem 0.5rem;">Pages</div>
          <div style="padding: 0.375rem 0.5rem; font-size: 0.875rem; border-radius: 0.25rem; background: var(--color-accent);">Dashboard</div>
          <div style="padding: 0.375rem 0.5rem; font-size: 0.875rem; border-radius: 0.25rem;">Settings</div>
          <div style="padding: 0.375rem 0.5rem; font-size: 0.875rem; border-radius: 0.25rem;">Team Members</div>
        </div>
      </div>
    </div>
  </div>
</div>

<details class="v-details">
<summary>Documentation</summary>

# Command Palette

Source files: `command.tsx`

---

## Command

**File:** `command.tsx`
**Primitive:** `cmdk` (`Command`)

Command palette and search interface. Can be used inline as an embedded search list or inside a dialog as a global command palette triggered by a keyboard shortcut.

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Command` | Root (`cmdk` wrapper) | `bg-popover text-popover-foreground rounded-lg border shadow-md` |
| `CommandDialog` | Wraps `Command` in a `Dialog` with sr-only title | `max-w-lg rounded-lg`, no padding (Command fills it) |
| `CommandInput` | Search input with `SearchIcon` | `h-12 border-b text-sm`, icon: `text-muted-foreground` |
| `CommandList` | Scrollable results container | `max-h-[300px] overflow-y-auto overflow-x-hidden` |
| `CommandEmpty` | Shown when no results match | `py-6 text-center text-sm text-muted-foreground` |
| `CommandGroup` | Result group with heading | Heading: `text-muted-foreground text-xs font-medium px-2 py-1.5` |
| `CommandItem` | Individual result row | `px-2 py-1.5 text-sm rounded-sm`, selected: `bg-accent text-accent-foreground` |
| `CommandShortcut` | Keyboard shortcut label | `text-muted-foreground text-xs ml-auto tracking-widest` |
| `CommandSeparator` | Visual divider between groups | `bg-border h-px` |
| `CommandLoading` | Loading indicator | Wraps `cmdk` loading primitive |

---

## CommandDialog

`CommandDialog` composes `Dialog` + `Command` into a single component for the global command palette pattern. It renders a centered modal overlay with the command search interface inside.

### Props (CommandDialog)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | -- | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Callback when open state changes |
| `title` | `string` | `"Command Palette"` | Screen-reader-only title (visually hidden) |
| `description` | `string` | `"Search for commands..."` | Screen-reader-only description (visually hidden) |

---

## Keyboard shortcut trigger

The standard pattern for triggering the command palette:

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen((prev) => !prev)
    }
  }
  document.addEventListener("keydown", handleKeyDown)
  return () => document.removeEventListener("keydown", handleKeyDown)
}, [])
```

- **macOS:** `Cmd+K`
- **Windows/Linux:** `Ctrl+K`
- The shortcut toggles the dialog (opens if closed, closes if open)
- Register the listener at the page or layout level, not inside the dialog

---

## Search and result ranking

`cmdk` provides built-in client-side fuzzy search. Results are automatically filtered and ranked as the user types.

### Default behavior

- Items are filtered by their `value` prop (or text content if no `value` is set)
- Filtering is case-insensitive substring matching
- Groups that have no matching items are automatically hidden
- `CommandEmpty` is shown only when zero items match across all groups

### Custom filtering

For server-side search or custom ranking, disable the built-in filter:

```tsx
<Command shouldFilter={false}>
  {/* Manage filtering externally */}
</Command>
```

### Result groups

Organize results into logical sections using `CommandGroup`:

```tsx
<CommandList>
  <CommandGroup heading="Pages">
    <CommandItem>Dashboard</CommandItem>
    <CommandItem>Settings</CommandItem>
  </CommandGroup>
  <CommandSeparator />
  <CommandGroup heading="Actions">
    <CommandItem>Create new project</CommandItem>
    <CommandItem>Invite team member</CommandItem>
  </CommandGroup>
</CommandList>
```

---

## States

### Empty state

When no results match the search query, `CommandEmpty` is displayed:

- Centered text: `py-6 text-center text-sm`
- Color: `text-muted-foreground`
- Typically reads "No results found." -- keep the message short and factual

### Loading state

Use `CommandLoading` to show a loading indicator during async search:

- Displayed inside `CommandList` alongside or instead of results
- Commonly shows a spinner or skeleton rows
- Should communicate that results are being fetched, not that the system is broken

### Selected state

The currently highlighted item (via keyboard navigation or hover):

- Background: `bg-accent`
- Text: `text-accent-foreground`
- First item is selected by default when the list opens

---

## Token usage

- **Surface:** `bg-popover`, `text-popover-foreground`
- **Selected item:** `bg-accent`, `text-accent-foreground`
- **Muted text:** `text-muted-foreground` (input placeholder, shortcuts, icons, group headings, empty state)
- **Separator:** `bg-border`
- **Input border:** `border-b` (default border color)
- **Dialog overlay:** `bg-black/50`
- **Dialog shadow:** `shadow-lg`
- **Command shadow (standalone):** `shadow-md`
- **z-index:** `z-50` (overlay stacking, via Dialog)
- **Border radius:** `rounded-lg` (command root and dialog)
- **Animations:** `fade-in/out`, `zoom-in/out-95` (dialog entrance/exit)

---

## Accessibility

### Roles and ARIA

- `Command` root renders with `role="combobox"` (via `cmdk`)
- The search input has `aria-expanded="true"` when the list is visible
- `aria-autocomplete="list"` on the input indicates filtering behavior
- `CommandList` is associated with the input via `aria-controls`
- Each `CommandItem` is selectable and announced by screen readers
- `CommandDialog` includes a visually hidden `DialogTitle` and `DialogDescription` for screen readers

### Keyboard navigation

| Key | Action |
|---|---|
| `ArrowDown` | Move selection to next item |
| `ArrowUp` | Move selection to previous item |
| `Enter` | Activate selected item |
| `Escape` | Close the dialog (when in `CommandDialog`) |
| `Cmd+K` / `Ctrl+K` | Open/close the dialog (when registered) |

- Focus is trapped inside the dialog when open
- When the dialog closes, focus returns to the element that triggered it
- Arrow keys wrap around from last item to first and vice versa

---

## Data attributes

- `data-slot="command"`, `data-slot="command-input"`, `data-slot="command-list"`
- `data-slot="command-empty"`, `data-slot="command-group"`, `data-slot="command-item"`
- `data-slot="command-shortcut"`, `data-slot="command-separator"`
- `data-selected` on the currently highlighted `CommandItem`
- `data-disabled` on disabled items
- `data-value` on each `CommandItem`

---

## Exports

- `Command` -- root wrapper
- `CommandDialog` -- dialog-wrapped command palette
- `CommandInput` -- search input
- `CommandList` -- scrollable result container
- `CommandEmpty` -- empty state
- `CommandGroup` -- result group
- `CommandItem` -- individual result
- `CommandShortcut` -- keyboard shortcut label
- `CommandSeparator` -- visual divider
- `CommandLoading` -- loading state

</details>
