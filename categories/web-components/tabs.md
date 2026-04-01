---
layout: visual
title: Tabs
---

<p class="v-label">Tab Bar</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div class="v-tabs">
      <div class="v-tab v-tab-active">Overview</div>
      <div class="v-tab">Analytics</div>
      <div class="v-tab">Settings</div>
    </div>
    <div style="padding:1.25rem;border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius) var(--radius);font-size:0.875rem;color:var(--muted-fg)">
      Real-time energy monitoring across 847 circuits. Last updated 2 minutes ago.
    </div>
  </div>
</div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Tabs

Source files: `tabs.tsx`

---

## Tabs

**File:** `tabs.tsx`
**Primitive:** `@radix-ui/react-tabs`

Organizes content into mutually exclusive panels, with a tab bar for switching between them. Only one panel is rendered at a time.

### Sub-components

| Component | Purpose | Key classes |
|---|---|---|
| `Tabs` | Root container | `flex flex-col gap-2` |
| `TabsList` | Tab bar | `bg-muted text-muted-foreground h-9 rounded-lg p-[3px]` |
| `TabsTrigger` | Individual tab button | Active: `bg-background shadow-sm text-foreground`; dark active: `border-input bg-input/30` |
| `TabsContent` | Panel content | `flex-1 outline-none` |

### Props (Tabs)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `defaultValue` | `string` | -- | Initially active tab (uncontrolled) |
| `value` | `string` | -- | Active tab (controlled) |
| `onValueChange` | `(value: string) => void` | -- | Callback when active tab changes |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction of the tab list |
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` | Whether tabs activate on focus or on explicit selection |

### Props (TabsTrigger)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | -- | **Required.** Unique identifier matching a `TabsContent` |
| `disabled` | `boolean` | `false` | Disables the trigger |

### Props (TabsContent)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | -- | **Required.** Matches the corresponding `TabsTrigger` value |
| `forceMount` | `boolean` | -- | Force-mounts the content (useful for animations or preserving state) |

### Active state styling

The active trigger is visually distinguished by an elevated background with a subtle shadow:

| State | Token classes |
|---|---|
| Inactive | `bg-muted text-muted-foreground` (inherits from `TabsList`) |
| Active (light) | `bg-background text-foreground shadow-sm` |
| Active (dark) | `border-input bg-input/30 text-foreground` |
| Disabled | `pointer-events-none opacity-50` |
| Focus | `border-ring ring-ring/50 ring-[3px]` |

### Token usage

- **Inactive tab bar:** `bg-muted`, `text-muted-foreground`
- **Active tab:** `bg-background`, `text-foreground` (light); `border-input`, `bg-input/30` (dark)
- **Shadow:** `shadow-sm` on active trigger (light mode only)
- **Border:** `border` on `TabsList` container
- **Focus ring:** `border-ring`, `ring-ring/50`
- **Border radius:** `rounded-lg` (list), inherits within triggers

### Overflow behavior

When tabs exceed the available width:

- The `TabsList` does not scroll or wrap by default
- For many tabs, wrap `TabsList` in a `ScrollArea` with horizontal orientation
- Alternatively, use a `DropdownMenu` to expose overflow tabs (the "more" pattern)
- On narrow viewports, consider collapsing to a `Select` component instead of tabs

### URL synchronization pattern

To sync the active tab with the URL (for bookmarkable tabs):

```tsx
// Read from searchParams
const searchParams = useSearchParams()
const activeTab = searchParams.get("tab") ?? "overview"

// Update URL on change
function handleTabChange(value: string) {
  const params = new URLSearchParams(searchParams)
  params.set("tab", value)
  router.replace(`?${params.toString()}`, { scroll: false })
}

<Tabs value={activeTab} onValueChange={handleTabChange}>
```

This pattern keeps the tab state in the URL so it survives page refreshes and can be shared via links.

### Accessibility

- `TabsList` renders with `role="tablist"`
- Each `TabsTrigger` has `role="tab"` and `aria-selected` reflecting its state
- Each `TabsContent` has `role="tabpanel"` and is associated with its trigger via `aria-labelledby`
- **Keyboard navigation:**
  - `ArrowLeft` / `ArrowRight` moves focus between tabs (horizontal orientation)
  - `ArrowUp` / `ArrowDown` moves focus between tabs (vertical orientation)
  - `Home` / `End` moves to first / last tab
  - `Enter` / `Space` activates the focused tab (when `activationMode="manual"`)
  - In `automatic` mode, focus alone activates the tab

### Data attributes

- `data-slot="tabs"`, `data-slot="tabs-list"`, `data-slot="tabs-trigger"`, `data-slot="tabs-content"`
- `data-state="active"` / `data-state="inactive"` on triggers and content

### Exports

- `Tabs` -- root container
- `TabsList` -- tab bar
- `TabsTrigger` -- individual tab button
- `TabsContent` -- panel content

</details>
