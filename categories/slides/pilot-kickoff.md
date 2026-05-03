---
layout: default
title: Slides — Pilot Kickoff Deck
status: experimental
status_note: Primary slides genre. Graduates to convention after shipping on 2 customer kickoffs with positive review (first target: next pilot kickoff after 2026-05-15).
---

# Pilot Kickoff Deck

A pilot kickoff deck is what Verdigris sends to a customer at the moment a pilot is committed: agreement scope is set, technical contacts are introduced, the first 90 days are mapped, and the success criteria are explicit. The audience is the customer team that will execute the pilot — typically a sponsor (VP-level), a working lead (Director or Senior Manager), and one or two engineers who will receive Verdigris hardware or data.

The deck is not a sales pitch. The pitch already worked; the contract is signed. The deck's job is to make the pilot legible to people who weren't in the sales motion. It's a reference, a calendar anchor, and the canonical version of "what we said we'd do" that all subsequent engagement-thread artifacts will trace back to.

This guide is the primary genre spec for the slides cell. Other genres ([internal-team](internal-team), [customer-101](customer-101), [partner-enablement](partner-enablement)) document deltas against this spec.

## Pick the genre first

The slides cell defines four genres. Pick one before opening a template. They are not interchangeable — each carries a different authority signal and a different audience expectation.

| Genre | When to use | Authority signal | Reference exemplars |
|---|---|---|---|
| **Pilot kickoff** | The customer just committed to a pilot; this is the first artifact they receive after signature | Founder + customer team named; explicit pilot scope, dates, success criteria, COI clean | a16z portfolio kickoff template; McKinsey client onboarding deck; Stripe enterprise launch packet |
| **Internal team** | Verdigris-internal engagement updates, pre-meeting prep, post-mortems | Operational, week-N notation OK, no external decoration | n/a (internal docs from Stripe, Atlassian, etc.) |
| **Customer 101** | First substantive meeting with a prospect; introduces Verdigris and the product wedge | Seren as primary voice (people intelligence, diplomatic precision); customer-empathy-led with Mark accenting the close | Anthropic founder presentations; early-stage pitch decks (Notion, Figma) |
| **Partner enablement** | A channel partner needs to co-sell Verdigris; deck arms their AE with the wedge, qualifying questions, and deal-registration mechanics | Jimit + Mike voices; market-fluent; emphasizes joint value | Stripe Verified Partner enablement; AWS reseller training decks |

The four genres differ on six axes. **Pick one and commit.** A pilot kickoff dressed as a customer 101 reads as "they don't know us yet" and erodes the sponsor's confidence. A customer 101 dressed as a pilot kickoff reads as "they're assuming a sale." Match the genre to the engagement state.

| Axis | Pilot kickoff | Internal team | Customer 101 | Partner enablement |
|---|---|---|---|---|
| **Length** | 12-20 slides | 8-15 | 15-25 | 20-30 |
| **Voice primary** | Mike (field credibility) | Thomas (operational) | Seren (people intelligence, diplomatic precision) | Jimit (market fluency) |
| **Voice supporting** | Thomas (operational structure) | Mike (technical translation) | Mike (field credibility on evidence slides) | Seren (people-first framing) |
| **Voice accent** | Jon (data flow + hardware install) | Jimit (market context) | Mark (close + "why now" only) | Mike (objection handling) |
| **CTA pattern** | "Pilot scope + decision date for expansion" | "Decision needed by [date]" | "Next meeting + agenda" | "Co-sell motion + deal registration" |
| **Confidentiality default** | CUSTOMER-CONFIDENTIAL | INTERNAL ONLY | PUBLIC | PARTNER-CONFIDENTIAL |
| **Date format** | absolute calendar dates | week-N notation OK | absolute | absolute |
| **Logomark** | full lockup, footer band | wordmark only, footer band | full lockup, footer band | full lockup, footer band |

## The deck is a reference (universal)

