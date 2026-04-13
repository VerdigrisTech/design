---
layout: visual
title: Page Sections
---

<p class="v-label">Hero Section</p>
<div class="v-demo">
  <div style="background:oklch(0.141 0.005 285.823);border-radius:0.625rem;overflow:hidden;">
    <div style="padding:8rem 3rem 5rem;text-align:center;max-width:48rem;margin:0 auto;">
      <div style="font-family:var(--font-mono);font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);margin-bottom:0.75rem;">Electrical Intelligence</div>
      <h1 style="font-family:Lato,sans-serif;font-size:clamp(2rem,5vw,4rem);font-weight:700;color:oklch(0.985 0 0);letter-spacing:-0.02em;line-height:1.1;margin-bottom:1rem;">AI-Grade Power Monitoring</h1>
      <p style="font-size:1.125rem;color:oklch(0.705 0.015 286.067);line-height:1.7;max-width:36rem;margin:0 auto 2rem;">Precision energy intelligence that turns buildings into assets.</p>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        <button style="font-family:var(--font-body);background:oklch(0.75 0.1286 191.57);color:oklch(0.141 0.005 285.823);border:none;padding:0.625rem 1.5rem;border-radius:calc(0.625rem - 2px);font-weight:600;font-size:0.875rem;cursor:pointer;">Request Demo</button>
        <button style="font-family:var(--font-body);background:transparent;color:white;border:1px solid oklch(1 0 0 / 0.6);padding:0.625rem 1.5rem;border-radius:calc(0.625rem - 2px);font-weight:600;font-size:0.875rem;cursor:pointer;">Learn More</button>
      </div>
    </div>
    <div style="height:4px;background:linear-gradient(to right in oklch,oklch(0.75 0.1286 191.57),oklch(0.29 0.1506 289.33),oklch(0.7 0.1909 24.11),oklch(0.87 0.1786 92.23),oklch(0.75 0.1286 191.57));"></div>
  </div>
</div>

<p class="v-label">Stats Row</p>
<div class="v-demo">
  <div style="display:flex;gap:3rem;justify-content:center;flex-wrap:wrap;padding:2rem 0;">
    <div style="text-align:center;">
      <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:700;color:oklch(0.75 0.1286 191.57);line-height:1.1;">2.1B+</div>
      <div style="font-family:var(--font-body);font-size:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted-fg);margin-top:0.25rem;">Data Points Daily</div>
    </div>
    <div style="text-align:center;">
      <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:700;color:oklch(0.75 0.1286 191.57);line-height:1.1;">47K</div>
      <div style="font-family:var(--font-body);font-size:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted-fg);margin-top:0.25rem;">Meters Deployed</div>
    </div>
    <div style="text-align:center;">
      <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:700;color:oklch(0.75 0.1286 191.57);line-height:1.1;">99.97%</div>
      <div style="font-family:var(--font-body);font-size:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted-fg);margin-top:0.25rem;">Uptime SLA</div>
    </div>
  </div>
</div>

<p class="v-label">Logo Marquee / Trust Bar</p>
<div class="v-demo">
  <style>
    .marquee-track {
      display: flex;
      gap: 3rem;
      animation: marquee-scroll 30s linear infinite;
    }
    .marquee-track .marquee-logo {
      height: 1.5rem;
      opacity: 0.7;
      flex-shrink: 0;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--muted-fg);
      display: flex;
      align-items: center;
      white-space: nowrap;
    }
    @keyframes marquee-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .marquee-track { animation: none; }
    }
  </style>
  <div style="overflow:hidden;padding:1.5rem 0;">
    <div class="marquee-track">
      <span class="marquee-logo">Cushman &amp; Wakefield</span>
      <span class="marquee-logo">JLL</span>
      <span class="marquee-logo">Colliers</span>
      <span class="marquee-logo">CBRE</span>
      <span class="marquee-logo">Brookfield</span>
      <span class="marquee-logo">Kilroy Realty</span>
      <span class="marquee-logo">Cushman &amp; Wakefield</span>
      <span class="marquee-logo">JLL</span>
      <span class="marquee-logo">Colliers</span>
      <span class="marquee-logo">CBRE</span>
      <span class="marquee-logo">Brookfield</span>
      <span class="marquee-logo">Kilroy Realty</span>
    </div>
  </div>
</div>

