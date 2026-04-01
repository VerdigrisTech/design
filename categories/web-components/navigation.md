---
layout: visual
title: Navigation
---

<p class="v-label">Horizontal Nav Bar</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div style="display: flex; align-items: center; gap: 1.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); width: 100%; font-size: 0.875rem;">
      <span style="font-weight: 600; margin-right: 1rem;">Verdigris</span>
      <a href="#" style="color: var(--color-foreground); font-weight: 500; text-decoration: none; border-bottom: 2px solid var(--color-foreground); padding-bottom: 0.25rem;">Dashboard</a>
      <a href="#" style="color: var(--color-muted-foreground); text-decoration: none;">Projects</a>
      <a href="#" style="color: var(--color-muted-foreground); text-decoration: none;">Team</a>
      <a href="#" style="color: var(--color-muted-foreground); text-decoration: none;">Settings</a>
    </div>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Navigation

Source files: `sidebar.tsx`, `tabs.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `command.tsx`, `dropdown-menu.tsx`

Note: `menubar.tsx`, `navigation-menu.tsx`, and `context-menu.tsx` do not exist in the current Patina build.

---

## Sidebar

**File:** `sidebar.tsx`
**Primitive:** Custom context + Radix Sheet (mobile)

The largest component in the library. Provides a full application sidebar with desktop/mobile layouts, collapsed states, and nested menus.

### Core components

| Component | Purpose |
|---|---|
| `SidebarProvider` | Context provider. Manages open/collapsed state, persists to cookie, keyboard shortcut (`Cmd+B`) |
| `Sidebar` | Root sidebar panel |
| `SidebarTrigger` | Toggle button (uses `PanelLeftIcon`) |
| `SidebarRail` | Thin drag rail for toggling |
| `SidebarInset` | Main content area beside the sidebar |

### Structure components

| Component | Purpose |
|---|---|
| `SidebarHeader` | Top section (`p-2`) |
| `SidebarContent` | Scrollable middle (`overflow-auto`) |
| `SidebarFooter` | Bottom section (`p-2`) |
| `SidebarSeparator` | Divider |
| `SidebarInput` | Styled search input |
| `SidebarGroup` | Logical section |
| `SidebarGroupLabel` | Section heading |
| `SidebarGroupAction` | Section action button |
| `SidebarGroupContent` | Section body |

### Menu components

| Component | Purpose |
|---|---|
| `SidebarMenu` / `SidebarMenuItem` | Menu list and items |
| `SidebarMenuButton` | Interactive menu item (supports CVA variants, tooltip) |
| `SidebarMenuAction` | Hover-reveal action on a menu item |
| `SidebarMenuBadge` | Badge on a menu item |
| `SidebarMenuSkeleton` | Loading placeholder |
| `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` | Nested sub-menu |

### Sidebar props

| Prop | Type | Default |
|---|---|---|
| `side` | `"left" \| "right"` | `"left"` |
| `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` |

### SidebarMenuButton variants (CVA)

| Variant | Options |
|---|---|
| `variant` | `default`, `outline` |
| `size` | `default` (`h-8`), `sm` (`h-7 text-xs`), `lg` (`h-12`) |

### CSS custom properties

| Variable | Default |
|---|---|
| `--sidebar-width` | `16rem` |
| `--sidebar-width-icon` | `3rem` |
| `--sidebar-width` (mobile) | `18rem` |

### Token usage

- `bg-sidebar`, `text-sidebar-foreground` (sidebar surface)
- `bg-sidebar-accent`, `text-sidebar-accent-foreground` (active/hover items)
- `border-sidebar-border` (borders, floating variant)
- `ring-sidebar-ring` (focus)
- `bg-background` (inset, input)

### Hook: `useSidebar()`

Returns `{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`.

---

## Tabs

**File:** `tabs.tsx`
**Primitive:** `@radix-ui/react-tabs`

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Tabs` | Root | `flex flex-col gap-2` |
| `TabsList` | Tab bar container | `bg-muted text-muted-foreground h-9 rounded-lg p-[3px]` |
| `TabsTrigger` | Individual tab button | Active: `bg-background shadow-sm` (dark: `bg-input/30`) |
| `TabsContent` | Panel | `flex-1 outline-none` |

### Token usage

- `bg-muted`, `text-muted-foreground` (inactive tab bar)
- `bg-background`, `text-foreground` (active tab, dark: `border-input bg-input/30`)
- Focus ring: `border-ring`, `ring-ring/50`

---

## Breadcrumb

**File:** `breadcrumb.tsx`
**Primitive:** Native `<nav>`, `<ol>`, `<li>`

### Sub-components

| Component | Purpose |
|---|---|
| `Breadcrumb` | `<nav aria-label="breadcrumb">` |
| `BreadcrumbList` | `<ol>` with flex-wrap, gap |
| `BreadcrumbItem` | `<li>` |
| `BreadcrumbLink` | `<a>` (supports `asChild`) |
| `BreadcrumbPage` | Current page (aria-current, non-interactive) |
| `BreadcrumbSeparator` | Defaults to `ChevronRight` icon |
| `BreadcrumbEllipsis` | `MoreHorizontal` icon for overflow |

### Token usage

- `text-muted-foreground` (list)
- `text-foreground` (current page, hover links)

---

## Pagination

**File:** `pagination.tsx`
**Primitive:** Native `<nav>`, `<ul>`, `<a>`
**Dependencies:** Uses `buttonVariants` from Button

### Sub-components

| Component | Purpose |
|---|---|
| `Pagination` | `<nav role="navigation" aria-label="pagination">` |
| `PaginationContent` | `<ul>` with gap |
| `PaginationItem` | `<li>` |
| `PaginationLink` | `<a>` styled as button. Active: `outline` variant; inactive: `ghost` |
| `PaginationPrevious` | Previous link (with `ChevronLeftIcon`) |
| `PaginationNext` | Next link (with `ChevronRightIcon`) |
| `PaginationEllipsis` | Overflow indicator (`MoreHorizontalIcon`) |

### Props (PaginationLink)

| Prop | Type | Default |
|---|---|---|
| `isActive` | `boolean` | -- |
| `size` | Button size | `"icon"` |

---

## Command

**File:** `command.tsx`
**Primitive:** `cmdk` (`Command`)

Command palette / search interface. Can be used standalone or inside a dialog.

### Sub-components

| Component | Purpose |
|---|---|
| `Command` | Root (`cmdk` wrapper) |
| `CommandDialog` | Wraps Command in a Dialog with sr-only title |
| `CommandInput` | Search input with `SearchIcon` |
| `CommandList` | Scrollable results (`max-h-[300px]`) |
| `CommandEmpty` | Empty state (`py-6 text-center`) |
| `CommandGroup` | Result group with heading |
| `CommandItem` | Individual result |
| `CommandShortcut` | Keyboard shortcut label |
| `CommandSeparator` | Visual divider |

### Token usage

- `bg-popover`, `text-popover-foreground` (surface)
- `bg-accent`, `text-accent-foreground` (selected item)
- `text-muted-foreground` (input placeholder, shortcut, icons)
- `bg-border` (separator)

---

## DropdownMenu

**File:** `dropdown-menu.tsx`
**Primitive:** Radix `DropdownMenu`

### Sub-components

| Component | Purpose |
|---|---|
| `DropdownMenu` | Root |
| `DropdownMenuTrigger` | Trigger element |
| `DropdownMenuContent` | Portaled dropdown panel (`sideOffset=4`) |
| `DropdownMenuGroup` | Logical group |
| `DropdownMenuItem` | Interactive item (supports `inset` and `variant`) |
| `DropdownMenuCheckboxItem` | Checkbox item with check indicator |
| `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` | Radio selection |
| `DropdownMenuLabel` | Non-interactive label (supports `inset`) |
| `DropdownMenuSeparator` | Divider |
| `DropdownMenuShortcut` | Keyboard shortcut text |
| `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` | Nested sub-menus |
| `DropdownMenuPortal` | Portal wrapper |

### DropdownMenuItem variants

| Prop | Type | Default |
|---|---|---|
| `variant` | `"default" \| "destructive"` | `"default"` |
| `inset` | `boolean` | -- |

Destructive variant: `text-destructive`, `focus:bg-destructive/10`.

### Token usage

- `bg-popover`, `text-popover-foreground` (content)
- `bg-accent`, `text-accent-foreground` (focused item)
- `text-destructive` (destructive variant)
- `text-muted-foreground` (icons, shortcuts)
- `bg-border` (separator)
- Animations: `fade-in/out`, `zoom-in/out-95`, `slide-in-from-*`

</details>
