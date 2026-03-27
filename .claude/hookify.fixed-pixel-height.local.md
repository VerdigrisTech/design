---
name: fixed-pixel-height
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(tsx|jsx)$
  - field: new_text
    operator: regex_match
    pattern: h-\[\d+px\](?!.*\b(sm|md|lg|xl):h-)
action: warn
---

**Fixed pixel height without responsive breakpoints detected**

You are using a fixed pixel height like `h-[500px]` without responsive variants (`sm:h-[...] md:h-[...]`). This creates a poor mobile experience:

- On iPhone (390px wide), a `h-[500px]` element + fixed navbar (80px) = 580px, consuming the entire viewport before any content appears
- GA4 data shows only 2% mobile traffic — fixed heights are a likely contributor

**Fix**: Add responsive breakpoints:

```tsx
// Bad
className="h-[500px]"

// Good
className="h-[300px] sm:h-[400px] md:h-[500px]"
```

Discovered via mobile rendering audit (Z2O-509). Fixed hero heights on `/`, `/demo`, `/industries/*`, and `/company/about` were all flagged.
