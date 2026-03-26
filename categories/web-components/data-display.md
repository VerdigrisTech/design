# Data Display

Source files: `table.tsx`, `data-table.tsx`, `badge.tsx`, `avatar.tsx`, `tooltip.tsx`, `chart.tsx`, `circular-progress.tsx`, `progress.tsx`, `skeleton.tsx`, `copyable-value.tsx`

---

## Table

**File:** `table.tsx`
**Primitive:** Native HTML table elements

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

### Token usage

- `bg-table-row-hover` (row hover -- custom token)
- `bg-table-row-highlighted` (selected row -- custom token)
- `bg-muted/50` (footer)
- `text-foreground` (header text)
- `text-muted-foreground` (caption)

---

## DataTable

**File:** `data-table.tsx`
**Primitive:** `@tanstack/react-table` + Patina Table components
**Dependencies:** Next.js `useRouter`/`usePathname`/`useSearchParams`

Full-featured data table with sorting, pagination, and column visibility.

### Sub-components

| Component | Purpose |
|---|---|
| `DataTable<TData, TValue>` | Main table with built-in sorting + pagination |
| `DataTableColumnHeader<TData, TValue>` | Sortable column header with dropdown (Asc/Desc/Hide) |
| `DataTablePagination<TData>` | Pagination bar with page size selector |

### Props (DataTable)

| Prop | Type | Default |
|---|---|---|
| `columns` | `ColumnDef<TData, TValue>[]` | required |
| `data` | `TData[]` | required |
| `emptyContent` | `React.ReactNode` | `"No data available"` |
| `showPagination` | `boolean` | `true` |

### Pagination defaults

Page sizes: `[10, 20, 30, 40, 50]`. URL-synced via `?per-page=` query param.

---

## Badge

**File:** `badge.tsx`
**CVA:** `badgeVariants`

### Variants

| Variant | Token classes |
|---|---|
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `destructive` | `bg-destructive text-white` (dark: `bg-destructive/60`) |
| `outline` | `text-foreground` (border only) |

### Props

- `variant` -- see table above (default: `"default"`)
- `asChild` -- renders children as root via Radix Slot

### Dimensions

`rounded-md px-2 py-0.5 text-xs font-medium`. SVG icons: `size-3`.

---

## Avatar

**File:** `avatar.tsx`
**Primitive:** `@radix-ui/react-avatar`

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Avatar` | Container | `size-8 rounded-full overflow-hidden` |
| `AvatarImage` | Image | `aspect-square size-full` |
| `AvatarFallback` | Fallback (initials/icon) | `bg-muted rounded-full` |

---

## Tooltip

**File:** `tooltip.tsx`
**Primitive:** Radix `Tooltip`

### Sub-components

| Component | Purpose |
|---|---|
| `TooltipProvider` | Context provider (`delayDuration` default: `0`) |
| `Tooltip` | Root |
| `TooltipTrigger` | Trigger element |
| `TooltipContent` | Content panel (portaled) with arrow |

### Token usage

- `bg-foreground text-background` (inverted colors for tooltip)
- `fill-foreground` (arrow)
- `rounded-md px-3 py-1.5 text-xs`
- Animations: `fade-in/out`, `zoom-in/out-95`, `slide-in-from-*`

---

## Chart

**File:** `chart.tsx`
**Primitive:** `recharts` (`ResponsiveContainer`, `Tooltip`, `Legend`)

Wrapper system for Recharts with theme-aware color injection.

### Sub-components

| Component | Purpose |
|---|---|
| `ChartContainer` | Wraps `ResponsiveContainer`, injects CSS color vars |
| `ChartStyle` | Generates `<style>` tag with `--color-{key}` per theme |
| `ChartTooltip` | Re-export of `recharts.Tooltip` |
| `ChartTooltipContent` | Custom tooltip with indicator support |
| `ChartLegend` | Re-export of `recharts.Legend` |
| `ChartLegendContent` | Custom legend with config-driven labels/icons |

### ChartConfig type

```ts
type ChartConfig = {
  [key: string]: {
    label?: ReactNode
    icon?: ComponentType
  } & ({ color?: string } | { theme: { light: string; dark: string } })
}
```

### ChartTooltipContent props

| Prop | Type | Default |
|---|---|---|
| `indicator` | `"dot" \| "line" \| "dashed"` | `"dot"` |
| `hideLabel` | `boolean` | `false` |
| `hideIndicator` | `boolean` | `false` |
| `nameKey` | `string` | -- |
| `labelKey` | `string` | -- |

### Token usage

- `bg-background`, `border-border/50` (tooltip container)
- `text-muted-foreground`, `text-foreground` (labels, values)
- `fill-muted-foreground` (axis ticks)
- `stroke-border` (grid lines, cursor)
- `fill-muted` (bar tooltip cursor, radial bar background)

---

## CircularProgress

**File:** `circular-progress.tsx`
**Primitive:** Custom SVG-based component (no external dep)

### Sub-components

| Component | Purpose |
|---|---|
| `CircularProgress` | Root with `role="progressbar"`, ARIA attributes |
| `CircularProgressIndicator` | SVG container |
| `CircularProgressTrack` | Background circle |
| `CircularProgressRange` | Animated foreground arc |
| `CircularProgressValueText` | Centered percentage text |
| `CircularProgressCombined` | All-in-one convenience wrapper |

### Props (CircularProgress)

| Prop | Type | Default |
|---|---|---|
| `value` | `number \| null` | `null` (indeterminate) |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `size` | `number` | `48` |
| `thickness` | `number` | `4` |
| `getValueText` | `(value, min, max) => string` | Percentage formatter |
| `label` | `string` | -- |
| `asChild` | `boolean` | -- |

### States

- `indeterminate` -- spinning animation when `value` is `null`
- `loading` -- partial fill
- `complete` -- full fill when `value === max`

### Token usage

- `text-muted-foreground/20` (track)
- `text-primary` (range arc)

---

## Progress

**File:** `progress.tsx`
**Primitive:** `@radix-ui/react-progress`

Linear progress bar. Height `h-2`, `rounded-full`.

### Props

| Prop | Type | Default |
|---|---|---|
| `value` | `number` | -- |
| `colorRanges` | `ColorRange[]` | `[{ threshold: 0, className: "bg-primary" }]` |

### ColorRange type

```ts
{ threshold: number; className: string }
```

Indicator color changes based on the highest matching threshold. Default: `bg-primary`. Track: `bg-primary/20`.

---

## Skeleton

**File:** `skeleton.tsx`
**Primitive:** Native `<div>`

Loading placeholder. `bg-accent animate-pulse rounded-md`. No props beyond standard div props.

---

## CopyableValue

**File:** `copyable-value.tsx`

Inline display of a value with a clipboard-copy button. Uses `Button` (ghost, icon size) + `Tooltip`.

### Props

| Prop | Type | Default |
|---|---|---|
| `value` | `string` | required |
| `className` | `string` | -- |
| `icon` | `ComponentType<{ className?: string }>` | `ClipboardCopy` |

### Token usage

- `text-muted-foreground/50` (default icon color)
- `text-foreground` (active/hover icon color)