Whichever genre you pick, this rule holds.

A slide deck is **not** a script. It carries the title, the structure, the anchor metrics, and the calendar. The narrative arrives through the speaker's voice; the deck is what survives the meeting. A deck that includes paragraphs of body copy, exhaustive bullets, or every objection handled fails the reference register: it's a reading exercise, not a meeting tool.

Reference set across the four genres: a16z portfolio kickoffs, McKinsey client onboarding decks, Stripe enterprise launch packets, Anthropic founder talks, AWS partner enablement. Every one of them treats the deck as a calendar-anchored reference, not a verbatim talk track. The presenter's job is to bring the deck to life; the deck's job is to be re-readable a week later by someone who wasn't in the room.

## Required structure (pilot kickoff)

A pilot kickoff deck has 12-20 slides in this canonical order. Slides marked **(required)** are non-negotiable; slides marked **(per engagement)** are common but skipped when context already covers them.

1. **Title slide** (required) — customer name + pilot title, Verdigris lockup, date, byline (founder + working lead)
2. **Why we're here** (required) — one slide framing the pilot's intent in the customer's language; this is *their* sentence, not Verdigris marketing
3. **What we agreed to** (required) — pilot scope: sites, hardware, software, data feeds, time window
4. **Success criteria** (required) — 3-5 measurable outcomes with thresholds; same wording as the contract
5. **Verdigris team** (required) — named individuals + role labels; *who you call when*
6. **Customer team** (per engagement) — names + role labels; same shape as Verdigris team
7. **Timeline (90 days, calendar)** (required) — Gantt or banded calendar with absolute dates, key milestones
8. **Hardware install plan** (per engagement) — when hardware is in scope; cite installer, scheduling, dependencies
9. **Data flow** (per engagement) — when data integration is in scope; sources, sample rate, anonymization
10. **What "good" looks like at week 4** (required) — a single concrete checkpoint that proves the pilot is on track
11. **Risks + mitigations** (required) — 3-5 named risks; each with a one-line mitigation
12. **Decisions we owe the customer** (required) — explicit list of decisions Verdigris will make and when
13. **Decisions we need from the customer** (required) — explicit list of decisions the customer will make and when
14. **Contact + escalation** (required) — phone numbers, Slack/email, escalation path
15. **Anchor metric** (required) — the single bolded outcome the pilot is designed to prove; pulled from the EVD canonical atom set if applicable
16. **Path to expansion** (per engagement) — what comes after a successful pilot; not a sales pitch, just the map
17. **Appendix: assumptions** (per engagement) — explicit list of pilot assumptions the customer can challenge
18. **Close slide** (required) — restated pilot title + decision date for expansion + "What to do next"

What is **not** on a pilot kickoff deck:

- Sales pitch slides ("Why Verdigris" / "Our differentiators") — the contract is signed; these slides erode trust
- Animated content (the deck must export to PDF cleanly)
- More than one anchor metric (per the case-study cell rule, multiple metrics compete for attention)
- Names baked into templates (use role labels per the rendering-layer-never-invents-facts principle)
- Internal Verdigris jargon ("EVD atom", "L3 evaluator", "site-coherence gate") — translate to customer language

## Decision framework: where to land in the bounds

The structure spec gives ranges (12-20 slides, 3-5 success criteria, 3-5 risks). The bounds prevent both starvation and bloat; this framework picks within them. Default to the middle column unless an explicit signal pushes you to the floor or the ceiling.

