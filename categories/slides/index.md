---
layout: default
title: Slides — Overview
status: experimental
status_note: First slides cell. Graduates to convention after 2 customer-facing decks ship using these patterns.
---

# Slide Decks

Verdigris produces decks across four engagement contexts. The contexts are different enough that one universal template fails all four and a different template per context succeeds. This cell defines the four genres and the rules that apply across them.

## Pick the genre first

| Genre | When to use | Primary audience |
|---|---|---|
| [**Pilot kickoff**](pilot-kickoff) | A customer just signed; this is the first artifact they receive | Customer team executing the pilot (sponsor + working lead + engineers) |
| [**Customer 101**](customer-101) | First substantive meeting with a prospect | Prospect's initial evaluator |
| [**Partner enablement**](partner-enablement) | A channel partner needs to co-sell Verdigris | Partner AE / channel manager |
| [**Internal team**](internal-team) | Verdigris-internal updates, prep, post-mortems | Verdigris team members |

Pilot kickoff is the **primary** genre. Internal team, customer 101, and partner enablement are documented as **deltas** against pilot kickoff — they share the same scaffolding and only specify what changes.

## Decision tree

1. Audience is a Verdigris-signed customer in active engagement?
   - **Yes** → kicking off a pilot or expansion → [Pilot kickoff](pilot-kickoff)
   - **Yes** → ongoing internal coordination → [Internal team](internal-team)
2. Audience is a prospect (no contract yet)?
   - First substantive meeting → [Customer 101](customer-101)
   - Already past first meeting → escalate to [Pilot kickoff](pilot-kickoff) once a pilot is committed
3. Audience is a partner / channel?
   - Partner-facing co-sell → [Partner enablement](partner-enablement)
4. Audience is internal Verdigris-only?
   - → [Internal team](internal-team)

If the situation doesn't fall out of this tree, do NOT improvise a fifth genre on the spot. Pick the closest existing genre, document the deviation, and propose a new genre via the [adversarial-review workflow](../../workflows/adversarial-review) when more than one surface needs it.

## What's universal across genres

Independent of genre, every Verdigris slide deck shares:

- **Logomark in footer band, every slide.** Position fixed (left), size fixed at 20pt. Title slide additionally uses the full lockup (44-60pt). Variant by mode (pilot kickoff + customer 101 + partner enablement = full lockup; internal team = wordmark only).
- **Confidentiality marking in footer band, every slide.** Tier varies by genre default; presence is mandatory.
- **Page number in footer band.** Always.
- **Role labels in templates, names only in produced decks.** Templates use "Pilot Sponsor"; the produced artifact says "Pilot Sponsor: Mark Chung, CEO".
- **Lato 700 headlines + Inter body + JetBrains Mono mono.** Same families as whitepapers and the website.
- **PDF-exportable.** No animation; render via Chrome `--print-to-pdf` or WeasyPrint.
- **Tables ≤ 6 columns and ≤ 8 rows per slide.** Above that, split or appendix.
- **Figures from the `.vd-figure` pattern.** Caption + credit line; never split across slides.
- **Naming convention.** `{type}-{audience}-{topic}-{YYYYMMDD}-v{N}.{ext}` per the [sales-collateral production guide](../../workflows/sales-collateral).

## What varies across genres

The four genres differ on six axes. The full matrix lives in [pilot-kickoff.md](pilot-kickoff#pick-the-genre-first); here is the summary:

| Axis | Pilot kickoff | Internal team | Customer 101 | Partner enablement |
|---|---|---|---|---|
| Length | 12-20 | 8-15 | 15-25 | 20-30 |
| Voice primary | mike (field credibility) | thomas (operational) | seren (people intelligence) | jimit (market fluency) |
| Voice supporting | thomas | mike | mike | seren |
| Voice accent | jon | jimit | mark (close + mission only) | mike |
| CTA pattern | Pilot scope + decision date | Decision needed by [date] | Next meeting + agenda | Co-sell motion + deal registration |
| Confidentiality default | CUSTOMER-CONFIDENTIAL | INTERNAL ONLY | PUBLIC | PARTNER-CONFIDENTIAL |
| Date format | absolute | week-N OK | absolute | absolute |
| Logomark variant | full lockup | wordmark | full lockup | full lockup |

## Reference stylesheet + tokens

- [`build/print/slides.css`](../../build/print/slides.css) — extends `cover.css`; emits per-genre `@page` masters; defines all `.vd-slide-*` selectors
- [`tokens/spacing/slides.json`](../../tokens/spacing/slides.json) — slide grid (1280×720 master, frame floor/ceiling, footer band height, table cell padding, type scale)
- Reuses tokens from `tokens/color/`, `tokens/typography/font-family.json`, `tokens/spacing/print.json`

## Rules

Six rules live in `rules/visual-rules.yml` under `composition.persuade-slide-deck`. Mode-conditional where applicable:

| Rule ID | Modes | Type | Linear |
|---|---|---|---|
| `composition.persuade-slide-deck.logomark-consistency` | all | constraint | Z2O-1318 |
| `composition.persuade-slide-deck.confidentiality-marking` | external (3 of 4 genres) | constraint | Z2O-1319 |
| `composition.persuade-slide-deck.template-roles-not-names` | template-only | constraint | Z2O-1320 |
| `composition.persuade-slide-deck.absolute-dates` | external | constraint | Z2O-1322 |
| `composition.persuade-slide-deck.table-formatting` | all | constraint | Z2O-1323 |
| `voice.audience-fit-diction.exit-criteria` | external | voice rule | Z2O-1321 |

The diction rule lives in `voice/recipes.yaml` rather than `visual-rules.yml` because diction is a voice concern, not a visual one. The other five are visual/structural.

## See also

- [Pilot kickoff (primary spec)](pilot-kickoff)
- [Customer 101 (deltas)](customer-101)
- [Partner enablement (deltas)](partner-enablement)
- [Internal team (deltas)](internal-team)
- [Sales collateral production guide](../../workflows/sales-collateral)
- [Adversarial review workflow](../../workflows/adversarial-review)
- [Whitepaper covers (sister cell, structural template)](../whitepapers/cover)
