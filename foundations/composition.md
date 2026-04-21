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
| **Demonstrate** | Revelation earns trust | Curiosity (hook) > comprehension (context) > revelation (evidence) > conviction (turn) > credibility (proof) > action (close) |

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
| **Demonstrate** | Show product capability through data | Trust + data_viz exception | Generous (4-14rem; see coupling) | Revelation arc |

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
| Demonstrate x Web page | **Defined** | Pretext + Canvas effects, revelation arc, max 2 animated per viewport, effects exclusive to this cell |

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
| **Close** | Final CTA | Full expression (dark bg) | H2 | 8-14rem |

### Arc Rules

- Every page needs a hook and a close
- At most one turn (the earned accent moment)
- Max 3 consecutive low-energy sections before a turn or visual break
- The turn should follow at least one evidence section

### Minimal Arc (Short Pages)

Pages with 3-6 sections (product, solution, partner pages) use a reduced arc: **Hook → Evidence(s) → Close**. No turn required -- the page is too short for the earned accent to land. Hook and close remain mandatory.

### Coupling Rules

Color, type, and spacing aren't independent on a persuasive page. They're coupled. All spacing values are **responsive** -- mobile gets less padding to avoid wasting screen real estate.

**Color to spacing:** Visual weight needs room.

| Background | Mobile (< 640px) | Tablet (640-767px) | Desktop (768px+) |
|------------|------|--------|---------|
| Dark (L < 0.3) | 4-6rem | 6-10rem | 8-14rem |
| Tinted (chroma > 0.01) | 3-5rem | 4-7rem | 5-10rem |
| Neutral | 3-4rem | 3-5rem | 4-6rem |

**Color to typography:** Background changes how text reads.
- Tinted or dark backgrounds: body line-height 1.65-1.75 (looser than 1.6 default)
- Tinted or dark backgrounds: max line-length 65ch (tighter than 75ch default)
- Dark backgrounds: body letter-spacing +0.01em to +0.03em

**Type to spacing:** Larger headings need more room.

| Heading | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1-led | 4rem+ | 6rem+ | 8rem+ |
| H2-led | 3rem+ | 4rem+ | 5rem+ |
| H3-led | 3rem+ | 3rem+ | 4rem+ |

### Section Role Tokens

Pre-mixed CSS custom properties for narrative role backgrounds. Use these instead of hardcoding hex/HSL values.

| Token | Light mode | Dark mode | Use for |
|-------|-----------|-----------|---------|
| `--section-hook-bg` | neutral.950 | midnight-purple tinted dark | Hook, hero sections |
| `--section-hook-fg` | neutral.50 | neutral.50 | Text on hook/hero |
| `--section-context-bg` | neutral.100 | neutral.900 | Context sections |
| `--section-evidence-bg` | white | neutral.950 | Evidence, proof sections |
| `--section-turn-bg-from/to` | warm gradient (6%/4% opacity) | warm gradient (8%/5% opacity) | Turn section gradient |
| `--section-turn-border` | cyber-yellow/40% | cyber-yellow/40% | Turn left border |
| `--section-close-bg` | neutral.950 | deeper midnight-purple tint | Close/CTA sections |
| `--section-close-fg` | neutral.50 | neutral.50 | Text on close sections |

Dark-on-dark differentiation: hook uses `hsl(262, 30%, 8%)` and close uses `hsl(262, 30%, 6%)` -- both midnight-purple tinted, subtly different from the page background (`neutral.950 = hsl(240, 10%, 4%)`).

### Ghost vs Ghost-on-Dark Buttons

| Button variant | Use on | Why |
|---------------|--------|-----|
| Ghost (secondary) | Light backgrounds (context, evidence, proof sections) | Uses neutral.200 border -- visible on light |
| Ghost-on-dark | Dark backgrounds (hook, close, hero sections) | Uses white/60 border -- visible on dark |

Rule of thumb: if the section uses `--section-hook-bg` or `--section-close-bg`, use ghost-on-dark.

### Logo Display Mode