| Boundary | Floor (small) | Default | Ceiling (large) |
|---|---|---|---|
| **Slide count (12-20)** | **12 slides** when the customer audience is small (sponsor + working lead only), the pilot is a single site, and the engagement is a known repeat pattern (second pilot with the same customer, or a refresh). | **15-16 slides** for a typical first pilot: sponsor + working lead + 1-2 engineers, single segment, fresh engagement. | **20 slides** when the pilot spans multiple sites or business units, the customer audience is broad (sponsor + working lead + multiple engineering / facilities groups), or the engagement complexity warrants explicit hardware-install + data-flow + path-to-expansion slides instead of folding them into the appendix. |
| **Success criteria (3-5)** | **3 criteria** when the engagement has one anchor outcome and two supporting observables (typical first pilot). | **4 criteria** when a regulatory or contractual outcome (LL97, SLA, capacity-deferral threshold) joins the technical anchors. | **5 criteria** only when the contract enumerates 5; never invent a fifth to fill the slide. Below 3 the slide reads as under-defined; above 5 the criteria compete for attention and the anchor metric loses definition. |
| **Risks + mitigations (3-5)** | **3 risks** for a low-complexity pilot (single site, known hardware, established data feed). | **4 risks** for a typical pilot where install logistics, data-feed access, and one customer-side dependency are all in scope. | **5 risks** for multi-site or multi-vendor pilots where coordination risk dominates. Avoid 6+ — the slide turns into a catalog and the customer stops reading. |
| **Decisions we owe / decisions we need (open-ended)** | **2-3 each** when the contract pre-resolves most decisions and only execution choices remain. | **4-5 each** for a typical first pilot where mid-engagement decisions are still unscoped. | **6-7 each** only when an unusually complex engagement leaves many decisions open; consider whether two of those should have been resolved in the contract instead. |

If the situation pushes you toward the ceiling on three or more boundaries simultaneously, the engagement may be a multi-pilot program rather than one pilot. Pause and check with the engagement lead before producing one oversized deck.

## Spacing rhythm

All values from `tokens/spacing/slides.json`. Every gap has a floor AND a ceiling.

| Gap | Floor | Default | Ceiling |
|---|---|---|---|
| Slide top frame | 48pt | 56pt | 72pt |
| Slide side frame | 56pt | 72pt | 88pt |
| Slide bottom frame (above footer band) | 48pt | 56pt | 64pt |
| Footer band height | 32pt | — | — (fixed) |
| Title to deck (subtitle) | 16pt | 22pt | 28pt |
| Deck to body | 32pt | 40pt | 56pt |
| Body block to next body block | 16pt | 22pt | 28pt |

The footer band is fixed at 32pt. Floor-and-ceiling on the frame allows visual variety across slide types; floor-and-ceiling on the rhythm gaps prevents both crowding and the half-empty-slide failure mode.

## Typography

| Slot | Font | Size | Weight | Color |
|---|---|---|---|---|
| Title slide H1 | Lato | 56pt | 700 | rgba(255,255,255,0.96), one accent in teal |
| Body slide headline | Lato | 36pt (32-44 range) | 700 | `--vd-ink`, one accent in teal |
| Body slide deck (subtitle) | Inter | 20pt (18-22 range) | 400 | `--vd-muted` |
| Body text | Inter | 22pt (18-24 range) | 400 | `--vd-ink` |
| Emphasis text | Inter | 24pt | 600 | `--vd-ink` |
| Footer text | Inter | 11pt (10-13 range) | 400 | `--vd-muted` |
| Footer confidentiality marking | Lato | 9pt | 700 | tier-specific color |
| Eyebrow | Lato | 12pt | 700 | `--vd-muted` (uppercase, 0.10em letterspacing) |

Verdigris locks Inter + Lato + JetBrains Mono. The same families used on the website and in whitepapers; consistency across surfaces is a brand cue.

## Logomark consistency (Z2O-1318)

Every slide in a pilot kickoff deck carries the logomark in the footer band, left-aligned, 20pt tall. The title slide additionally carries the full lockup top-left, 52pt tall (44-60pt floor/ceiling). Three rules:

