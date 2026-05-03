---
layout: default
title: Case Studies
status: experimental
status_note: First case-studies cell. Graduates to convention after 2 case-study refreshes ship using these patterns (target: Rectifier, Cooling Tower, or Fortune 50 Telecom existing studies).
---

# Case Studies

A Verdigris case study is the proof artifact for a single customer engagement. It carries one anchor metric, one named operator's voice, and one closing invitation for the reader to replicate the work in their own facility. The Notion *Sales Collateral Cheat Sheet* lists four published case studies (Rectifier, Cooling Tower, Fortune 50 Telecom CapEx, Fortune 50 Telecom LL97) — all pre-cell, eligible for refresh under this spec.

This cell is **single-genre**. Unlike slides (4 genres), one-pagers (2 genres), or whitepapers (3 genres), case studies have one rhetorical structure that consistently lands across audiences. Fragmenting into multiple genres would underspecify each variant; the single-genre framing keeps the discipline tight.

## The case study is dual-target

Every case study renders to **two targets**, both required:

1. **Web canonical** — `verdigris.co/resources/case-studies/{slug}`. The version a prospect lands on from search, from the website nav, or from a sales link. Interactive elements (live charts, embedded video) live here.
2. **PDF mirror** — committed alongside `examples/{slug}.html`, distributed via Drive (`/Verdigris/Collateral/case-study/{slug}/`), attached to outbound emails. Static rendering of the same content.

The web is canonical for **content**; the PDF is canonical for **distribution as an attachment**. The PDF mirror MAY drop interactive elements but MUST NOT add or modify content claims. The `composition.persuade-case-study.web-pdf-parity` rule enforces this — divergence between the two is a real failure mode (a case study with one anchor metric on the web and a different one in the PDF erodes credibility on first comparison).

## Required structure (single genre)

Case studies have six required sections, in this order:

1. **Header** — eyebrow + headline + deck + byline (customer name, segment, engagement window)
2. **Executive summary** — one paragraph in a teal-rule callout box; the entire case in 4-6 sentences. A reader who reads ONLY the executive summary should grasp the engagement, the outcome, and the relevance.
3. **Problem** — what the customer needed to solve, in their language and at their scale. Specific to this customer; never generic ("data-center reliability is hard").
4. **Approach** — what Verdigris did in this engagement. Specific actions, specific decisions, specific instrumentation. Avoids "best practices" framing — a case study is one execution, not a methodology lecture.
5. **Outcome** — section anchored by the **single bolded anchor metric**. Surrounding prose carries secondary observations; secondary observations are NEVER bolded as competing metrics.
6. **Quote** — named operator voice; required attribution including organization (or explicit redaction).
7. **Replicate** — closing CTA inviting the reader to do this in their own facility. Dark-banded, action-oriented (mirrors the one-pager CTA strip pattern).

(Quote technically sits inside or after Outcome; the six "required sections" frame is Executive summary, Problem, Approach, Outcome, Quote, Replicate per the rule block.)

## The anchor metric

**One bolded outcome metric per case study.** This is the load-bearing rule.

A case study that presents two competing bolded metrics ("$1.3M-$3M recovered AND 21 days advance warning AND 800+ rectifiers monitored") dilutes the proof — the reader scanning the page sees three numbers competing for attention and the win loses its definition. Pick the one number that defines the engagement; let the others support in surrounding prose.

Examples of legitimate single anchors (illustrative; numbers should be re-verified against the canonical EVD atom set in the consuming repo before any production case study ships):

- **`$1.3M-$3M`** — Fortune 50 Telecom CapEx deferral over a 3-year horizon (anchored to EVD-005; the dollar range reflects fleet-projection sensitivity, not per-facility — see Z2O-1310)
- **`19% HVAC energy reduction`** — Fortune 50 Telecom LL97 compliance (verify against the published case study at verdigris.co/resources/case-studies/ before reuse)
- **`14 days`** of advance warning — Rectifier failure precursor identification (anchored to EVD-104)
- **`Zero penalties`** — LL97 compliance outcome (claim type: count; pair with the regulatory window in surrounding prose)

Per-instance qualifiers ("per facility", "per rack", "per circuit") are silent metric multipliers and require explicit context. A `$3M per facility` anchor without stating fleet size N silently multiplies the canonical claim by an unknown N. See `LEARNINGS.md` for the per-instance qualifier discipline (Z2O-1310 in the consuming `verdigris` repo).

## Quote attribution

Every customer quote requires:

1. **Named individual OR explicit role label.** "Mark Chu, VP of Operations" or "VP of Operations, Fortune 50 Telecom". Never "the customer told us."
2. **Organization name OR explicit redaction.** "Fortune 50 Telecom" / "Hyperscale colocation customer" / "named operator" all acceptable when the customer has not granted public attribution.

A quote attributed only to the company ("Per Acme Corp") without a human voice fails the trust register: the case study reads as marketing rather than evidence. Quotes attributed to "anonymous customer" are similarly weak — the redaction is fine, the absence of a role label is not.

## Voice recipe

Uses the existing `case_study` recipe in `voice/recipes.yaml`:

- **Seren primary** — customer perspective, diplomatic precision. The customer's voice is THE primary voice in a case study; Seren's people-intelligence translation makes the customer voice land authentically rather than as scrubbed marketing speak.
- **Mike supporting** — field credibility, competitor comparison context.
- **Jimit accent** — market-trend connection, why this win matters beyond one customer.

