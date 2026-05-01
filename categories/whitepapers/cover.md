---
layout: visual
title: Whitepaper & Briefing Covers
status: experimental
status_note: Graduates to convention after this pattern ships on 2 surfaces with positive review. First surface is the LBNL/DOE briefing in examples/.
---

# Whitepaper & Briefing Covers

Verdigris produces high-stakes editorial PDFs for national-lab, regulator, and policy audiences. The cover sets whether the document reads as "a CEO sent this" or "a templating tool produced this." This guide defines the cover system.

## Pick the genre first

Most cover decisions follow from a single upstream choice: **which genre is this document?** The same audience reads three different genres differently. Get the genre right; the rest of the spec snaps into place.

| Genre | When to use | Authority signal | Reference exemplars |
|---|---|---|---|
| **Lab tradition** | The document is co-authored by a research institution and reads as institutional research output | Institution + multiple co-authors with division affiliation; methodology chapter; full bibliography | LBNL ETA reports (eta-publications.lbl.gov); NREL technical reports (docs.nrel.gov); Brattle expert reports |
| **Policy brief / think-tank** | A named institution with policy standing addresses an audience of policymakers; numbered recommendations are the deliverable | Named partners + city; methodology sidebar; "Recommendations to <institution>" | CSIS energy briefs; Brookings Policy Briefs; BPC briefings; EFI Action Plans |
| **CEO-authored brief** | An operator with field data and a point of view writes directly to a research or policy audience; the byline IS the warrant | First-person voice; tight; cited but not bibliography-heavy; declarative recommendations | Anthropic *Core Views on AI Safety*; Stripe annual letters; Bezos shareholder letters; a16z manifestos |

The three genres differ on six axes. **Pick one and commit.** Hybrids that borrow signals from a genre they don't actually belong to read as marketing dressed as research, regardless of typography quality.

| Axis | Lab tradition | Policy brief | CEO brief |
|---|---|---|---|
| **Cover style** | Plain white, contract # visible | Branded photographic / dark | Title + byline + date, no formal cover sheet |
| **Length** | 25-80pp | 8-25pp | 4-12pp |
| **Authorship** | 3-10 co-authors w/ division | 1-3 named authors w/ city | Single named author |
| **Voice** | Third-person institutional | Declarative | First-person ("I" or "we") |
| **CTA section label** | "Implications" / "Open Questions" | "Recommendations to <institution>" | "Bottom line" / "What to do" |
| **COI / disclosure** | DOE/UC boilerplate, always | Optional unless regulated | Required only when author benefits commercially from the recommendations |
| **Methodology** | Full chapter | Sidebar or 1-page appendix | Footnote or none |
| **Citations** | Author-date inline + full bibliography | Numbered footnotes/endnotes + URLs | Inline hyperlinks or numbered with URLs |

The current canonical example (`examples/lbnl-briefing.html`) is a **CEO-authored brief addressed to a lab audience** — first-person, single byline, 5 pages, with selective borrowing from the policy-brief and lab traditions (COI disclosure because the recommendations benefit Verdigris commercially; light methodology callout because the central claim rests on proprietary field data). It is NOT a lab-tradition document and should not pretend to be one.

## The cover is a quiet surface (universal)

Whichever genre you pick, this rule holds.

A whitepaper cover is **not** page 1 of an article. It carries identity, title, audience, byline, and date. Body copy belongs on page 2.

A cover that includes section headers, body paragraphs, or any of the document's argument fails the cover register. Reference set across all three genres: LBNL ETA reports, NREL technical reports, CSIS briefs, Brookings Policy Briefs, EFI plans, Anthropic position papers, Stripe Press jackets. Every one of them keeps page 1 as a quiet typographic surface (or, in the CEO genre, dispenses with a formal cover entirely and lets the title block do the work).

## Hierarchy

Required, in this order, top to bottom:

1. **Identity mark** (logo, top-left, ~180px wide on dark)
2. **Eyebrow** (series + audience, e.g., "BRIEFING · LBNL GRID INTEGRATION GROUP / DOE")
3. **Headline** (the paper's title, max 3 lines, Lato 700, with one teal accent phrase)
4. **Deck** (one-sentence subhead, max ~24 words)
5. **Quiet field** (bounded white space; floor 1.4in, ceiling 2.6in)
6. **Byline** (author name + affiliation incl. city + email, date, distribution/version meta)

Genre-specific additions:

- **Policy-brief / think-tank only:** "Prepared for: <institution + group>" line below byline. Optional in CEO and lab genres (the eyebrow already names the audience).
- **CEO-brief only, when author benefits commercially:** Disclosure block. One sentence, footer-tier type. Pattern: "**Disclosure.** The author is [role] of [vendor], which develops [products discussed]. Views are the author's." Drop "has not been peer-reviewed" boilerplate; it advertises insecurity.
- **Lab-tradition only:** DOE/UC boilerplate disclaimer + funding contract number. Universal in lab genre, never optional.

What is **not** on a cover (any genre):
- Section headers (e.g., "THE PROBLEM")
- Body paragraphs of the document's argument
- Bullets, callouts, tables
- Pull quotes
- Multiple dividers (one is the cap, between the quiet field and the byline)

## Spacing rhythm

All values from `tokens/spacing/print.json`. Every gap has a floor AND a ceiling.

| Gap | Floor | Default | Ceiling |
|---|---|---|---|
| Page frame (top, sides, bottom) | n/a | 0.85in | n/a |
| Eyebrow to headline | 32px | 36px | 48px |
| Headline to deck | 18px | 22px | 28px |
| **Deck to byline (quiet field)** | **1.4in** | **1.6in** | **2.6in** |
| Byline to bottom edge | 0.6in | 0.75in | 1.0in |

The deck-to-byline gap is the single load-bearing measurement. Below the floor the cover reads as a page-1 article. Above the ceiling it reads as wrong-page-size. Hold the range.

Page frame margins use a single canonical default (0.85in). Floor/ceiling values are not yet codified because no surface has needed to deviate. Add them to `tokens/spacing/print.json` if a real surface ever needs a different frame.

## Typography

| Slot | Font | Size | Weight | Color |
|---|---|---|---|---|
| Eyebrow | Lato | 9pt | 700 | `color.brand.verdigris` (lightened tint on dark) |
| Headline | Lato | 38pt | 700 | rgba(255,255,255,0.96), accent in teal |
| Deck | Inter | 13pt | 400 | rgba(255,255,255,0.72) (contrast tier 2) |
| Byline name | Inter | 11pt | 600 | white |
| Byline affiliation | Inter | 9.5pt | 400 | rgba(255,255,255,0.55) |
| Date | Inter | 9.5pt | 400 | rgba(255,255,255,0.65) |

Verdigris locks Inter + Lato + JetBrains Mono (`tokens/typography/font-family.json`, `foundations/typography.md` line 128-159). Do not introduce a serif headline for whitepapers. Lato 700 carries editorial weight at this scale.

## Font loading (production renderers)

Production renderers MUST load Inter, Lato, and JetBrains Mono before paginating. The reference stylesheet at `build/print/cover.css` assumes those families are available; system fallbacks render measurably wider, which inflates page counts (observed: 5pp → 7pp on the same content when fonts failed to load).

Two acceptable approaches:

1. **Self-hosted woff2 (recommended for WeasyPrint).** WeasyPrint cannot fetch fonts at print time. Bundle the woff2 files and reference them via `@font-face` in a stylesheet loaded alongside `cover.css`.
2. **Google Fonts via @import (Chrome `--print-to-pdf` only).** Acceptable when the renderer has network access at print time. Use `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@700&family=JetBrains+Mono:wght@400&display=block')` and explicitly `display=block` so the renderer waits for the font before laying out (otherwise pages paginate against the fallback metrics first).

A skill consuming this spec must verify the rendered page count matches the spec (CEO brief: 4-12pp, policy brief: 8-25pp, lab tradition: 25-80pp). If the count drifts, font loading is the first thing to check.

## Figures

One figure with real data does more credibility work than most of the brief's prose. Use the `.vd-figure` pattern in `build/print/cover.css`:

```html
<figure class="vd-figure">
  <img src="path/to/chart.svg" alt="...">
  <figcaption class="vd-figure-caption">
    <span class="vd-figure-label">Figure 1</span>
    Inverter waveform under nominal vs. faulted conditions.
    <span class="vd-figure-credit">Source: Verdigris field data, n=14 sites, 8 kHz sampling, Q1 2026.</span>
  </figcaption>
</figure>
```

Conventions:
- Caption sits below the figure (never above; lab and policy briefs are unanimous on this).
- Credit line is required when the figure rests on proprietary or non-public data; same content discipline as the Methods callout.
- Figures never split across pages (`page-break-inside: avoid`). If the figure plus caption exceeds remaining page space, push to the next page even if it leaves white space.
- Figure label uses Lato 700 / teal eyebrow tier — same vocabulary as section eyebrows, so figures read as structural peers of sections.

## Dark cover specifics

Most Verdigris briefings (CEO and policy-brief modes) use a dark cover. Lab-tradition documents use a plain white cover; the rules below do not apply.

1. **Drop headline weight one tier.** Lato 700 (not 800/900). Heavy weights bloom on dark.
2. **Deck at contrast tier 2** (~70-78% L), not pure white. Two near-white texts compete.
3. **Divider at 20% white** (`rgba(255,255,255,0.20)`), 0.4pt weight. Above that, the divider competes with the title block.

Background color is `color.neutral.950` (`oklch(0.141 0.005 285.823)`, near-black with a hue-286 tint), **not** invented navy. Reserve `color.brand.midnight-purple` for accents only.

## Body conventions by genre

The recommendations / call-to-action section uses a different label per genre. The patch v0.1 of this guide claimed "Recommendations to <institution>" was the lab convention. **That was wrong** — it is the think-tank/policy-brief convention. Lab convention is "Implications" or "Open Questions." Use the table below.

| Genre | Section label | Format |
|---|---|---|
| Lab tradition | "Implications" or "Open Questions for <audience>" | Prose, sometimes bulleted; rarely numbered |
| Policy brief / think-tank | "Recommendations to <institution>" | Numbered (typically 3-7) |
| CEO brief | "Bottom line" / "What to do" / declarative summary | Numbered or prose; declarative voice |

**Methodology callout.** Required when a quantitative claim rests on proprietary or non-public data. Use a letter footnote (m, n, ...) to distinguish from numeric citations. Required content: site count *n*, geography, instrumentation (sample rate, sensor class), observation window, statistical confidence interval, anonymization protocol, data-availability statement. Lab tradition: full chapter. Policy brief: sidebar or appendix. CEO brief: callout box (see `.vd-methods` in `build/print/cover.css`).

## Citation format

Default to ANSI/NISO baseline. For each entry: author, "quoted title," series ID or arXiv number, (year), URL. Bare domains alone ("brookings.edu") are insufficient. arXiv preprints require year. Government and lab reports require report number (e.g., LBNL-2001637).

Genre flexibility:
- **Lab tradition:** author-date inline (Shehabi et al., 2024) resolving to a full bibliography. DOIs preferred.
- **Policy brief:** numbered footnotes or endnotes; URLs OK.
- **CEO brief:** inline hyperlinks acceptable; numbered with URLs is the conservative choice for an institutional audience.

## WeasyPrint quirks

The reference stylesheet at `build/print/cover.css` works around four known WeasyPrint bugs:

- **Use named pages, not `@page :first`.** `:first` is brittle ([WeasyPrint #2088](https://github.com/Kozea/WeasyPrint/issues/2088)).
- **Use Flex column for cover layout, not Grid.** Grid is unreliable in WeasyPrint ([#1186](https://github.com/Kozea/WeasyPrint/issues/1186)).
- **Use `padding-top`, not `margin-top`, for vertical rhythm.** WeasyPrint silently collapses sibling margins ([#37](https://github.com/Kozea/WeasyPrint/issues/37)).
- **Suppress running headers/footers on the cover** by giving the cover its own named `@page` with no `@top-*` or `@bottom-*` boxes ([#474](https://github.com/Kozea/WeasyPrint/issues/474)).

Chrome `--print-to-pdf` honors all of these without workarounds.

## Reference example

| Mode | Surface | File |
|---|---|---|
| CEO brief addressed to a lab audience | LBNL/DOE briefing (5pp, single byline, COI footer, Methods callout) | `examples/lbnl-briefing.html` + `.pdf` |

Lab-tradition and pure policy-brief examples will be added when real surfaces ship.

## What this rule does NOT cover

- Long-form (>15 page) lab reports. Needs a separate "report" pattern with TOC, chapter breaks, multi-author title page.
- Bound print (perfect-bound, saddle-stitched). Needs bleed and gutter rules.
- Light-cover variants of the policy-brief or CEO-brief modes. Most Verdigris briefings are dark. Light covers earn their own pattern when a real surface needs one.
- One-pagers and case studies. See `categories/ads-and-templates/guidelines.md`.

## Structural additions vs content additions

**The rendering layer never invents facts.** This is the load-bearing rule for any system that generates documents from author-supplied content.

A best-practice **structural slot** (COI disclosure block, Methods callout, byline city, "Prepared for" line) MAY be added by the design layer if and only if:

1. The slot is a documented best practice for the document's mode, AND
2. The content placed in the slot is either (a) verifiable from a real source or (b) clearly marked as a template the author must fill in before distribution.

A **content addition** (filling a citation with a fabricated entry, correcting an author attribution, renaming a section, inventing byline metadata) is never a rendering-layer decision. It is an author decision. The design system flags such items in the hand-off note and lets the author resolve them.

Failure modes this rule prevents:

- Inventing a byline city ("Moss Landing CA") because a convention says bylines should include city.
- Inventing a citation (a fabricated ERCOT report URL) because the body claims a number that needs a source.
- "Correcting" an author attribution (Khaledian → Ko/Zhu) without surfacing the change to the author.
- Filling a Methods box with plausible-sounding numbers ([SITE COUNT] = 14) instead of leaving the bracket and flagging.
- Renaming a section label ("Bottom line" → "Recommendations to LBNL and DOE") because a different convention seemed more polished.

Test for any rendering-layer change: *if the author skim-reads the rendered document, will they recognize every claim, citation, label, and metadata field as theirs?* If no, the change is content, not rendering, and belongs in the hand-off note.

When in doubt: **mark as a template, or ask the author.** Never default to plausible-sounding placeholder.

## Placeholder convention

When the rendering layer reaches a structural slot whose content the author has not provided, mark the slot as a template field. Two equivalent forms:

```html
<!-- Inline -->
The study covers <span class="vd-template">[SITE COUNT]</span> sites across
<span class="vd-template">[GEOGRAPHY]</span>.

<!-- With author hint -->
<span class="vd-template">[FIELD: site count, e.g. "14"]</span>
```

Conventions:
- Bracketed `[FIELD]` or `[FIELD: hint]` syntax inside a `.vd-template` span. Brackets stay literal in the output so a CEO skimming the rendered PDF cannot miss them.
- The renderer styles `.vd-template` in alert yellow (`#fff4d6` / `#8a5a00`) — the same palette as `.vd-methods-draft` — so a draft-tier document has one consistent "fill this in" visual language.
- A small `▸` glyph prefixes the field, making placeholders scannable when a reviewer is paging quickly.
- Placeholders MUST survive PDF export (`print-color-adjust: exact`). Never use a styling that depends on screen-only CSS — a placeholder invisible in print is worse than no placeholder.
- Before distribution, every `[FIELD]` must be either filled in by the author or removed (with the surrounding sentence rewritten). The hand-off note from the rendering layer should enumerate every placeholder remaining in the document.

This is the visible counterpart to the structural-vs-content principle above: the design layer adds the *slot*, marks the *missing content*, and lets the author fill it in. The yellow tint is intentionally jarring; it should never feel "designed enough to ship."

## Why this guide changed

v0.1 of this guide treated whitepaper covers as one genre and codified think-tank conventions ("Recommendations to <institution>", required "Prepared for" line, mandatory disclosure block) as universal. A research-and-debate review across LBNL, NREL, CSIS, BCG, Brattle, Anthropic, and Stripe exemplars showed those are mode-specific, not universal. Genre choice now leads the guide; per-mode adjustments follow.
