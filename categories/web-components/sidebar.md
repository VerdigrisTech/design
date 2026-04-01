---
layout: visual
title: Sidebar
---

<p class="v-label">Sidebar Navigation</p>
<div class="v-demo">
  <div class="v-comp-demo" style="display: flex;">
    <div style="width: 14rem; background: var(--color-sidebar-background, var(--color-muted)); border-right: 1px solid var(--color-border); padding: 0.75rem 0; display: flex; flex-direction: column; gap: 0.125rem; min-height: 14rem;">
      <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 500; color: var(--color-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">Main</div>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; background: var(--color-accent); border-radius: 0.375rem; margin: 0 0.5rem;">
        <span style="opacity: 0.7;">&#9776;</span> Dashboard
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0.5rem;">
        <span style="opacity: 0.7;">&#9881;</span> Settings
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0.5rem;">
        <span style="opacity: 0.7;">&#128100;</span> Users
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0.5rem;">
        <span style="opacity: 0.7;">&#128202;</span> Analytics
      </div>
    </div>
  </div>
</div>

<details class="v-details">
<summary>Documentation</summary>

# Sidebar

Source files: `sidebar.tsx`

The largest component in the Patina library. Provides a full application sidebar with desktop and mobile layouts, collapsed states, nested menus, and keyboard shortcuts.

---

## Architecture

The sidebar uses a context-driven architecture. `SidebarProvider` manages all state and distributes it to child components. The sidebar is never rendered in isolation -- it always lives inside a provider.

```
SidebarProvider
  +-- Sidebar (the panel itself)
  |     +-- SidebarHeader
  |     +-- SidebarContent (scrollable)
  |     |     +-- SidebarGroup(s)
  |     |           +-- SidebarGroupLabel
  |     |           +-- SidebarGroupContent
  |     |                 +-- SidebarMenu
  |     |                       +-- SidebarMenuItem(s)
  |     |                             +-- SidebarMenuButton
  |     +-- SidebarFooter
  |     +-- SidebarRail
  +-- SidebarInset (main content area)
```

---

## Core components

| Component | Purpose |
|---|---|
| `SidebarProvider` | Context provider. Manages open/collapsed state, persists to cookie, keyboard shortcut (`Cmd+B` / `Ctrl+B`) |
| `Sidebar` | Root sidebar panel |
| `SidebarTrigger` | Toggle button (renders `PanelLeftIcon`) |
| `SidebarRail` | Thin drag rail at the sidebar edge for toggling |
| `SidebarInset` | Main content area beside the sidebar |

## Structure components

| Component | Purpose | Key classes |
|---|---|---|
| `SidebarHeader` | Top section | `p-2` |
| `SidebarContent` | Scrollable middle area | `overflow-auto` |
| `SidebarFooter` | Bottom section | `p-2` |
| `SidebarSeparator` | Divider | Uses `Separator` primitive |
| `SidebarInput` | Styled search input | `bg-background`, focus ring |
| `SidebarGroup` | Logical section container | -- |
| `SidebarGroupLabel` | Section heading | `text-sidebar-foreground/70 text-xs font-medium` |
| `SidebarGroupAction` | Section action button | -- |
| `SidebarGroupContent` | Section body | -- |

## Menu components

| Component | Purpose |
|---|---|
| `SidebarMenu` / `SidebarMenuItem` | Menu list and items |
| `SidebarMenuButton` | Interactive menu item (supports CVA variants, tooltip in collapsed state) |
| `SidebarMenuAction` | Hover-reveal action button on a menu item |
| `SidebarMenuBadge` | Badge on a menu item |
| `SidebarMenuSkeleton` | Loading placeholder with optional icon slot |
| `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` | Nested sub-menu |

---

## Sidebar props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `side` | `"left" \| "right"` | `"left"` | Which edge the sidebar appears on |
| `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` | Visual style (see variants below) |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | Collapse behavior |

### Variants

| Variant | Description | Visual treatment |
|---|---|---|
| `sidebar` | Default flush sidebar | No shadow, bordered, flush with viewport edge |
| `floating` | Detached from edge with gap | `shadow-sm`, `rounded-lg`, `border-sidebar-border` |
| `inset` | Recessed into the content area | `bg-background` on inset area, no sidebar shadow |

### Collapsible modes

| Mode | Description |
|---|---|
| `offcanvas` | Sidebar slides fully off-screen when collapsed |
| `icon` | Sidebar shrinks to icon-only width (`--sidebar-width-icon: 3rem`) |
| `none` | Sidebar cannot be collapsed |

---

## SidebarMenuButton variants (CVA)

| Variant | Options |
|---|---|
| `variant` | `default`, `outline` |
| `size` | `default` (`h-8`), `sm` (`h-7 text-xs`), `lg` (`h-12 text-sm group-data-[collapsible=icon]:p-0`) |

---

## CSS custom properties

| Variable | Default | Notes |
|---|---|---|
| `--sidebar-width` | `16rem` | Desktop expanded width |
| `--sidebar-width-icon` | `3rem` | Icon-only collapsed width |
| `--sidebar-width` (mobile) | `18rem` | Mobile sheet width (slightly wider for touch) |

---

## Responsive behavior

### Desktop (above mobile breakpoint)

- Sidebar renders as a fixed panel alongside the content
- Collapsed state controlled by `collapsible` prop
- Toggle via `SidebarTrigger` or keyboard shortcut `Cmd+B` / `Ctrl+B`
- State persisted to a cookie (`sidebar_state`) so it survives page loads

### Mobile (below mobile breakpoint)

- Sidebar renders inside a `Sheet` component (slide-in overlay)
- Triggered by `SidebarTrigger` (no keyboard shortcut on mobile)
- Full `--sidebar-width` (18rem) sheet panel
- Overlay with `bg-black/50` backdrop
- Closed by tapping outside or pressing the close button

### Icon-only collapsed state

When `collapsible="icon"`:

- Sidebar width transitions to `--sidebar-width-icon` (3rem)
- Menu item text is hidden; only icons remain visible
- `SidebarMenuButton` shows a `Tooltip` with the item label on hover
- Group labels are hidden (`sr-only`)
- Sub-menus are hidden
- `SidebarMenuAction` buttons are hidden

---

## Token usage

- **Surface:** `bg-sidebar`, `text-sidebar-foreground`
- **Active/hover items:** `bg-sidebar-accent`, `text-sidebar-accent-foreground`
- **Borders:** `border-sidebar-border`
- **Focus ring:** `ring-sidebar-ring`
- **Inset & input background:** `bg-background`
- **z-index:** `z-10` (raised, above content but below modals)
- **Shadow:** `shadow-sm` (floating variant only)
- **Mobile overlay:** `bg-black/50` (via Sheet)

### Sidebar-specific color tokens

The sidebar uses its own set of semantic color tokens, separate from the global palette. This allows the sidebar to maintain a distinct visual identity (e.g., darker background) without affecting other surfaces.

| Token | Purpose |
|---|---|
| `sidebar-background` | Sidebar panel background |
| `sidebar-foreground` | Default text color within the sidebar |
| `sidebar-accent` | Background for active/hovered menu items |
| `sidebar-accent-foreground` | Text color for active/hovered menu items |
| `sidebar-border` | Border color for sidebar edges and floating variant |
| `sidebar-ring` | Focus ring color within the sidebar |
| `sidebar-primary` | Primary action color within the sidebar |
| `sidebar-primary-foreground` | Text on primary actions within the sidebar |

---

## Hook: `useSidebar()`

Returns the full sidebar context:

| Property | Type | Description |
|---|---|---|
| `state` | `"expanded" \| "collapsed"` | Current sidebar state |
| `open` | `boolean` | Whether sidebar is open (desktop) |
| `setOpen` | `(open: boolean) => void` | Set desktop open state |
| `openMobile` | `boolean` | Whether sidebar is open (mobile) |
| `setOpenMobile` | `(open: boolean) => void` | Set mobile open state |
| `isMobile` | `boolean` | Whether viewport is below mobile breakpoint |
| `toggleSidebar` | `() => void` | Toggle sidebar (works for both desktop and mobile) |

---

## Data attributes

- `data-slot="sidebar"`, `data-slot="sidebar-trigger"`, `data-slot="sidebar-rail"`
- `data-slot="sidebar-header"`, `data-slot="sidebar-content"`, `data-slot="sidebar-footer"`
- `data-slot="sidebar-menu"`, `data-slot="sidebar-menu-button"`, `data-slot="sidebar-menu-action"`
- `data-state="expanded"` / `data-state="collapsed"` on `SidebarProvider`
- `data-collapsible="offcanvas" | "icon" | "none"` on `Sidebar`
- `data-side="left" | "right"` on `Sidebar`
- `data-variant="sidebar" | "floating" | "inset"` on `Sidebar`

---

## Exports

- `SidebarProvider` -- context provider (wrap at layout level)
- `Sidebar` -- root panel
- `SidebarTrigger` -- toggle button
- `SidebarRail` -- drag rail
- `SidebarInset` -- main content area
- `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarSeparator`
- `SidebarInput`
- `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`
- `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`
- `useSidebar` -- context hook

</details>
