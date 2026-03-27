---
name: hover-on-touch
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(tsx|jsx)$
  - field: new_text
    operator: regex_match
    pattern: hover:(-translate-y|scale-|-(translate|rotate|skew))
action: warn
---

**Hover transform effect without touch-device guard detected**

You are using `hover:-translate-y` or `hover:scale-` which causes Cumulative Layout Shift (CLS) on touch devices. On mobile, these effects fire on tap, causing elements to visually jump — this hurts SEO (Core Web Vitals) and confuses users.

**Fix**: Either wrap in a `@media (hover: hover)` guard or use Tailwind's group-hover pattern which is hover-only by default:

```tsx
// Bad — shifts layout on tap
className="hover:-translate-y-1 hover:shadow-xl"

// Good — only activates on devices with real hover
className="@media(hover:hover):(-translate-y-1 shadow-xl)"

// Alternative — use CSS directly
// In index.css:
// @media (hover: hover) { .card-lift:hover { transform: translateY(-4px); } }
className="card-lift"
```

Discovered via mobile rendering audit (Z2O-509). `hover:-translate-y-1` in `features.tsx` and `industries.tsx` was causing CLS on mobile.