1. **Position is fixed.** Footer logomark always left of footer band, vertical center. Title-slide logomark always top-left of safe frame.
2. **Size is bounded.** Footer 20pt exact (no scale). Title 44-60pt range (a little freedom for visual balance).
3. **Variant is fixed per surface.** Pilot kickoff uses the **full lockup** (`assets/logos/lockup-white.svg` for dark backgrounds, `lockup-dark.svg` for light). Internal-team genre uses the wordmark; customer-101 + partner-enablement match pilot kickoff.

A logomark that drifts in size, position, or variant signals "ad-hoc deck, not template-produced." Reviewers register it pre-consciously and lose trust in the rest.

## Confidentiality marking (Z2O-1319)

Every slide in a pilot kickoff deck carries the confidentiality marking in the footer band, right-aligned. Default tier: **CUSTOMER-CONFIDENTIAL**. The marking is mandatory; absence is a rule violation.

| Tier | Use case | Color |
|---|---|---|
| `PUBLIC` | Customer 101 decks, case studies, one-pagers, whitepapers | `--vd-muted` |
| `CUSTOMER-CONFIDENTIAL` | Pilot kickoff decks (default), customer-specific briefs | warm yellow `#c79100` |
| `PARTNER-CONFIDENTIAL` | Partner enablement decks | muted purple `#6b4ba0` |
| `INTERNAL ONLY` | Internal team decks, board-prep | muted red `#8a3a3a` |

The color signals tier without requiring the reader to parse the text. Consistency across the deck is mandatory: a deck that switches tiers mid-way is a smell that suggests bolt-on slides from a different artifact.

## Roles, not names (Z2O-1320)

The pilot kickoff template uses role labels, not specific people:

- "Pilot Sponsor" (not "Mark Chung")
- "Working Lead" (not "Thomas Chung")
- "Verdigris Field Engineer" (not "Mike Mahedy")
- "Customer Pilot Lead" (not "Jane Doe")

When a real deck is produced from the template, the production step fills in names alongside the roles ("Pilot Sponsor: Mark Chung, CEO"). The role label stays — it's how the customer reads the deck six months later when staffing has shifted.

This is the rendering-layer-never-invents-facts principle from `LEARNINGS.md` applied to slide templates. A name baked into a template is no longer a template; it's a one-off artifact masquerading as reusable infrastructure. When the next pilot needs a new deck, the artifact gets re-cloned from the role-labeled template, not edited from a names-baked precedent.

## Template vs. produced

The roles-not-names rule is concrete in this comparison. Left column is what an agent generates from the spec (or what a producer clones from a previous deck); right column is what a human fills in against the actual engagement. A produced deck MUST NOT ship while any `[FIELD: ...]` placeholder remains.

| Slot | Template stage | Produced stage |
|---|---|---|
| Verdigris team slide | `Pilot Sponsor: <span class="vd-template">[FIELD: name + title, e.g. "Mark Chung, CEO"]</span>` | `Pilot Sponsor: Mark Chung, CEO` |
| Customer team slide | `Customer Pilot Lead: <span class="vd-template">[FIELD: name + title]</span>` | `Customer Pilot Lead: Jane Doe, VP of Energy Operations` |
| Title slide subtitle | `Pilot kickoff for <span class="vd-template">[FIELD: customer + scope, e.g. "Acme Life Sciences — 5-building pilot"]</span>` | `Pilot kickoff for Acme Life Sciences — 5-building pilot` |
| Timeline anchor | `Hardware install: <span class="vd-template">[FIELD: absolute date, e.g. "2026-06-15"]</span>` | `Hardware install: 2026-06-15` |

The template stage is what an agent generates from the spec; the produced stage is what a human (or evidence-grounded agent) fills in. Never ship the produced stage without source evidence for every filled placeholder — a sponsor name is verifiable from the contract; an install date is verifiable from the project schedule. If a slot lacks a source, leave the placeholder visible and flag it in the hand-off note.

## Audience-fit diction (Z2O-1321)

