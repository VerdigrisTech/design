---
layout: visual
title: Spacing
---

<div class="v-demo">
  <div class="v-label">Spacing Scale — 4px base grid</div>
  <div class="v-spacing-row">
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 4px;"></div>
      <div class="v-spacing-label">4px<br>0.25rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 8px;"></div>
      <div class="v-spacing-label">8px<br>0.5rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 12px;"></div>
      <div class="v-spacing-label">12px<br>0.75rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 16px;"></div>
      <div class="v-spacing-label">16px<br>1rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 20px;"></div>
      <div class="v-spacing-label">20px<br>1.25rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 24px;"></div>
      <div class="v-spacing-label">24px<br>1.5rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 32px;"></div>
      <div class="v-spacing-label">32px<br>2rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 40px;"></div>
      <div class="v-spacing-label">40px<br>2.5rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 48px;"></div>
      <div class="v-spacing-label">48px<br>3rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 64px;"></div>
      <div class="v-spacing-label">64px<br>4rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 80px;"></div>
      <div class="v-spacing-label">80px<br>5rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 96px;"></div>
      <div class="v-spacing-label">96px<br>6rem</div>
    </div>
    <div class="v-spacing-item">
      <div class="v-spacing-block" style="height: 128px;"></div>
      <div class="v-spacing-label">128px<br>8rem</div>
    </div>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Border Radius Scale</div>
  <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: end;">
    <div style="text-align: center;">
      <div style="width: 4rem; height: 4rem; border: 2px solid var(--brand-teal); border-radius: 6px; background: var(--muted);"></div>
      <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg); margin-top: 0.375rem;">sm<br>6px</div>
    </div>
    <div style="text-align: center;">
      <div style="width: 4rem; height: 4rem; border: 2px solid var(--brand-teal); border-radius: 8px; background: var(--muted);"></div>
      <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg); margin-top: 0.375rem;">md<br>8px</div>
    </div>
    <div style="text-align: center;">
      <div style="width: 4rem; height: 4rem; border: 2px solid var(--brand-teal); border-radius: 10px; background: var(--muted);"></div>
      <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg); margin-top: 0.375rem;">base (lg)<br>10px</div>
    </div>
    <div style="text-align: center;">
      <div style="width: 4rem; height: 4rem; border: 2px solid var(--brand-teal); border-radius: 14px; background: var(--muted);"></div>
      <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg); margin-top: 0.375rem;">xl<br>14px</div>
    </div>
    <div style="text-align: center;">
      <div style="width: 4rem; height: 4rem; border: 2px solid var(--brand-teal); border-radius: 9999px; background: var(--muted);"></div>
      <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--muted-fg); margin-top: 0.375rem;">full<br>9999px</div>
    </div>
  </div>
</div>

<div class="v-demo">
  <div class="v-label">Container Max-Width</div>
  <div style="position: relative; height: 2.5rem; border: 1px dashed var(--border); border-radius: var(--radius); overflow: hidden;">
    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 100%; max-width: 80rem; background: var(--brand-teal); opacity: 0.12; border-radius: var(--radius);"></div>
    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--muted-fg); white-space: nowrap;">container-max: 80rem (1280px)</div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

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

## Line Length

| Context | Max width | Reference |
|---------|-----------|-----------|
| Persuade body (default) | 75ch | `typography.line-length.body` |
| Inform/Narrate body | 65ch | `composition.inform-web-page.coupling.line-length` |
| Tinted/dark backgrounds | 65ch | `composition.persuade-web-page.coupling.tinted-line-length` |

Line length is a readability constraint, not a layout constraint. It limits the measure (characters per line) regardless of container width.

</details>
