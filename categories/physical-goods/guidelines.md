---
layout: visual
title: Physical Goods Guidelines
---

<div class="v-demo">
  <div class="v-label">Visual Mood — "Clean, premium, understated."</div>
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
    <div class="v-card-title" style="font-family: Lato, sans-serif; font-weight: 700; font-size: 1.25rem; color: oklch(0.141 0.005 285.823)">Clean, premium, understated.</div>
    <div class="v-card-desc" style="color: oklch(0.552 0.016 285.938)">Matte finishes, generous negative space, teal as a precise accent. Engineering confidence in physical form.</div>
  </div>
</div>

<details class="v-details"><summary>Guidelines</summary>

# Physical Goods Guidelines

## Overview

Physical goods are any Verdigris-branded items that exist in the real world: hardware labels and enclosure markings on energy monitoring devices, trade show materials (banners, backdrops, table covers), business cards, sticker sheets, branded swag (t-shirts, notebooks, pens), and product packaging. These items represent the brand in professional environments — data centers, commercial buildings, utility conferences — where credibility and precision matter.

Unlike screen-based surfaces, physical goods are subject to ink gamut limitations, substrate variation, and viewing conditions that differ dramatically from a calibrated monitor. This guide defines the constraints, token mappings, and approval workflows that keep physical output consistent with the digital brand.

## Mood & Style

Clean, premium, understated. Verdigris hardware is installed in mission-critical infrastructure — the brand voice in physical form should reflect that same engineering confidence. Think matte finishes, generous negative space, and teal used as a precise accent rather than a saturating wash.

Key adjectives: **professional, precise, restrained, durable, trustworthy.**

Avoid: playful, loud, maximalist, glossy-consumer-tech aesthetics. The audience is facility managers, energy engineers, and CTOs — not end consumers browsing a retail shelf.

## Specifications

### Business Cards

| Property | Value | Notes |
|----------|-------|-------|
| Dimensions | 3.5 x 2" (89 x 51 mm) | Standard US size |
| Bleed | 0.125" (3 mm) all sides | Extend backgrounds to bleed edge |
| Safe zone | 0.125" (3 mm) inside trim | Keep all text and logos within safe zone |
| Resolution | 300 DPI minimum | 600 DPI preferred for small type |
| Color mode | CMYK (process) or Pantone (spot) | See Token Usage below |
| Paper stock | 16pt or heavier, matte or soft-touch | Avoid glossy lamination |

### Sticker Sheets

| Property | Value | Notes |
|----------|-------|-------|
| Common sizes | 2 x 2" (logo die-cut), 3 x 1" (URL/tagline strip), 4 x 3" (sheet of mixed) | Request specific die lines from vendor |
| Bleed | 0.0625" (1.5 mm) beyond die line | |
| Resolution | 300 DPI minimum | |
| Substrate | Matte vinyl or matte paper | Vinyl for outdoor/equipment use |
| Finish | Matte laminate | Avoid high-gloss on stickers applied to hardware |

### Hardware Labels

| Property | Value | Notes |
|----------|-------|-------|
| Dimensions | Varies by enclosure — typical: 2.5 x 1" (serial/model), 4 x 2" (product identity) | Confirm with hardware engineering |
| Material | Polyester or polycarbonate (UL-rated where required) | Must withstand data center operating temps |
| Adhesive | Permanent, high-temperature rated | Labels must not peel in 35 C+ environments |
| Resolution | 600 DPI minimum | Small type on labels requires higher resolution |
| Color mode | CMYK or screen print (1-2 spot colors) | Minimize ink layers on industrial labels |
| Minimum type size | 6pt (legibility on small labels) | Use `Inter` at medium weight (500) for readability |

### Trade Show & Large Format

| Property | Value | Notes |
|----------|-------|-------|
| Banner sizes | 33 x 80" (retractable), 8 x 3' (table backdrop) | Request templates from vendor |
| Resolution | 150 DPI at full size | 300 DPI at half size is equivalent |
| Bleed | Per vendor spec — typically 0.5-1" | Always request bleed template |
| Color mode | CMYK | Large-format inkjet printers — Pantone matching not available |
| File format | PDF/X-1a or high-res TIFF | No RGB, no transparency |