| Logo count | Display | Why |
|-----------|---------|-----|
| ≤ 5 | Static grid | All visible at once, no motion needed |
| 6+ | Marquee scroll | Too many for a single row without overflow |

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

Not all pages have equal visual weight. Tier controls two things: hero scale (how loud) and color budget (how many accent moments a page can earn). A third axis, hero posture, is separate and is covered in Hero Posture below.

| Page tier | Hero scale | Default posture | Turn allowed | Color budget | Example |
|-----------|-----------|----------------|-------------|-------------|---------|
| **Primary** (1 page) | Full (8rem padding, gradient strip, H1 at 4rem, 50rem max-height) | authoritative | Yes | Trust + 1 accent | Homepage |
| **Secondary** | Standard (5rem padding, H1 at 3rem) | authoritative | Only if 6+ sections | Trust only | Product, Platform, Hardware, Solutions |
| **Tertiary** | None. Section opens directly with H1. | | No | Trust only | Docs, blog, legal |
| **Convert** | Minimal (single heading + CTA) | authoritative | No | 1 accent (CTA) | Pricing, demo request, signup |

The homepage owns the full-scale hero with gradient strip. If secondary pages also use full-scale heroes, the homepage loses its primacy and the site feels like a collection of landing pages rather than a coherent product. Default posture is the tier's baseline, not a requirement. Individual pages override posture when the visitor's posture differs from the tier default (see Hero Posture).

### Hero Posture

Posture controls how the hero reads, not how loud it is. The three postures map to three visitor jobs. Pick posture based on why the visitor is on the page, not what tier the page sits in.

| Posture | Background | Foreground | Stat cards | Signals | When to use |
|---------|-----------|------------|------------|---------|-------------|
| **authoritative** | `color.semantic.hero-authoritative-bg` (neutral.950) | `color.semantic.hero-authoritative-fg` (neutral.50) | frosted glass on dark | product authority; "pay attention" | Product evaluation pages. Visitor is in consideration stage: platform, hardware, solutions, homepage. |
| **belonging** | `color.semantic.hero-belonging-bg` (brand.verdigris) | `color.semantic.hero-belonging-fg` (neutral.50) | frosted glass on teal | identity; "who we are" | Identity pages where teal is warmth, not accent: About, mission, investors. Capped at 2 pages per site. |
| **approachable** | `color.semantic.hero-approachable-bg` (neutral.50) | `color.semantic.hero-approachable-fg` (neutral.950) | card bg with 1px border (neutral.200) | warmth; "here is how we help your world" | Awareness-stage surfaces (industry landings from search), recruiting, and partner pages. |

**Authoritative** is the workhorse and the default for product-evaluation pages. The dark background creates visual weight and signals serious infrastructure. A data center VP clicking through /platform expects this.

**Belonging** says "this is who we are," not "this is what we sell." Reserved for identity pages. More than two belonging heroes across a site dilutes the About page's singular role and turns brand teal into wallpaper.

**Approachable** is the variant for pages where authority would feel off-key. An industry page is about the visitor's problem, not the product. A careers page should feel open and inviting, not like a product pitch. A partners page is relationship-oriented. Light posture fits these visitor postures; dark posture fights them.

Posture is independent of scale. A secondary-scale hero can be authoritative (product page) or approachable (industry page). Don't read the table left-to-right: tier picks scale, posture picks treatment, and the two decisions are made separately.

### Cross-Page Turn Scarcity

The turn moment (earned accent) is powerful because it's rare. At page level, the rule is "at most one turn per page." At site level: at most one turn per 3-page navigation depth. In practice, this means the homepage gets the turn and secondary pages do not, unless the visitor is deep enough (3+ clicks from homepage) that the earlier turn has faded.

If every page has a turn, the accent becomes wallpaper. The scarcity rule preserves its emotional impact.

### Accent Diversity

When multiple pages do use accent moments (homepage + a deep product page), they must use different palette regions. If the homepage turn uses midnight-purple (energy region), the product page turn should use cyber-yellow (results region) or skip the turn. Two identical accents in a session feels like a template, not a design.

### Purpose De-Escalation

