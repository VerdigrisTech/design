---
layout: visual
title: Tables
---

<p class="v-label">Data Table</p>
<div class="v-demo">
  <div class="v-comp-demo" style="padding: 0; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
      <thead>
        <tr style="background: var(--color-muted, #f4f4f5); border-bottom: 1px solid var(--color-border, #e4e4e7);">
          <th style="text-align: left; padding: 0.625rem 0.75rem; font-weight: 600; color: var(--color-foreground, #1a1a1a);">Circuit</th>
          <th style="text-align: left; padding: 0.625rem 0.75rem; font-weight: 600; color: var(--color-foreground, #1a1a1a);">Location</th>
          <th style="text-align: right; padding: 0.625rem 0.75rem; font-weight: 600; color: var(--color-foreground, #1a1a1a);">Power (kW)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--color-border, #e4e4e7);">
          <td style="padding: 0.625rem 0.75rem;">HVAC-Main</td>
          <td style="padding: 0.625rem 0.75rem; color: var(--color-muted-foreground, #71717a);">Building A, Floor 2</td>
          <td style="padding: 0.625rem 0.75rem; text-align: right; font-variant-numeric: tabular-nums;">24.8</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--color-border, #e4e4e7); background: var(--color-muted, #f4f4f5); background: color-mix(in oklch, var(--color-muted, #f4f4f5) 40%, transparent);">
          <td style="padding: 0.625rem 0.75rem;">Lighting-East</td>
          <td style="padding: 0.625rem 0.75rem; color: var(--color-muted-foreground, #71717a);">Building A, Floor 1</td>
          <td style="padding: 0.625rem 0.75rem; text-align: right; font-variant-numeric: tabular-nums;">8.3</td>
        </tr>
        <tr>
          <td style="padding: 0.625rem 0.75rem;">Plug-Load-West</td>
          <td style="padding: 0.625rem 0.75rem; color: var(--color-muted-foreground, #71717a);">Building B, Floor 3</td>
          <td style="padding: 0.625rem 0.75rem; text-align: right; font-variant-numeric: tabular-nums;">12.1</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Tables

Source files: `table.tsx`, `data-table.tsx`

This guide covers the base Table component and the full-featured DataTable built on TanStack Table. For other data display components (Badge, Avatar, Chart), see [Data Display](data-display.md).

---

## Table

**File:** `table.tsx`
**Primitive:** Native HTML table elements

Low-level table building blocks. Wrapped in a scrollable `div` for responsive overflow handling.

### Sub-components

| Component | Element | Key classes |
|---|---|---|
| `Table` | `table` | Wrapped in scrollable `div`. `w-full caption-bottom text-sm` |
| `TableHeader` | `thead` | `[&_tr]:border-b` |
| `TableBody` | `tbody` | `[&_tr:last-child]:border-0` |
| `TableFooter` | `tfoot` | `bg-muted/50 border-t font-medium` |
| `TableRow` | `tr` | `hover:bg-table-row-hover data-[state=selected]:bg-table-row-highlighted border-b` |
| `TableHead` | `th` | `text-foreground h-10 px-2 font-medium truncate` |
| `TableCell` | `td` | `p-2 align-middle truncate` |
| `TableCaption` | `caption` | `text-muted-foreground mt-4 text-sm` |

### Responsive behavior

The root `Table` is wrapped in a `div` with `overflow-auto` to enable horizontal scrolling on narrow viewports. Table columns retain their natural widths -- no responsive stacking is applied at the base level.

### Token usage

| Token | Usage |
|---|---|
| `bg-table-row-hover` | Row hover state (custom semantic token) |
| `bg-table-row-highlighted` | Selected row state (custom semantic token) |
| `bg-muted/50` | Footer background |
| `text-foreground` | Header text |
| `text-muted-foreground` | Caption text |
| `border` (default) | Row bottom borders, header bottom border, footer top border |

### Data attributes

