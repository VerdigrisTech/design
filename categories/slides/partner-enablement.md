---
layout: default
title: Slides — Partner Enablement Deck
status: experimental
status_note: Deltas-only against pilot-kickoff. Graduates with the cell after 2 customer-facing decks ship.
---

# Partner Enablement Deck

This genre arms a channel partner's account executive with what they need to co-sell Verdigris into their accounts. Audience is the partner's AE / channel manager — a salesperson at another company who will represent Verdigris in conversations Verdigris is not directly in.

The deck must be self-contained. The partner AE will not have a Verdigris technical person on every call. The deck has to teach the wedge, the qualifying questions, the technical answer to the most common objections, and the deal-registration mechanics — all in a form a partner AE can re-use across many of their own customers.

This guide documents only the **deltas** against [pilot-kickoff.md](pilot-kickoff). Read that spec first.

## What changes

| Axis | Pilot kickoff (parent) | Partner enablement (this genre) |
|---|---|---|
| Length | 12-20 slides | 20-30 |
| Voice primary | Mike (field credibility) | **Jimit** (outside-in market positioning) |
| Voice supporting | Thomas | **Seren** (people intelligence, diplomatic precision on co-sell mechanics) |
| Voice accent | Jon | **Mike** (industry insider credibility for objection handling) |
| CTA pattern | "Pilot scope + decision date for expansion" | "Co-sell motion + deal registration" — explicit mechanics |
| Confidentiality default | CUSTOMER-CONFIDENTIAL | **PARTNER-CONFIDENTIAL** (purple marking) |
| Logomark | full lockup | full lockup (same) |
| Date format | absolute calendar dates | absolute (same) |

## What changes structurally

Partner enablement decks are longer because they replace, in document form, the live training sessions a partner AE would otherwise need. Canonical structure:

1. **Title slide** (required) — Verdigris + partner co-branding
2. **The Verdigris wedge** (required) — one slide; same as customer 101
3. **Why this matters to your customers** (required) — partner-perspective framing
4. **Joint value proposition** (required) — what the partner offers + what Verdigris offers + the better-together story
5. **Qualifying questions** (required) — 5-7 questions a partner AE asks to identify a Verdigris-fit account
6. **Discovery cheat sheet** (required) — what answers to listen for; what disqualifies
7. **Pricing model** (required) — partner-discount tier, deal-registration discount, MDF program if applicable
8. **Common objections** (required) — 4-6 objections + the technical answer
9. **Reference customers** (required, 2-3 slides) — case study summaries the partner AE can cite
10. **Technical FAQ** (required, 2-3 slides) — what the partner AE needs to know without escalating
11. **Verdigris technical bench** (required) — named technical contacts the partner AE can pull in
12. **Deal-registration mechanics** (required) — exact steps; URL, form, timing, partner discount triggers
13. **Co-marketing assets** (required) — one-pagers, case studies, demo links the partner can use
14. **Training cadence** (required) — quarterly partner training; how to renew certification
15. **Close: deal-registration call to action** (required) — "register your first opportunity at [URL]"

## What stays the same

- 12-column grid; 1280×720 master; footer band 32pt
- Logomark position + size; full lockup variant
- Role labels in templates ("Verdigris Partner Manager" not "Jimit Shah"; produced deck adds the name alongside)
- Table dims, figures, PDF-exportable

## Diction adjustments specific to partner enablement

The Z2O-1321 diction rule applies, plus partner-specific adjustments:

- "**Partner**" — name the partner explicitly when known. Generic "partner" reads as boilerplate.
- "**Customer**" — refer to the partner's customers as "your customers" or by named accounts. Verdigris's customers in this deck are *evidence*; the partner's customers are the *audience's frame*.
- "**Co-sell**" — preferred over "resell." Verdigris partnerships are co-selling motions, not resale of a product the partner ships independently.
- "**Margin**" — fine to use; partner AEs care about margin on the deal.
- "**Pilot**" — fine; partner AEs understand B2B technical pilots.
- "**SLA**" — fine to use; partner AEs need to know SLA mechanics to set their customer's expectations.
- "**Generally available**" — name the actual product status (in pilot, in production at N customers, fleet-deployed). "GA" is internal product-roadmap language.

## Voice recipe

The `partner_enablement_deck` recipe in `voice/recipes.yaml` sets:

- **Jimit (primary)** — outside-in market positioning ([`voice/team/jimit-shah.yaml`](../../voice/team/jimit-shah.yaml)). Partner AEs respond to language that sounds like their own; Jimit's market fluency translates Verdigris into the partner's commercial frame.
- **Seren (supporting)** — people intelligence and diplomatic precision on co-sell mechanics ([`voice/team/seren-coskun.yaml`](../../voice/team/seren-coskun.yaml)). A partnership that reads as "you'll sell our product" instead of "we'll sell together" fails before it starts. Seren's voice makes the partner feel like a collaborator, not an extraction target.
- **Mike (accent)** — industry insider credibility for objection-handling slides ([`voice/team/mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml)). When a partner AE is asked a technical question by their customer, Mike's voice is what they should hear in their head.

The recipe mirrors the pattern in `partner_materials` (Jimit primary, Seren supporting, Mike accent) — an earlier draft had Seren demoted to accent, which adversarial review flagged as a divergence from precedent without rationale. The diplomatic precision in Seren's voice is load-bearing for partner relationships, not decorative.

The split intentionally avoids Mark and Thomas as primary voices: a partner AE doesn't need the founder's voice; they need a teammate-equivalent voice they can carry into their own conversations.

## Confidentiality

PARTNER-CONFIDENTIAL is the default tier. Pricing details, deal-registration mechanics, and partner discount tiers are not public information. The marking is mandatory on every slide.

The partner agreement should govern how the partner AE shares the deck with their own customers — typically the answer is "no, share the customer-101 deck instead, which is PUBLIC." A clean separation prevents accidental disclosure of partner-specific pricing.

## Why this genre exists

A partner co-sell motion has different rhetorical needs than a direct customer kickoff. The partner-enablement genre captures those differences in a single template; pre-2026, this work was done as bespoke per-partner playbooks. The genre split surfaced during the [adversarial-review workflow](../../workflows/adversarial-review) for the slides cell.

## What this cell does NOT cover

- **End-customer decks.** When the audience is the partner's customer (not the partner themselves), use `customer-101.md`.
- **Joint customer-facing decks.** When the partner and Verdigris jointly present to a shared customer, use `customer-101.md` plus in-call technical support, not a standalone partner-enablement deck.
- **Co-marketing campaigns.** When the asset is part of joint partner-marketing (joint webinars, co-branded case studies), defer to a future partner-marketing cell or use the existing `partner_materials` voice recipe.
- **Internal partnership training.** When Verdigris is training its own team on partnership mechanics, use `internal-team.md`.

## See also

- [`workflows/sales-collateral`](../../workflows/sales-collateral) — production guide spanning all collateral types
- [Pilot kickoff (primary spec)](pilot-kickoff)
- [Slides index](index)
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — `partner_enablement_deck` recipe (and the existing `partner_materials` recipe for adjacent collateral)
- [`voice/team/jimit-shah.yaml`](../../voice/team/jimit-shah.yaml), [`seren-coskun.yaml`](../../voice/team/seren-coskun.yaml), [`mike-mahedy.yaml`](../../voice/team/mike-mahedy.yaml) — voice profile sources
