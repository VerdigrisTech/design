---
layout: visual
title: Ads & Templates Guidelines
status: partial
status_note: Needs finalized template files and real campaign examples before this guide is complete.
---

<div class="v-demo">
  <div class="v-label">Visual Mood — "Precise, masterful, refined, pioneering."</div>
  <div class="v-swatches">
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.75 0.1286 191.57)"></div>
      <div class="v-swatch-name">Verdigris</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.21 0.006 285.885)"></div>
      <div class="v-swatch-name">neutral.900</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.7 0.1909 24.11)"></div>
      <div class="v-swatch-name">Pastel Red</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.985 0 0)"></div>
      <div class="v-swatch-name">neutral.50</div>
    </div>
  </div>
  <div class="v-gradient" style="height: 4px; background: linear-gradient(to right, oklch(0.75 0.1286 191.57), oklch(0.29 0.1506 289.33), oklch(0.7 0.1909 24.11))"></div>
  <div class="v-card" style="margin-top: 1rem; padding: 1.5rem; background: oklch(0.985 0 0); border-left: 3px solid oklch(0.75 0.1286 191.57)">
    <div class="v-card-title" style="font-family: Lato, sans-serif; font-weight: 700; font-size: 1.25rem; color: oklch(0.141 0.005 285.823)">Precise, masterful, refined, pioneering.</div>
    <div class="v-card-desc" style="color: oklch(0.552 0.016 285.938)">Credibility through restraint. Sophisticated buyers, not impulse shoppers.</div>
  </div>
  <div class="v-grid-2" style="margin-top: 1rem;">
    <div class="v-card" style="padding: 1rem;">
      <div class="v-comp-label">Recovered News Banner</div>
      <img src="../../assets/banners/verdigris-banner.avif" alt="Recovered Verdigris banner asset used for news and editorial surfaces" style="width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid var(--border);" />
    </div>
    <div class="v-card" style="padding: 1rem;">
      <div class="v-comp-label">Recovered Press Banner</div>
      <img src="../../assets/banners/verdigris-banner-green.avif" alt="Recovered green Verdigris banner asset used for press surfaces" style="width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid var(--border);" />
    </div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Guidelines</summary>

# Ads & Templates Guidelines

## Overview

This category covers all produced marketing collateral at Verdigris: display advertising (Google Display Network, LinkedIn, social media), email templates, sales collateral (one-pagers, case studies, data sheets), and presentation decks. These materials extend the web brand into channels with strict format constraints and limited attention windows. Every piece must feel like it belongs alongside the Verdigris product and website — precise, intelligent, and restrained.

## Mood & Style

Verdigris collateral embodies all four brand pillars. We sell energy intelligence to sophisticated buyers — facility managers, sustainability directors, and C-suite executives. The visual tone communicates credibility through restraint, not volume.

- **Precise:** Clean geometry, aligned grids, intentional whitespace. Every element earns its place.
- **Masterful:** Confident typography, controlled color palette, no visual clutter. The design demonstrates the same rigor as our product.
- **Refined:** Subtle use of the brand gradient, professional photography, understated data visualizations.
- **Pioneering:** OKLch color science, perceptual gradient interpolation, data-driven proof points (8 kHz, sub-cycle) that signal technical leadership no competitor can claim.

This is **not** salesy, loud, or promotional in the conventional sense. No starbursts, no "ACT NOW" banners, no stock photos of people pointing at screens. If a piece could belong to any B2B SaaS company, it is not Verdigris.

## Specifications

### Display Ads

| Format | Dimensions | Max File Size | File Type | Notes |
|--------|-----------|---------------|-----------|-------|
| Medium Rectangle | 300 x 250 px | 150 KB | PNG, JPG, GIF, HTML5 | Highest volume — design this first |
| Leaderboard | 728 x 90 px | 150 KB | PNG, JPG, GIF, HTML5 | Constrained height — headline + CTA only |
| Wide Skyscraper | 160 x 600 px | 150 KB | PNG, JPG, GIF, HTML5 | Vertical layout — stack elements |
| Social / LinkedIn Feed | 1200 x 628 px | 5 MB | PNG, JPG | 1.91:1 ratio — also used for Open Graph |
| LinkedIn Carousel | 1080 x 1080 px | 10 MB per card | PNG, JPG | Square — max 10 cards |
| Instagram / Square | 1080 x 1080 px | 5 MB | PNG, JPG | Use for cross-posting |

### Email Templates

| Property | Value | Notes |
|----------|-------|-------|
| Max width | 600 px | Centered in client viewport |
| Min body text | 14 px (`fontSize.body-small`) | Gmail clips at smaller sizes on mobile |
| Image width | 600 px max, @2x for retina | Provide 1200 px source, render at 600 px |
| File format | Inline HTML + CSS | No external stylesheets — clients strip `<link>` |
| Background | `color.neutral.white` or `color.neutral.50` | Dark mode: let clients invert; do not force |

