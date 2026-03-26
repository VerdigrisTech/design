# Layout

Source files: `separator.tsx`, `scroll-area.tsx`, `collapsible.tsx`, `accordion.tsx`, `resizable.tsx`, `toggle.tsx`, `toggle-group.tsx`

Note: `aspect-ratio.tsx` does not exist in the current Patina build.

---

## Separator

**File:** `separator.tsx`
**Primitive:** Radix `Separator`

### Props

| Prop | Type | Default |
|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `decorative` | `boolean` | `true` |

### Token usage

- `bg-border`
- Horizontal: `h-px w-full`
- Vertical: `h-full w-px`

---

## ScrollArea

**File:** `scroll-area.tsx`
**Primitive:** `@radix-ui/react-scroll-area`

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `ScrollArea` | Root + viewport + scrollbar | `relative`, viewport: `size-full rounded-[inherit]` |
| `ScrollBar` | Custom scrollbar | `w-2.5` (vertical) / `h-2.5` (horizontal) |

Scrollbar thumb: `bg-border rounded-full`. Focus ring on viewport.

### Props (ScrollBar)

| Prop | Type | Default |
|---|---|---|
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |

---

## Collapsible

**File:** `collapsible.tsx`
**Primitive:** `@radix-ui/react-collapsible`

Thin wrapper -- no additional styling. Three pass-through components:

| Component | Purpose |
|---|---|
| `Collapsible` | Root |
| `CollapsibleTrigger` | Toggle element |
| `CollapsibleContent` | Animated reveal/hide area |

Data attributes: `data-slot="collapsible"`, `data-slot="collapsible-trigger"`, `data-slot="collapsible-content"`.

---

## Accordion

**File:** `accordion.tsx`
**Primitive:** `@radix-ui/react-accordion`

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Accordion` | Root (supports `type="single"` or `type="multiple"`) | -- |
| `AccordionItem` | Item container | `border-b last:border-b-0` |
| `AccordionTrigger` | Toggle button with chevron | `text-sm font-medium hover:underline` |
| `AccordionContent` | Animated content panel | `animate-accordion-up` / `animate-accordion-down` |

### Token usage

- `text-muted-foreground` (chevron icon)
- Border: default `border` color
- Content padding: `pt-0 pb-4`

### Animation

Uses custom Tailwind keyframes: `animate-accordion-up` (collapse) and `animate-accordion-down` (expand). These must be defined in the Tailwind config.

---

## Resizable

**File:** `resizable.tsx`
**Primitive:** `react-resizable-panels`

### Sub-components

| Component | Purpose |
|---|---|
| `ResizablePanelGroup` | Container (`flex`, direction-aware) |
| `ResizablePanel` | Individual panel |
| `ResizableHandle` | Drag handle between panels |

### Props (ResizableHandle)

| Prop | Type | Default |
|---|---|---|
| `withHandle` | `boolean` | -- |

When `withHandle` is true, renders a visible `GripVerticalIcon` grip indicator (`h-4 w-3`).

### Token usage

- `bg-border` (handle line and grip background)
- `ring` (focus ring)
- Handle rotates 90 degrees when group direction is `vertical`

---

## Toggle

**File:** `toggle.tsx`
**Primitive:** `@radix-ui/react-toggle`
**CVA:** `toggleVariants`

### Variants

| Variant | Token classes |
|---|---|
| `default` | `bg-transparent` (active: `bg-accent text-accent-foreground`) |
| `outline` | `border border-input bg-transparent shadow-xs` (active: same) |

### Sizes

| Size | Dimensions |
|---|---|
| `default` | `h-9 px-2 min-w-9` |
| `sm` | `h-8 px-1.5 min-w-8` |
| `lg` | `h-10 px-2.5 min-w-10` |

### Token usage

- `bg-muted`, `text-muted-foreground` (hover)
- `bg-accent`, `text-accent-foreground` (active / `data-[state=on]`)
- `border-input` (outline variant)
- Focus ring: `border-ring`, `ring-ring/50`
- `rounded-md`, `text-sm font-medium`

---

## ToggleGroup

**File:** `toggle-group.tsx`
**Primitive:** `@radix-ui/react-toggle-group`

Groups multiple toggles with shared variant/size context.

### Sub-components

| Component | Purpose |
|---|---|
| `ToggleGroup` | Root (context provider for variant/size/spacing) |
| `ToggleGroupItem` | Individual toggle item |

### Props (ToggleGroup)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"default" \| "outline"` | `"default"` | Passed to all items via context |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Passed to all items via context |
| `spacing` | `number` | `0` | Gap between items (in spacing units) |

### Spacing behavior

When `spacing=0` (default): items have no gap, inner border-radii are removed, and outline borders are collapsed (connected button group appearance). When `spacing > 0`: items are separated with individual rounded corners.

### Token usage

Same as Toggle (inherits `toggleVariants`), plus:
- `data-[spacing=0]` selectors for connected mode
- `data-[variant=outline]:shadow-xs` on group with default spacing
