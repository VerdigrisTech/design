---
layout: default
title: Slides — Customer 101 Deck
status: experimental
status_note: Deltas-only against pilot-kickoff. Graduates with the cell after 2 customer-facing decks ship.
---

# Customer 101 Deck

This genre introduces Verdigris to a new prospect at the first substantive meeting (post-discovery, pre-contract). Audience is the prospect's initial evaluator: a Director, Senior Manager, or VP whose job is to decide whether Verdigris is worth a deeper look.

The deck's job is to make the wedge legible — what Verdigris does, what evidence supports it, what comes next — without overwhelming a first-meeting audience with operational detail. This is a customer-empathy-led deck; Seren's diplomatic precision carries the framing slides, Mike's field credibility carries the evidence slides, and Mark's founder voice is reserved for the close.

This guide documents only the **deltas** against [pilot-kickoff.md](pilot-kickoff). Read that spec first.

## What changes

| Axis | Pilot kickoff (parent) | Customer 101 (this genre) |
|---|---|---|
| Length | 12-20 slides | 15-25 |
| Voice primary | Mike (field credibility) | **Seren** (people intelligence, diplomatic precision) |
| Voice supporting | Thomas | **Mike** (field credibility on evidence slides) |
| Voice accent | Jon | **Mark** (close + "why now" / mission-gravity moments only) |
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

- **Seren (primary)** — people intelligence, diplomatic precision, operator empathy ([`voice/team/seren-coskun.yaml`](../../voice/team/seren-coskun.yaml)). The first-meeting audience needs to feel HEARD before they're pitched at. Seren's voice ("from my perspective", "I will just quietly leave this here") frames Verdigris as a careful collaborator rather than a vendor closing on a stranger.
- **Mike (supporting)** — field credibility on the evidence slides ([`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)). Operator-recognizable specifics — OCP-conference observations, real installation patterns, physical equipment reality — earn credibility that founder voice alone cannot.
- **Mark (accent only)** — founder voice on the close slide and the "why now" / mission-gravity framing ([`voice/team/mark-chung.yaml`](../../voice/team/mark-chung.yaml)). Reserved for the moments where founder authority is decisive; not the dominant register because story-led at 50% overpowers a first-meeting audience that is skeptical and busy.

A customer 101 deck that reads as 100% engineering-detail loses first-meeting audiences. A deck that reads as 100% founder-narrative loses technical evaluators and can feel like a pitch dressed as humility. The Seren-primary / Mike-supporting / Mark-accent mix splits the difference and lands the deck as "we hear you, we have done this work, here's why now."

This recipe was revised after adversarial review (2026-05-02) — the initial recipe had Mark primary at 50%, which over-indexed on founder voice for an audience whose primary need was to feel understood. See `LEARNINGS.md` "Voice recipes need profile YAMLs as evidence."

## Voice at a glance

A producer reading this cell should be able to answer "what voice mix am I writing in?" without leaving the page. Pulled directly from the `customer_101_deck` recipe and the linked profile YAMLs.

**Seren — primary** (Profile: [`voice/team/seren-coskun.yaml`](../../voice/team/seren-coskun.yaml)). Diplomatic precision and people intelligence. Seren names what is positive before what is missing, frames opinions as perspectives rather than verdicts, and offers help in the same breath as feedback. A first-meeting prospect needs to feel HEARD before they are pitched at, which is exactly the register Seren writes in.

> "From my perspective"

Carries: title slide framing, problem-in-their-language, what we do, where we fit, team — about 45% of the deck. Body register throughout.

**Mike — supporting** (Profile: [`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)). Field credibility on the evidence slides. Mike's industry-insider voice supplies the operator-recognizable specifics — OCP-conference observations, real installation patterns, manufacturing economics — that earn credibility a founder voice alone cannot.

> "I was at [conference] and they presented..."

Carries: the 2-4 evidence slides, how-it-works specifics — about 25% of the deck.

**Mark — accent** (Profile: [`voice/team/mark-chung.yaml`](../../voice/team/mark-chung.yaml)). Founder voice on the close slide and the "why now" framing. Mark's strategic_narrative (9) and mission_gravity (9) are decisive on the moments that need founder weight; bounded to specific slides because story-led at 50% overpowers a skeptical first-meeting audience.

> "There's a real question inside it"

Carries: close slide, why-now slide. Stays out of body slides.

## Why this genre exists

The same pilot kickoff review surfaced that the pilot-kickoff template was being used inappropriately for first meetings, where it landed as "they're assuming we've signed." The customer 101 genre exists so the *first meeting* gets a deck calibrated to its purpose — not a recycled pilot kickoff with the customer name swapped.

## What this cell does NOT cover

- **Pilot-scoping decks.** When the prospect has signed a pilot agreement and you're scoping the engagement, use `pilot-kickoff.md`.
- **Partner channels.** When the audience is a channel partner's account executive (not the end customer), use `partner-enablement.md`.
- **Internal team coordination.** When the audience is Verdigris-only, use `internal-team.md`.
- **One-pager leave-behinds.** When the artifact will be scanned cold without a presenter, use `categories/one-pagers/guide.md`.

## See also

- [`workflows/sales-collateral`](../../workflows/sales-collateral) — production guide spanning all collateral types (decision tree, naming, distribution)
- [Pilot kickoff (primary spec)](pilot-kickoff)
- [Slides index](index)
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — `customer_101_deck` recipe
- [`voice/team/seren-coskun.yaml`](../../voice/team/seren-coskun.yaml), [`mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml), [`mark-chung.yaml`](../../voice/team/mark-chung.yaml) — voice profile sources
