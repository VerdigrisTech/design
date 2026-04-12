---
layout: visual
title: Composition
---

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Composition

How color, typography, and spacing work together. Individual foundations define each axis. Composition defines how they interact.

## Purpose x Surface Matrix

Composition rules are organized by purpose (what the page does) and surface (what medium it's on). The same surface can serve different purposes with different composition logic. A homepage (persuade) and a case study (inform) are both web pages, but they compose differently.

| Purpose | What it does | Color budget | Spacing | Rhythm |
|---------|-------------|-------------|---------|--------|
| **Persuade** | Sell, convince, inspire | Trust + 1 earned accent | Generous (5-8rem sections) | Narrative arc |
| **Inform** | Explain, document, teach | Teal only | Tight (3rem sections) | Steady, scannable |
| **Analyze** | Show data, monitor, compare | Full palette | Compact (1-3rem panels) | Dashboard grid |
| **Convert** | Drive a single action | 1 accent (CTA only) | Focused (4rem) | Linear funnel |
| **Identify** | Brand recognition in seconds | Teal only | Surface-constrained | Single moment |
| **Narrate** | Tell a story with depth | Illustrative (in figures) | Generous (5-8rem) | Episode + figure pairs |
| **Assist** | AI interaction (chat, embedded) | Monochrome + functional | Content-driven | Conversational |
| **Instruct** | Machine-to-machine | N/A (structural) | N/A | Rule clarity |

### Defined Cells

| Purpose x Surface | Status | Tracking |
|-------------------|--------|----------|
| Persuade x Web page | **Defined** | Narrative roles, coupling rules, whitespace principle |
| Persuade x Ad banner | **Defined** | Z-pattern, max 4 elements, 30% whitespace |
| Persuade x Email | **Defined** | Single column 600px, system fonts, 1 CTA per section |
| Persuade x Slide deck | **Defined** | 10-15 slides, 24pt floor, dark bookends, single turn |
| Inform x Web page | **Defined** | Metronomic rhythm, 3rem padding, 65ch line length |
| Inform x Slide deck | **Defined** | One idea per slide, 60% whitespace, teal in diagrams |
| Analyze x Dashboard | **Defined** | 12-col grid, full palette, 13-14px body, tabular-nums |
| Convert x Web page | **Defined** | 4-role funnel, single CTA, max 3 tiers, micro-reassurance |
| Identify x Ad banner | **Defined** | Teal only, 3-8 word tagline, Z-pattern |
| Identify x Hardware | **Defined** | One teal accent, neutral housing, single wordmark |
| Narrate x Web page | **Defined** | Episode + figure pairs, 1.7 line-height, color in figures not backgrounds |
| Assist x Chat | **Defined** | Flat layout (no bubbles), 680-720px, competence over personality |
| Assist x Embedded | **Defined** | Visual marker for AI content, provenance metadata, EU AI Act compliance |
| Instruct x Machine | **Defined** | Floors AND ceilings, id paths, canonical tokens only |

For implementation patterns (hero sections, stats rows, trust bars, CTA strips), see `categories/web-components/page-sections.md`.

## Persuade x Web Page

For homepages, landing pages, and campaign pages. Narrative pacing with coupling rules.

### Narrative Roles

Each section on a persuasive page serves a role in the story. The role determines its visual treatment.

| Role | Purpose | Color | Type | Padding |
|------|---------|-------|------|---------|
| **Hook** | First impression, value prop | Full expression (dark bg, teal) | H1 (4rem) | 8rem |
| **Context** | Set up the problem | Breathing room (neutral.200) | H2 (3rem) | 4rem |
| **Evidence** | Show proof | Supporting (teal label, white bg) | H2 + cards | 4rem |
| **Turn** | Shift the feeling | Earned accent (tint + border + label) | H2 + stats | 5rem+ |
| **Proof** | Hard numbers, logos | Supporting (teal label) | H2 + body | 4rem |
| **Close** | Final CTA | Full expression (dark bg) | H2 | 4rem+ |

### Arc Rules

- Every page needs a hook and a close
- At most one turn (the earned accent moment)
- Max 3 consecutive low-energy sections before a turn or visual break
- The turn should follow at least one evidence section

### Coupling Rules

Color, type, and spacing aren't independent on a persuasive page. They're coupled.

**Color to spacing:** Visual weight needs room.
- Dark sections (L < 0.3): padding at least 8rem
- Tinted sections (chroma > 0.01): padding at least 5rem
- Neutral sections: padding at least 4rem

**Color to typography:** Background changes how text reads.
- Tinted or dark backgrounds: body line-height 1.65-1.75 (looser than 1.6 default)
- Tinted or dark backgrounds: max line-length 65ch (tighter than 75ch default)
- Dark backgrounds: body letter-spacing +0.01em

**Type to spacing:** Larger headings need more room.
- H1-led section: padding at least 8rem
- H2-led section: padding at least 5rem
- H3 or body-led: padding at least 4rem

### Whitespace Principle

Generous whitespace is the primary signal of quality on persuasive pages. Perceived luxury correlates with empty space (spatial color efficacy research). When in doubt, add more space, not more content.

See `rules/visual-rules.yml` -> `composition.persuade_web_page` for the machine-consumable version.

## Narrate x Web Page

For long-form editorial essays, design retrospectives, case narratives. Not persuade (no funnel). Not inform (not flat). The reader follows a journey with depth.

This purpose type was created when the evolution essay needed composition rules and no existing type fit. The framework grew to accommodate a surface it couldn't serve.

### Structure

Narrate uses episodes, not narrative roles. Episodes are prose + figure pairs, repeatable in any order.

| Element | Purpose | Color | Padding |
|---------|---------|-------|---------|
| **Opening** | Set the scene | Full or supporting | 8rem |
| **Episode** | A chapter with prose + figure | Breathing or supporting | 5rem |
| **Figure** | Visual evidence within an episode | Varies (the figure itself may use any intensity) | 3rem margin |
| **Reflection** | Honest assessment of limits | Breathing | 5rem |
| **Closing** | Invitation, not CTA | Full or supporting | 8rem |

### Key Differences from Persuade

- **Color is illustrative, not atmospheric.** Color appears inside figures (specimens, before/after comparisons), not as section background tints. Between figures, the page is neutral.
- **No marketing patterns.** No CTA buttons in prose. No gradient strips. No card grids as content. The page is an essay.
- **Body text is 1.125rem at 1.7 line-height.** Looser than persuade (1.6) for sustained reading.
- **The closing is an invitation, not a conversion.** The reader leaves thinking, not clicking.

### When to Use Narrate

Design essays, retrospectives, case studies with depth, process documentation that tells a story. If the piece has a beginning, middle, and end and the reader should experience the journey (not just scan for information), it's narrate.

See `rules/visual-rules.yml` -> `composition.narrate_web_page` for the machine-consumable version.

</details>