The voice recipe `pilot_kickoff_deck` (in `voice/recipes.yaml`) sets the dial: Mike primary (field credibility, operator empathy from actual customer-site work — see [`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)), Thomas supporting (operational clarity, structured-but-transparent — see [`voice/team/thomas-chung.yaml`](../../voice/team/thomas-chung.yaml)), Jon accent (technical depth on data flow / hardware install slides — see [`voice/team/jon-chu.yaml`](../../voice/team/jon-chu.yaml)). The contract is signed; the customer team needs to feel the team they'll work with for 90 days already understands their world — not founder reassurance. Beyond the recipe, four diction adjustments are required for a pilot kickoff:

1. "**Exit criteria**" → "**expansion criteria**" or "**graduation criteria**"
   - "Exit" implies the customer is leaving Verdigris. The opposite is intended: the criteria mark the path from pilot to expanded engagement. "Expansion criteria" carries the right vector. "Graduation criteria" works when the audience is technically inclined.
2. "**Customer**" → use the customer's name when known, "your team" when speaking inclusively
   - "Customer" is third-person; the deck is addressed *to* them, so first-person ("we", "your team") and named ("Acme Life Sciences", "Verizon") read better.
3. "**Pilot phase**" → "**first 90 days**" or "**this engagement**"
   - "Phase" is internal Verdigris jargon for the staged engagement model. The customer doesn't think in phases.
4. "**Generally available**" → "**in production**" or "**fleet-deployed**"
   - "GA" is internal product-roadmap language. Customers want to know if it works at their scale, not where it sits in our roadmap.

These are starting points, not exhaustive. The diction pass is a final read-through before distribution: walk every slide, mark any internal jargon, replace it with operator-readable language. Pair with the voice recipe.

## Voice at a glance

A producer reading this cell should be able to answer "what voice mix am I writing in?" without leaving the page. Pulled directly from the `pilot_kickoff_deck` recipe and the linked profile YAMLs.

**Mike — primary** (Profile: [`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)). Field credibility from actual customer-site work. Mike's voice is what makes the install plan, success criteria, and team slide read as "we have lived your problems," not "we read about your problems in a deck." His range covers Slack-brief sanity checks and authoritative long-form, both grounded in real MW numbers and conference observations.

> "I was at [conference] and they presented..."

Carries: install plan, success criteria, team slide, anchor metric — the slides where field-recognizable specificity is the trust signal.

**Thomas — supporting** (Profile: [`voice/team/thomas-chung.yaml`](../../voice/team/thomas-chung.yaml)). Operational clarity, structured-not-corporate. Thomas writes the kind of update that names what's slipping in the same breath as what's working. His self-honesty (10 in profile) is what keeps the deck honest about what's experimental, what's mature, and what's still TBD.

> "people should walk away feeling good"

Carries: timeline, decisions we owe, decisions we need from the customer, escalation — the structural backbone slides.

**Jon — accent** (Profile: [`voice/team/jon-chu.yaml`](../../voice/team/jon-chu.yaml)). Bench-engineer voice for the data-flow and hardware-install slides. Jon doesn't theorize when he can observe; the diction is "looks like a firewall issue to me" rather than "we believe network connectivity may be impacted."

> "looks like a firewall issue to me"

Carries: data flow slide, hardware install slide. Stays out of the rest.

## Date format (Z2O-1322)

Pilot kickoff decks use **absolute calendar dates** for every timeline claim:

- ✅ "Hardware install: 2026-06-15"
- ✅ "First data ingestion: June 22, 2026"
- ✅ "Week 4 checkpoint: 2026-07-13"
- ❌ "Hardware install: Week 1"
- ❌ "First data ingestion: Late June"
- ❌ "Mid-pilot review: Week 6"

Week-N notation is acceptable in the **internal team** genre only, where the pilot timeline is the running thread for everyone in the room. For external audiences, week-N drops the calendar anchor and forces the customer to do mental arithmetic. Absolute dates anchor the deck to the customer's calendar, which is what they actually plan against.