Visitors typically move from high-energy pages (persuade) toward low-energy pages (convert, inform). The visual intensity should de-escalate to match. Intensity is the combination of scale (full > standard > minimal > none) and posture (authoritative > belonging > approachable); reducing either axis de-escalates.

| Transition | Intensity shift | Why |
|-----------|----------------|-----|
| Persuade → Persuade | Reduce: standard scale or approachable posture; no turn unless 6+ sections | Avoids pitch fatigue |
| Persuade → Inform | Reduce: no hero, metronomic rhythm | Visitor wants answers, not spectacle |
| Persuade → Convert | Reduce sharply: minimal scale, single CTA, no turn | Focus earns trust at decision point |
| Inform → Convert | Maintain: both are low-energy | Natural transition |
| Any → Narrate | Reset: narrate has its own register (honesty) | Editorial stands alone |

### Navigation Continuity

Header and footer are the compositional spine, consistent across every page.

- **Header:** lightest element on every page. Breathing room. No per-page header styling. The header provides orientation; the page provides expression.
- **Footer:** always dark. Provides closure. Same structure across pages. The footer is the site's consistent ending, not a per-page design surface.
- **Breadcrumb / wayfinding:** uses teal as functional color (trust region). Not decorative.

These invariants make page-level variation feel coherent. Without them, a dark homepage followed by a light product page feels like two different sites.

### Entry Point Awareness

Not every visitor starts at the homepage. With 60%+ arriving from LLMs, many land on secondary or tertiary pages. Site-level composition must accommodate this:

- Every page works standalone (the self-contained rule from page-level composition)
- But pages also work in sequence (the de-escalation and scarcity rules above)
- When in conflict, standalone wins. A product page must earn its own trust even if the visitor skipped the homepage.

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

## Visual Signature

The Verdigris visual signature derives from the product: 8,000 samples per second of electrical data, made visible. The signature is not a logo treatment or an illustration style. It is a family of data-derived visual patterns that only an electrical intelligence company can produce.

### Canonical Brand Visualizations

These are the official visual signature elements. They appear on marketing pages, in Remotion videos, and as design system specimens. Each is grounded in real electrical engineering concepts.

| Element | What it shows | Where to use | Priority |
|---------|-------------|-------------|----------|
| **Phase Portrait (Lissajous)** | V-I relationship as XY figure. Each load type produces a unique shape. | Card icons, hero illustrations, loading states, favicon candidate | Primary mark |
| **Harmonic Spectrum** | Frequency-domain bars showing harmonic content of a load. | Section dividers (2-4px), card top borders, dashboard headers | Texture system |
| **Waveform Trace** | Time-domain electrical signal showing 60Hz fundamental + harmonics. | Section separators, ambient background, resolution comparisons | Supporting |
| **Resolution Comparison** | Same data at different sample rates (1/min vs 8kHz). | Evidence sections, product demos, slide decks | Narrative device |

### What Is NOT a Brand Visualization

- Generic sine waves with no harmonic content (could be any company)
- Particle systems or dot fields not derived from electrical data
- Abstract gradient meshes (the Stripe look)
- Network/node graphs that don't represent actual circuit topology
- Waveforms used as pure decoration without connection to section content

### Canvas-Rendered Text

Some brand effects require rendering text to Canvas rather than DOM. This is a significant architectural decision with accessibility, performance, and SEO implications.

**When to use Canvas text:**
- Character-level effects that CSS cannot achieve (per-character displacement, SDF morphing, text as clipping mask)
- Text that must interact with Canvas visualizations (labels positioned on waveform data points)
- Effects requiring sub-pixel character positioning (Pretext measurement)

**When NOT to use Canvas text:**
- Body copy, paragraphs, any text meant to be read at length
- Navigation, buttons, form labels, or any interactive text
- Text that needs to be selectable, translatable, or indexed by search engines
- Anything that can be achieved with CSS transforms, opacity, or clip-path

