# Cards

Source file: `card.tsx`

---

## Card

**Primitive:** Native `<div>` elements throughout
**No CVA** -- single visual style, customizable via `className`.

### Sub-components

| Component | Element | Purpose | Key classes |
|---|---|---|---|
| `Card` | `div` | Outer container | `bg-card text-card-foreground rounded-xl border py-6 shadow-sm` |
| `CardHeader` | `div` | Title + description + optional action | CSS Grid: `grid-cols-[1fr_auto]` when action present |
| `CardTitle` | `div` | Heading | `font-semibold leading-none` |
| `CardDescription` | `div` | Subtitle / help text | `text-muted-foreground text-sm` |
| `CardAction` | `div` | Top-right action area | `col-start-2 row-span-2 row-start-1` |
| `CardContent` | `div` | Main body | `px-6` |
| `CardFooter` | `div` | Bottom bar | `flex items-center px-6` |

### Anatomy

```
Card
  CardHeader
    CardTitle
    CardDescription
    CardAction (optional, auto-positioned top-right)
  CardContent
  CardFooter
```

### Token usage

- **Background:** `card`
- **Text:** `card-foreground`, `muted-foreground`
- **Border:** default border color (inherits `border`)
- **Border radius:** `rounded-xl`
- **Shadow:** `shadow-sm`
- **Spacing:** `gap-6` (between sections), `px-6` (horizontal padding)
- Contextual border classes: `[.border-b]:pb-6` on header, `[.border-t]:pt-6` on footer -- activated by adding `border-b` / `border-t` to the Card

### Data attributes

Each sub-component emits `data-slot="card"`, `data-slot="card-header"`, etc. The `CardAction` slot enables the grid layout via `has-data-[slot=card-action]:grid-cols-[1fr_auto]` on `CardHeader`.
