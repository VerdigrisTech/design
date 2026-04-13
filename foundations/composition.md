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

Gender, age, and accent carry cultural weight. These attributes require stakeholder input and cannot be decided by design-system logic alone. See the options analysis below.

**Options under evaluation:**

**A. Male voice**
- For: Matches current buyer demographic (facilities management skews ~80% male). Familiar authority signal in infrastructure contexts.
- Against: Reinforces industry gender norms. "Default male = authority" is a dated assumption. Indistinguishable from competitors.
- Brand alignment: Neutral. The pillars don't imply gender.

**B. Female voice**
- For: Differentiates in a male-dominated vertical. Research shows female voices rate higher for perceived helpfulness and trustworthiness in professional contexts.
- Against: "Helpful female assistant" trope is documented and risks undermining the Masterful pillar. Could trigger "secretary, not engineer" perception in a conservative buyer base.
- Brand alignment: Tension with Masterful if it activates the assistant archetype rather than the expert archetype.

**C. Gender-ambiguous voice**
- For: Sidesteps gendered defaults entirely. Forward-looking (Apple's Quinn voice, 2024). Strongest Pioneering signal. No demographic baggage to manage across markets.
- Against: Newer territory for TTS quality. Some audiences find it harder to form a connection. May feel "designed by committee" if not executed well.
- Brand alignment: Strong Pioneering fit. Consistent with "infrastructure, not personality" from Masterful. Requires high production quality to avoid uncanny valley.

**D. Regional accent**
- American English (General American) is the safe default for a US-headquartered B2B company selling globally. Avoid strong regional accents that localize the brand. For non-English markets, use native speakers or high-quality multilingual TTS rather than accented English.

**Recommendation (pending stakeholder review):** Option C (gender-ambiguous) is the strongest brand-aligned choice. It avoids the gendered defaults that every competitor uses, signals Pioneering, and lets the vocal qualities (calm authority, measured pace, clear enunciation) carry the brand rather than demographic associations. If stakeholders prefer a gendered voice, Option A is the safer GTM choice for the current buyer demographic, with Option B as a differentiation play.

### Hosting and Pipeline

The voice framework is pipeline-agnostic. Voice briefs are declarative descriptions; the TTS engine is an implementation detail. Current options:

- **API-hosted** (ElevenLabs, Azure Custom Neural Voice, Cartesia Sonic): fastest to integrate, pay-per-use, no infra to manage.
- **Self-hosted open-source** (VoxCPM2, 2B params, Apache 2.0): full control, no data leaves the network. Requires GPU inference infrastructure.
- **Hybrid**: API for development/iteration, self-hosted for production once the voice is locked.

Evaluate hosting options before committing to a specific engine. See Linear issue for infrastructure evaluation.

### Constraints

- Voice must pass the same "no personality theater" test as written Assist x Chat content
- Pace must stay within 140-170 wpm (floor: comprehension; ceiling: rushed feeling)
- No background music or sound design in voice-only content. Music is a separate design decision.
- Reduced-motion users who have opted out of animation should not receive auto-playing audio. Audio requires explicit user action.
- All spoken content must have a text transcript (accessibility, EU AI Act Article 50 for AI-generated speech)

</details>