<p class="v-label">CTA Strip (Multi-Card)</p>
<div class="v-demo">
  <style>
    .cta-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1.5rem;
    }
    .cta-card {
      padding: 1.5rem;
      border: 1px solid var(--border);
      border-radius: 0.625rem;
      background: var(--card);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
      .cta-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      }
    }
    .cta-card h3 {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .cta-card p {
      font-size: 0.875rem;
      color: var(--muted-fg);
      line-height: 1.5;
    }
  </style>
  <div style="font-family:var(--font-mono);font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);margin-bottom:1rem;">Platform</div>
  <div class="cta-strip">
    <div class="cta-card">
      <h3>Real-Time Monitoring</h3>
      <p>Circuit-level visibility across your entire portfolio.</p>
    </div>
    <div class="cta-card">
      <h3>AI Detection</h3>
      <p>Anomaly detection that finds faults before they escalate.</p>
    </div>
    <div class="cta-card">
      <h3>Energy Analytics</h3>
      <p>Granular consumption data for optimization and reporting.</p>
    </div>
  </div>
</div>

<p class="v-label">CTA Arrow Link</p>
<div class="v-demo">
  <style>
    .cta-arrow-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: oklch(0.75 0.1286 191.57);
      text-decoration: none;
      transition: gap 0.2s ease;
    }
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
      .cta-arrow-link:hover {
        gap: 0.5rem;
      }
    }
  </style>
  <div style="display:flex;flex-direction:column;gap:1rem;">
    <a href="#" class="cta-arrow-link">See detection in action <span aria-hidden="true">&rarr;</span></a>
    <a href="#" class="cta-arrow-link">Read the case study <span aria-hidden="true">&rarr;</span></a>
  </div>
</div>

<p class="v-label">Dark Image Container</p>
<div class="v-demo">
  <div style="background:oklch(0.21 0.006 285.885);border-radius:0.625rem;padding:2rem;overflow:hidden;">
    <div style="background:oklch(0.141 0.005 285.823);border-radius:calc(0.625rem - 2px);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;border:1px solid oklch(1 0 0 / 0.1);">
      <div style="text-align:center;">
        <div style="font-family:var(--font-mono);font-size:0.6875rem;color:oklch(0.552 0.016 285.938);text-transform:uppercase;letter-spacing:0.05em;">Dark-themed screenshot</div>
        <div style="font-family:var(--font-body);font-size:0.75rem;color:oklch(0.705 0.015 286.067);margin-top:0.375rem;">neutral.900 wrapper prevents jarring contrast on light pages</div>
      </div>
    </div>
  </div>
</div>

<div class="v-gradient"></div>

<details class="v-details" markdown="1">
<summary>Documentation</summary>

# Page Sections

## Overview

Section-level patterns for Persuade x Web Page composition (homepages, landing pages, campaign pages). These sit between component patterns (buttons, cards) and full-page composition rules (`foundations/composition.md`).

These patterns cover the Persuade purpose type. Inform and Convert pages use different section vocabularies and are documented in `foundations/composition.md` and the corresponding cells in `rules/visual-rules.yml`.

## Token Usage

### Colors

- Brand teal: `color.brand.verdigris` (hero labels, stat numbers, CTA arrow links)
- Dark background: `color.neutral.950` (hero sections, close sections)
- Dark container: `color.neutral.900` (image container wrapper)
- Muted foreground: `color.semantic.muted-foreground` (stat labels, section descriptions)

### Typography

- Display: `font-family.display` (Lato) for hero H1 and stat numbers
- Body: `font-family.body` (Inter) for all other text
- Mono: `font-family.mono` (JetBrains Mono) for section labels

### Spacing

- Section padding: 4rem-8rem depending on narrative role (see Composing a Persuade Page)
- Card gap: 1.5rem (`components.cta-strip-cards.gap`)
- Logo gap: 2rem-4rem (`components.logo-marquee-bar.min_gap`, `.max_gap`)

---

## Hero Section

The first section on a persuade page. Serves the **hook** narrative role: capture attention, state the value proposition.

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Background | `color.neutral.950` (dark) | `composition.persuade-web-page.hook` |
| Min height (mobile) | 22rem | `spacing.hero_height.base` |
| Min height (sm 640px+) | 25rem | `spacing.hero_height.sm` |
| Min height (md 768px+) | 31.25rem | `spacing.hero_height.md` |
| Section padding | 8rem minimum | `composition.persuade-web-page.coupling.dark-padding` |
| Body line-height | 1.65-1.75 | `composition.persuade-web-page.coupling.tinted-line-height` |
| Max line length | 65ch | `composition.persuade-web-page.coupling.tinted-line-length` |
| Body letter-spacing | +0.01em | `composition.persuade-web-page.coupling.dark-letter-spacing` |

### Element Stack

Top to bottom: section label (mono, uppercase, teal) > H1 (display font, 4rem) > subhead (body, 1.125rem) > CTA group (primary filled + ghost-on-dark secondary) > gradient strip (4px).

### Do's

