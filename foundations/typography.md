# Typography

## Font Stack

### Inter (Body — shared)

Inter is the body font across both codebases. It's a versatile, highly legible sans-serif designed for screens, with excellent support for tabular numbers and multiple weights.

- **Usage:** Body text, labels, navigation, buttons, data tables
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Loading:** Google Fonts or self-hosted via `next/font` (Patina) or `<link>` (www)

### Lato (Display/Headings — www only)

Lato provides visual contrast for marketing headings. It's slightly wider and rounder than Inter, creating a more approachable feel for hero text. **Patina does not use a display font** — it uses Inter everywhere.

- **Usage:** H1, H2, H3 headings on marketing pages
- **Weights:** 700 (bold) only — headings don't need medium/regular
- **Where:** www applies `font-display` class to all `h1–h6` via `@layer base`

### JetBrains Mono (Code — Patina canonical)

Patina uses JetBrains Mono for all monospace contexts. The www site falls back to system monospace. JetBrains Mono has excellent ligatures and is designed for code readability.

- **Usage:** Code blocks, terminal output, metrics, IDs, timestamps, CLI commands
- **Weights:** 400 only

## Font Evaluation (Inter+Lato vs Alternatives)

The current Inter+Lato pairing is the **baseline to evaluate against**. Potential directions:

### Option A: Keep Inter + Lato (current www)
- **Pros:** No migration cost, familiar to users, Lato is widely available
- **Cons:** Lato is ubiquitous (Google's #3 most popular font), limited brand differentiation
- **Verdict:** Safe, not distinctive

### Option B: Inter for everything (current Patina)
- **Pros:** Simplest stack, one font to load, consistent across app and marketing
- **Cons:** No typographic contrast between headings and body — marketing pages feel flat
- **Verdict:** Works for apps, insufficient for marketing

### Option C: Inter + a geometric display font
- Candidates: Plus Jakarta Sans, General Sans, Satoshi, Cabinet Grotesk
- **Pros:** More personality than Lato, still clean/tech-forward
- **Cons:** Requires evaluation and licensing review
- **Verdict:** Worth exploring in Phase 3

### Option D: A single variable font with wide weight range
- Candidates: Instrument Sans, Space Grotesk
- **Pros:** One font file, weight variation creates hierarchy
- **Cons:** Less typographic contrast than a serif/sans pairing
- **Verdict:** Modern but may not differentiate enough

### Evaluation Results (2026-03-27)

Evaluated all four options against these criteria:

| Criteria | Weight | Inter+Lato (A) | Inter-only (B) | Inter+Geometric (C) | Single Variable (D) |
|----------|--------|----------------|-----------------|---------------------|---------------------|
| Brand fit | High | Good — clean, approachable | Flat — no hierarchy contrast | Excellent — fresh, distinctive | Good — modern |
| Migration cost | High | Zero | Low (remove Lato) | Medium (add new font, test) | Medium |
| Performance | Medium | 2 fonts, well-cached (Google #3 + #1) | 1 font, fastest | 2 fonts, may need self-hosting | 1 font |
| Patina alignment | Medium | Divergent (Patina = Inter-only) | Perfect alignment | Divergent | Divergent |
| Licensing | Low | Free (OFL) | Free (OFL) | Varies — some need licensing | Varies |

**Option C deep dive:** Plus Jakarta Sans and Satoshi were the strongest candidates. Both offer more geometric personality than Lato. However:
- Neither is available on Google Fonts (requires self-hosting or CDN setup)
- Introducing a new display font mid-sprint adds risk with no user-facing upside yet
- The token architecture makes a future font swap trivial — update `fontFamily.display` in `tokens/typography/font-family.json` and rebuild

**Decision: Lock Inter + Lato.**

Rationale:
1. **Zero migration cost** — already implemented in www, already in the token system
2. **Performance** — both fonts are top-10 on Google Fonts, maximizing cache hits across the web
3. **Good enough** — Lato at 700 weight provides sufficient heading contrast for marketing pages
4. **Future-proof** — the token system decouples the font choice from every consumer. If we want to explore a geometric display font later, it's a single JSON change + rebuild. No reason to block the website upgrade sprint on a font decision.
5. **Patina stays Inter-only** — the display font is a justified www deviation (marketing needs font contrast that an app dashboard doesn't)

**Locked fonts:**
- Body: `Inter` (shared across all surfaces)
- Display: `Lato` (www marketing headings only)
- Mono: `JetBrains Mono` (code, metrics, data)

**Review trigger:** Revisit if/when Verdigris rebrands or if user research indicates the typography feels generic. The token architecture ensures a swap is low-cost when the time comes.

## Type Scale

All values from www's production CSS. Where `brand_rules.yml` disagrees, CSS is the source of truth.

### Headings

| Level | Desktop | Mobile (<991px) | Weight | Line Height | Letter Spacing |
|-------|---------|-----------------|--------|-------------|----------------|
| H1 | 4rem (64px) | 2.75rem (44px) | 700 | 1.1 | -0.02em |
| H2 | 3rem (48px) | 2rem (32px) | 700 | 1.2 | -0.02em |
| H3 | 2rem (32px) | 1.5rem (24px) | 700 | 1.3 | — |

### Body

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| Large | 1.25rem (20px) | 1.6 | Hero subtext, feature descriptions |
| Medium | 1.125rem (18px) | 1.6 | Cards, summaries |
| Regular | 1rem (16px) | 1.6 | Body paragraphs, lists |
| Small | 0.875rem (14px) | 1.6 | Captions, metadata, fine print |

### Discrepancies (brand_rules.yml vs CSS)

| Property | brand_rules.yml | www CSS (truth) | Patina |
|----------|----------------|-----------------|--------|
| H1 size | 3.5rem | **4rem** | Tailwind default |
| H2 size | 2.5rem | **3rem** | Tailwind default |
| H2 weight | 600 | **700** | Tailwind default |
| H3 weight | 500 | **700** | Tailwind default |
| Font family | Inter only | **Inter + Lato** | Inter only |
| CTA casing | uppercase | Not applied | Not applied |

**Recommendation:** Update `brand_rules.yml` design section to match CSS values, then deprecate in favor of this design repo.

## CTA Text Transform

`brand_rules.yml` specifies `text-transform: uppercase` for CTAs. Neither codebase implements this. **Recommendation:** Document as optional, not enforced. Remove from `brand_rules.yml`.