### Swag (T-Shirts, Notebooks, Misc.)

| Property | Value | Notes |
|----------|-------|-------|
| Print method | Screen print (1-3 colors) or DTG (full color) | Screen print preferred for durability |
| Logo artwork | Vector (SVG/EPS/AI) | Never supply raster logos for garment printing |
| Minimum logo width | 2" on garments, 1" on small items (pens, lanyards) | |
| Thread count (embroidery) | Simplify logo to 3 colors max, 0.25" minimum detail | Fine gradients do not reproduce in thread |

### Packaging

| Property | Value | Notes |
|----------|-------|-------|
| Color mode | CMYK + Pantone spot for brand teal | Offset lithography for production runs |
| Bleed | 0.125" (3 mm) | |
| Dieline | Provided by packaging vendor — all artwork must fit within dieline | |
| Barcode clear zone | 0.25" (6 mm) quiet zone around UPC/QR | |
| Unboxing order | Brand identity visible on first surface revealed | Logo and teal accent on inner flap or sleeve |

## Token Usage

### Colors

Physical goods cannot use OKLch or HSL CSS values. **Use hex values from `build/dist/hex/colors.json`** as the starting point for all print color specifications.

**Primary brand teal** (`color.brand.verdigris`): The hex output from the build pipeline is the reference for screen-based proofs. For offset printing and spot-color jobs, use **Pantone PMS 3262 C** as the closest Pantone match. Always request a press proof against PMS 3262 C — do not rely on CMYK builds of teal, which tend to shift toward cyan under standard printing conditions.

**Dark text and body copy**: Use the hex equivalent of `color.neutral.950` from `build/dist/hex/colors.json`. This is the primary foreground color in light mode and provides the correct near-black with the subtle zinc tint from the brand neutral scale.

**Secondary dark** (`color.neutral.900`): Use the hex equivalent for secondary text, captions, and QR codes.

**White and light backgrounds**: Use the hex equivalent of `color.neutral.white` or `color.neutral.50`. On uncoated paper stocks, pure white is the paper itself — use `color.neutral.50` only when printing a tinted background is intentional.

**Accent colors**: `color.brand.midnight-purple`, `color.brand.pastel-red`, and `color.brand.cyber-yellow` may be used sparingly on trade show materials and swag where the full brand palette is appropriate. Obtain Pantone swatches for any spot-color use of these accents — the build pipeline hex values are approximations for screen preview, not print-accurate targets.

**Colors to avoid in print**: Do not use the gradient interpolation steps (`color.brand.mix-step-1` through `color.brand.cyber-yellow-step-3`) on physical goods. Smooth gradients reproduce poorly in screen printing and on industrial labels.

### Typography

- **Inter** — body text, product labels, technical specifications, business card details. Use weights 400 (regular) and 500 (medium). Embed the font or convert to outlines in all print-ready files.
- **Lato** — marketing headlines on trade show banners, packaging feature callouts, and large-format signage. Weight 700 (bold) only.
- **JetBrains Mono** — serial numbers, model numbers, MAC addresses, and any machine-readable text on hardware labels. Weight 400 only.

All fonts must be outlined (converted to paths) in final production files. Do not rely on the printer having fonts installed.

### Spacing

- **Minimum clear space around the Verdigris logo**: Equal to the height of the logo mark on all sides. This is a hard minimum — more space is always better.
- **Margin from trim edge**: All text and critical artwork must sit at least 0.125" (3 mm) inside the trim line, or per the vendor's safe zone specification if larger.
- **Information density on hardware labels**: Prioritize legibility over completeness. If a label is too crowded at the minimum type sizes listed above, move secondary information to a QR code destination.

## Do's

1. **Do:** Maintain consistent logo sizing across all physical goods. The minimum clear space rule (clear space = logo height) applies everywhere — business cards, labels, banners, and swag.
   <!-- ![Good example](assets/good-logo-clear-space.png) -->

2. **Do:** Use brand teal (`color.brand.verdigris` / PMS 3262 C) as an accent — a rule line, a logo mark fill, an icon highlight. On physical goods, teal is most effective in small, precise doses.
   <!-- ![Good example](assets/good-teal-accent-business-card.png) -->