1. **Do:** Let the hero breathe. Whitespace is the primary signal of quality on persuade pages. When in doubt between adding content and adding space, add space.

2. **Do:** Use the gradient strip at the bottom of the hero as a visual transition to the next section. It anchors the brand palette without adding visual noise.

3. **Do:** Pair a primary filled CTA with a ghost-on-dark secondary CTA. The filled button draws the eye; the ghost provides an alternative without competing.

### Don'ts

1. **Don't:** Fill the hero with secondary information (partner logos, taglines, social proof). The hero is a single clear idea with room to breathe. Trust bars and stats belong in later sections.

2. **Don't:** Use more than one H1 on the page. The hero owns the H1. Every other section uses H2 or lower.

3. **Don't:** Add more than two CTAs in the hero. Three or more buttons create decision paralysis and dilute the primary action.

---

## Stats Row

Large numbers with labels, used for trust and metric displays. Serves the **turn** or **evidence** narrative role.

### Color by Content Category

Stat numbers default to brand teal (`color.brand.verdigris`) when all metrics are trust-region content (technology, platform, data quality). When stats span multiple content categories, number color can follow the palette semantics from `foundations/color.md`:

- Trust/technology metrics: teal (default)
- Detection/alert metrics: energy region (`mp-step-2` or `mp-step-3`)
- Savings/ROI metrics: results region (`cyber-yellow`) on dark backgrounds only
- Recovery/sustainability metrics: growth region (`cy-step-2`) on dark backgrounds only

When in doubt, use teal. Teal + neutrals must comprise at least 70% of color expression on any surface.

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Number size | 2rem-3.5rem | `components.stats-row.number.min_size`, `.max_size` |
| Number weight | 700 | `components.stats-row.number.font_weight` |
| Number color | `color.semantic.primary` | `components.stats-row.number.color` |
| Label transform | uppercase | `components.stats-row.label.text_transform` |
| Label tracking | 0.05em | `components.stats-row.label.letter_spacing` |
| Label weight | 500 | `components.stats-row.label.font_weight` |
| Label color | `color.semantic.muted-foreground` | `components.stats-row.label.color` |
| Layout | horizontal | `components.stats-row.layout` |
| Responsive | stack vertical below sm (640px) | `components.stats-row.responsive` |

### Do's

1. **Do:** Use 3-4 stats. Fewer than 3 looks sparse; more than 4 overwhelms.

2. **Do:** Use real numbers, not rounded generics. "2.1B+" is more credible than "Billions."

### Don'ts

1. **Don't:** Mix units inconsistently. If one stat uses a suffix ("+", "%"), apply the same formatting logic across all stats.

2. **Don't:** Place the stats row as the first section. Stats land harder after the reader has context (the hook and at least one evidence section).

---

## Logo Marquee / Trust Bar

Scrolling logo display for social proof. Serves the **proof** narrative role.

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Container | overflow hidden | `components.logo-marquee-bar.overflow` |
| Logo height | 1.25rem-2rem | `components.logo-marquee-bar.logo_min_height`, `.logo_max_height` |
| Logo opacity | 0.7 | `components.logo-marquee-bar.logo_opacity` |
| Gap | 2rem-4rem | `components.logo-marquee-bar.min_gap`, `.max_gap` |
| Reduced motion | static display (no scroll) | `components.logo-marquee-bar.requires_reduced_motion` |

### Implementation

The marquee requires a duplicated logo set inside an overflow-hidden container. The animation translates the track by -50% (one full set width) and loops infinitely. On `prefers-reduced-motion: reduce`, the animation stops and logos display statically.

### Do's

1. **Do:** Mute logo opacity to 0.7. Logos at full opacity compete with page content for attention.

2. **Do:** Include at least 6 logos to fill the viewport. Fewer creates visible gaps in the scroll.

### Don'ts

1. **Don't:** Mix logo sizes. All logos should share the same max-height for visual consistency.

2. **Don't:** Use the marquee without a reduced-motion fallback. The scrolling animation can cause discomfort for motion-sensitive users.

---

## CTA Strip (Multi-Card)

Horizontal card strip where each card is a call-to-action. Serves the **evidence** narrative role (feature highlights, product areas).

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Layout | horizontal (grid) | `components.cta-strip-cards.layout` |
| Gap | 1.5rem | `components.cta-strip-cards.gap` |
| Card width | 16rem-24rem | `components.cta-strip-cards.card_min_width`, `.card_max_width` |
| Card padding | 1.5rem | `components.cta-strip-cards.card_padding` |
| Card radius | 0.625rem | `components.cta-strip-cards.card_border_radius` |
| Hover effect | hover-lift | `components.cta-strip-cards.hover_effect_ref` |
| Responsive | scroll horizontal on mobile, grid on desktop | `components.cta-strip-cards.responsive` |