**Mandatory requirements for Canvas text:**
1. Every Canvas text element must have an identical HTML fallback, hidden when Canvas is active
2. The HTML fallback must use the same typography tokens (font family, weight, size, color)
3. `prefers-reduced-motion: reduce` must show the HTML fallback and hide the Canvas
4. The Canvas element must have `role="img"` and `aria-label` matching the text content
5. No Canvas text in the critical rendering path. Fonts load first, Canvas initializes after.

### Named Text Effects

Three named effects are part of the visual signature. Each has exact specifications for timing, color, and behavior. These effects are **exclusive to the Demonstrate x Web Page composition cell** (Technology/Signal page). They do not appear on the homepage, product pages, or any other page type. The homepage earns its impact through composition restraint, not Canvas effects.

**Attention budget:** At most 2 animated elements visible in any single viewport at any time. The ambient waveform counts as one if its opacity exceeds 10%. Named effects count when actively animating (not after completion). The resolution slider counts when the user is interacting with it.

**Reading constraint:** Heading text must reach full legibility (final color, complete letterforms) before expected reading completion. For headings under 40 characters, fully legible within 600ms. For longer headings, within 800ms. If the full effect duration exceeds the legibility deadline, text resolves first and ambient glow/color continues after.

**1. Measurement Bar Reveal**

Characters materialize from 1px vertical bars (oscilloscope cursor metaphor) that widen to reveal the full letterform.

| Property | Value | Token |
|----------|-------|-------|
| Total duration | 800ms | Below `duration.spin` ceiling |
| Stagger per character | 35ms | N/A (custom) |
| Easing | ease-out (cubic) | `easing.out` |
| Bar color | brand teal at 40-80% opacity | `color.brand.verdigris` |
| Bar width | 1px, widening to character width | N/A |
| Final text color | neutral.50 (dark bg) or neutral.950 (light bg) | `color.semantic.foreground` |
| Glow | teal edge glow at 15% opacity, fades during reveal | `color.brand.verdigris` |
| Gate 1 purpose | Brand (measurement becomes meaning) | N/A |
| Reduced-motion fallback | Static text, no animation | HTML fallback |
| Use on | H1 headlines on dark hero sections | Hook and Close roles |
| Max frequency | Once per page (Hook), optionally reprised in Close | Scarcity principle |

**2. Harmonic Typography**

Large display text where digit shapes are clipping masks revealing live waveform data scrolling behind them.

