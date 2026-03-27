# Illustration Guidelines

## Overview

Illustration at Verdigris exists to make complex energy and IoT concepts tangible. Electrical metering, building systems, circuit-level data flows, and machine-learning pipelines are inherently abstract -- illustration translates them into visual models that users and prospects can parse in seconds. Every illustration must serve comprehension first; decoration is never the goal.

Verdigris operates in the cleantech and energy intelligence space. The visual language should project precision, credibility, and technical competence. Illustrations reinforce the idea that Verdigris understands the systems it monitors.

## Mood & Style

**Technical with polish.** Illustrations should feel like they belong in an engineering whitepaper that was professionally designed -- not in a children's app or a lifestyle blog.

Key attributes:
- **Precise:** Clean geometry, consistent stroke weights, deliberate alignment
- **Structured:** Grid-based composition, clear visual hierarchy, labeled layers
- **Restrained:** Minimal color palette per illustration, generous negative space
- **Confident:** No tentative linework, no sketchy textures, no wobbly hand-drawn effects

### Projection & Perspective

| Type | Use | Example |
|------|-----|---------|
| **Isometric** | System architecture, hardware topology, building diagrams | Data center floor plan, circuit breaker panel layout |
| **Flat / Outline** | Icons, spot illustrations, UI-embedded graphics | Sensor icon, meter status indicator, feature callout |
| **Orthographic** | Technical diagrams, wiring schematics, data flow | API pipeline, metering data flow from panel to cloud |

Isometric is the default for hero and explanatory illustrations. Flat/outline is the default for anything that appears inline with text or inside a UI component.

**Never:** 3D-rendered photorealism, cartoonish characters, mascots, hand-drawn/watercolor textures, or playful/whimsical styles.

## Specifications

| Property | Value | Notes |
|----------|-------|-------|
| Format (web) | SVG | Preferred for all vector illustration; scalable, theme-aware, small file size |
| Format (raster fallback) | PNG at 2x | Export at 2x resolution for Retina; max width 2400px |
| Format (social/email) | PNG at 2x | SVG not supported in most email clients |
| Stroke weight | 2px (default) | Consistent across all elements within an illustration |
| Stroke weight (detail) | 1px | For fine internal details, secondary lines, dashed connectors |
| Corner radius | 2px | Matches the system's border-radius conventions for small elements |
| Artboard padding | 24px minimum | Breathing room prevents clipping when embedded in layouts |
| Color limit | 4 colors max per illustration | Brand palette only; see Token Usage below |
| Naming convention | Lowercase, hyphens, descriptive | e.g., `hero-building-energy-flow.svg`, `icon-circuit-breaker.svg` |

### SVG Requirements

- All text must be converted to outlines (paths), or omitted entirely in favor of HTML text overlays
- Remove editor metadata (`<sodipodi:>`, `<inkscape:>`, Illustrator comments)
- Use `viewBox` instead of fixed `width`/`height` for responsive scaling
- Optimize with SVGO or equivalent before committing
- Prefer `currentColor` for strokes/fills that should adapt to light/dark mode

## Token Usage

### Colors

Illustrations must use only colors from the brand palette and neutral scale. Never introduce colors outside the token set.

**Primary accent:**
- `color.brand.verdigris` -- the default accent color for illustration highlights, active elements, and primary data lines

**Structure and scaffolding:**
- `color.neutral.200` -- light structural lines, background grid, inactive elements (light mode)
- `color.neutral.400` -- secondary structural lines, labels, annotations
- `color.neutral.800` -- structural lines and scaffolding in dark mode contexts
- `color.neutral.900` -- primary linework, outlines, text-weight strokes (light mode)
- `color.neutral.950` -- heaviest weight lines (light mode)

**Data visualization and status:**
- `color.status.destructive-light` -- error states, alerts, threshold breaches in light mode
- `color.status.destructive-dark` -- error states in dark mode illustrations
- `color.brand.cyber-yellow` -- warnings, attention highlights, active-power indicators
- `color.brand.pastel-red` -- secondary warm accent when a second highlight is needed

**Hero gradients:**
- Use the brand gradient steps (`color.brand.verdigris` through `color.brand.mix-step-1`, `color.brand.mix-step-2`, `color.brand.mix-step-3` to `color.brand.midnight-purple`) for hero illustration backgrounds and feature visuals
- Gradient direction should flow from teal to purple (left-to-right or top-to-bottom)

