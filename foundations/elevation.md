# Elevation

> Audit of 59 UI components + non-UI components in Patina (`/tmp/patina/src/components/`).
> Last updated: 2026-03-25.

## Shadow System

Patina uses **Tailwind v4 default shadows exclusively** -- no custom shadow values are defined in `globals.css` or any Tailwind config override. There is one exception: a custom `box-shadow` in the sidebar component that uses a 1px outline trick.

### Shadow Scale

| Token | Tailwind Class | CSS Value | Component Usage |
|-------|---------------|-----------|-----------------|
| `none` | `shadow-none` | `none` | sidebar-header, input-group children (nested input/textarea), toggle-group flush-spacing items |
| `xs` | `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | input, textarea, select-trigger, checkbox, switch, button (outline variant), toggle (outline), toggle-group (outline wrapper), button-group, input-group wrapper, calendar dropdown-root, editable input, data-table kbd |
| `sm` | `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | card, slider thumb, tabs-trigger (active state), sidebar (floating variant), sidebar-inset, data-table action-bar |
| `md` | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | dropdown-menu content, select content, popover, hover-card |
| `lg` | `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | dialog, alert-dialog, draggable-dialog, sheet, dropdown-menu sub-content |
| `xl` | `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | chart tooltip |
| `sidebar-border` | `shadow-[...]` | `0 0 0 1px hsl(var(--sidebar-border))` | sidebar menu-button (custom; hover swaps color to `--sidebar-accent`) |

### Semantic Groupings

**Form controls** (`shadow-xs`): The lightest shadow. Provides subtle depth to interactive form elements without competing with content. Applied to: input, textarea, select trigger, checkbox, switch, button (outline), toggle (outline), editable.

**Containers** (`shadow-sm`): Light lift for content grouping. Applied to: card, active tab trigger, floating sidebar, slider thumb.

**Floating menus** (`shadow-md`): Distinct separation from the page surface. Applied to: dropdown-menu, select dropdown, popover, hover-card.

**Modals and sheets** (`shadow-lg`): Maximum intentional separation for focus-trapping overlays. Applied to: dialog, alert-dialog, draggable-dialog, sheet panel, dropdown sub-content.

**Tooltips** (`shadow-xl`): Deepest shadow, used only for chart tooltips that need to visually float above dense data.

### transition-[color,box-shadow] Pattern

Several components use `transition-[color,box-shadow]` to animate shadow changes alongside focus rings. This is used by: badge, input, textarea, select-trigger, checkbox, slider thumb, scroll-area viewport, tabs-trigger, toggle, input-group. This is the Tailwind v4 pattern for smooth focus-ring transitions via `box-shadow` rather than `outline`.

### Custom Shadow: Sidebar Menu Button

The sidebar `SidebarMenuButton` uses a raw shadow value as a border substitute:

```
shadow-[0_0_0_1px_hsl(var(--sidebar-border))]
hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]
```

This avoids layout shift that a real `border` would cause, using a zero-spread box-shadow as a 1px outline.

## Z-Index System

Patina uses a **five-layer** z-index system. All values come from Tailwind's built-in utilities. No custom z-index values are defined in configuration.

### Layer Map

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `base` | `0` | — | waveform background (`zIndex: 0` inline style) |
| `scrollbar` | `1` | `z-1` | scroll-area scrollbar (stays above content, below everything else) |
| `raised` | `10` | `z-10` | sidebar panel, resizable handle, data-table draggable head (while dragging), button-group focused child, toggle-group focused item, calendar focused day |
| `sticky` | `20` | `z-20` | sidebar resize handle, sidebar-resize-handle custom component |
| `overlay` | `50` | `z-50` | **all** overlays, popovers, modals, tooltips, fixed UI (see below) |

### Layer 50 Components (Full List)

Every portal-based or fixed-position component converges on `z-50`:

- **Overlays/scrims**: dialog, alert-dialog, draggable-dialog, sheet (the backdrop `bg-black/50` or `bg-black/80`)
- **Modal content**: dialog, alert-dialog, draggable-dialog, sheet (the panel itself)
- **Floating menus**: dropdown-menu content, dropdown-menu sub-content, select content
- **Popovers**: popover, hover-card
- **Tooltips**: tooltip content, tooltip arrow
- **Fixed UI**: app-header (sticky nav), data-table action-bar (fixed bottom bar)

### Dynamic Z-Index: Data Table

The data-table uses CSS custom properties for per-column z-index:

{% raw %}
```tsx
style={{ zIndex: `var(--header-${header?.id}-z)` }}
```
{% endraw %}

These are computed at runtime based on pinned column positions, not from the token scale. They operate within the table's local stacking context and do not conflict with the global layer system.

### Design Decisions

1. **Flat overlay layer**: All overlays share `z-50`. This works because Radix UI portals append to `document.body` and only one modal/popover is typically open at a time. No z-index arms race needed.

2. **No z-30 or z-40**: The gap between `sticky` (20) and `overlay` (50) is intentionally empty. This leaves room for future layers (e.g., floating action buttons, banners) without restructuring.

3. **Focus z-10**: Interactive elements inside groups (button-group, toggle-group) use `focus:z-10` / `focus-visible:z-10` to ensure the focused item's ring is not clipped by adjacent siblings.

## Dark Mode Shadows

Patina does **not** define separate shadow values for dark mode. The same `rgb(0 0 0 / ...)` shadows are used in both themes. In dark mode:

- Shadows become largely invisible against dark backgrounds
- Visual separation is achieved through **borders** (`border-border`, `border-input`) and **background contrast** (`dark:bg-input/30`) instead
- The sidebar border-as-shadow uses `hsl(var(--sidebar-border))` which resolves to `oklch(1 0 0 / 10%)` in dark mode -- a subtle light outline rather than a dark shadow

### Recommendation

If dark-mode elevation becomes a concern, consider:
- Adding a `shadow-glow` token with a brand-tinted light shadow (e.g., `0 0 12px rgb(var(--primary) / 0.15)`)
- Using `ring` utilities (already used for focus states) as decorative elevation cues
- Increasing `border` opacity for cards and floating elements in dark mode
