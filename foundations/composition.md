---
layout: visual
title: Composition
---

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Composition

How color, typography, and spacing work together. Individual foundations define each axis. Composition defines how they interact.

## Purpose x Surface Matrix

Composition rules are organized by purpose (what the page does) and surface (what medium it's on). The same surface can serve different purposes with different composition logic. A homepage (persuade) and a case study (inform) are both web pages, but they compose differently.

### Surface Registers

Each web-page purpose type has a dominant emotional register that describes how it earns trust. Registers are not enforceable rules. They guide judgment calls when the coupling rules don't prescribe an answer. Brand values are expressed through concrete guardrails (coupling rules, ceilings, floors), not declared as labels on composition cells.

With 60%+ of traffic arriving from LLMs with intent already shaped, each page must earn trust within its own scroll. The register describes the trust-earning sequence built into the page's composition.

| Purpose | Register | Trust sequence |
|---------|----------|----------------|
| **Persuade** | Restraint earns trust | Conformity (hook) > credibility (evidence) > craft (turn) > conviction (close) |
| **Inform** | Clarity earns trust | Question (arrival) > answer (scannable) > depth (available, not forced) |
| **Analyze** | Competence earns trust | Status (KPI strip) > detail (drill into panels) > action (alerts) |
| **Convert** | Focus earns trust | Value (one sentence) > options (max 3) > reassurance > action (single CTA) |
| **Narrate** | Honesty earns trust | Curiosity (opening) > understanding (episodes) > respect (reflection) > thinking (closing) |
| **Assist** | Competence earns trust | Answer first > evidence (citations, data) > depth (interactive artifacts) |
| **Identify** | N/A (single moment, not a trust sequence) | Recognition in under 3 seconds. No narrative arc. |
| **Instruct** | N/A (machine-to-machine, structural) | Rule clarity > completeness > enforceability. No visual register. |

| Purpose | What it does | Color budget | Spacing | Rhythm |
|---------|-------------|-------------|---------|--------|
| **Persuade** | Sell, convince, inspire | Trust + 1 earned accent | Generous (4-14rem; see coupling rules) | Narrative arc |
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
| **Turn** | Shift the feeling | Earned accent (tint + border + label) | H2 + stats | 5-10rem |
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
- Dark sections (L < 0.3): padding 8-14rem
- Tinted sections (chroma > 0.01): padding 5-10rem
- Neutral sections: padding 4-6rem

**Color to typography:** Background changes how text reads.
- Tinted or dark backgrounds: body line-height 1.65-1.75 (looser than 1.6 default)
- Tinted or dark backgrounds: max line-length 65ch (tighter than 75ch default)
- Dark backgrounds: body letter-spacing +0.01em to +0.03em

**Type to spacing:** Larger headings need more room.
- H1-led section: padding 8-14rem
- H2-led section: padding 5-10rem
- H3 or body-led: padding 4-6rem

### Whitespace Principle

Generous whitespace is the primary signal of quality on persuasive pages. Perceived luxury correlates with empty space (spatial color efficacy research). When in doubt, add more space, not more content.

See `rules/visual-rules.yml` -> `composition.persuade-web-page` for the machine-consumable version.

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
- **Body text is 1.125rem at 1.7 line-height.** Looser than the 1.6 base default.
- **The closing is an invitation, not a conversion.** The reader leaves thinking, not clicking.

### When to Use Narrate

Design essays, retrospectives, case studies with depth, process documentation that tells a story. If the piece has a beginning, middle, and end and the reader should experience the journey (not just scan for information), it's narrate.

See `rules/visual-rules.yml` -> `composition.narrate-web-page` for the machine-consumable version.

## Site-Level Composition

Page-level composition governs sections within a page. Site-level composition governs how pages relate to each other across a visit. Individual pages are self-contained (each earns trust within its own scroll), but visitors who navigate between pages will notice if every page uses identical composition. The site needs an arc too.

### Page Hierarchy

Not all pages have equal visual weight. The homepage is the loudest; secondary pages progressively quiet down.

| Page tier | Hero treatment | Turn allowed | Color budget | Example |
|-----------|---------------|-------------|-------------|---------|
| **Primary** (1 page) | Full expression: dark bg, gradient strip, H1, 8rem | Yes — the earned accent moment | Trust + 1 accent | Homepage |
| **Secondary** | Compact hero: neutral.100 or neutral.200 bg, H1 at 3rem, 5rem padding | Conditional — only if the page has 6+ sections | Trust only | Product, Platform |
| **Tertiary** | No hero. Section opens directly with H1 at standard weight. | No | Trust only | Docs, blog posts, legal |
| **Convert** | Minimal: single heading + CTA, neutral or dark bg, no narrative arc | No | 1 accent (CTA) | Pricing, demo request, signup |

The homepage owns the full-expression hero with gradient strip. If secondary pages also use full-expression heroes, the homepage loses its primacy and the site feels like a collection of landing pages rather than a coherent product.

### Cross-Page Turn Scarcity

The turn moment (earned accent) is powerful because it's rare. At page level, the rule is "at most one turn per page." At site level: at most one turn per 3-page navigation depth. In practice, this means the homepage gets the turn and secondary pages do not, unless the visitor is deep enough (3+ clicks from homepage) that the earlier turn has faded.

If every page has a turn, the accent becomes wallpaper. The scarcity rule preserves its emotional impact.

### Accent Diversity

When multiple pages do use accent moments (homepage + a deep product page), they must use different palette regions. If the homepage turn uses midnight-purple (energy region), the product page turn should use cyber-yellow (results region) or skip the turn. Two identical accents in a session feels like a template, not a design.

### Purpose De-Escalation

Visitors typically move from high-energy pages (persuade) toward low-energy pages (convert, inform). The visual intensity should de-escalate to match.

| Transition | Intensity shift | Why |
|-----------|----------------|-----|
| Persuade → Persuade | Reduce: secondary hero, no turn unless 6+ sections | Avoids pitch fatigue |
| Persuade → Inform | Reduce: no hero, metronomic rhythm | Visitor wants answers, not spectacle |
| Persuade → Convert | Reduce sharply: minimal hero, single CTA, no turn | Focus earns trust at decision point |
| Inform → Convert | Maintain: both are low-energy | Natural transition |
| Any → Narrate | Reset: narrate has its own register (honesty) | Editorial stands alone |

### Navigation Continuity

Header and footer are the compositional spine — consistent across every page.

- **Header:** lightest element on every page. Breathing room. No per-page header styling. The header provides orientation; the page provides expression.
- **Footer:** always dark. Provides closure. Same structure across pages. The footer is the site's consistent ending, not a per-page design surface.
- **Breadcrumb / wayfinding:** uses teal as functional color (trust region). Not decorative.

These invariants make page-level variation feel coherent. Without them, a dark homepage followed by a light product page feels like two different sites.

### Entry Point Awareness

Not every visitor starts at the homepage. With 60%+ arriving from LLMs, many land on secondary or tertiary pages. Site-level composition must accommodate this:

- Every page works standalone (the self-contained rule from page-level composition)
- But pages also work in sequence (the de-escalation and scarcity rules above)
- When in conflict, standalone wins — a product page must earn its own trust even if the visitor skipped the homepage

See `rules/visual-rules.yml` -> `composition.site-level` for the machine-consumable version.

## Spoken Voice

How Verdigris sounds when content is spoken aloud. Extends the written voice rules from Assist x Chat to any surface with audio output: video narration, AI assistant speech, ad voiceovers, accessibility.

### Voice Pillars

The same brand pillars that govern written voice govern spoken voice. Each maps to a concrete vocal quality.

| Pillar | Written rule (Assist x Chat) | Spoken equivalent | Floor | Ceiling |
|--------|----------------------------|-------------------|-------|---------|
| **Precise** | Exact values, no hedging, citation-forward | Measured pace, clear enunciation, no filler words | 140 wpm | 170 wpm |
| **Masterful** | AI as infrastructure, no personality theater | Calm authority, steady pitch, no vocal fry or uptalk | Pitch variance: 30Hz | Pitch variance: 80Hz |
| **Refined** | Interface disappears, content dominates | Unhurried delivery, natural pauses at clause boundaries | Pause at periods: 400ms | Pause at periods: 700ms |
| **Pioneering** | Active artifacts, response IS the tool | Confident forward momentum, no hedging qualifiers | N/A (behavioral) | N/A (behavioral) |

### Single Voice, Purpose-Adapted

One primary voice builds brand recognition (like teal). Style parameters adapt by purpose.

| Purpose | Adaptation | Example |
|---------|-----------|---------|
| **Persuade** (video, ads) | Warmer, slightly slower. Earns trust through restraint. | Brand video narration, webinar intro |
| **Inform** (docs, tutorials) | Neutral, steady, scannable rhythm. Clarity over feeling. | Product walkthrough, help content |
| **Analyze** (dashboards) | Clipped, precise. Data-forward. Faster pace. | Alert readout, KPI summary |
| **Narrate** (case studies) | More spacious, natural. Room for reflection. | Case study video, retrospective |
| **Assist** (AI chat) | Direct, professional. Answer-first cadence. | AI assistant reading a response aloud |

### Voice Brief Format

A voice brief is the spoken equivalent of a color token: a declarative description that a TTS pipeline resolves into audio. The brief should be specific enough to reproduce consistently.

```
voice.brand.primary:
  age_range: [pending stakeholder decision]
  gender: [pending stakeholder decision]
  qualities:
    - calm authority without coldness
    - measured pace, unhurried but not slow
    - clear enunciation, no mumbling or trailing off
    - natural breath pauses at clause boundaries
    - steady pitch with subtle emphasis on key data
  anti-qualities:
    - no vocal fry or uptalk
    - no filler words (um, uh, like, you know)
    - no breathy or ASMR quality
    - no announcer energy or radio voice
    - no synthetic flatness (must sound like a person)
  reference_prompt: "The voice of a senior engineer presenting
    findings to a board. They know the data cold. They respect
    the audience's time. They are confident without performing
    confidence."
```

### Demographic Attributes

Gender, age, and accent carry cultural weight. These attributes require stakeholder input and cannot be decided by design-system logic alone. Options analysis and recommendation tracked in Linear (Z2O-1044).

### Constraints

- Voice must pass the same "no personality theater" test as written Assist x Chat content
- Pace must stay within 140-170 wpm (floor: comprehension; ceiling: rushed feeling)
- No background music or sound design in voice-only content. Music is a separate design decision.
- Reduced-motion users who have opted out of animation should not receive auto-playing audio. Audio requires explicit user action.
- All spoken content must have a text transcript (accessibility, EU AI Act Article 50 for AI-generated speech)

</details>
