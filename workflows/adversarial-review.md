---
layout: default
title: Adversarial Review Workflow
status: experimental
status_note: First applied to the whitepaper cover system. Graduates to convention after a second non-trivial design decision uses it successfully.
---

# Adversarial Review Workflow

For non-trivial design decisions, run this workflow before merge. It is *additional to*, not a replacement for, the 3-agent QA workflow defined in `CLAUDE.md`.

## When to use this workflow

Required for:

- New category folder (e.g., `categories/whitepapers/`)
- New foundation document or major rewrite of an existing one
- Schema changes to `rules/visual-rules.yml`
- New token group (e.g., adding `tokens/spacing/print.json`)
- Composition matrix changes (new cells, removed cells, restructured axes)
- Any change that introduces a new institutional reference set or claims a "best practice" not yet documented
- Any change that expands the public surface of `@verdigristech/design-tokens` (`package.json` `files` or `exports`) — see "When 3 loops vs. 5 loops" below
- Any change to a rendering layer (CSS files, print stylesheets, paged-media specs) where overflow, clipping, or font-loading bugs are invisible to source readers
- Precedent-setting cells that downstream cells will cargo-cult (the first whitepaper cell, the first sales-collateral system, the first cross-cell inheritance pattern)

Not required for:

- Token value tuning (a number changed)
- Bug fixes against an existing spec
- Adding examples to an existing pattern
- Documentation polish that doesn't change rules
- Refactors that preserve behavior

The dividing line: **does this change establish what is true, or check that work matches what is already true?** Adversarial review for the former, QA for the latter.

## Why this exists separately from QA

QA finds errors against a known spec. Run a content check, a rules-consistency check, an HTML-validation check; each one assumes the spec is correct and verifies that the artifact obeys it.

Adversarial review stress-tests the spec itself. When the spec is new or being substantively changed, QA cannot tell you whether the rules are right; it can only tell you whether the artifact follows the rules. A spec that codifies a wrong universal can pass every QA check and still ship a flawed system.

The whitepaper cover system shipped a v0.1 with universal "Recommendations to <institution>" labeling and required COI disclosures. QA passed. Adversarial review surfaced that those are genre-specific conventions and that the v0.1 spec had inadvertently universalized think-tank patterns. The fix changed the spec, not the artifacts.

## The four stages

### 1. Research

Build the institutional reference set before writing rules. For each genre the spec will cover, find 3-5 authoritative exemplars from real institutions. Read or page through them. Capture concrete observations:

- What is on the cover, in the body, in the back matter
- What conventions hold across the set, what diverges
- What the genre's "tells" are — the things that mark a document as belonging to this genre
- What this genre is NOT (the negative space)

Output: a research note (in the PR description, in the category guide, or in `docs/`) listing exemplars and observations. The note is the input to stage 2.

This stage is non-negotiable. Skipping it produces specs that codify the author's intuition or the most recently encountered exemplar as universal.

### 2. Debate

Spawn two reviewer agents (or two adversarial passes by the same agent) holding opposing positions on the most consequential open question.

Examples of debate prompts that produced useful tension on the whitepaper cover system:

- "Position A: Recommendations should always be labeled 'Recommendations to <institution>' for accountability. Position B: That label is genre-specific to think-tank briefs and inappropriate for CEO briefs and lab-tradition documents."
- "Position A: Every vendor-authored brief needs a COI disclosure block on the cover. Position B: COI belongs only when the recommendations directly benefit the author's commercial interest, otherwise it advertises insecurity."

The debate is structured: each side cites exemplars from the research stage; the goal is not consensus but exposure of the tradeoffs. The synthesizer (you, or a third agent) reads both arguments and decides how the spec should resolve the tension — usually with a genre-conditional rule (encoded via the YAML `modes:` field), sometimes by accepting one side, occasionally by reframing the question.

Output: a synthesis note enumerating which position won, which genre it applies to, and what rules drop out.

### 3. Synthesis

Translate the debate output into spec changes:

- Update the category guide (`categories/<category>/<topic>.md`).
- Update or add rules in `rules/visual-rules.yml`. Use genre-conditional annotations on the YAML `modes:` field (e.g. `modes: [ceo_brief, policy_brief]`) when the debate produced a genre-specific resolution.
- Update or add tokens in `tokens/`.
- Update the reference stylesheet or template in `build/`.
- Update the composition matrix in `foundations/composition.md` if a new cell or column was introduced.
- Update the sidebar in `_layouts/default.html` if a new page was added.

Cross-file consistency is critical: if a value appears in rules, foundations, and specimens, all three must match. The validators catch some of this; you catch the rest.

### 4. QA

Run the standard 3-agent QA workflow from `CLAUDE.md`:

1. Content review (no AI artifacts, voice consistency, factual accuracy)
2. Rules consistency (cross-file value alignment, sidebar coverage, validator pass)
3. HTML/render validation (specimens render, examples render, no broken links)

QA at this stage operates on the new spec. It tells you whether your artifacts obey it. If they don't, fix the artifacts; do not weaken the spec to match a sloppy artifact.

## Output of the workflow

A PR that includes:

- Research note (in PR description or linked category guide)
- Synthesis note explaining what changed and why (often the "Why this guide changed" section at the bottom of the category guide)
- Updated rules, tokens, foundations, and examples
- Passing validators and QA

The "Why this guide changed" section is part of the deliverable, not an afterthought. It is the audit trail that lets a future reader understand why the spec is what it is, and it is the warning to future cells thinking about reverting the change.

