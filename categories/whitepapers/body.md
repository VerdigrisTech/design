---
layout: visual
title: Whitepaper Body: Inside Pages
status: experimental
status_note: Graduates to convention after this pattern ships on 2 surfaces with positive review. The cover ships at experimental; the body inherits maturity.
---

# Whitepaper Body: Inside Pages

This guide covers pages 2+ of a Verdigris whitepaper or briefing. The cover (page 1) is specified in [`cover.md`](cover.md). All inside-pages conventions assume the cover has already established the document's genre.

The decisions below are genre-conditional. Most inside-pages questions (TOC depth, citation marker style, multi-author title page, methodology depth, running headers) collapse onto the genre the cover already declared. Where a rule is universal, it says so. Where it forks by genre, a 3-column matrix gives the answer.

## Inherits the cover genre

The cover guide already chose `lab_tradition`, `policy_brief`, or `ceo_brief` (see [`cover.md` "Pick the genre first"](cover.md#pick-the-genre-first)). The body does not re-pick. The genre attribute is declared once on the document body element (`<body data-genre="...">`, same convention the cover uses) and every body decision below reads from it.

If you find yourself wanting to mix body conventions across genres (lab citation density with a CEO byline, policy-brief recommendations in a lab report), the cover picked the wrong genre. Fix the cover; the body follows.

## Table of contents

A TOC is required, conventional, or rare depending on genre.

| Decision | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| TOC required? | Yes | Conventional at 12pp+ (skip under 8pp) | Rare; skip under 9pp |
| Depth | 2-3 levels (Chapter / Section / Subsection) | 1-2 levels | Single level, inline list with descriptions |
| Page numbers | Right-flush with dot leaders | Right-flush, no dot leaders | None |
| List of Figures + List of Tables | Required, each on its own page after TOC | Optional | Omit |

Dot leaders only appear in `lab_tradition`. Modern policy briefs (CSIS, Brookings, BPC) hold a clean type column and let the right-flush numerals carry alignment. CEO briefs that include a TOC follow the Anthropic pattern: section title plus a one-line description, no page numbers, no leaders.

Markup uses `.vd-toc` as the wrapper, `.vd-toc-entry` per row, `.vd-toc-h2` / `.vd-toc-h3` / `.vd-toc-h4` for indent levels, and `.vd-toc-page` for the right-flush numeral slot. Indent per level is held by `tokens/spacing/print.json` `whitepaper.body.toc-indent-per-level` (recommend 0.25in).

Entry-to-entry vertical gap has a floor and ceiling at `whitepaper.body.toc-entry-gap-min` and `whitepaper.body.toc-entry-gap-max`. Below the floor the TOC reads as a list; above the ceiling it reads as a table of contents that lost its content.

## Chapter and section breaks

A chapter break starts a new page. A section break uses vertical rhythm only. Genre decides which one applies and whether chapters are numbered.

| Decision | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Hard page break per chapter | Yes, every chapter | Yes when 15pp+; no under 15pp | No |
| Numbering style | Arabic ("1. Introduction"); section/subsection inherit (§2.1) | Roman (CSIS), Arabic (BPC), or unnumbered (Brookings); pick one and hold | Monospace teal `01`, `02` (Verdigris deviation, see below) |
| Eyebrow above chapter title | Optional ("CHAPTER 2") | BPC house style ("PART I -- DIAGNOSIS") | None |
| Per-chapter figure / equation numbering | Yes (Fig 2.1, Eq 2.3) | No, continuous | No, continuous |

Chapter breaks use `.vd-chapter` as the wrapper, with `.vd-chapter-eyebrow` for the optional label tier and `.vd-chapter-title` for the heading. Top padding after the page break is held by `whitepaper.body.chapter-break-top-padding-min` and `whitepaper.body.chapter-break-top-padding-max`. Section breaks use the existing `spacing.print.section.padding-bottom` token; no new token needed.

**Verdigris deviation (CEO brief numbering).** Source CEO exemplars (Anthropic *Core Views on AI Safety*, a16z manifestos, Bezos shareholder letters) leave sections unnumbered. Verdigris uses monospace teal `01`, `02`, `03` markers as in the existing `examples/lbnl-briefing.html` body. Justification: Verdigris CEO briefs land with institutional audiences who cite by section in review threads, and the evaluator pipeline addresses sections by ID. Numbered sections give both readers and machines a stable handle without forcing a hard page break or lab-style nesting. Document this on any new CEO brief; do not silently match the source exemplars.

## Multi-author title page

A title page sits on page 2 (or page 2-3) and carries author roster, affiliations, acknowledgments, funding, and the suggested-citation block. Required content thins as the genre gets shorter.

| Element | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Separate title page | Yes | Optional (often inline at top of page 2) | No |
| Author roster | Required, all co-authors with affiliation | 1-3 named authors with city | Byline on cover only |
| ORCID | Conventional | Uncommon | Omit |
| Acknowledgments block | Required | Short paragraph or "About the Authors" | Optional closing line in body |
| Funding statement | Required (DOE/UC contract number) | When sponsored | Subsumed into cover COI disclosure |
| Suggested citation | Required | Required (BPC, CSIS); optional (Brookings) | Omit unless deposited in citable repo |

Markup: `.vd-title-page` wraps the entire block. Inside it, `.vd-contributors` is the roster, with `.vd-contributor-name`, `.vd-contributor-affil`, and `.vd-contributor-orcid` per row. The blocks below the roster use `.vd-acknowledgments`, `.vd-funding`, and `.vd-suggested-citation`.

### Contributors block

Single column under three authors; two columns at four or more. Author order follows the field convention: lead author first; alphabetical when contributions are equal; institutional seniority for `lab_tradition`. Corresponding author marked with a dagger or asterisk that resolves to the email in the byline footnote tier.

Each row carries name (Inter 600), affiliation (Inter 400, includes city for `policy_brief`), ORCID inline after the name when present (Inter 400, smaller). Affiliations resolve via superscript footnote when multiple authors share institutions; the resolved affiliation block sits below the roster.

### Acknowledgments

Tone is institutional, third-person ("The authors thank ..."). Acknowledgments name people and reviewers; funding names money. Keep them separate. One paragraph in `policy_brief`, up to one column in `lab_tradition`, omitted as a block in `ceo_brief` (a single closing line at the foot of the body is enough: "Thanks to X for review. Errors are mine.").

### Funding

`lab_tradition` funding is mandatory and uses the agency's exact boilerplate. Pattern: contract number + agency + program (e.g., "This work was supported by the U.S. Department of Energy under Contract No. DE-AC02-05CH11231 ..."). `policy_brief` funding appears when the work was sponsored. `ceo_brief` rolls funding into the cover disclosure; do not repeat it on the title page.

### Suggested citation

Default to ANSI/NISO baseline, mirroring the cover's citation format. Pattern: author(s), "title," series ID or report number, (year), URL. `lab_tradition` includes the report number (e.g., LBNL-2001637). `policy_brief` includes the institution. `ceo_brief` omits the block unless the brief is deposited in a citable repository (Zenodo, arXiv).

The block sits in `.vd-suggested-citation` with a hairline rule above and below. Place it on the title-page verso (`lab_tradition`) or directly under the byline (`policy_brief`).

## Citations in body prose

This section covers in-body citation markers. The bibliography format is specified in [`cover.md` "Citation format"](cover.md#citation-format); do not duplicate here.

| Marker style | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Default | Author-date inline `(Shehabi et al., 2024)` | Numbered superscript resolving to endnotes | Numbered superscript (Verdigris print default) |
| Two authors | `(Smith & Doe, 2024)` | Numbered | Numbered |
| Three or more | Collapse to `et al.` from first cite | Numbered | Numbered |
| Footnote scope | n/a (no footnotes; uses bibliography) | Document-wide endnotes | Document-wide endnotes |
| Inline hyperlinks | DOI preferred over URL in bibliography | URL inline in endnote | Web-only versions may use inline links; print uses superscripts |
| Self-cite for proprietary data | Letter footnote (m, n, ...), distinct from numeric markers | Same | Same |

The numbered-superscript default for `ceo_brief` print is conservative: institutional audiences (LBNL, DOE, regulators) read superscripts as the citation contract. Inline hyperlinks are acceptable on the web-published version of the same document, not on the print PDF. This matches the cover's citation guidance.

Markup uses `.vd-cite` for numeric markers and `.vd-cite-letter` for the proprietary-data letter footnote (already established in the LBNL example). The reference list at the end of the document uses `.vd-references` as the wrapper and `.vd-ref-entry` per item.

Hyperlinks in body prose are teal (`color.brand.verdigris`) with no underline in print, underline on screen. Long URLs in print should be deferred to the endnote, not run inline.

## Figures, tables, equations

### Figures

Body figures are the workhorse and follow the same markup pattern as cover figures: `.vd-figure` wrapping an image plus `.vd-figure-caption` containing `.vd-figure-label`, the caption text, and `.vd-figure-credit`.

Caption position is below the figure (universal across all three genres; lab and policy traditions are unanimous on this). Numbering forks by genre.

| Decision | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Numbering | Per chapter (`Figure 2.1`) | Continuous (`Figure 1, 2, 3`) | Continuous |
| Cross-reference | "see Figure 2.1" | "see Figure 1" | "see Figure 1" |
| Source line on proprietary data | Required | Required | Required |
| Source line on public data | Conventional | Conventional | Optional |

Gap above and below the figure block is held by `whitepaper.body.figure-gap-above-min` / `-max` and `whitepaper.body.figure-gap-below-min` / `-max`. If the tokens are not yet populated, default to 18px floor / 28px ceiling above and 12px floor / 20px ceiling below; the token agent will lock the values.

Page-break behavior: figures never split (`page-break-inside: avoid`). When the figure plus caption exceeds remaining page space, push to the next page even at the cost of white space on the prior page. Same rule the cover uses.

The figure label uses Lato 700 / teal eyebrow tier, matching `.vd-chapter-eyebrow`. This is intentional: figures, tables, and chapter labels share one structural eyebrow vocabulary so they read as peers, not as separate type families.

### Tables

Body tables use `.vd-table` (distinct from `.vd-impact`, which is reserved for cover-tier hero tables). Hairline rules sit at the top, below the header row, and at the bottom (booktabs three-rule convention; 0.25-0.5pt). No vertical rules. No alternating row tint in `lab_tradition` or `policy_brief`. `ceo_brief` may use a very light row tint (≤4% gray) for scanability when the table runs beyond five rows.

Header row: Lato 600, sentence case, not all caps unless the header is in the eyebrow tier. Caption sits **above** the table (universal default; tables read top-down, so the caption belongs at the top). This diverges from figures intentionally.

Table numbering parallels figure numbering: per chapter for `lab_tradition`, continuous for the other two genres.

Page-break behavior for long tables: the header row repeats on each page break (`thead { display: table-header-group; }`). Cell padding floor/ceiling are held by future tokens `whitepaper.body.table-cell-padding-min` / `-max` (recommend 6px floor / 10px ceiling); the token agent will pick up the recommendation.

### Equations

Display equations sit centered, with the equation number flush right in parens. Markup: `.vd-equation` wraps the equation, `.vd-equation-num` holds the number.

| Decision | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Numbering | Per chapter (`(2.1)`) | Continuous (`(1)`) | Avoid display equations |
| When required | When methodology rests on a quantitative model | Rare; convert to prose when possible | Convert to prose or inline math |

Number an equation only when the body prose later references it. Unreferenced numbered equations add visual chrome without paying for it.

Inline equations use math italics and never break across lines.

## Pull-quotes and callouts

Pull-quotes use a single visual pattern across all three genres: teal left rule, no fill, oversized type. The class is `.vd-pullquote`, which extends the existing `.vd-thesis` cover treatment. One CSS class; frequency is enforced in the rules YAML, not in separate components.

| Decision | lab_tradition | policy_brief | ceo_brief |
|---|---|---|---|
| Pull-quote frequency | Rare (signals editorial intervention; lab readers register as bias) | Occasional (1-3 per brief, surfaces a recommendation or striking stat) | More frequent (every 1-3 pages, sets rhythm) |
| Side-margin floor / ceiling | `whitepaper.body.pullquote-side-margin-min` / `-max` | same | same |

Pull-quote font is Lato 700 (matching the headline tier on the cover). The teal left rule is 2px, full vertical height of the quote block.

Callouts share `.vd-callout` as the base class with modifiers per type:

- `.vd-methods` (already in `cover.css`): methodology callout. Universal across all three genres. Required when a quantitative claim rests on proprietary or non-public data. Required content is specified in [`cover.md`](cover.md#methodology-callout) (n, geography, instrumentation, window, anonymization).
- `.vd-callout-warning`: caveats around proprietary data, scope limits, or recommendation conditions ("Important: this recommendation assumes ..."). Used in `policy_brief` and `ceo_brief`. Avoid in `lab_tradition`; lab readers handle caveats in body prose, and a yellow warning box reads as marketing in lab register.
- `.vd-callout-caveat`: genre-specific limit notes (e.g., "Findings are conditional on the inverter classes covered in this study."). Lighter visual treatment than `-warning`; used sparingly in any genre.

## Running headers and footers

Genre decides whether the page chrome is full, minimal, or absent. WeasyPrint named regions (`@top-left`, `@top-right`, `@bottom-left`, `@bottom-center`, `@bottom-right`) are the implementation; the cover suppresses both header and footer through its own named `@page` (already documented in [`cover.md` WeasyPrint quirks](cover.md#weasyprint-quirks)).

| Region | lab_tradition | policy_brief | ceo_brief (4-8pp) | ceo_brief (9-12pp) |
|---|---|---|---|---|
| Running header | Paper title (left), chapter title (right), facing pages | Paper title (left), institution mark opposite | None | Paper title only, no chapter |
| Running footer | Page number (outer corner), contract number (inner / center) | Page number, institution name | Page number, institution name | Page number, institution name |
| Confidentiality marking | Footer center when INTERNAL/PARTNER | Footer center when INTERNAL/PARTNER | Footer center when INTERNAL/PARTNER | Footer center when INTERNAL/PARTNER |
| Suppressed on | Cover, chapter-opening pages | Cover, page-2 title block | Cover | Cover |

Suppressing the header and footer on chapter-opening pages is universal print convention; the chapter title carries its own visual weight at page top, and competing chrome above it muddies the hierarchy.

Confidentiality marking uses the existing `--vd-conf-public`, `--vd-conf-internal`, `--vd-conf-partner` variables in `cover.css`. PUBLIC tier omits the marking entirely. The contract number in the footer is `lab_tradition` only; do not invent one for other genres.

Header and footer heights are held by `whitepaper.body.running-header-height-min` / `-max` and `whitepaper.body.running-footer-height-min` / `-max` in `tokens/spacing/print.json`.

## Reference examples

Two reference examples ship with the body spec, one per dominant genre. The existing `lbnl-briefing.html` is a partial-CEO-brief precursor that predates the formal genre split; the new examples extend it with TOC, multi-section body, multi-author block (lab only), and full reference list.

| Mode | Surface | File |
|---|---|---|
| `lab_tradition` | LBNL-style technical report (40pp, 4 co-authors, full TOC, per-chapter figures, numbered equations, bibliography) | `examples/lab-style-report.html` + `.pdf` |
| `ceo_brief` | CEO brief addressed to a research audience (8pp, single byline, monospace section numbers, 4 figures, numbered endnotes) | `examples/ceo-brief.html` + `.pdf` |
| `ceo_brief` (precursor) | LBNL/DOE briefing, partial implementation | `examples/lbnl-briefing.html` + `.pdf` |

A `policy_brief` reference example is deferred until a real policy-audience surface ships. The cover spec already documents this gap.

## Versioning + refresh

Whitepaper revisions follow the canonical naming + versioning protocol. See [`workflows/sales-collateral#versioning-vs-refresh`](../../workflows/sales-collateral#versioning-vs-refresh) for the policy on when an edit is in-place, a refresh, or a new version.

## What this rule does NOT cover

- **Bound print (bleed, gutter, perfect-bound, saddle-stitched).** Belongs in a future `categories/print-production/` guide when a real bound surface ships.
- **Index generation.** Belongs in a future long-form-report extension if a Verdigris document ever needs an index.
- **Glossary conventions.** Belongs in the same long-form extension; current Verdigris briefings define terms inline.
- **Multi-language layout.** Belongs in a future internationalization guide; current Verdigris briefings are English-only.
- **Accessibility tagging for screen readers (PDF/UA).** Belongs in a future `foundations/accessibility-print.md` once a stakeholder requires it.
- **Interactive PDF features (forms, JavaScript, embedded media).** Out of scope; Verdigris print PDFs are read-only artifacts.

## Why this guide changed

v0.1 -- initial spec, ships alongside two reference examples per genre. Genre-conditional decisions adjudicated against LBNL/NREL/Brattle (lab), CSIS/Brookings/BPC (policy), and Anthropic/Stripe/a16z/Bezos (CEO) exemplar surveys.
