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

Build the institutional reference set before writing rules. For each genre or mode the spec will cover, find 3-5 authoritative exemplars from real institutions. Read or page through them. Capture concrete observations:

- What is on the cover, in the body, in the back matter
- What conventions hold across the set, what diverges
- What the genre's "tells" are — the things that mark a document as belonging to this genre
- What this genre is NOT (the negative space)

Output: a research note (in the PR description, in the category guide, or in `docs/`) listing exemplars and observations. The note is the input to stage 2.

This stage is non-negotiable. Skipping it produces specs that codify the author's intuition or the most recently encountered exemplar as universal.

### 2. Debate

Spawn two reviewer agents (or two passes by the same agent in adversarial mode) holding opposing positions on the most consequential open question.

Examples of debate prompts that produced useful tension on the whitepaper cover system:

- "Position A: Recommendations should always be labeled 'Recommendations to <institution>' for accountability. Position B: That label is genre-specific to think-tank briefs and inappropriate for CEO briefs and lab-tradition documents."
- "Position A: Every vendor-authored brief needs a COI disclosure block on the cover. Position B: COI belongs only when the recommendations directly benefit the author's commercial interest, otherwise it advertises insecurity."

The debate is structured: each side cites exemplars from the research stage; the goal is not consensus but exposure of the tradeoffs. The synthesizer (you, or a third agent) reads both arguments and decides how the spec should resolve the tension — usually with a mode-conditional rule, sometimes by accepting one side, occasionally by reframing the question.

Output: a synthesis note enumerating which position won, which mode it applies to, and what rules drop out.

### 3. Synthesis

Translate the debate output into spec changes:

- Update the category guide (`categories/<category>/<topic>.md`).
- Update or add rules in `rules/visual-rules.yml`. Use mode-conditional annotations (`modes: [ceo_brief, policy_brief]`) when the debate produced a mode-specific resolution.
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

## Anti-patterns

**Skipping research and going straight to debate.** Two agents arguing without exemplars produces vibes, not principles. Always research first.

**Synthesizing into universal rules when the debate exposed a genre split.** If position A wins for genre X and position B wins for genre Y, the rule must be mode-conditional. Forcing one side to win across all modes is the failure mode the workflow exists to catch.

**Treating adversarial review as a one-way ratchet toward more rules.** Sometimes the right outcome of debate is removing or weakening a rule. The whitepaper cover system removed three "always required" rules and replaced them with mode-conditional rules — net rule count went down, but precision went up.

**Conflating adversarial review with code review.** This workflow stress-tests the spec. Code review (`pr-review-toolkit:code-reviewer`) checks that the implementation matches the spec. Both happen, in that order.

## See also

- `CLAUDE.md` — 3-agent QA workflow definition
- `LEARNINGS.md` — cross-cell principles that emerged from this and earlier reviews
- `categories/whitepapers/cover.md` — first surface to use this workflow; "Why this guide changed" section documents the v0.1 → v0.2 outcome