The recipe was audited 2026-05-02 against the new Mark Chung and Jon Chu profile YAMLs and held up — neither founder voice belongs as primary in a case study because the customer is the protagonist, not Verdigris.

## Citation discipline

Inherits citation conventions from `categories/whitepapers/cover.md`:

- Numbered citations with full source (author, title, year, URL or report ID) — no bare domains
- arXiv preprints require year
- Government and lab reports require report number (e.g., LBNL-2001637)
- Verdigris-internal data sources cite the EVD atom or canonical claim ID where applicable, plus a plain-language description

Charts and figures use the `.vd-figure` pattern from `cover.css` (figure + caption with label + credit line). Uncredited proprietary charts fail the trust register — every chart cites its data source.

## Confidentiality

Case studies default to **PUBLIC** tier. Customer-redacted variants ("Fortune 50 Telecom" / "Hyperscale colocation customer") are still PUBLIC — the redaction is content discipline, not a confidentiality tier. A case study that needs to be CUSTOMER-CONFIDENTIAL is probably a brief or an internal team retrospective, not a case study.

## Spacing and typography

All values from `tokens/spacing/print.json` (frame primitives) and `build/print/case-study.css`. Case studies use the same paper-page frame as whitepaper inside-pages: 0.95-1.0in margins, Inter 11pt body, 1.6 line-height, 6.6in max content width.

| Slot | Font | Size | Weight | Color |
|---|---|---|---|---|
| Eyebrow | Lato | 9pt | 700 | `--vd-muted` (uppercase, 0.16em letterspacing) |
| Headline | Lato | 30pt | 700 | `--vd-ink`, one accent in teal |
| Deck | Inter | 13pt | 400 | `--vd-muted` |
| Section eyebrow | Lato | 9pt | 700 | `--vd-muted` (with `--vd-teal` section number) |
| Section title (h2) | Lato | 18pt | 700 | `--vd-ink` |
| Body | Inter | 11pt | 400 | `--vd-ink` |
| Executive summary body | Inter | 12pt | 400 | `--vd-ink` (in teal-rule callout) |
| Anchor metric | Lato | 56pt | 700 | `--vd-teal` |
| Quote | Lato | 17pt | 400 | `--vd-ink` |
| Quote attribution | Inter | 10.5pt | 400 | `--vd-muted` (name in 600/`--vd-ink`) |
| Replicate CTA headline | Lato | 18pt | 700 | rgba(255,255,255,0.96) on dark band |
| Page footer | Inter | 9pt | 400 | `--vd-muted` |

## Reference exemplars

| Existing case study | Anchor metric | Status |
|---|---|---|
| Rectifier | 14+ days advance warning on rectifier-class faults | Pre-cell; first refresh target |
| Cooling Tower | Specific KW/CO2 reduction (TBD on refresh) | Pre-cell; second refresh target |
| Fortune 50 Telecom — CapEx | $1.3M-$3M deferred over 3 years | Pre-cell; canonical for redacted-customer pattern |
| Fortune 50 Telecom — LL97 | 19% HVAC energy reduction, zero LL97 penalties | Pre-cell; canonical for compliance-outcome pattern |

The first refresh under this cell should be Rectifier — its anchor metric is specific, its customer is willing to be named in some channels, and its problem-approach-outcome arc is the cleanest of the four for testing the spec.

## What this cell does NOT cover

- **Multi-customer reports.** A "5 customers, 5 stories" report is a brief or a whitepaper, not a case study. Case studies are one engagement.
- **Internal post-mortems.** When the audience is Verdigris-only, use `categories/slides/internal-team.md` (deck) or a future internal-retrospective sub-cell.
- **Pre-engagement projections.** A "what we expect to deliver" artifact is a pilot kickoff deck (`categories/slides/pilot-kickoff.md`), not a case study.
- **Marketing campaigns / collateral series.** When multiple case studies appear together as a campaign, this cell governs each individual case; a future "case-study-series" cell can govern series-level patterns when a real surface needs one.

## Why this guide exists

Verdigris has four published case studies and at least two more in flight. The published four don't share a structural template — anchor-metric placement varies, quote attribution varies, executive-summary discipline varies. Codifying the single genre and the dual-target render makes refresh and net-new case studies a template-fill, not a blank-page redesign.

The **single anchor metric** rule resolves a specific pre-existing tension: the homepage and platform pages already have a "per-facility / per-rack" qualifier risk that PR #281 surfaced (see Z2O-1310). Case studies are the highest-risk surface for that failure mode because the bolded outcome is what the reader takes away. Forcing the single-anchor discipline at the rule level catches the multiplier risk before it ships.

The **web/PDF parity** rule reflects how case studies actually circulate: a prospect lands on the web canonical, downloads the PDF for forwarding, and the two artifacts diverge over time as edits land in one but not the other. Codifying parity as a rule (not just a process) makes divergence visible in evaluator runs.

## See also

- [`workflows/sales-collateral`](../../workflows/sales-collateral) — production guide spanning all collateral types
- [`categories/slides/`](../slides/) — sister cell; sales-collateral universals (logomark, roles, dates) inherited here
- [`categories/whitepapers/cover`](../whitepapers/cover) — sister cell; print-rendering patterns + citation discipline inherited
- [`categories/one-pagers/guide`](../one-pagers/guide) — sister cell; CTA-strip pattern inherited
- [`build/print/case-study.css`](../../build/print/case-study.css) — reference stylesheet (dual-target)
- [`voice/recipes.yaml`](../../voice/recipes.yaml) — `case_study` recipe (Seren primary)
