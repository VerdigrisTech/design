# Verdigris Design System — Learnings

Cross-cell knowledge that emerged from real work on the system. Each entry pairs a principle with the surface that produced it, so a future cell working in a different category can borrow the lesson without re-discovering it.

This file is not authoritative — `foundations/`, `rules/`, and `categories/` remain the canonical homes for individual rules and patterns. This is the place to capture *why a class of decisions tends to go a certain way*, in a form that survives the specific project that produced it.

Entries are append-only. If a learning turns out to be wrong, leave the entry and add a "Reversed by" note pointing to the newer entry, the way `git revert` is preferred over `git rewrite` — honest history beats clean history.

---

## Rendering layer never invents facts

**Surface that produced this:** Whitepaper cover system (CEO brief to LBNL).

A best-practice structural slot (Methods callout, COI disclosure, "Prepared for" line, byline city) MAY be added by the rendering layer if it is a documented best practice for the genre. The *content* placed in that slot must come from a verifiable source or be marked as a template the author fills in.

Failure modes the principle prevents:
- Inventing a byline city ("Moss Landing CA") because a convention says bylines should include city.
- Filling a Methods box with plausible-sounding numbers because the slot exists.
- "Correcting" an author attribution without surfacing the change.
- Renaming a section label to something more polished.

Test for any rendering-layer change: *if the author skim-reads the rendered document, will they recognize every claim, citation, label, and metadata field as theirs?* If no, the change is content, not rendering, and belongs in the hand-off note.

Pairs with the placeholder convention (`.vd-template` + `[FIELD: hint]` syntax) defined in `categories/whitepapers/cover.md`.

Generalizes to: any cell where an agent or template fills in a structured artifact. Marketing pages with author-supplied copy, ad templates with product names, slide decks with quotes — same rule. Add the slot; mark the missing content; do not invent.

---

## Pick the genre first

**Surface that produced this:** Whitepaper cover system. v0.1 of the cover guide treated whitepapers as one genre and codified think-tank conventions as universal. Reference set across LBNL, NREL, CSIS, BCG, Brattle, Anthropic, Stripe showed those are mode-specific.

Whenever a category has multiple legitimate institutional reference sets (lab tradition, policy brief, CEO brief; or marketing site, product page, ad; or trade-show booth, retail packaging, internal hardware), the FIRST decision in the spec is which genre the artifact belongs to. The rest of the rules cascade from that choice.

Hybrids that borrow signals from a genre they don't actually belong to read as marketing dressed as something else, regardless of typography quality. Pick one and commit.

When you write a category guide, lead with a genre-selection table (when to use, authority signal, exemplars). Don't make readers infer the genre from rules that pretend to be universal.

---

## Floors AND ceilings

**Surface that produced this:** Multiple. Codified in the project rule "every guidance rule needs both a floor AND a ceiling" (CLAUDE.md).

AI agents and template-driven rendering pipelines optimize toward maximums when only floors are specified. A "minimum 18px gap" without an upper bound becomes 96px. A "minimum 1.4in deck-to-byline" without a ceiling becomes a half-empty cover.

Every spacing rule, font-size rule, color-density rule, and copy-length rule must have both bounds. The default sits between them; the floor and ceiling express the register the artifact must hold.

This is enforced for `rules/visual-rules.yml` by `npm run validate:rules`. Apply the same discipline when writing prose specifications in `foundations/` and `categories/`.

---

## Mode-conditional rules beat universalized rules

**Surface that produced this:** Whitepaper cover system. The first pass of `composition.persuade-whitepaper-cover` rules required the COI disclosure block, "Prepared for" line, and "Recommendations to <institution>" labeling on every cover. Adversarial review showed each of these is genre-specific.

When a cell has multiple modes (see "Pick the genre first"), each rule should declare *which modes it applies to*. The YAML schema supports this via per-rule `modes: [ceo_brief, policy_brief]` annotations.

Universalized rules force compliance theater: a CEO brief gets a COI block grafted on because "the rule said so," even though the genre's exemplars (Anthropic, Stripe, a16z) don't carry one. Mode-conditional rules let the same rule file serve all genres without forcing wrong defaults.

---

## WeasyPrint and Chrome --print-to-pdf are not interchangeable

**Surface that produced this:** Whitepaper cover system reference stylesheet.

Working set of issues to design around (links in `categories/whitepapers/cover.md`):
- `@page :first` is brittle in WeasyPrint. Use named pages (`@page cover`, `@page paper`) and apply with the `page:` property.
- CSS Grid is unreliable in WeasyPrint. Use Flex column for paged layouts.
- Sibling `margin-top` collapses silently in WeasyPrint. Use `padding-top` for vertical rhythm.
- Running headers/footers leak onto the cover unless the cover has its own named `@page` with no `@top-*`/`@bottom-*` boxes.
- WeasyPrint cannot fetch fonts at print time. Self-host woff2 or accept the fallback metrics (which inflate page counts).
- Background colors require `print-color-adjust: exact` (works in both engines) for placeholders and alert blocks to survive PDF export.

Chrome `--print-to-pdf` honors all of these without workarounds. Choose the renderer per surface: WeasyPrint for server-side automation, Chrome for human-in-the-loop final renders.

---

## Adversarial review then debate, for non-trivial design decisions

**Surface that produced this:** Whitepaper cover system. The first pass shipped a single-genre spec. A second pass — research multiple exemplar sets, then have two debaters argue opposing positions, then synthesize — surfaced the three-genre framework, the structural-vs-content principle, and several rules that needed to become mode-conditional.

When a design decision is non-trivial (new category, breaking schema change, change to a foundation), QA-style review (content, rules consistency, HTML validation) is necessary but not sufficient. QA finds errors against a known spec; it does not stress-test the spec itself.

The full workflow is documented in `workflows/adversarial-review.md`. The short form: research → debate → synthesis → QA. Each stage has a different agent role and different pass/fail criteria.

---

## Structural enforcement must follow structural changes

**Surface that produced this:** `build/validate-rules.ts` `checkSidebarCoverage` had `categories/web-components/` hardcoded. Adding `categories/whitepapers/` slipped through silently — the new category didn't show in any validation, even though its `cover.md` was missing from earlier sidebar revisions.

When you add a new structural primitive (a new category folder, a new tokens subdirectory, a new content type), audit every validator and every CI step that walks the structure. Hardcoded paths drift; dynamic walks (`readdirSync` + filter) survive future additions.

This generalizes: any time you add a peer to an existing thing, search for places that enumerate the existing thing and confirm they pick up the peer.
