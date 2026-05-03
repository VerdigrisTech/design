---
layout: default
title: Sales Collateral Production Guide
status: experimental
status_note: First production guide for the Verdigris collateral system. Graduates to convention after the slides cell ships on a real customer engagement (target: next pilot kickoff after 2026-05-15).
---

# Sales Collateral Production Guide

This guide is the production-side counterpart to the category cells under `categories/{slides,one-pagers,case-studies,whitepapers}`. Each cell defines what a *correct* artifact looks like; this guide defines *how* one gets produced and *where* it goes.

If you are about to make a deck, a one-pager, a case study, a leave-behind, or a whitepaper, start here. Pick the type, apply the cell, follow the production checklist below.

## Why this exists

Verdigris produces collateral repeatedly: pilot kickoff decks, customer 101 decks, partner enablement decks, one-pagers, case studies, whitepapers, demo videos. Today most of those are produced bespoke each time. A 2026-04 review of the customer pilot kickoff deck found six recurring quality issues (logomark drift, missing confidentiality footer, real names baked into templates, audience-mismatched diction, week-N notation, ad-hoc tables) — none of them deck-specific, all of them production-process gaps. The design-system cells codify the rules; this workflow documents the process so the rules actually land in shipped artifacts.

The disease Mark Chung named in 2026-05-01: *"Too much of this depends on individual follow-up, memory, and ad hoc explanation. We need repeatable collateral that helps customers, partners, and internal teams understand the product without requiring a live walkthrough every time."*

This guide is the part of the cure that lives in the design repo. The companion side-quest (Drive + Notion organization) lives in Linear and is enumerated at the bottom.

## Decision tree: pick the collateral type

Use this tree when an engagement thread asks for "something to share."

1. **Is the audience an existing customer in active engagement?**
   - **Yes, kicking off a pilot or expansion** → pilot kickoff deck (`categories/slides/pilot-kickoff.md`)
   - **Yes, internal-only update for the engagement team** → internal team deck (`categories/slides/internal-team.md`)
   - **Yes, post-pilot proof to send up the chain** → case study (`categories/case-studies/`)
2. **Is the audience a prospect or new contact?**
   - **First meeting, learning the product** → customer 101 deck (`categories/slides/customer-101.md`)
   - **Leave-behind after a meeting** → one-pager (`categories/one-pagers/`)
   - **Technical evaluation / RFP context** → whitepaper (`categories/whitepapers/cover.md`)
3. **Is the audience a partner or channel?**
   - **Partner enablement / co-sell motion** → partner enablement deck (`categories/slides/partner-enablement.md`)
   - **Solution overview for partner site / catalog** → one-pager, comparative genre
4. **Is the audience internal (team-wide, board, all-hands)?**
   - **Team operational** → internal team deck
   - **Board-facing** → custom (no cell yet; defer to whitepaper or pilot kickoff genre depending on tone)
5. **Demo-style content (video, sandbox walkthrough)?**
   - Out of scope for this guide today. Demo cell deferred — file a Linear issue if a real surface needs it.

If the answer doesn't fall out of the tree, do NOT improvise a new genre on the spot. Either pick the closest existing cell and document the deviation, or pause and propose a new genre via the adversarial-review workflow (`workflows/adversarial-review.md`).

## Production checklist

Run this checklist for every collateral artifact. It applies across types; cell-specific additions are noted.

### 1. Genre selection

- Identify the type via the decision tree above.
- For deck types, identify the *genre* within the type (pilot kickoff vs. internal team vs. customer 101 vs. partner enablement). Each genre has its own spec.
- Write the chosen `type:` and `genre:` into the artifact's frontmatter or a top-of-file comment. This is the single load-bearing piece of metadata.

### 2. Voice recipe

