# Brand Alignment Analysis: design.verdigris.co vs www.verdigris.co

**Date:** 2026-03-27
**Purpose:** Compare the docs site against the canonical www brand identity and the four brand pillars (Precision, Masterful, Refined, Pioneering) to identify alignment gaps.

## Current State

### www.verdigris.co (production)
- **Color space:** HSL (`hsl(178 86% 42%)` for brand teal)
- **Radius:** `0.5rem` (8px)
- **Fonts:** Inter (body), Lato (display), system mono (no JetBrains Mono)
- **Ring/focus:** `hsl(153 67% 38%)` — green-shifted, not neutral
- **Foreground:** `hsl(220 13% 18%)` — slightly blue-tinted dark
- **Neutral hue:** ~220 (blue-gray)

### design.verdigris.co (docs site)
- **Color space:** Hex fallbacks in CSS (`#0fc8c3`, `#0e0f11`, etc.)
- **Radius:** `0.375rem` (6px) on sidebar links
- **Fonts:** Inter (body only), no Lato on headings, no JetBrains Mono loaded via Google Fonts
- **Layout:** Sidebar + content, sticky header, clean but basic
- **No dark mode toggle**
- **No brand gradient visible**

### Canonical tokens (this repo)
- **Color space:** OKLch (canonical) → all others derived
- **Radius:** `0.625rem` (10px) — Patina canonical
- **Fonts:** Inter + Lato + JetBrains Mono (all via Google Fonts)
- **Neutral hue:** ~286 (zinc-tinted, from Patina)
- **Ring/focus:** Neutral-based (not green-shifted)

---

## Alignment Gaps

### 1. Docs site doesn't eat its own dog food

| Property | Canonical Token | Docs Site Actual | Gap |
|----------|----------------|------------------|-----|
| Heading font | Lato 700 | Inter (no Lato loaded) | Headings use body font |
| Mono font | JetBrains Mono | System mono stack | Code blocks use fallback |
| Border radius | 0.625rem (10px) | 0.375rem (6px) | Smaller than canonical |
| Neutral hue | ~286 (zinc) | Pure gray hex values | No zinc tint |
| Dark mode | Full token swap system | Not implemented | No dark mode |
| Brand gradient | 16-stop OKLch hue loop | Not visible | Missing brand signature |
| Color space | OKLch | Hex fallbacks | Not using canonical format |

**Verdict:** The docs site documents the design system but doesn't implement it. A visitor would see a different visual language on the docs site than what the tokens prescribe. The specimen page fixes this.

### 2. www has known divergences from canonical

| Property | Canonical Token | www Actual | Migration Status |
|----------|----------------|-----------|-----------------|
| Radius | 0.625rem | 0.5rem | Documented, not migrated |
| Neutral hue | ~286 (zinc) | ~220 (blue-gray) | Divergent |
| Ring color | Neutral-based | Green-shifted (153°) | Divergent |
| Foreground | oklch(0.141 ...) | hsl(220 13% 18%) | Close but different hue |
| Mono font | JetBrains Mono | System mono | Not loaded on www |
| Color space | OKLch | HSL | www uses legacy format |

**Verdict:** www is using HSL with blue-gray neutrals. The design system specifies zinc-tinted neutrals (hue ~286) from Patina. This is the main visual discrepancy — it affects every neutral surface, border, and text color.

### 3. Brand Pillar Alignment

| Pillar | How it should manifest | Docs site | www | Specimen |
|--------|----------------------|-----------|-----|----------|
| **Precision** | Tight letter-spacing, tabular numbers, mono for data | Partial — has mono code blocks | Good — "8 kHz", "48hr" metrics displayed | Full — JetBrains Mono, -0.02em, data examples |
| **Masterful** | Inter legibility, 700-weight headings, confident hierarchy | Weak — no weight/size differentiation | Good — bold headlines, clear hierarchy | Full — Lato 700 display, proper type scale |
| **Refined** | Generous whitespace, zinc neutrals, canonical radius | Partial — clean but tight spacing | Good — generous whitespace | Full — 4px grid, canonical radius, zinc neutrals |
| **Pioneering** | OKLch, perceptual gradients, brand hue loop | Missing — hex fallbacks | Missing — HSL, no gradient | Full — OKLch vars, gradient strip, all 16 stops |

---

## Recommendations

### Immediate (specimen page — done)
The specimen page we just built uses canonical OKLch values, loads all three fonts from Google Fonts, implements dark mode with token swaps, shows the brand gradient, and maps each pillar to its visual manifestation. It is the first page on the docs site that fully implements the design system it documents.

### Short-term (docs site convergence)
1. **Load Lato + JetBrains Mono** via Google Fonts in the Jekyll layout
2. **Apply Lato 700 to h1-h3** on the docs site
3. **Update hex values to OKLch** where browser support allows (>95% global)
4. **Add dark mode toggle** to the docs site layout (the specimen has the pattern)
5. **Bump radius** from 0.375rem to 0.625rem

### Medium-term (www convergence)
1. **Migrate neutral hue** from ~220 (blue-gray) to ~286 (zinc) — this is the biggest visual delta
2. **Migrate radius** from 0.5rem to 0.625rem
3. **Fix ring/focus color** from green-shifted to neutral-based
4. **Add JetBrains Mono** for any code/metrics rendering on www
5. **Switch to OKLch** as browser support allows

### Long-term
- Both sites should consume `@verdigristech/design-tokens/css/oklch` directly
- The docs site CSS should be generated from the same token source as www
