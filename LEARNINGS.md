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

---

## Voice recipes need profile YAMLs as evidence

**Surface that produced this:** Voice recipes for sales-collateral decks (PR #43, slides cell). The first draft of four new recipes referenced "Mark" and "Jon" as primary or supporting voices — but `voice/team/` only had profile YAMLs for Jimit, Josh, Mike, Seren, and Thomas. Mark and Jon were assumed-by-name without backing evidence. An adversarial-review agent team caught this immediately: "every assignment involving them is undefendable because their voice strengths are unknown."

The fix was symmetric:

1. Author the missing profile YAMLs from the same source the existing five used (Slack message corpus). For Mark, also draw from his published blog at verdigris.co/blog. Both grounded the inferred voice in observable evidence.
2. Re-run the recipe-mix decisions against the now-evidenced profiles. Result: Seren moved from accent to primary in customer_101_deck (her operator_empathy 8 + personal_connection 8 + diplomatic precision are exactly what a first-meeting needs). Mike moved from supporting to primary in pilot_kickoff_deck (his field-credible voice from actual customer-site work is what the post-signature audience recognizes). Thomas moved from primary to supporting in pilot_kickoff. The partner_enablement_deck recipe was reverted to match the partner_materials precedent (Jimit primary, Seren supporting, Mike accent) after the reversal-without-rationale was flagged.

Generalizes: any recipe-style configuration that names voices, profiles, or sources by string identifier is silently fabricating unless the identifier is backed by an artifact. The design system's "rendering layer never invents facts" principle applies symmetrically here — referencing "Mark" without a Mark profile YAML is the same shape as a Methods callout with fabricated numbers. Both feel correct because the placeholder LOOKS like content; both fail under adversarial review.

When to apply this learning:

- Adding any new voice recipe that names a team member as primary, supporting, or accent.
- Adding any reference to `team/<name>.yaml` from any artifact in the design system.
- Reviewing existing recipes during quarterly sweeps — confirm every named source still has a current profile YAML.
- Any cell that wires up evaluator pipelines against voice ingredients should fail closed when a referenced profile is missing, not pass with the reference unresolved.

---

## Adversarial review catches the errors the system was built to prevent

**Surface that produced this:** Same PR (#43). The voice recipes I shipped initially demoted Seren from supporting (in the existing partner_materials recipe) to accent (in the new partner_enablement_deck recipe) without rationale. The adversarial-review agent team prosecuted this directly: "This is a direct reversal of partner_materials for no stated reason... the reversal appears to be a recipe-generation artifact, not a deliberate choice."

The error was the exact failure mode the adversarial-review workflow exists to catch: a divergence from precedent without justification, made because writing a new recipe in isolation makes the precedent invisible. The recipe-author (me) didn't notice they were reversing a pattern; the reviewer (the agent team, with the existing recipes in context) did.

This is the second time on the same branch (PR #43 ships the slides cell PLUS this fix) where adversarial review caught an error that the cell's own rules would have caught if applied to the cell itself. The pattern is real: cells that are about preventing X tend to fail at X during their own creation, because the author is focused on the outer artifact rather than the meta-rule.

When to apply this learning:

- Run adversarial review on the cell BEFORE shipping the cell, not after.
- Treat "I shipped a cell about [precedent / discipline / consistency / mode-conditional rules] and the cell itself didn't follow [that]" as a structural smell — it almost certainly happened, even if the reviewer hasn't found it yet.
- The agents found the error in <10 minutes. Pre-commit adversarial review is cheaper than post-PR fix.

---

## Three-loop adversarial review converges; one loop misses

**Surface that produced this:** PR #43, Loops 1-3 of agent-team adversarial review on the four-cell sales-collateral system. Each loop ran 3 parallel agents prosecuting different dimensions; each loop's fixes informed the next.

The pattern: **issues found per loop decay**, not because later loops are weaker, but because earlier loops fix the load-bearing failures and later loops find the load-light ones. Loops are converging when:

- Loop 1 (cell-level): structural bugs (5 broken rules with missing fields, 4 unverifiable exemplar claims, voice profile documentation gap)
- Loop 2 (cross-cell + inheritance + examples): integrity bugs (inheritance was documentation-only; example HTML violated its own cell on single-anchor-metric; missing cross-references in delta genre files)
- Loop 3 (external + recipe re-prosecution + enforcement): refinement (recipe percentage re-allocation, structural-vs-llm test conversion, profile YAML best_for documentation)

A single loop would have caught only the most obvious 30-40% of issues. The first agent team focuses on what it can see; subsequent agent teams build on the prior fixes and catch what the first round missed.

When to apply this pattern:

- New cells, new schemas, new tokens — anything where downstream consumers (Cowork skill, evaluator pipeline) will rely on the artifact's correctness for many surfaces.
- After a non-trivial refactor: the structural changes always reveal cascading inconsistencies the original author can't see.
- Before a release that establishes precedent (the first whitepaper cell, the first sales-collateral system, the first cross-cell inheritance pattern).

When NOT to apply:

- Bug fixes (one-shot, reversible, narrow scope).
- Token value tuning (numeric updates, validators catch the rest).
- Documentation polish (cosmetic; reviewer eyes catch this in PR).

The cost: 9 agent calls (3 loops × 3 agents) + ~2 hours of synthesis. The benefit: a system that converges on correctness rather than ships at "good enough." Cost-benefit favors three loops on cells that establish precedent; favors one loop on incremental work; favors zero loops on bug fixes.

Pair with `workflows/adversarial-review.md` -- the workflow itself. The three-loop pattern is when to invoke that workflow more than once on the same artifact.

---

## Pre-flight structural tests are cheaper than llm_eval

**Surface that produced this:** PR #43, Loop 3 enforcement-viability audit. The new sales-collateral rules shipped with `llm_eval:` test blocks for most rules (logomark consistency, CTA strip presence, numbered-list-count, thesis-block-required, etc.). An LLM eval costs money and time per evaluation; a structural test (CSS selector presence, regex count, JSON field check) costs near-zero.

Many rules are **structural plus semantic**: the structural part can be a cheap pre-flight check, and the semantic part is the llm_eval that fires if the structural test passes. Examples:

- `cta-strip-required`: structural = `.vd-onepager-cta` element exists; semantic = "is the CTA action specific or generic?"
- `numbered-list-count` (comparative): structural = count `<li>` items in 5-12 range; semantic = optional, only if structural fails
- `thesis-block-required`: structural = `aside.vd-onepager-thesis` exists; semantic = "does the thesis block carry the argument?"
- `single-anchor-metric` (case study): structural = exactly one `.vd-cs-anchor .vd-anchor-metric` element; semantic = "is the anchor compatible with surrounding prose?"

The pattern: write the structural test first, fall back to llm_eval only when the rule's semantics genuinely require comprehension. This pattern is now embedded as a `test:` block with both `structural:` and `llm_eval:` sub-fields in the relevant rules.

When to apply:

- Any rule where the failure mode includes a STRUCTURAL signature (missing element, wrong count, wrong file format) before it includes a SEMANTIC signature (wrong content, wrong tone, wrong intent).
- Rules that fire many times per artifact (one per slide, one per row): structural cost dominates llm_eval cost at scale.
- Rules that need to fire in CI (where llm_eval cost is borne by the project, not the consumer).

When llm_eval is the right answer:

- Rules about meaning, register, voice, argument quality. ("Does the close slide have the right founder authority weight?")
- Rules that compare two artifacts (web/PDF parity) — though the comparison itself can be structural plus semantic.
- Rules where the structural signature is unstable (different consumers render the artifact differently).

The discipline: every llm_eval in a rule should be paired with the question, "could a structural check fire first and the llm_eval only run when the structural check passes?" If the answer is yes, add the structural test.

---

## Single-genre cells when fragmentation isn't earned

**Surface that produced this:** Case studies cell (PR #43, Phase 4). The whitepaper cell ships three genres, the slides cell ships four genres, the one-pagers cell ships two genres — but the case-studies cell ships one. The decision was not symmetry-driven; it was evidence-driven.

A genre split is earned when the rhetorical structure of two variants is genuinely different — different authority signal, different audience expectation, different required sections. The whitepaper genres differ on six axes; the slide genres differ on six axes; the one-pager genres differ on five. The case study, by contrast, has one rhetorical structure that consistently lands across audiences (operator who lived it, their VP, procurement, board): executive summary -> problem -> approach -> outcome -> quote -> replicate. Splitting into "operational case study" / "strategic case study" / "compliance case study" would underspecify each variant — the same six sections, with cosmetic prose differences, dressed up as separate genres.

When to ship a single-genre cell:

- The rhetorical structure is the same across plausible audience splits.
- The required sections are the same.
- The voice mix is the same (or differs by less than 20% across recipes).
- The render targets are the same (or differ in deterministic, not rhetorical, ways — web vs. PDF mirror is fine).

When to fragment into multiple genres:

- The rhetorical structure genuinely differs (institutional research vs. CEO letter vs. policy brief — three different things).
- The required sections differ (pilot kickoff has decisions/risks/escalation; customer 101 has the wedge/evidence/why-now — different sections).
- The voice mix differs sharply (case study is Seren-primary; pilot kickoff is Mike-primary; customer 101 is Seren-primary — but they ship as separate cells / recipes because the ROUND of audience differs even when the voice does not).

Generalizes to: any cell facing the "should I split?" question. The default should be NOT to split until evidence accumulates that one spec underspecifies multiple surfaces. Premature genre proliferation is the failure mode.

---

## Web/PDF parity as a structural rendering-layer rule

**Surface that produced this:** Case studies cell (PR #43, Phase 4). Case studies render to two targets: web canonical (verdigris.co/resources/case-studies/{slug}) and PDF mirror (Drive). Pre-cell, the two targets diverged over time as edits landed in one but not the other — anchor metrics drifted, citations got out of sync, quote attribution was scrubbed differently.

The fix was a rule rather than a process: `composition.persuade-case-study.web-pdf-parity` enforces that both targets carry the same content, citations, anchor metric, and quote attribution. The PDF mirror MAY drop interactive elements (live charts, embedded video) but MUST NOT add or modify content claims relative to the web canonical.

Process-only enforcement (a manual review step in a workflow doc) failed for the same reason most process-only rules fail: when the artifact is being edited under deadline pressure, a single-target edit feels safe and the sibling target's drift is invisible until someone compares them weeks later. A rule with a defined evaluator (LLM-eval comparing the two targets) catches the drift on every artifact change, not on quarterly sweeps.

When to apply this learning:

- Any cell that ships an artifact to multiple render targets (web + PDF, web + email, deck + handout, video + transcript). Codify parity as a rule, not a process step.
- The rule should specify what's allowed to differ (interactive vs. static, live data vs. snapshot) and what isn't (content claims, citations, attribution).
- Pair the rule with a CI evaluator pass that flags divergence on every edit. Quarterly comparison is not the same thing.

---

## Production process belongs in the design repo when consumers diverge

**Surface that produced this:** Sales collateral system (slides cell + sales-collateral production guide). Mark Chung asked for "a scalable way to produce product demo artifacts" with consumers spanning Verdigris's sales motion, partner channels, customer engagement teams, and internal coordination. The decision: absorb production process (templates, naming convention, distribution rules, versioning protocol) into the design repo as `workflows/sales-collateral.md`, not split it across Notion and the design repo.

The original charter for `VerdigrisTech/design` was rules + tokens + foundations. Process docs were not part of the original mandate. But when consumers diverge — when the same artifact (a deck) gets produced by different humans for different audiences across different engagement contexts — a single source of truth that propagates via the package version is more valuable than two synced sources of truth. Drift between Notion's "how we make decks" and the design repo's "what a correct deck looks like" is the failure mode the consolidation prevents.

When to absorb process:

- Consumers diverge in role, geography, or tooling. (One team in one place that meets weekly does not need codified process; five teams across two continents do.)
- The process artifact and the rule artifact need to ship together. (Template + naming convention + version label have to update atomically.)
- A package consumer (skill, evaluator, AI agent) benefits from machine-readable process. (The Cowork skill consuming `@verdigristech/design-tokens` picks up workflow updates automatically; a Notion page does not propagate.)

When NOT to absorb process:

- Process is genuinely human-only (interview rubrics, OKR setting). Keep these in Notion.
- The audience is exclusively non-technical. (Design repo is markdown-via-Jekyll; Notion's WYSIWYG is friendlier for non-engineers.)
- Process changes faster than the design repo's release cadence. (Quarterly retros belong in a higher-velocity tool.)

Trade-off explicitly accepted: the design repo's charter expanded. As `workflows/*` grows past five docs, evaluate splitting into a sibling `verdigris-design-ops` repo. Meanwhile, the precedent is that `workflows/` is the seam — process docs live there, sectioned away from `rules/`, `tokens/`, `foundations/`, `categories/`.

Generalizes to: any cross-cell artifact that involves humans producing content. Sales collateral was the first; future candidates include hiring rubric production, board-deck production, partnership-agreement templates.
