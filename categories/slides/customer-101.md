---
layout: default
title: Slides — Customer 101 Deck
status: experimental
status_note: Deltas-only against pilot-kickoff. Graduates with the cell after 2 customer-facing decks ship.
---

# Customer 101 Deck

This genre introduces Verdigris to a new prospect at the first substantive meeting (post-discovery, pre-contract). Audience is the prospect's initial evaluator: a Director, Senior Manager, or VP whose job is to decide whether Verdigris is worth a deeper look.

The deck's job is to make the wedge legible — what Verdigris does, what evidence supports it, what comes next — without overwhelming a first-meeting audience with operational detail. This is a story-led deck; the founder's voice carries it.

This guide documents only the **deltas** against [pilot-kickoff.md](pilot-kickoff). Read that spec first.

## What changes

| Axis | Pilot kickoff (parent) | Customer 101 (this genre) |
|---|---|---|
| Length | 12-20 slides | 15-25 |
| Voice mix | thomas (40%) + mark (30%) + technical_precision (30%) | mark (50%) + jon (30%) + operator_empathy (20%) |
| CTA pattern | "Pilot scope + decision date for expansion" | "Next meeting + agenda" — a specific calendar invite, not a decision |
| Confidentiality default | CUSTOMER-CONFIDENTIAL | **PUBLIC** — these decks are share-friendly |
| Logomark | full lockup | full lockup (same as parent) |
| Date format | absolute calendar dates | absolute (same as parent) |

## What changes structurally

The 18-slide pilot-kickoff structure does not apply. Customer 101 decks have a different canonical structure:

1. **Title slide** (required) — Verdigris + the prospect's industry / use case in the eyebrow
2. **The wedge** (required) — one slide stating Verdigris's specific value proposition for the prospect
3. **The problem in their language** (required) — the customer's framing of the problem Verdigris solves
4. **What we do** (required) — Verdigris in 1-2 sentences; supported by 1 visual
5. **How it works** (required) — high level; signals + intelligence + outcomes
6. **Evidence** (required, 2-4 slides) — case study summaries, anchor metrics, named customers (where public)
7. **Where we fit** (required) — Verdigris's position relative to BMS, EMS, IoT platforms
8. **Why now** (required) — the market/regulatory/AI-load shift that makes Verdigris timely
9. **Pricing model** (per engagement) — when the prospect asks; otherwise defer
10. **Pilot model** (per engagement) — when the prospect's evaluation is moving toward a pilot
11. **Team** (required) — Mark + Thomas + 1-2 named technical leads with role labels
12. **Close: next meeting + agenda** (required) — explicit calendar invite, agenda for that meeting

Slides marked **(required)** appear in every customer 101 deck. Slides marked **(per engagement)** appear when the conversation has moved to those topics; they are skipped on first meetings where pricing/pilot mechanics are premature.

## What stays the same

- 12-column grid; 1280×720 master; footer band 32pt
- Logomark position + size; full lockup variant (PUBLIC tier means external surface, full lockup signals brand confidence)
- Confidentiality marking (PUBLIC); tier color is `--vd-muted` (subtle)
- Role labels in templates ("Verdigris CEO" not "Mark Chung"; produced deck adds the name alongside)
- Table dims, figures, PDF-exportable

## Diction adjustments specific to customer 101

The Z2O-1321 diction rule applies: avoid internal jargon. Customer 101 has additional adjustments because the audience is brand new:

- "**Verdigris**" — pronounce it on the title slide, audibly, the first time. Embarrassing if a prospect has been mispronouncing it for 20 minutes.
- "**Signals**" — capitalize as a proper noun when referring to the product (else it reads as a generic word).
- "**EVD atom / canonical claim**" — never use; substitute "evidence" or the underlying number with a citation.
- "**Pilot**" — fine to use; this audience expects this word from a B2B technical product.
- "**Customer**" — first-person inclusive ("we'd want to validate X with you"); never third-person ("customers see Y").

## Voice recipe

The `customer_101_deck` recipe in `voice/recipes.yaml` sets:

- **mark (50%)** — founder authority; the wedge slide and the close are unmistakably Mark's voice
- **jon (30%)** — story-led pacing; the "evidence" slides have a narrative arc, not just bullet points
- **operator_empathy (20%)** — recognize the prospect is busy and skeptical; respect their attention

A customer 101 deck that reads as 100% engineering-detail (technical_precision dominant) loses first-meeting audiences. A deck that reads as 100% story (no concrete numbers) loses technical evaluators. The 50/30/20 mix splits the difference.

## Why this genre exists

The same Abcam review surfaced that the pilot-kickoff template was being used inappropriately for first meetings, where it landed as "they're assuming we've signed." The customer 101 genre exists so the *first meeting* gets a deck calibrated to its purpose — not a recycled pilot kickoff with the customer name swapped.

## See also

- [Pilot kickoff (primary spec)](pilot-kickoff)
- [Slides index](index)
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — `customer_101_deck` recipe