Mixed formats in one deck (week-N on slide 4, absolute on slide 8) is a smell. Pick the format the genre demands and hold it.

## Tables and supporting visuals (Z2O-1323)

Tables on a pilot kickoff slide carry pilot scope, success criteria, role assignments, and timeline data. Four constraints, all enforced by the cell:

| Constraint | Floor | Ceiling | Why |
|---|---|---|---|
| Cell vertical padding | 8pt | 16pt | Below 8pt rows compress; above 16pt the table loses density |
| Cell horizontal padding | 12pt | 20pt | Same reasoning, horizontal axis |
| Columns per slide | — | 6 | Above 6, the slide cannot be read at projection distance |
| Rows per slide | — | 8 | Above 8, split across slides or move to an appendix |

The header row uses Lato 13pt 700 in `--vd-muted` (uppercase, 0.10em letterspacing) — same eyebrow tier as section eyebrows in the whitepaper cell, for visual consistency across surfaces. Body rows use Inter 18pt 400 in `--vd-ink`. First column is bold (font-weight: 600) for the row label.

Supporting visuals (figures, diagrams, charts) follow the `.vd-figure` pattern from `build/print/cover.css`: figure → caption with label → credit line. Three slide-specific overrides:

- Figure max-height: 480pt (leaves room for slide headline + caption + footer)
- Caption type: 13pt Inter 400 (smaller than print whitepapers because slide projection adds visual weight)
- Credit type: 10pt Inter 400 (same data-source-credit discipline; never an uncredited proprietary chart)

Figures NEVER split across slides. If a figure plus caption plus credit doesn't fit, push the figure to the next slide rather than shrink it.

## Reference exemplars

These four exemplars informed the genre debate during adversarial review. Borrowing patterns from outside this set is permitted; borrowing from genres that don't apply to pilot kickoffs is not.

| Exemplar | What it teaches | What to borrow | What NOT to borrow |
|---|---|---|---|
| a16z portfolio kickoff template | Founder-led tone; explicit "what we agreed to" framing; restraint on visual decoration | Title-slide minimalism; explicit decisions section | Their playbook-driven 30-slide length (too long for a pilot kickoff) |
| McKinsey client onboarding | Crisp role assignments; risk + mitigation discipline; calendar fidelity | Role + responsibility tables; risk register format | Heavy frameworks ("3 horizons", "5 forces") that don't apply |
| Stripe enterprise launch packet | Confidentiality marking discipline; PDF-first export; no animation | Footer band convention; absolute dates throughout | Stripe-specific product framing |
| AWS Solutions Architect kickoff | Technical clarity on data flow + integration points | Data-flow diagrams with named source/sink | Cloud-architecture-deck conventions (cells, regions, AZs) |

A Verdigris pilot kickoff borrows from all four but is none of them: founder authority (a16z), operational clarity (McKinsey), confidentiality discipline (Stripe), technical precision (AWS).

## Production checklist

Before distributing a pilot kickoff deck, walk this checklist. Fail any line, fix it before sending.