## When 3 loops vs. 5 loops

The four-stage workflow above (research / debate / synthesis / QA) describes one *iteration*. For most non-trivial cells, three iterations of the agent-team loop on the same artifact converge on correctness; a single loop catches only the most-obvious 30-40% of issues. PR #43 codified this in the LEARNINGS entry "Three-loop adversarial review converges; one loop misses." The default cadence is:

- **Loop 1 (cell-level prosecution).** Agents prosecute the cell's own rules, structure, and exemplar claims. Catches structural bugs (missing fields, broken references, undocumented voice profiles).
- **Loop 2 (cross-cell + inheritance + examples).** Agents prosecute the cell's interaction with neighboring cells, the integrity of inheritance chains, and the conformance of the example HTMLs to the cell's own spec. Catches integrity bugs (documentation-only inheritance, examples that violate their own cell, missing cross-references).
- **Loop 3 (external + recipe re-prosecution + enforcement).** Agents revisit the prior fixes from a fresh angle, prosecute enforcement viability (is the rule structurally testable, or only LLM-eval-able?), and look for refinement-grade issues. Catches the load-light bugs that only surface after the load-bearing ones are fixed.

For three classes of work, three loops are not enough. Add a Loop 4 and Loop 5:

- **Triggers for 5 loops:**
  - **(a) The work expands the npm package surface.** Any `package.json` `files` or `exports` change ships new content publicly; PII risk is real. (See `workflows/pii-review.md`.)
  - **(b) The work changes any rendering layer.** New or modified CSS, print stylesheets, paged-media specs. Static analysis cannot see overflow, clipping, font-loading races, or dark-on-dark contrast.
  - **(c) The cell is precedent-setting.** Future cells will cargo-cult its patterns; bugs that ship here propagate.

- **Loop 4: CSS / implementation audit.** A dedicated agent reads the CSS and implementation files line-by-line against the spec. PR #43's Loop 4 caught a `1280pt` vs. `1280px` slide-dimension bug that produced a silent ~33% oversize. CSS linters do not see semantic mismatches against tokens; this loop does.
- **Loop 5: render verification + external threat modeling.** Two parallel sub-passes:
  - *Render verification* (Loop 5R): open the artifact in a real browser via Playwright, measure layout, check for overflow / clipping / contrast / font-load timing. PR #43's 5R caught CTA bars clipped 90px below the page fold and timeline tables clipping ~50% of viewport content silently.
  - *Threat modeling* (Loop 5O): read the actual content of every file the package will ship and prosecute it as a security artifact, not a documentation artifact. PR #43's 5O caught the four classes of customer PII enumerated in `workflows/pii-review.md` ("Why this exists").

- **Loop 6+ (optional): external review pass.** External code-review bots (Gemini Code Assist, Claude Code Review, GitHub's review action) run ASYNC after internal loops complete. Treat their output as a separate review pass: read it, triage findings, fix the real ones, push back on the cargo-cult ones. This is parallel to internal loops, not part of them — a Loop 6 finding is not a "Loop 5 didn't catch it" failure, because external bots and internal agents see different surfaces.

### Per-loop agent count

Plan-agent recommendation: **4-5 parallel agents per loop, maximum**. Past that, the synthesis cost (reading the agents' outputs, deduplicating findings, resolving disagreements between agents) eats the gains from additional coverage. Confirmed in PR #43 Wave 1, where 5 agents per loop was the sweet spot and 7+ produced more synthesis overhead than incremental signal.

The exception: when the agents are prosecuting genuinely different surfaces (Loop 5R = render, Loop 5O = threat modeling), each surface gets its own 4-5 agents because their outputs don't overlap. The "max 4-5" cap is per-surface, not per-loop.

### When NOT to add Loop 4 and Loop 5

- Bug fixes (one-shot, reversible, narrow scope; no new public surface, no rendering change, no precedent).
- Token value tuning (numeric updates with no consuming-CSS change; structural validators catch the rest).
- Documentation polish (cosmetic; reviewer eyes catch this in PR).
- Rules updates within a stable schema (no new categories, no new public files, no rendering change).

The cost of 5 loops is real: 5 loops × 4-5 agents × ~15 min synthesis per loop ≈ 5 hours of structured review. The benefit is real too: PII catches, render-bug catches, and convergence on a spec that downstream cells can trust. Apply the cost-benefit honestly.

## Anti-patterns

**Skipping research and going straight to debate.** Two agents arguing without exemplars produces vibes, not principles. Always research first.

**Synthesizing into universal rules when the debate exposed a genre split.** If position A wins for genre X and position B wins for genre Y, the rule must be genre-conditional (use the `modes:` YAML field). Forcing one side to win across all genres is the failure mode the workflow exists to catch.

**Treating adversarial review as a one-way ratchet toward more rules.** Sometimes the right outcome of debate is removing or weakening a rule. The whitepaper cover system removed three "always required" rules and replaced them with genre-conditional rules — net rule count went down, but precision went up.

**Conflating adversarial review with code review.** This workflow stress-tests the spec. Code review (`pr-review-toolkit:code-reviewer`) checks that the implementation matches the spec. Both happen, in that order.

## See also

- `CLAUDE.md` — 3-agent QA workflow definition
- `LEARNINGS.md` — cross-cell principles that emerged from this and earlier reviews
- `categories/whitepapers/cover.md` — first surface to use this workflow; "Why this guide changed" section documents the v0.1 → v0.2 outcome
- `workflows/pii-review.md` — required Loop 5O companion when the work expands the npm package surface
