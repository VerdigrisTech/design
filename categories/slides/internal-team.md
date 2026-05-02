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
| Voice mix | thomas (40%) + mark (30%) + technical_precision (30%) | thomas (operational, terse); minimal narrative voice |
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

## Diction adjustments specific to internal decks

The diction rules for external genres (Z2O-1321, e.g., "exit criteria" → "expansion criteria") **do not apply** to internal-team decks. Internal jargon is fine — and faster — when the audience is Verdigris-only.

What still applies:

- Customer name in customer's preferred form (always; even internal decks reference customers correctly)
- Absolute dates for any decision the team is committing to
- Week-N notation only for tracking the engagement timeline, not for decision dates

## Why this genre exists

Filed implicitly via the same Abcam review (Z2O-1318 through Z2O-1323) — the slide cluster surfaced in customer-facing decks but the rules need to NOT apply to internal decks (e.g., the customer-101 wordmark would be wrong for an internal weekly), so the genre split was necessary to express the deltas. The four-genre framework was synthesized via the [adversarial-review workflow](../../workflows/adversarial-review).

## See also

- [Pilot kickoff (primary spec)](pilot-kickoff) — full structure, typography, spacing, rationale
- [Slides index](index) — genre selection
