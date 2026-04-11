---
layout: visual
title: Composition
---

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Composition

How color, typography, and spacing work together. Individual foundations define each axis. Composition defines how they interact.

## Purpose x Surface Matrix

Composition rules are organized by purpose (what the page does) and surface (what medium it's on). The same surface can serve different purposes with different composition logic. A homepage (persuade) and a case study (inform) are both web pages, but they compose differently.

| Purpose | What it does | Color budget | Spacing | Rhythm | Status |
|---------|-------------|-------------|---------|--------|--------|
| **Persuade** | Sell, convince, inspire | Trust + 1 earned accent | Generous (5-8rem sections) | Narrative arc | Defined (web page) |
| **Inform** | Explain, document, teach | Teal only | Tight (4rem sections) | Steady, scannable | <span class="status-pill status-pill-partial">Partial</span> |
| **Analyze** | Show data, monitor, compare | Full palette | Compact (2rem sections) | Dashboard grid | <span class="status-pill status-pill-partial">Partial</span> |
| **Convert** | Drive a single action | 1 accent (CTA only) | Focused (4rem) | Linear funnel | <span class="status-pill status-pill-partial">Partial</span> |
| **Identify** | Brand recognition in seconds | Teal only | Surface-constrained | Single moment | <span class="status-pill status-pill-partial">Partial</span> |

### Defined Cells

| Purpose x Surface | Status | Tracking |
|-------------------|--------|----------|
| Persuade x Web page | **Defined** | Narrative roles, coupling rules, whitespace principle |
| Persuade x Ad banner | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1007 |
| Persuade x Email | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1007 |
| Persuade x Slide deck | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1008 |
| Inform x Web page | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1004 |
| Inform x Slide deck | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1004 |
| Analyze x Dashboard | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1005 |
| Convert x Web page | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1006 |
| Identify x Ad banner | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1007 |
| Identify x Hardware | <span class="status-pill status-pill-partial">Partial</span> | Z2O-1007 |

`Partial` means the purpose is described in the matrix table above but no composition rules, coupling constraints, or specimens exist yet.

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

</details>