3. **Do:** Use Inter at weight 500 (medium) for all product labels and hardware markings. Medium weight provides better legibility at small sizes on physical substrates than regular weight (400).

4. **Do:** Use Lato at weight 700 (bold) for marketing headlines on trade show banners and packaging. The display font provides the typographic contrast needed at large scale.

5. **Do:** Render QR codes using the hex equivalent of `color.neutral.900` on a white or `color.neutral.50` background. Ensure the quiet zone around the QR code is at least 4 modules wide. Test scannability on the actual printed substrate before final production.

## Don'ts

1. **Don't:** Use brand teal (`color.brand.verdigris`) as a large fill area on physical products. OKLch-defined teal maps cleanly to screen rendering, but in CMYK printing the color shifts noticeably toward cyan when covering large areas. Use teal for accents and the logo mark only. Large background areas should use `color.neutral.950`, `color.neutral.white`, or a light `color.neutral.50`.
   <!-- ![Bad example](assets/bad-teal-large-fill.png) -->

2. **Don't:** Set any text below 8pt (6pt is permitted only on hardware labels where space is physically constrained — see Hardware Labels spec above). Marketing materials, business cards, and packaging should treat 8pt as the absolute floor for legibility.
   <!-- ![Bad example](assets/bad-small-type.png) -->

3. **Don't:** Place critical information (phone numbers, URLs, regulatory text) inside the brand gradient or over gradient transitions. Multi-color gradients reproduce inconsistently across print methods, substrates, and vendors. Critical text must sit on solid color backgrounds.

4. **Don't:** Use metallic foil, spot UV, embossing, or other specialty print treatments without explicit approval from the brand team. These treatments have high per-unit cost, add production complexity, and can conflict with the understated brand aesthetic if applied carelessly.

5. **Don't:** Supply RGB files to print vendors. All production artwork must be converted to CMYK (with Pantone spot channels where applicable) before handoff. RGB-to-CMYK conversion at the printer's RIP produces unpredictable color shifts, especially for teal.

## Templates & Starting Points

- **Business card template**: Request the current Figma file from the brand team. The template includes bleed marks, safe zone guides, and correctly placed logo with Inter/Lato type.
- **Trade show banner template**: Vendor-specific — request dieline templates from the print vendor, then apply brand elements following this guide.
- **Hardware label template**: Coordinate with hardware engineering for enclosure dimensions and UL/regulatory requirements before designing.
- **Sticker die-cut template**: Standard 2 x 2" circle and 3 x 1" rectangle templates are available in the brand Figma library.

## Deviation from Patina

Physical goods are a **justified deviation** from Patina's screen-first design system. The reasons are structural, not stylistic:

- **Color space translation**: Patina defines all colors in OKLch, which has no direct analog in CMYK or Pantone systems. The hex output from `build/dist/hex/colors.json` is an intermediate step, not a final print spec. Pantone matching (PMS 3262 C for brand teal) is necessary for any spot-color or offset work, and press proofing is mandatory.
- **Substrate variation**: Screen rendering is consistent and backlit. Print output varies by paper stock, ink density, coating, and press calibration. Colors that look identical on screen will diverge on matte vs. coated paper.
- **Font rendering**: Inter and Lato render with subpixel precision on screens. In print, small sizes and thin weights lose definition. This guide specifies minimum sizes and preferred weights that differ from Patina's screen-optimized defaults.
- **No dark mode**: Physical goods do not have a light/dark toggle. The semantic token layer (`tokens/color/semantic-light.json`, `tokens/color/semantic-dark.json`) does not apply. Use the base color tokens and their hex equivalents directly.

These deviations are constrained to the physical medium. Brand identity (logo, teal accent usage, typography pairing, tone) remains fully aligned with Patina.

## Related

- [Color foundations](../../foundations/color.md) — OKLch rationale, brand palette, and hex output documentation
- [Typography foundations](../../foundations/typography.md) — Font stack, type scale, and weight specifications
- [Hex color output](../../build/dist/hex/colors.json) — Machine-generated hex values for all tokens (use as print starting point)
- [Base color tokens](../../tokens/color/base.json) — Canonical OKLch definitions

</details>
