---
layout: visual
title: Photography Guidelines
---

<div class="v-demo">
  <div class="v-label">Visual Mood — "Technical but approachable."</div>
  <div class="v-swatches">
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.75 0.1286 191.57)"></div>
      <div class="v-swatch-name">Verdigris</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.141 0.005 285.823)"></div>
      <div class="v-swatch-name">neutral.950</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.92 0.004 286.32)"></div>
      <div class="v-swatch-name">neutral.200</div>
    </div>
    <div class="v-swatch">
      <div class="v-swatch-color" style="background: oklch(0.985 0 0)"></div>
      <div class="v-swatch-name">neutral.50</div>
    </div>
  </div>
  <div class="v-gradient" style="height: 4px; background: linear-gradient(to right, oklch(0.75 0.1286 191.57), oklch(0.141 0.005 285.823))"></div>
  <div class="v-card" style="margin-top: 1rem; padding: 1.5rem; background: oklch(0.985 0 0); border-left: 3px solid oklch(0.75 0.1286 191.57)">
    <div class="v-card-title" style="font-family: Lato, sans-serif; font-weight: 700; font-size: 1.25rem; color: oklch(0.141 0.005 285.823)">Technical but approachable.</div>
    <div class="v-card-desc" style="color: oklch(0.552 0.016 285.938)">Real infrastructure, real teams, honest lighting. Photography is evidence, not decoration.</div>
  </div>
</div>

<details class="v-details"><summary>Guidelines</summary>

# Photography Guidelines

## Overview

Photography at Verdigris communicates what the brand actually does: intelligent energy management for buildings, data centers, and hardware infrastructure. Every photo should reinforce the intersection of **physical environments** and **digital intelligence** — the spaces where Verdigris technology operates. Photography is not decoration; it is evidence of the real world the product serves.

Verdigris is a cleantech company. The photography should feel technical but human, grounded in real environments, and unmistakably tied to energy, buildings, and the people who work with them.

## Mood & Style

### Visual Tone

**Technical but approachable.** Photos should feel like the viewer is getting an honest look at real infrastructure, real teams, and real technology — not a polished advertisement. Clean compositions, natural or controlled lighting, and a preference for environmental context over isolated subjects.

### Adjectives

- Clean
- Modern
- Grounded
- Purposeful
- Warm (not cold/clinical)

### What "Verdigris Photography" Feels Like

- A well-lit data center corridor with visible cable management and server racks — orderly, not chaotic
- An engineer reviewing a dashboard on a tablet in a mechanical room — human presence in a technical space
- A building exterior at dusk with warm interior light visible — the transition from physical to digital
- A team working together at a whiteboard — candid, not posed

### What It Does NOT Feel Like

- A stock photo of two people shaking hands in front of a glass building
- A pure-white studio shot of a generic circuit board
- An oversaturated aerial drone shot with HDR processing
- A dark, moody server room lit only by blue LEDs

## Specifications

### Image Dimensions

| Context | Aspect Ratio | Minimum Resolution | Notes |
|---------|-------------|-------------------|-------|
| Hero / full-width banner | 16:9 | 2400 x 1350px | Must work with text overlay |
| Card thumbnail | 3:2 | 1200 x 800px | Focal point should be center-weighted |
| Team portrait | 1:1 | 800 x 800px | Headshots and profile images |
| Blog / inline | 16:9 or 3:2 | 1600 x 900px | Responsive — will crop on mobile |
| Social media (Open Graph) | 1.91:1 | 1200 x 630px | Required for link previews |

### File Formats

| Format | Use Case | Notes |
|--------|----------|-------|
| **WebP** | Primary web format | Preferred for all web surfaces. ~30% smaller than JPEG at equivalent quality. |
| **JPEG** | Fallback | Use when WebP is not supported (email templates, legacy systems). Quality 80-85. |
| **PNG** | Screenshots, UI overlays | Only for images that require transparency or contain sharp text/UI elements. |
| **AVIF** | Future consideration | Better compression than WebP, but browser support is still maturing. Not required yet. |

### File Size Budgets

| Context | Maximum File Size | Notes |
|---------|------------------|-------|
| Hero image | 300 KB | After compression. Use responsive `srcset` to serve smaller versions on mobile. |
| Card thumbnail | 100 KB | Lazy-loaded below the fold. |
| Team portrait | 80 KB | Small dimensions keep this naturally light. |
| Inline / blog | 200 KB | Consider `loading="lazy"` for all below-fold images. |

### Resolution

- All screenshots and example images should be exported at **2x resolution** for Retina displays
- Maximum width: **2400px** — anything larger adds file size without visual benefit on current displays
- Always provide both 1x and 2x versions for hero images, or use responsive `srcset`

## Token Usage

### Colors

Photography rarely exists in isolation — it appears inside cards, heroes, and layouts where brand tokens define the surrounding context.

**Overlay tints:** When placing text over a photo, use a semi-transparent overlay derived from the brand palette:

- `color.brand.midnight-purple` at 60-80% opacity for dark overlays — ensures white text meets WCAG AA contrast (4.5:1 minimum for body text, 3:1 for large headings)
- `color.brand.verdigris` at 10-20% opacity for a subtle teal color wash — decorative only, never under text
- `color.neutral.950` at 50-70% opacity for a neutral dark overlay — use when brand color tinting is inappropriate

**Borders and frames:** When a photo appears in a card or grid layout:

- Use `color.neutral.200` (light mode) or `color.neutral.800` (dark mode) for subtle borders
- For featured/highlighted photos, a 2px border in `color.brand.verdigris` signals emphasis

**Duotone treatments:** For stylized non-photorealistic uses (e.g., background textures, abstract section dividers):

- Map shadows to `color.brand.midnight-purple`
- Map highlights to `color.brand.verdigris`
- This creates an on-brand tonal image without introducing off-palette colors

