---
layout: default
title: Slides — Internal Team Deck
status: experimental
status_note: Deltas-only against pilot-kickoff. Graduates with the cell after 2 customer-facing decks ship.
---

# Internal Team Deck

This genre is for Verdigris-internal coordination: pre-meeting prep, post-mortem reviews, weekly engagement updates, account reviews, board prep that the board hasn't seen yet. Audience is Verdigris-only — pilot working group, leadership team, eng/GTM coordination.

This guide documents only the **deltas** against [pilot-kickoff.md](pilot-kickoff). Read that spec first.

## What changes

| Axis | Pilot kickoff (parent) | Internal team (this genre) |
|---|---|---|
| Length | 12-20 slides | 8-15 |
| Voice primary | Mike (field credibility) | **Thomas** (operational, transparent) |
| Voice supporting | Thomas | **Mike + Jon** (technical translation + bench-diagnostic credibility) |
| Voice accent | Jon (data flow / hardware) | **Jimit** (market context when engagement intersects strategy) |
| CTA pattern | "Pilot scope + decision date for expansion" | "Decision needed by [date]" — a specific Verdigris decision, owner, date |
| Confidentiality default | CUSTOMER-CONFIDENTIAL | **INTERNAL ONLY** (red marking) |
| Date format | absolute calendar dates | **week-N notation acceptable** when the engagement timeline is the running thread |
| Logomark | full lockup (footer + title) | **wordmark only** (no full lockup; signals "internal context, not customer-facing") |

The wordmark distinction matters: a Verdigris employee opening an internal deck immediately registers "this isn't going to a customer" via the lockup variant. The customer-facing decks always use the full lockup; the internal-only decks always use the wordmark. The visual delta is small and intentional.

## What stays the same

- 12-column grid; 1280×720 master; footer band 32pt
- Logomark position (footer left, 20pt); confidentiality marking (footer right)
- Role labels in templates (this genre matters less because internal templates often *do* name people, but the principle holds: a "weekly account review template" should say "Pilot Lead" not "Mark")
- Table dims (max 6 cols, max 8 rows, padding floor/ceiling)
- Figures via `.vd-figure`
- PDF-exportable (no animation)

## Skipped slides

The pilot-kickoff structure has 18 canonical slides. Internal team decks typically use a subset:

| From pilot kickoff | Internal team status |
|---|---|
| 1. Title | required |
| 2. Why we're here | required (terse: "What this meeting is for") |
| 3. What we agreed to | optional (covered in the linked customer-facing artifact) |
| 4. Success criteria | required (operational; tracked weekly) |
| 5. Verdigris team | required (often the title slide carries the team list inline) |
| 6. Customer team | optional |
| 7. Timeline | required (week-N notation OK) |
| 8. Hardware install | optional (when relevant) |
| 9. Data flow | optional |
| 10. Week-4 checkpoint | required |
| 11. Risks + mitigations | required (more direct than customer-facing) |
| 12. Decisions we owe | required |
| 13. Decisions from customer | optional |
| 14. Contact + escalation | optional |
| 15. Anchor metric | required |
| 16. Path to expansion | optional |
| 17. Appendix: assumptions | optional |
| 18. Close: decision date | required |

## Voice at a glance

Internal-team decks are heterogeneous: engineers need technical precision, operators need empathy, GTM needs market context. A single-voice recipe brittles. The `internal_team_deck` recipe runs four voices, each carrying a slice. Pulled directly from the recipe and the linked profile YAMLs.

**Thomas — primary** (Profile: [`voice/team/thomas-chung.yaml`](../../voice/team/thomas-chung.yaml)). Operational, transparent. Self-honesty is 10 in his profile, which makes him the right voice for "what's slipping." His thinking-out-loud register works for internal context where translation costs more than it gains.

> "people should walk away feeling good"

Carries: title, why-we-here, success criteria, decisions we owe, week-4 checkpoint, close. The structural backbone.