1. Genre selected and declared in deck metadata (`<body data-genre="pilot-kickoff">`)
2. Voice recipe applied (`pilot_kickoff_deck` from `voice/recipes.yaml`)
3. Required slides present (slides 1, 2, 3, 4, 5, 7, 10, 11, 12, 13, 14, 15, 18 from the structure above)
4. Logomark in footer on every body slide; full lockup on title slide
5. Confidentiality marking present on every slide (default CUSTOMER-CONFIDENTIAL)
6. Role labels in template; specific names alongside roles in the produced deck
7. Diction pass: "exit criteria" → "expansion criteria"; "customer" → customer name or "your team"; etc.
8. Absolute dates throughout (no week-N notation)
9. Tables comply (max 6 cols, max 8 rows, padding within range)
10. One anchor metric (slide 15); not multiple
11. PDF export tested via Chrome `--print-to-pdf` — no clipping, fonts loaded, footer present on every slide
12. Hand-off note attached, enumerating any `[FIELD: ...]` placeholders that remain
13. Naming convention applied: `pilot-kickoff-{customer}-{topic}-{YYYYMMDD}-v{N}.pdf` — see [`workflows/sales-collateral`](../../workflows/sales-collateral#versioning-vs-refresh) for when to bump the version vs. edit in place

The checklist sits alongside the cell-validator pass; the validator catches structural rule violations (logomark, confidentiality, table dims), the checklist catches content-quality issues (diction, slide count, anchor metric).

## What this guide does NOT cover

- **Live demo segments.** When a pilot kickoff includes a live demo, the demo content lives elsewhere (sandbox URL, recorded walkthrough); the deck links to it. Demo cell is deferred until a real surface needs it.
- **Customer-specific data dashboards.** A kickoff deck doesn't render live customer data. If the customer wants live charts, link to the deployed dashboard rather than pasting screenshots.
- **Internal review or retrospective decks.** Those are internal-team genre, not pilot-kickoff. Different rules.
- **Renewal or expansion-stage decks.** A renewal conversation is structurally a fresh kickoff, but the role assignments, history, and success criteria all change. Defer to a future "renewal kickoff" sub-genre when a real surface emerges.

## Why this guide exists

Filed as Linear issues Z2O-1318 through Z2O-1323 on 2026-05-02 from a review of the customer pilot kickoff deck:

- **Z2O-1318** Logomark consistency — drifted across slides, undermining the template's authority signal
- **Z2O-1319** Confidentiality marking — absent on most slides; one declaration on slide 1 is not enough for a deck the customer will share internally
- **Z2O-1320** Roles vs. names — customer-specific names baked into what should have been a reusable template
- **Z2O-1321** Audience-fit diction — "exit criteria" landed wrong with a customer thinking about expansion, not departure
- **Z2O-1322** Date / week-N — mixed formats in one deck created ambiguity about the actual pilot calendar
- **Z2O-1323** Table formatting — ad-hoc tables with inconsistent padding, column counts, header treatment

Each issue is now a rule under `composition.persuade-slide-deck.*` in `rules/visual-rules.yml`, plus a voice rule under `voice/recipes.yaml` for diction. The rules are genre-conditional (via the YAML `modes:` field) where the constraint differs across genres (confidentiality default, date format, voice mix). Mark Chung's broader framing on 2026-05-01 — "we need a scalable way to produce product demo artifacts and canonical product information" — drove the decision to absorb production-process scope into the design repo via `workflows/sales-collateral.md`, the production-side counterpart to this cell.

The genre framework was synthesized via the [adversarial-review workflow](../../workflows/adversarial-review): research the four exemplars, debate the genre splits (does pilot kickoff really differ from customer 101? — yes, on six axes; does internal team belong as a sibling genre or a parent class? — sibling, because the deltas-only against pilot kickoff approach minimizes drift), synthesize the rules, then QA. Per `LEARNINGS.md` "honest history beats clean history," this section preserves the audit trail.

## See also

- [`categories/slides/index`](index) — genre selection / decision tree
- [`categories/slides/internal-team`](internal-team) — internal team genre, deltas-only against this spec
- [`categories/slides/customer-101`](customer-101) — first-meeting prospect deck
- [`categories/slides/partner-enablement`](partner-enablement) — partner co-sell deck
- [`workflows/sales-collateral`](../../workflows/sales-collateral) — production guide spanning all collateral types
- [`workflows/adversarial-review`](../../workflows/adversarial-review) — research-debate-synthesize-QA workflow
- [`categories/whitepapers/cover`](../whitepapers/cover) — sister cell, structural template for this guide
- [`build/print/slides.css`](../../build/print/slides.css) — reference stylesheet
- [`tokens/spacing/slides.json`](../../tokens/spacing/slides.json) — spacing tokens
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — voice recipes (`pilot_kickoff_deck`, etc.)