### Typography

When text appears over photography:

- Use **Lato 700** for headings — the heavier weight maintains legibility over busy backgrounds
- Use **Inter 400 or 500** for body text — always over a solid or semi-transparent overlay, never directly on an unprocessed photo
- Minimum text size over photography: **18px** (to qualify as "large text" under WCAG, reducing the contrast ratio requirement to 3:1)

### Spacing

- Photos in card grids should respect the system spacing scale — use `spacing.6` (24px) or `spacing.8` (32px) for gaps between photo cards
- Inset padding for text overlays on hero images: minimum `spacing.8` (32px) on all sides
- Photos should never bleed to the absolute edge of a viewport without intentional full-bleed design

## Do's

1. **Do:** Photograph real Verdigris environments — data centers, building mechanical rooms, electrical panels, server racks, office spaces. Authentic context communicates credibility in a way stock photography cannot.
   <!-- ![Good example](assets/good-data-center-corridor.png) -->

2. **Do:** Include people in technical environments. An engineer checking a panel, a team reviewing data on a screen, a technician in a server room. The human element keeps the brand from feeling cold or impersonal.
   <!-- ![Good example](assets/good-engineer-dashboard.png) -->

3. **Do:** Use natural or balanced artificial lighting. Overhead fluorescents in a real mechanical room are fine — they are honest. Supplement with controlled fill light if needed, but do not create a studio look in a field environment.
   <!-- ![Good example](assets/good-natural-lighting.png) -->

4. **Do:** Apply teal accent overlays using `color.brand.verdigris` at low opacity (10-20%) for decorative photo treatments. This ties the image to the brand palette without overwhelming the photographic content.
   <!-- ![Good example](assets/good-teal-overlay.png) -->

5. **Do:** Provide meaningful `alt` text for every photograph. Describe what the image conveys, not what it literally depicts. "Engineer monitoring real-time energy data on a building management dashboard" is better than "Person looking at a screen."

## Don'ts

1. **Don't:** Use generic stock photography — handshake images, abstract glowing shapes, people pointing at blank whiteboards, or staged diversity poses. These undermine the technical credibility Verdigris has earned through real-world deployments.
   <!-- ![Bad example](assets/bad-generic-handshake.png) -->

2. **Don't:** Oversaturate or apply heavy HDR processing. Verdigris photography should feel natural and grounded. Neon-bright colors and exaggerated dynamic range look artificial and conflict with the measured, clean brand palette.
   <!-- ![Bad example](assets/bad-oversaturated-hdr.png) -->

3. **Don't:** Use pure black-and-white treatments. The brand palette exists to create a consistent tonal identity. Stripping color removes the connection to `color.brand.verdigris` and the broader palette. If you need a desaturated look, use the duotone treatment described in Token Usage above.
   <!-- ![Bad example](assets/bad-black-white-treatment.png) -->

4. **Don't:** Use watermarked, low-resolution, or rights-ambiguous images. Every photograph used in Verdigris materials must have clear licensing (owned, licensed, or Creative Commons with proper attribution). Watermarks are never acceptable in any context.
   <!-- ![Bad example](assets/bad-watermarked-image.png) -->

5. **Don't:** Hardcode color values for overlays or tints. Always reference the design token (e.g., `color.brand.midnight-purple`) rather than a raw hex or RGB value. This ensures consistency if the palette evolves.

## Subject Matter Guide

### Priority Subjects

| Subject | Why | Notes |
|---------|-----|-------|
| **Data centers** | Core deployment environment | Show racks, cooling systems, cable management, monitoring screens |
| **Building exteriors** | Verdigris monitors buildings | Daytime or dusk shots that show scale and context |
| **Mechanical/electrical rooms** | Where hardware lives | Panels, meters, conduit, sensors — the real infrastructure |
| **Hardware close-ups** | Verdigris makes physical sensors | Circuit boards, sensor housings, installation details |
| **Team at work** | Human element | Candid office shots, whiteboard sessions, field work |
| **Dashboards / screens** | The software product | Screenshots of Patina or monitoring interfaces in context (on a monitor, tablet) |

### Secondary Subjects

| Subject | Notes |
|---------|-------|
| City skylines | Only if the building context is relevant — not as generic decoration |
| Energy infrastructure | Power lines, transformers, substations — when editorially relevant |
| Abstract technology | Only as duotone/stylized background textures, never as primary imagery |

## Templates & Starting Points

- **Hero overlay template:** Dark overlay using `color.brand.midnight-purple` at 70% opacity, white heading text in Lato 700, subtext in Inter 400. Minimum 32px inset padding.
- **Photo card component:** 3:2 aspect ratio, `color.neutral.200` border (1px), 8px border radius matching `radius.lg`, image covers full card area with `object-fit: cover`.
- **Team portrait grid:** 1:1 aspect ratio, circular crop, `color.neutral.100` background behind each portrait, `spacing.6` gap between items.

## Related

- [Color foundations](../../foundations/color.md) — Brand palette rationale, OKLch values, and WCAG contrast guidance
- [Accessibility foundations](../../foundations/accessibility.md) — Alt text requirements, color contrast ratios, and color independence rules
- [Typography foundations](../../foundations/typography.md) — Font stacks and type scale for text-over-photo layouts
- [Dark mode foundations](../../foundations/dark-mode.md) — How photo overlays and borders adapt between light and dark themes
- [tokens/color/base.json](../../tokens/color/base.json) — Canonical brand color values
- [tokens/color/semantic-light.json](../../tokens/color/semantic-light.json) — Semantic color mappings (light mode)
- [tokens/color/semantic-dark.json](../../tokens/color/semantic-dark.json) — Semantic color mappings (dark mode)

</details>