### Typography

Illustrations should not contain embedded text. If labels are required:
- Use HTML/CSS text overlays positioned over the illustration
- Labels use `fontFamily.sans` (Inter) at appropriate scale sizes
- Code or metric values use `fontFamily.mono` (JetBrains Mono)

### Spacing

- Align illustration placement to the spacing scale (`spacing.base` tokens)
- Maintain at least `spacing.layout.section` between an illustration and adjacent content blocks
- Icon-sized illustrations (inline) align to the text baseline with `spacing.base.2` horizontal margin

## Do's

1. **Do:** Maintain a consistent 2px stroke weight across all elements within an illustration. Uniformity in line weight is the single biggest contributor to a professional, cohesive look.

2. **Do:** Use `color.brand.verdigris` as the primary accent color. Teal is the brand signal -- when a viewer scans a page, the teal elements in an illustration should draw the eye to the most important concept.

3. **Do:** Use the brand gradient (`color.brand.verdigris` to `color.brand.midnight-purple`) for hero illustrations and marketing feature visuals. This gradient is the most recognizable Verdigris visual motif.
   <!-- ![Good example](assets/good-hero-gradient.png) -->

4. **Do:** Use isometric projection for system architecture and hardware topology diagrams. Isometric communicates three-dimensionality while keeping measurements consistent -- appropriate for a technical audience.
   <!-- ![Good example](assets/good-isometric-architecture.png) -->

5. **Do:** Use flat/outline style for icons and small spot illustrations. At small sizes, flat icons read faster and scale more predictably than detailed illustrations.

6. **Do:** Export SVGs with `viewBox` and `currentColor` so illustrations adapt to light and dark mode contexts without separate assets.

7. **Do:** Keep illustrations to 4 or fewer colors. Constraint forces clarity -- every color must earn its place by encoding distinct information.

## Don'ts

1. **Don't:** Use gradients outside the brand palette. -- Arbitrary gradients dilute brand recognition and create visual inconsistency across surfaces. Only the defined brand gradient steps are permitted.

2. **Don't:** Use a hand-drawn, sketchy, or watercolor style. -- Verdigris is an engineering company; informal visual styles undermine the precision and credibility the brand needs to project.
   <!-- ![Bad example](assets/bad-sketch-style.png) -->

3. **Don't:** Use clip art, stock illustration, or generic SaaS illustration styles (the "Corporate Memphis" look with disproportionate limbs and flat shading). -- These are instantly recognizable as generic and signal that the company did not invest in its own visual identity.
   <!-- ![Bad example](assets/bad-clip-art.png) -->

4. **Don't:** Embed text directly in illustration files (SVG `<text>` elements or rasterized labels). -- Embedded text cannot be translated, searched, or restyled. Use HTML overlays positioned over the illustration instead.

5. **Don't:** Use more than 4 colors in a single illustration. -- Exceeding the limit creates visual noise and makes it harder for the viewer to parse which colors encode which meaning. If you need more differentiation, use opacity or stroke-style variations (solid, dashed, dotted).

6. **Don't:** Mix isometric and flat projection within the same illustration. -- Mixing projection systems breaks spatial coherence and makes diagrams harder to read.

## Templates & Starting Points

- **Isometric grid:** A 30-degree isometric grid template (SVG) should be used as the base for all architecture and hardware illustrations. Maintains consistent angles and proportions across the set.
- **Icon grid:** A 24x24 / 32x32 pixel grid for flat icons, with 2px padding and 2px stroke weight pre-configured.
- **Brand gradient swatch:** A reference swatch file containing all gradient steps from `color.brand.verdigris` through `color.brand.midnight-purple` for use in design tools.

## Related

- [Color foundations](../../foundations/color.md) -- Brand palette rationale, OKLch color space, neutral scale
- [Animation guidelines](../animation/guidelines.md) -- For animated illustrations (SVG animation, scroll-triggered reveals)
- [Dark mode foundations](../../foundations/dark-mode.md) -- How illustrations should adapt between light and dark contexts
- [Accessibility foundations](../../foundations/accessibility.md) -- Contrast requirements, alt text conventions for illustrations
- [tokens/color/base.json](../../tokens/color/base.json) -- Canonical brand and neutral color values