- Look up the voice recipe in `voice/recipes.yaml` matching your genre (e.g., `pilot_kickoff_deck`, `customer_101_deck`).
- Read the matching `voice/team/*.yaml` profiles for the named voice sources.
- Draft the artifact's prose with the recipe's mix in mind. Don't borrow voices that aren't in the recipe (cross-genre voice drift is the fastest way to make a deck feel "off").

### 3. Template + asset selection

- Clone the cell's reference template (`categories/<type>/examples/...html` or the indicated working file).
- Use canonical assets only:
  - Logomark from `assets/logos/` — pick the variant the cell specifies (full lockup vs. wordmark vs. icon).
  - Colors from `tokens/color/` — never invent hex values; if a needed color isn't in tokens, propose it via adversarial review before shipping.
  - Typography per the cell's spec; never substitute fonts.
- If a needed asset is missing, mark a `[FIELD: hint]` placeholder using the `.vd-template` convention from `categories/whitepapers/cover.md` and resolve before distribution.

### 4. Confidentiality declaration

- Choose one tier per genre default:
  - **PUBLIC** — case studies, customer 101 decks, public one-pagers
  - **CUSTOMER-CONFIDENTIAL** — pilot kickoff decks (default), customer-specific briefs
  - **PARTNER-CONFIDENTIAL** — partner enablement decks
  - **INTERNAL ONLY** — internal team decks, board-prep materials
- Place the marking in the footer per the cell's spec. Never omit; the design system rule for external-audience genres requires an explicit declaration.

### 5. Roles, not names (templates)

- Templates use role labels: "VP of Operations", "Pilot Lead", "Account Executive".
- Specific names appear only when a real individual is genuinely attributed (case study quotes, signed letters, named expert opinions).
- This is the rendering-layer-never-invents-facts principle from `LEARNINGS.md` applied to the production stage. If you fill in a name during production, the artifact is no longer a template and must be re-cloned for the next surface.

### 6. Audience-fit diction

- Review the cell's diction guidance (per-genre voice section) before finalizing copy.
- Common adjustments per audience:
  - **Customer / partner** — replace internal jargon with operator-readable terms ("expansion criteria" not "exit criteria").
  - **Executive (any audience)** — collapse multi-step technical narratives to outcome + path.
  - **Procurement** — anchor on contract-relevant terms (SLA, pricing, scope, decision criteria).
- The voice recipe sets the dial; the diction pass sharpens individual word choices.

### 7. Date format

- External-audience artifacts use absolute calendar dates: "2026-06-15" or "June 15, 2026".
- Internal-team artifacts may use week-N notation ("Week 3 of pilot") if the engagement timeline is the running thread.
- Mixed date formats in one artifact is a smell; pick one and hold it.

### 8. Tables + supporting visuals

- Tables follow the per-cell table-formatting spec (max columns / max rows / cell padding / header treatment).
- Figures use the `.vd-figure` pattern from `build/print/cover.css` (figure + caption + credit).
- Charts cite their data source via the credit line. No uncredited proprietary data.

### 9. Hand-off note

- Every produced artifact is delivered with a hand-off note enumerating:
  - The cell + genre it conforms to
  - Any deviations from the cell with justification
  - Every `[FIELD: ...]` placeholder remaining in the artifact (pre-distribution, this list must be empty)
  - The intended distribution channel
  - The version label
- The hand-off note is the audit trail. Ship it alongside the artifact in Drive.

### 10. Version label

- Apply the canonical naming convention: `{type}-{audience}-{topic}-{YYYYMMDD}-v{N}.{ext}`.
- Example: `pilot-kickoff-abcam-life-sciences-20260502-v1.pdf`.
- Increment v{N} for revisions; never overwrite a shipped version. Old versions get a `-superseded-by-v{N+1}` suffix or move to `archive/`.

### 11. Pre-merge PII review

Run `workflows/pii-review.md` against any sales-collateral artifact that lands in this repo before merge. The full workflow applies; the sales-collateral-specific checks to run first:

- **Example HTMLs may not name real customers.** Anything in `categories/{slides,one-pagers,case-studies}/examples/*.html` uses fictional placeholders (Acme Life Sciences, Globex Energy) unless a real customer name has documented co-marketing approval (signed case-study consent, public partner page, joint press release on file). Check this before the file lands, not after.
- **Voice references in cell guides must use approved names.** Cell guides under `categories/slides/*.md` and the corresponding voice recipes name team members and, occasionally, customer or partner contacts. Names of team members are allowlisted per file in `build/lint-external.ts`; names of customers, partners, or external contacts must be either fictional or co-marketing-approved.
- **No internal-channel quotations.** Slack screenshots, email forwards, Linear comment quotations don't belong in shipped collateral or in the cell guides that document collateral. Rewrite to operational descriptors before merge.
- **Equipment / facility identifiers.** BBE-class serial numbers, facility nicknames, vendor relationship strings — none of these belong in a customer-shareable artifact unless the customer has signed off on the disclosure.

Failures here are stop-the-line: redact, rename, exclude, or escalate per the pii-review workflow. Do not merge a sales-collateral artifact with an unresolved PII finding.

## Naming convention (canonical)

Both Drive filenames and the artifact's internal version metadata follow the same pattern:

```
{type}-{audience-or-customer}-{topic}-{YYYYMMDD}-v{N}.{ext}
```

| Token | Examples |
|---|---|
| `type` | `pilot-kickoff`, `customer-101`, `partner-enablement`, `case-study`, `one-pager`, `whitepaper`, `internal-team` |
| `audience-or-customer` | `abcam`, `verizon`, `t-mobile-redacted`, `csis`, `lbnl`, `internal` |
| `topic` | `life-sciences`, `5-building-pilot`, `signals-overview`, `lock-in-avoidance` |
| `YYYYMMDD` | `20260502` |
| `v{N}` | `v1`, `v2`, `v3` |
| `ext` | `pdf`, `pptx`, `key`, `html`, `docx` |

Examples:

- `pilot-kickoff-abcam-life-sciences-20260502-v1.pdf`
- `case-study-fortune-50-telecom-capex-deferral-20260415-v2.pdf`
- `one-pager-architectural-advantages-20260301-v3.pdf`
- `whitepaper-power-intelligence-architecture-20260218-v1.pdf`

Internal-only and confidential variants append the tier as a suffix when the file might escape its intended bucket: `pilot-kickoff-abcam-life-sciences-20260502-v1-CUSTOMER-CONFIDENTIAL.pdf`. The marking inside the artifact is still required; the suffix is belt-and-braces for the file system.

## Distribution rules

Each artifact has a canonical home. Sharing means linking to the canonical path, not attaching a copy.

| Type | Canonical home | Hub link |
|---|---|---|
| Pilot kickoff deck | Drive `/Verdigris/Collateral/pilot-kickoff/{YYYY-MM}-{customer}/` | Notion Sales Collateral Cheat Sheet entry |
| Customer 101 deck | Drive `/Verdigris/Collateral/customer-101/` | Notion |
| Partner enablement | Drive `/Verdigris/Collateral/partner-enablement/{YYYY-MM}-{partner}/` | Notion + partner portal |
| Internal team deck | Drive `/Verdigris/Collateral/internal-team/{YYYY-MM}/` | Notion (internal-only page) |
| Case study | Web `verdigris.co/resources/case-studies/{slug}` (canonical) + Drive PDF mirror | Notion |
| One-pager | Web `verdigris.co/resources/one-pagers/{slug}` (canonical) + Drive PDF mirror | Notion |
| Whitepaper | Web `verdigris.co/resources/whitepapers/{slug}` + Drive PDF mirror | Notion |

When sharing, prefer the public URL if the tier is PUBLIC. When the tier is CUSTOMER-CONFIDENTIAL or PARTNER-CONFIDENTIAL, share the Drive link with explicit permissions. Never paste the artifact body inline in Slack/email — link to the canonical version.

