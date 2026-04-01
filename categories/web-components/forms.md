---
layout: visual
title: Forms
---

<p class="v-label">Text Input</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <input class="v-input" type="text" placeholder="Enter your email address" />
  </div>
</div>

<p class="v-label">Input with Label</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div style="display: flex; flex-direction: column; gap: 0.375rem;">
      <label style="font-size: 0.875rem; font-weight: 500; color: var(--color-foreground, #1a1a1a);">Email address</label>
      <input class="v-input" type="email" placeholder="you@example.com" />
    </div>
  </div>
</div>

<p class="v-label">Subscribe Pattern</p>
<div class="v-demo">
  <div class="v-comp-demo">
    <div class="v-comp-row">
      <input class="v-input" type="email" placeholder="you@example.com" style="flex: 1;" />
      <button class="v-btn v-btn-default">Subscribe</button>
    </div>
  </div>
</div>

<details class="v-details">
<summary>Documentation</summary>

# Forms

Source files: `input.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`, `switch.tsx`, `slider.tsx`, `calendar.tsx`, `form.tsx`, `label.tsx`

Note: `radio-group.tsx` and `date-picker.tsx` do not exist in the current Patina build.

---

## Input

**File:** `input.tsx`
**Primitive:** Native `<input>`

Single-variant text input. Height `h-9`, responsive text (`text-base` / `md:text-sm`).

### Token usage

| Token | Usage |
|---|---|
| `border-input` | Default border |
| `text-foreground` | File input text |
| `text-muted-foreground` | Placeholder |
| `primary`, `primary-foreground` | Selection highlight |
| `ring`, `border-ring` | Focus state |
| `destructive` | Invalid state (`aria-invalid`) |
| `bg-input/30` | Dark mode background |

---

## Select

**File:** `select.tsx`
**Primitive:** `@radix-ui/react-select`

### Sub-components

| Component | Purpose |
|---|---|
| `Select` | Root (controlled/uncontrolled) |
| `SelectTrigger` | Button that opens the dropdown |
| `SelectValue` | Display for selected value |
| `SelectContent` | Dropdown panel (portaled) |
| `SelectGroup` | Option group container |
| `SelectLabel` | Group heading |
| `SelectItem` | Individual option (with check indicator) |
| `SelectSeparator` | Divider between groups |
| `SelectScrollUpButton` / `SelectScrollDownButton` | Scroll affordances |

### SelectTrigger sizes

| Size | Dimensions |
|---|---|
| `default` | `h-9` |
| `sm` | `h-8` |
| `icon` | (no explicit height, icon-only) |

### Props (SelectTrigger)

| Prop | Type | Default |
|---|---|---|
| `size` | `"sm" \| "default" \| "icon"` | `"default"` |
| `dropdownIcon` | `React.ReactNode` | `<ChevronDownIcon>` |

### Token usage

- `bg-popover`, `text-popover-foreground` (dropdown content)
- `border-input`, `text-muted-foreground` (trigger)
- `bg-accent`, `text-accent-foreground` (focused item)
- `bg-border` (separator)
- Focus ring: `ring`, `border-ring`

---

## Textarea

**File:** `textarea.tsx`
**Primitive:** Native `<textarea>`

Auto-sizing via `field-sizing-content`, minimum height `min-h-16`. Shares the same border/focus/invalid token pattern as Input.

---

## Checkbox

**File:** `checkbox.tsx`
**Primitive:** `@radix-ui/react-checkbox`

Fixed `size-4`, `rounded-[4px]`. Checked state uses `bg-primary text-primary-foreground border-primary`. Indicator renders a `CheckIcon` at `size-3.5`.

### Token usage

- `border-input`, `bg-input/30` (unchecked, dark)
- `bg-primary`, `text-primary-foreground`, `border-primary` (checked)
- Focus / invalid: same ring pattern as Input

---

## Switch

**File:** `switch.tsx`
**Primitive:** `@radix-ui/react-switch`

Track: `h-[1.15rem] w-8 rounded-full`. Thumb: `size-4 rounded-full`.

| State | Track | Thumb |
|---|---|---|
| Unchecked | `bg-input` | `bg-background` (dark: `bg-foreground`) |
| Checked | `bg-primary` | `bg-background` (dark: `bg-primary-foreground`) |

---

## Slider

**File:** `slider.tsx`
**Primitive:** `@radix-ui/react-slider`

Supports single and range values. Track height: `h-1.5`. Thumb: `size-4 rounded-full border-primary`.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tooltip` | `boolean` | `false` | Shows value tooltip on drag |
| `formatTooltip` | `(value: number) => string` | `toString` | Custom tooltip formatter |
| `rangeClassName` | `string` | -- | Additional class for the filled range |
| `rangeStyle` | `CSSProperties` | -- | Inline style for the filled range |

### Token usage

- `bg-muted` (track), `bg-primary` (range fill)
- `border-primary`, `bg-background` (thumb)
- `ring-ring/50` (thumb hover/focus)

---

## Calendar

**File:** `calendar.tsx`
**Primitive:** `react-day-picker` (`DayPicker`)

Full calendar widget with day/month navigation. Supports single select, range select, and dropdown month/year pickers via `captionLayout`.

### Props

| Prop | Type | Default |
|---|---|---|
| `showOutsideDays` | `boolean` | `true` |
| `captionLayout` | `"label" \| "dropdown" \| ...` | `"label"` |
| `buttonVariant` | Button variant | `"ghost"` |

### Token usage

- `bg-background` (calendar surface)
- `bg-accent`, `text-accent-foreground` (today, range middle, selected)
- `bg-primary`, `text-primary-foreground` (range start/end, single selected)
- `text-muted-foreground` (outside days, disabled, weekday headers)
- CSS var `--cell-size: --spacing(8)` controls cell dimensions

### Sub-component: `CalendarDayButton`

Custom day cell that wraps `Button` with `variant="ghost" size="icon"`. Adds data attributes for selection states (`data-selected-single`, `data-range-start`, `data-range-end`, `data-range-middle`).

---

## Form (react-hook-form integration)

**File:** `form.tsx`
**Primitive:** `react-hook-form` `FormProvider` + `Controller`

Provides accessible form field wiring: auto-generated IDs, `aria-describedby`, `aria-invalid`, and error display.

### Sub-components

| Component | Purpose |
|---|---|
| `Form` | Re-export of `FormProvider` |
| `FormField` | Wraps `Controller`, provides field context |
| `FormItem` | Container (`grid gap-2`) |
| `FormLabel` | Label with error styling (`text-destructive` on error) |
| `FormControl` | Radix `Slot` that injects `id`, `aria-*` attributes |
| `FormDescription` | Help text (`text-muted-foreground text-sm`) |
| `FormMessage` | Error message (`text-destructive text-sm`) |

### Hook: `useFormField()`

Returns `{ id, name, formItemId, formDescriptionId, formMessageId, ...fieldState }`.

---

## Label

**File:** `label.tsx`
**Primitive:** `@radix-ui/react-label`

Styled label: `text-sm font-medium`, `select-none`. Respects `group-data-[disabled=true]` and `peer-disabled` for opacity changes.

</details>