### Sales Collateral (PDF)

| Property | Value | Notes |
|----------|-------|-------|
| Page size | Letter (8.5 x 11 in) or A4 | Default to Letter for US audiences |
| Bleed | 0.125 in (3 mm) | Required for professional print |
| Color space | CMYK for offset print, RGB for digital-only | Use hex values from `hex/colors.json` for digital PDF |
| Resolution | 300 DPI minimum for print, 150 DPI for digital-only | |
| Body text minimum | 10 pt | 9 pt absolute minimum for captions |
| Export format | PDF/X-1a (print) or PDF (digital) | |

### Presentation Decks

| Property | Value | Notes |
|----------|-------|-------|
| Aspect ratio | 16:9 | Standard widescreen |
| Slide dimensions | 1920 x 1080 px | Matches projector/screen native resolution |
| Body text minimum | 18 px | Must be legible from back of a conference room |
| Max bullet points per slide | 5 | If more, split into two slides |
| Export format | PPTX (editable), PDF (sharing) | |

## Token Usage

### Colors

The brand palette is defined in `tokens/color/base.json`. For print and static ad contexts where CSS custom properties are not available, use the hex equivalents from `hex/colors.json` in the build output.

| Role | Token | Usage |
|------|-------|-------|
| Primary accent | `color.brand.verdigris` | CTA buttons, accent lines, icon highlights. Never as body text on light backgrounds (fails WCAG AA). |
| Deep anchor | `color.brand.midnight-purple` | Dark backgrounds, section dividers, footer bars |
| Warm highlight | `color.brand.pastel-red` | Sparingly for data callouts, secondary accent |
| Caution / energy | `color.brand.cyber-yellow` | Sparingly for metric highlights, chart accents |
| Light backgrounds | `color.neutral.white`, `color.neutral.50` | Page backgrounds, card surfaces |
| Dark backgrounds | `color.neutral.950`, `color.neutral.900` | Hero sections, footers, dark-mode slides |
| Body text (light bg) | `color.neutral.950` | Primary reading text |
| Body text (dark bg) | `color.neutral.50` | Inverted reading text |
| Muted text | `color.neutral.500` | Captions, disclaimers, secondary info |
| Borders / dividers | `color.neutral.200` | Subtle structural lines |

**Rule:** Use a maximum of two accent colors per piece (e.g., `color.brand.verdigris` + `color.brand.midnight-purple`). A third accent is permitted only in data visualizations where color-coding demands it.

### Typography

Typefaces are defined in `tokens/typography/font-family.json`. Sizes and weights are in `tokens/typography/scale.json`.

| Role | Font | Weight | Size range |
|------|------|--------|------------|
| Headlines / titles | `fontFamily.display` (Lato) | `fontWeight.bold` (700) | 24 px - 48 px depending on format |
| Body copy | `fontFamily.sans` (Inter) | `fontWeight.regular` (400) | 14 px - 18 px (`fontSize.body-small` to `fontSize.body-medium`) |
| CTAs / labels | `fontFamily.sans` (Inter) | `fontWeight.semibold` (600) | 14 px - 16 px |
| Data / metrics | `fontFamily.mono` (JetBrains Mono) | `fontWeight.regular` (400) | 14 px - 24 px |
| Captions / legal | `fontFamily.sans` (Inter) | `fontWeight.regular` (400) | 10 px - 12 px (print only, min 14 px for digital) |

**Note:** For email templates, fallback to system fonts. Not all email clients load custom fonts. The `fontFamily.sans` stack includes `-apple-system, 'Roboto', sans-serif` as fallbacks.

### Spacing

Use the 4 px grid from `tokens/spacing/base.json`. Key values for collateral:

| Token | Value | Use in collateral |
|-------|-------|-------------------|
| `spacing.4` | 16 px | Internal padding in ad units |
| `spacing.6` | 24 px | Section spacing in emails |
| `spacing.8` | 32 px | Section spacing in one-pagers |
| `spacing.12` | 48 px | Major section breaks in decks |
| `spacing.16` | 64 px | Page margins in PDFs |

## Do's

1. **Do:** Place the Verdigris logo consistently in the **top-left or bottom-left** corner of every piece. This matches the web header convention and builds spatial recognition across touchpoints.

2. **Do:** Use `fontFamily.display` (Lato) for headlines and `fontFamily.sans` (Inter) for all body copy. This pairing is the same as the marketing website, and collateral should feel like a direct extension of it.

3. **Do:** Maintain generous whitespace — at least 30% of any ad unit should be negative space. In constrained formats like the 728 x 90 leaderboard, this means limiting content to a headline, logo, and single CTA.