## Versioning + sunset

- An artifact is **active** when its version is the latest in its Drive folder AND the Notion link points to it.
- An artifact is **superseded** when a newer version exists; old version moves to `archive/` subfolder, Notion link updates atomically.
- An artifact is **retired** when the underlying claim or product surface no longer applies; PDF stays in archive but the Notion entry gains a `Retired` tag.
- Quarterly sweep (recommended): Sales Ops walks each Notion entry and verifies the link points to the active version, retired items are tagged, archives don't shadow active.

## Working with cells

When you finalize an artifact, run the cell's validators (`npm run validate:rules` from the design repo) against the artifact's HTML version when possible. The slides, one-pagers, and case-studies cells include specific evaluator passes. CI for the design repo doesn't validate consumer artifacts, but a local `npm run validate:rules` against a draft is cheap and catches the pilot-kickoff-class issues before review.

For a non-trivial new artifact (new product launch deck, new partner co-sell motion, new whitepaper that doesn't fit existing genres), follow `workflows/adversarial-review.md`: research exemplars from the broader industry, debate the choices, synthesize the cell update, then ship the artifact. Do not invent new genres on the spot inside a customer-facing artifact.

## Anti-patterns

These are the patterns this guide exists to prevent. They are documented so a future cell can borrow the negative examples.

- **Bespoke per deal.** A pilot deck rebuilt from scratch for each customer when the previous deck only needed audience + customer details swapped. Symptom: 6+ hours per deck. Fix: clone the template, fill placeholders, ship.
- **Ad-hoc versioning.** Three "Hyperscaler Inflection v.docx" files in Drive on the same day. Symptom: nobody knows which is canonical. Fix: naming convention with explicit `-v{N}` suffix and atomic Notion link updates.
- **Names baked into templates.** A template that says "Mark Chung will lead the kickoff" is no longer a template. Fix: role labels, with names filled in at production time only.
- **Mixed confidentiality.** A deck declares CUSTOMER-CONFIDENTIAL on slide 1 and shows internal Slack screenshots on slide 14. Fix: one tier per artifact; sensitive content gets its own bucket.
- **Mixed date formats.** Slide 4 says "Week 3," slide 8 says "2026-06-15," slide 12 says "Late June." Fix: per-genre default + hold it.
- **Drive copies in inboxes.** Sharing means linking. The PDF stays in Drive; the link goes in the email.

## Side-quest: Drive + Notion organization

Out-of-design-repo work but enumerated so it doesn't get dropped. Recommended Linear ticket scope (file under team Z2O, link to this doc):

1. Audit current Drive contents against the canonical structure above. Identify duplicates (start with "Hyperscaler Inflection" copies), bespoke pilot decks that should become templates, and orphaned files.
2. Move active artifacts into the `/Verdigris/Collateral/{type}/...` structure.
3. Move superseded versions into `archive/` subfolders.
4. Update Notion Sales Collateral Cheat Sheet entries to point at the new canonical paths. Add a "Latest version" field per entry.
5. Document the structure on the Notion page so newcomers find it.

This is a one-time cleanup followed by quarterly sweeps. Likely owners: Sales Ops (Mark, Jimit, or Seren depending on division of labor); not the design system team.

## See also

- `workflows/adversarial-review.md` — research / debate / synthesize / QA workflow for new cells
- `workflows/pii-review.md` — mandatory PII review for any artifact that lands in this repo (referenced from step 11 above)
- `LEARNINGS.md` — cross-cell principles (rendering layer never invents, pick the genre first, floors AND ceilings)
- `categories/whitepapers/cover.md` — first applied genre cell, the structural template for slides + one-pagers + case studies
- `voice/USE.md` — voice recipe selection workflow
- Notion: Sales Collateral Cheat Sheet (link hub for active artifacts)