- `data-slot="table"`, `data-slot="table-header"`, `data-slot="table-body"`, etc.
- `data-state="selected"` on `TableRow` for selected row highlighting

### Exports

- `Table`, `TableHeader`, `TableBody`, `TableFooter`
- `TableRow`, `TableHead`, `TableCell`, `TableCaption`

---

## DataTable

**File:** `data-table.tsx`
**Primitive:** `@tanstack/react-table` + Patina Table components
**Dependencies:** Next.js `useRouter` / `usePathname` / `useSearchParams`

Full-featured data table with sorting, pagination, column visibility, and row selection. Built on TanStack Table and composed from the base Table sub-components.

### Sub-components

| Component | Purpose |
|---|---|
| `DataTable<TData, TValue>` | Main table with built-in sorting + pagination |
| `DataTableColumnHeader<TData, TValue>` | Sortable column header with dropdown menu (Asc / Desc / Hide) |
| `DataTablePagination<TData>` | Pagination bar with page size selector |

### Props (DataTable)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `ColumnDef<TData, TValue>[]` | required | TanStack column definitions |
| `data` | `TData[]` | required | Row data array |
| `emptyContent` | `React.ReactNode` | `"No data available"` | Shown when data is empty |
| `showPagination` | `boolean` | `true` | Toggle pagination bar |

### Sorting

Column sorting is managed by TanStack Table's `SortingState`. `DataTableColumnHeader` renders a dropdown menu with three options:

| Action | Effect |
|---|---|
| Asc | Sort column ascending |
| Desc | Sort column descending |
| Hide | Remove column from visible columns |

The dropdown uses `DropdownMenu` from [Navigation](navigation.md) and inherits its token usage (`bg-popover`, `text-popover-foreground`, `bg-accent`).

### Filtering

Filtering is driven by TanStack Table's `ColumnFiltersState`. Filter UI is implemented at the consumer level -- DataTable exposes the table instance for custom filter controls.

### Pagination

| Property | Value |
|---|---|
| Default page sizes | `[10, 20, 30, 40, 50]` |
| URL sync | `?per-page=` query param (via Next.js router) |
| Navigation | First, Previous, Next, Last buttons |
| Row count display | `{start}-{end} of {total} row(s)` |

`DataTablePagination` uses `Select` for the page size picker and `Button` (outline variant) for page navigation.

### Row selection

Row selection is provided by TanStack Table's `RowSelectionState`. Selected rows receive `data-state="selected"` which activates `bg-table-row-highlighted`.

### Sticky headers

Table headers (`thead`) can be made sticky by applying `sticky top-0 z-10` to the `TableHeader`. The `zIndex.raised` token (`z-10`) keeps headers above scrolling content without competing with overlays.

### Action bar

When rows are selected, an action bar can be rendered above or below the table. The action bar uses:

| Token | Usage |
|---|---|
| `shadow-sm` (`shadow.sm`) | Subtle elevation for the action bar |
| `z-50` (`zIndex.overlay`) | Ensures the bar floats above table content |
| `bg-background` | Action bar surface |
| `border` | Action bar border |

### Token usage

All base Table tokens apply, plus:

| Token | Usage |
|---|---|
| `bg-muted/50` | Footer row background |
| `text-muted-foreground` | Pagination info text, column header dropdown icons |
| `bg-popover`, `text-popover-foreground` | Column header dropdown menu |
| `bg-accent`, `text-accent-foreground` | Focused dropdown menu item |
| `shadow-xs` (`shadow.xs`) | Keyboard shortcut badges in column header dropdown |
| `shadow-sm` (`shadow.sm`) | Action bar elevation |

### Data attributes

- Inherits all base Table `data-slot` attributes
- `data-state="selected"` on selected rows
- `data-slot="data-table"` on root

### Exports

- `DataTable` -- the full-featured table component
- `DataTableColumnHeader` -- reusable sortable column header
- `DataTablePagination` -- reusable pagination bar

</details>
