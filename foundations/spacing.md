# Spacing

## Grid

All spacing uses a **4px base grid**. Values are multiples of 0.25rem (4px).

The full scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.

See `tokens/spacing/base.json` for the complete token set.

## Layout Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `container-max` | 80rem (1280px) | Max-width for page content. Both codebases agree. |
| `padding-global` | 2.5rem / 1.5rem mobile | Horizontal page padding |
| `section-pad` | 4rem | Standard section vertical padding |
| `section-pad-large` | 8rem / 5rem mobile | Hero and feature sections |
| `section-pad-medium` | 5rem | Secondary sections |

## Border Radius

| Codebase | Value | Pixels |
|----------|-------|--------|
| Patina | 0.625rem | 10px |
| www | 0.5rem | 8px |

**Recommendation:** Adopt Patina's `0.625rem` (10px) as canonical. Rationale:

1. Patina has 60+ battle-tested components using this radius
2. 10px is slightly more rounded, creating a softer, more modern feel
3. The www site's 8px radius is close enough that migration is low-risk
4. Patina's radius scale (sm/md/lg/xl) is already well-defined relative to the base

The radius scale relative to 0.625rem base:

| Token | Formula | Value |
|-------|---------|-------|
| `sm` | base - 4px | ~6px |
| `md` | base - 2px | ~8px (equivalent to www's current base) |
| `lg` | base | 10px |
| `xl` | base + 4px | ~14px |
| `full` | 9999px | Pill shape |

## Hero Heights

Responsive hero heights (www):

| Breakpoint | Height |
|-----------|--------|
| Default (mobile) | 22rem (352px) |
| 640px+ | 25rem (400px) |
| 768px+ | 31.25rem (500px) |

## Responsive Breakpoints

Standard Tailwind breakpoints plus Patina's ultra-wide extensions:

| Name | Value | Source |
|------|-------|--------|
| sm | 640px | Tailwind default |
| md | 768px | Tailwind default |
| lg | 1024px | Tailwind default |
| xl | 1280px | Tailwind default |
| 2xl | 1536px | Tailwind default |
| 3xl–8xl | 1792–3072px | Patina custom |

**Note:** www uses 991px as a breakpoint for heading/padding responsiveness. This is non-standard. **Recommendation:** Migrate to the standard `lg` (1024px) breakpoint.