| Property | Value | Token |
|----------|-------|-------|
| Font | Lato 700 | `font.display` |
| Size | clamp(5rem, 15vw, 12rem) | Responsive |
| Waveform phases | Three, offset 120 degrees | Real three-phase power |
| Phase A color | teal (#0fc8c3) | `color.brand.verdigris` |
| Phase B color | purple (#9a2f85) | `color.brand.mp-step-2` |
| Phase C color | yellow (#fecf00) | `color.brand.cyber-yellow` |
| Waveform speed | One 60Hz cycle per 500ms | Matches AC power frequency |
| Scroll behavior | Pins briefly (0.5 scroll-heights), waveforms freeze on scroll-past | N/A |
| Non-digit characters | Solid fill (commas, units are punctuation, not data) | N/A |
| Gate 1 purpose | Brand (text reveals the data the company measures) | N/A |
| Reduced-motion fallback | CSS `background-clip: text` with static teal-to-blue gradient | HTML + CSS |
| Use on | Key stat numbers in Evidence sections | Once per page |

**3. Waveform-to-Text Reveal**

Section heading starts as a continuous oscilloscope trace spanning the full text width, then resolves into readable letterforms.

| Property | Value | Token |
|----------|-------|-------|
| Total duration | 1200ms | Custom (below 1.5x `duration.spin`) |
| Easing | ease-out (cubic) | `easing.out` |
| Waveform structure | 60Hz fundamental + 3rd/5th/7th harmonics | Real electrical harmonic structure |
| Color during transition | Starts at teal, sweeps through palette, terminates at the Turn section's designated accent region | Must end at section accent, not cycle freely |
| Final text color | neutral.50 (dark bg) or neutral.950 (light bg) | `color.semantic.foreground` |
| Gate 1 purpose | Brand + Orientation (signal becomes language, section entering) | N/A |
| Reduced-motion fallback | Static text with 3px teal left border + one static phase portrait or harmonic spectrum illustration | HTML + CSS + static brand viz |
| Use on | H2 headings at the Turn section on Demonstrate pages only | Once per page (the earned accent) |
| Constraint | The waveform phase must be a continuous trace across the full heading width, not per-character noise. The palette sweep must resolve to the section's accent color, not cycle through all 16 stops independently. | Structural + accent alignment |

### Ambient Waveform Layer

A persistent 60Hz sine wave that runs behind page content at low opacity. This is the page's "heartbeat" -- the AC power frequency made visible.

| Section role | Dark bg opacity | Light bg opacity | Harmonics | Color |
|-------------|----------------|-----------------|-----------|-------|
| Hook | 15% | N/A (Hook is always dark) | 1st only | teal |
| Context | Off | Off | None | N/A |
| Evidence | 10-15% | Off (use static illustration) | 1st + 3rd | teal |
| Turn | 15-20% | Off (accent tint handles it) | 1st + 3rd + 5th | section accent |
| Proof | Off | Off | None | N/A |
| Close | 12% | N/A (Close is always dark) | 1st + 3rd + 5th | teal |

The ambient layer appears only on dark-background sections. On light backgrounds (Context, Proof, light-mode Evidence), the waveform layer is hidden -- the section's neutral background does the work. This prevents a teal tint from contaminating neutral breathing-room sections.

**Constraints:**
- Rendered as a single Canvas layer behind all content
- Never more than 20% opacity (reduced from 25% -- it's ambient, not a feature)
- On dark sections: contrast ratio of foreground text vs (background + wave at peak opacity) must meet WCAG AA for large text (3.0:1)
- `prefers-reduced-motion`: static thin line at 8% opacity, no animation
- The waveform frequency (60Hz visual cycles per screen width) is a design constant, not adjustable per page
- The ambient layer counts toward the attention budget (see Named Text Effects) when its opacity exceeds 10%

### Interactive Data Visualization

Data visualizations on marketing pages follow different rules than dashboards.

| Rule | Marketing page | Dashboard (Patina) |
|------|---------------|-------------------|
| Interaction model | Scroll-driven + one interactive widget | Direct manipulation |
| Max interactive elements per page | 1 (the resolution slider or equivalent) | Unlimited |
| Sticky behavior | Max 1.5 scroll-heights per sticky section | N/A |
| Auto-play | Yes, with pause on user interaction | No |
| Data source | Synthetic (labeled as "representative") or anonymized real data | Live customer data |
| Color budget | Trust region + data_visualization exception | Full palette |
| Labels | Pretext-measured, appear sequentially | Standard DOM |
| Performance budget | 60fps target, 30fps floor, single active Canvas | Application-level |

### Technology Page Composition Cell

The Technology/Signal page is a new composition cell: **Demonstrate x Web Page**.

| Property | Value |
|----------|-------|
| Purpose | Show what the product sees -- the data IS the content |
| Trust sequence | Curiosity (hook) > comprehension (context) > revelation (evidence) > conviction (turn) > credibility (proof) > action (close) |
| Page tier | Secondary |
| Hero treatment | Dark, compact (not full-expression -- homepage owns that) |
| Turn allowed | Yes (the page has 8+ sections) |
| Color budget | Trust + data_visualization exception for viz sections |
| Canvas text effects | Up to 3 named effects (measurement bar reveal, harmonic typography, waveform-to-text reveal). Exclusive to this page type. |
| Ambient layer | Yes, dark sections only (per opacity table above) |
| Attention budget | Max 2 animated elements visible in any viewport simultaneously |
| Synthetic data | Must be labeled "Representative electrical data" or similar. Synthetic fault events acceptable but must not claim to be real measurements. |
| Reduced-motion minimum | Page must include at least one static phase portrait or harmonic spectrum illustration for visual signature even without animation. The CSS gradient-clip fallback on Harmonic Typography is the baseline. |
| Interactive elements | 1 primary (resolution slider), secondary interactions on viz elements |

</details>