**Mike — supporting** (Profile: [`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)). Translates engineering reality into operator-readable status. Field credibility grounds the customer-side perspective even when the audience is internal.

> "please sanity check"

Carries: customer-side status, hardware-install status when relevant, risks + mitigations.

**Jon — co-supporting** (Profile: [`voice/team/jon-chu.yaml`](../../voice/team/jon-chu.yaml)). Engineering status, bench-diagnostic credibility. Technical_precision is 9 in his profile and is load-bearing for engineering status slides. Internal coordination cannot lead with operations-speak alone.

> "looks like a firewall issue to me"

Carries: data-flow status, hardware-install diagnostics, scope-and-coordination slides. Added 2026-05-02 after Loop 3 review caught the gap.

**Jimit — accent** (Profile: [`voice/team/jimit-shah.yaml`](../../voice/team/jimit-shah.yaml)). Connects the engagement to market signals when relevant.

> "Hot new update from Semianalysis..."

Carries: occasional market-context slides when the engagement intersects strategy. Stays out of routine status decks.

## Diction adjustments specific to internal decks

The diction rules for external genres (Z2O-1321, e.g., "exit criteria" → "expansion criteria") **do not apply** to internal-team decks. Internal jargon is fine — and faster — when the audience is Verdigris-only.

What still applies:

- Customer name in customer's preferred form (always; even internal decks reference customers correctly)
- Absolute dates for any decision the team is committing to
- Week-N notation only for tracking the engagement timeline, not for decision dates

## Why this is a genre and not a mode flag on pilot kickoff

A reasonable challenge: if internal team is "deltas-only against pilot kickoff," is it really a genre, or is it a `mode: internal` toggle that could apply to any genre?

Verdict: it's a genre, defensibly, on five structural grounds:

1. **Voice mix changes from three voices to a different three voices**, with Thomas as primary instead of Mike. The voice center of gravity shifts because the audience is internal — operational clarity beats field credibility.
2. **Logomark variant changes** (full lockup → wordmark only). This signals "internal context, not customer-facing" pre-consciously to readers; a wordmark-only customer deck would feel cheap, a full-lockup internal deck feels misplaced.
3. **Confidentiality tier marking color changes** to red (INTERNAL ONLY), distinct from the customer/partner/public yellow/purple/grey palette.
4. **Date format relaxes** to permit week-N notation when the engagement timeline is the running thread (per the absolute-dates rule's mode list excluding internal_team).
5. **Diction rules NOT applied** — the audience-fit-diction guidance ("exit criteria" → "expansion criteria", etc.) doesn't apply because internal jargon is faster than translation when the audience is Verdigris-only.

If we collapsed internal_team to a `mode: internal` toggle on pilot_kickoff, every rule that distinguishes the genres would need conditional logic on the toggle. That's complexity without simplification. Treating internal_team as a genre keeps each genre's spec self-contained and locally readable.

The genre stays a genre. If a sixth structural delta accumulates against another existing genre and a new "post-mortem" or "retrospective" sub-genre earns its own spec, this defense is what to point at — same five-axis test.

## Origin

Filed implicitly via the same pilot kickoff review (Z2O-1318 through Z2O-1323) — the slide cluster surfaced in customer-facing decks but the rules need to NOT apply to internal decks (e.g., the customer-101 wordmark would be wrong for an internal weekly), so the genre split was necessary to express the deltas. The four-genre framework was synthesized via the [adversarial-review workflow](../../workflows/adversarial-review).

## What this cell does NOT cover

- **Customer-facing decks.** When the audience includes any customer-side participants, use `pilot-kickoff.md`, `customer-101.md`, or `partner-enablement.md`.
- **Customer-attended retrospectives.** Internal-team decks are Verdigris-only. If the customer attends the retrospective, it's a joint review (use the relevant external genre).
- **Board materials.** When the board has not seen the engagement before, use a standalone board-prep brief or whitepaper, not an internal weekly deck.
- **Audit / compliance artifacts.** When the artifact must survive external audit, escalate to a formal compliance brief.

## See also

- [`workflows/sales-collateral`](../../workflows/sales-collateral) — production guide spanning all collateral types
- [Pilot kickoff (primary spec)](pilot-kickoff) — full structure, typography, spacing, rationale
- [Slides index](index) — genre selection
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — `internal_team_deck` recipe
- [`voice/team/thomas-chung.yaml`](../../voice/team/thomas-chung.yaml), [`mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml), [`jimit-shah.yaml`](../../voice/team/jimit-shah.yaml) — voice profile sources