4. **Do:** Include exactly one clear call-to-action per ad. Multiple CTAs split attention and reduce click-through rate. For longer-form pieces (one-pagers, decks), one primary CTA per page or slide.

5. **Do:** Use hex values from `hex/colors.json` when working in print or static-image contexts where CSS tokens are unavailable. These are generated from the canonical OKLch values and stay in sync through the build pipeline.

6. **Do:** Design the 300 x 250 medium rectangle first. It is the highest-volume format and forces the tightest editorial discipline. Adapt outward to other sizes from this base.

## Don'ts

1. **Don't:** Use `color.brand.verdigris` as body text on white or light backgrounds. The brand teal has a contrast ratio below 3:1 against `color.neutral.white`, which fails WCAG AA for both normal and large text. Use `color.neutral.950` for text, and reserve teal for buttons, accents, and decorative elements.

2. **Don't:** Use more than two accent colors in a single piece. A one-pager using `color.brand.verdigris`, `color.brand.pastel-red`, and `color.brand.cyber-yellow` simultaneously reads as chaotic, not energetic. Pick a primary accent and one supporting accent.

3. **Don't:** Set body text below 14 px in any digital format (ads, email, social). At smaller sizes, Inter loses legibility on non-retina screens and in compressed image formats. For print, the floor is 10 pt.

4. **Don't:** Use ALL CAPS for body text or paragraphs. ALL CAPS is permitted only for short labels (2-3 words max, e.g., "CASE STUDY", "NEW FEATURE") set in `fontWeight.semibold` with increased `letterSpacing.heading`. Full sentences in all caps are unreadable and feel aggressive.

5. **Don't:** Use decorative, script, or novelty typefaces anywhere. The type system is `fontFamily.display` (Lato), `fontFamily.sans` (Inter), and `fontFamily.mono` (JetBrains Mono). There are no exceptions for "creative" collateral — the constraint is the brand.

6. **Don't:** Hardcode color values. Always reference token names in design specs and handoffs. If a hex value is needed for a production file (e.g., a Photoshop document), pull it from the build output at `hex/colors.json`, not from memory or a color picker.

## Templates & Starting Points

Standard templates are maintained in Figma (access through the Verdigris design team). When Figma links become available, they will be listed here.

### Recovered Brand Banner Assets

- [verdigris-banner.avif](../../assets/banners/verdigris-banner.avif) — canonical editorial/news banner recovered from the legacy marketing-site source repo
- [verdigris-banner-green.avif](../../assets/banners/verdigris-banner-green.avif) — green press/banner variant recovered from the legacy marketing-site source repo

These should be treated as reference assets for on-brand collateral and specimen work. They are useful for understanding composition, cropping, and brand treatment, but they do not replace proper source templates in Figma.

### Planned Templates

| Template | Format | Status |
|----------|--------|--------|
| Google Display ad set (300x250, 728x90, 160x600) | Figma + exported assets | Planned |
| LinkedIn / social image (1200x628) | Figma | Planned |
| Email — product announcement | HTML + Figma | Planned |
| Email — monthly newsletter | HTML + Figma | Planned |
| One-pager — product overview | Figma + PDF | Planned |
| Case study — 2-page | Figma + PDF | Planned |
| Presentation deck — sales pitch | Figma + PPTX | Planned |
| Presentation deck — conference talk | Figma + PPTX | Planned |

### Template Principles

Until templates are available, follow these structural rules:

- **Ads:** Logo (top-left), headline (center or left-aligned), single CTA button (bottom), background from neutral scale or brand gradient.
- **Emails:** Logo header (centered, 120 px wide max), single-column body at 600 px, CTA button using `color.brand.verdigris` background with `color.neutral.white` text, footer with unsubscribe and address.
- **One-pagers:** Logo top-left, headline and subhead in top third, two-column body with supporting data/charts, CTA or contact block at bottom.
- **Decks:** Title slide with brand gradient background, content slides with `color.neutral.white` background, section dividers using `color.brand.midnight-purple`, closing slide with CTA and contact info.

## Related

- [Color foundations](../../foundations/color.md) — Full palette rationale and WCAG contrast guidance
- [Typography foundations](../../foundations/typography.md) — Font selection, scale, and pairing logic
- [Accessibility foundations](../../foundations/accessibility.md) — Contrast requirements and inclusive design
- [Spacing foundations](../../foundations/spacing.md) — Grid system and spacing scale
- [Dark mode foundations](../../foundations/dark-mode.md) — Inverted color strategy for dark backgrounds
- [tokens/color/base.json](../../tokens/color/base.json) — Canonical OKLch color tokens
- [tokens/typography/font-family.json](../../tokens/typography/font-family.json) — Font family tokens
- [tokens/typography/scale.json](../../tokens/typography/scale.json) — Size, weight, and line-height tokens

</details>