### Do's

1. **Do:** Use 3 cards for a balanced row. 2 looks incomplete; 4+ may not fit without scrolling on tablet.

2. **Do:** Keep card content to heading + one sentence. CTA cards are scannable, not readable.

### Don'ts

1. **Don't:** Mix hover-lift with hover-scale on CTA cards. Pick one. See `categories/animation/hover-states.md` for the hover-lift pattern.

2. **Don't:** Add images to CTA strip cards. These are text-forward micro-CTAs, not feature cards with hero images.

---

## CTA Arrow Link

Inline link with a trailing arrow that expands on hover. Used where a full button is too heavy.

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Font weight | 500 | `components.cta-arrow-link.font_weight` |
| Arrow character | → | `components.cta-arrow-link.arrow_character` |
| Display | inline-flex, center-aligned | `components.cta-arrow-link.display` |
| Default gap | 0.25rem | `components.cta-arrow-link.min_gap` |
| Hover gap | 0.5rem | `components.cta-arrow-link.max_gap` |
| Transition | gap 200ms ease | `components.cta-arrow-link.transition` |
| Hover gate | compound media query required | `components.cta-arrow-link.requires_hover_query` |

The arrow span should have `aria-hidden="true"` since the arrow is decorative.

### Do's

1. **Do:** Use CTA arrow links for section-level navigation ("See detection in action", "Read the case study"). They are lighter than buttons and guide the reader forward.

2. **Do:** Place arrow links at the end of a section, after the content has made the case.

### Don'ts

1. **Don't:** Use arrow links for primary page CTAs. Primary actions get buttons (filled or ghost-on-dark). Arrow links are secondary.

2. **Don't:** Mix arrow links with the underline CTA-link pattern (`components.cta-link`) in the same section. Pick one style per context.

---

## Dark Image Container

Dark wrapper for showcasing dark-themed screenshots on light pages. Prevents jarring contrast at the light/dark boundary.

### Specifications

| Property | Value | Rule reference |
|----------|-------|----------------|
| Background | `color.neutral.900` | `components.dark-image-container.background` |
| Border radius | 0.625rem | `components.dark-image-container.border_radius` |
| Padding | 1.5rem-3rem | `components.dark-image-container.min_padding`, `.max_padding` |
| Overflow | hidden | `components.dark-image-container.overflow` |

### Do's

1. **Do:** Use the dark container when embedding Patina dashboard screenshots or dark-mode UI on light page backgrounds. The neutral.900 wrapper provides a visual frame.

2. **Do:** Use the smaller padding (1.5rem) for inline images and larger padding (3rem) for hero-scale screenshots.

### Don'ts

1. **Don't:** Use the dark container for light-themed images. It inverts the purpose and makes the image look detached.

2. **Don't:** Nest dark containers inside dark page sections (hero, footer). The container exists to bridge light-to-dark contrast, which is not needed on already-dark surfaces.

---

## Composing a Persuade Page

These section patterns map to narrative roles defined in `foundations/composition.md`:

| Narrative role | Section pattern | Color intensity | Padding |
|---------------|----------------|----------------|---------|
| **Hook** | Hero Section | Full expression (dark bg, teal) | 8rem |
| **Context** | Body text on neutral.200 bg. Max-width 65ch, 1.6 line-height. | Breathing room (neutral.200) | 4rem |
| **Evidence** | CTA Strip Cards, card grids | Supporting (teal label, white bg) | 4rem |
| **Turn** | Stats Row with accent background | Accent (tint + border) | 5rem+ |
| **Proof** | Logo Marquee + Dark Image Container | Supporting (teal label) | 4rem |
| **Close** | Hero-weight dark section with CTA | Full expression (dark bg) | 4rem+ |

### Arc rules

See `foundations/composition.md` for the full narrative arc rules governing section ordering and pacing.

### Section flow

Pages must follow the lightness rhythm rules to avoid strobing (alternating dark/light sections). See `foundations/color.md` for context and `rules/visual-rules.yml` -> `color.section-flow` for machine rules.

See `foundations/composition.md` for the coupling rules (color-to-spacing, color-to-typography, type-to-spacing) and whitespace principle.

## Related

- [Composition](../../foundations/composition.md) -- Purpose x Surface framework and coupling rules
- [Hover States](../animation/hover-states.md) -- Hover-lift, ghost-on-dark, CTA arrow-link hover patterns
- [Buttons](buttons.md) -- Button variants including ghost-on-dark
- [Visual Rules](../../rules/visual-rules.yml) -- Machine-readable rules (canonical values)

</details>
