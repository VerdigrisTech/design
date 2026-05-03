---
layout: default
title: PII Review Workflow
status: rule
status_note: graduates from experimental immediately because the failure mode (public exposure of PII) is irreversible.
---

# PII Review Workflow

Mandatory pre-merge review for any change that expands the public surface of `@verdigristech/design-tokens`. Loop 5 of PR #43 caught customer PII (a cofounder's family scheduling, customer equipment serials, a Fortune 50 customer named directly, customer pilot names) inside `voice/team/*.yaml` profiles that had just been added to the npm package's `files` array. The render-and-threat-modeling agent caught it. The four prior loops did not. This workflow is the discipline behind the validator that catches the next instance before it reaches a merge queue.

## When to invoke

Run this review when ANY of the following is true on the branch:

- The `files` array in `package.json` has changed (added entry, expanded a glob, removed an exclusion).
- The `exports` field in `package.json` has changed (new export path, broadened wildcard, new conditional export).
- A file under `voice/team/*.yaml` has been added or modified.
- A new file has been added under any directory currently listed in `package.json` `files`. (The directory's inclusion is transitive — adding a new file inside it ships that file publicly without a `files` change.)
- Any commit adds customer-identifying details (names, sites, equipment IDs, vendor relationships, pilot names, internal-channel quotes) to a file that was previously clean. This applies even when the file already ships publicly — the file just gained PII it did not have before.

If none of the above is true, this workflow is not required. Run the standard 3-agent QA workflow (`CLAUDE.md`) and the adversarial review workflow (`workflows/adversarial-review.md`) for non-trivial design decisions.

## The principle

**Adding files to a public npm package is a security action, not a documentation action.**

Static analysis (rules consistency, schema validation, sidebar coverage, lint) prosecutes correctness, structure, and cross-file alignment. None of those passes can read the prose inside a voice sample and recognize "this is a child's volleyball schedule." The PII review is the human read of the actual content of the actual files that will land in the published tarball.

## Pre-flight checklist

Run every step. Stop and fix at the first failure; do not batch.

1. **Enumerate the tarball.** Run `npm pack --dry-run` (or `npm pack --json --dry-run` for machine-readable output) on the branch. Capture the exact list of files that would ship. This list is the audit set; nothing outside it needs PII review for THIS package, and everything inside it does.
2. **Diff against main.** Compute the set of files in the branch tarball that are NOT in the main tarball. These are the new public files. Every one of them gets a content scan in step 3.
3. **Scan new files for denylist patterns.** For each new file in the tarball, grep the content against the denylist (see next section). Any hit is a stop-the-line event: redact, rename, exclude, or escalate (see "What to do when PII IS found").
4. **Voice profile YAMLs get extra scrutiny.** For every `voice/team/*.yaml` that ships publicly, confirm the `Sources:` header (or equivalent provenance block) lists ONLY public corpus: published blog posts, talks, public Slack channels with documented consent, public LinkedIn posts. If a private channel appears in the source list, the profile must be redacted before shipping or the profile must be excluded from the package via `package.json` `files`.
5. **Example HTMLs get a customer-name pass.** For every file under `categories/*/examples/*.html` that ships publicly, customer names appearing in the artifact must be either (a) fictional placeholders ("Acme Life Sciences", "Globex Energy") OR (b) real names that have been documented as co-marketing-approved (signed case-study consent, public partner page, published joint press release). No third option. "Probably fine" is not a third option.
6. **New tokens, rules, workflows: redact internal quotations.** Any new YAML, JSON, or markdown file that quotes Slack, email, Linear comments, or other internal communications: rewrite to operational descriptors before merge. "Mark said in #team-z2o" becomes "the founder asked for X." Specific quoted text from internal channels is replaced with the operational summary.

## Denylist patterns

This is the starting set, not an exhaustive list. Maintainers expand it as new PII shapes are surfaced by review or by post-publish discovery. Treat the list as a living artifact.

- **Family scheduling and personal logistics.** Anything resembling "I have to take my [son/daughter/kid] to [activity] at [time]," "school pickup," "doctor appointment," named family members of any team member.
- **Customer equipment identifiers.** Strings matching `[A-Z]{3}\d{6,10}` (the BBE-class serial-number shape that surfaced in PR #43), specific facility nicknames ("Aurora", "Site B-3"), vendor relationship names ("One Power", "[Customer] deployment").
- **Named customers from a maintained customer denylist.** The current denylist (expand as needed): T-Mobile, Verizon, Abcam, and any customer in active pilot or signed contract whose name has not cleared a co-marketing review. The denylist lives next to this workflow doc; ask the GTM lead before adding or removing entries.
- **Internal channel names.** `#team-z2o`, `#eng-internal`, `#deals-private`, etc. References to private Slack channels in shipped content.
- **Names of team members in profile-source citations.** Profile YAMLs that ship must source from public corpus only. The team-name allowlist for `voice/README.md` and recipe metadata is documented in `build/lint-external.ts` ALLOWLIST.
- **Compensation, equity, hiring deliberations.** Any reference to specific salary numbers, equity percentages, candidate evaluation language. These never ship publicly.

## Allowlist mechanism

Legitimate exceptions exist: a co-marketing-approved customer name belongs in a published case-study cell; team-member names appear by design in `voice/README.md` and in cell guides that document voice recipes. The escape hatch for this is the `ALLOWLIST` constant in `build/lint-external.ts`. To allow a specific pattern in a specific file, add the file path and the pattern's `description` field to `ALLOWLIST`, then justify the exception in the PR description.

The allowlist is per-file and per-pattern, NOT per-pattern globally. "Allow team member name in `voice/README.md`" does not propagate to `voice/team/*.yaml`. This narrowness is the point: each exception is reviewable in isolation.

If you find yourself adding many entries to the allowlist for the same change, that is a signal that the change should be redacted at the source instead.

## What to do when PII IS found

Four options, in order of preference. Pick the highest-numbered option that fully resolves the finding.

1. **Redact.** Rewrite the offending content in place. A voice sample that mentions a customer becomes a voice sample that mentions "a recent customer." A schedule reference becomes "a personal commitment." Redaction preserves the file's public availability while removing the leakable detail. Best when the surrounding artifact has independent public value.
2. **Rename.** Replace specific identifiers with fictional placeholders and document the substitution in a comment or front matter note. "Abcam" becomes "Acme Life Sciences"; the example HTML still demonstrates the cell's structural rules. Best for example HTMLs and reference templates where the realism was a tutorial choice, not a load-bearing claim.
3. **Exclude.** Move the file out of the npm package by updating `package.json` `files` to omit the path (or by adding a more-specific exclusion). The file stays in the repo for internal use; it just doesn't ship. Best when the file's value is internal-only (the `voice/team/*.yaml` profiles fall here: useful for repo consumers, not useful for npm consumers).
4. **Escalate.** When none of the above resolves the finding (the PII is load-bearing in a deliverable that must ship and cannot be rewritten without losing the artifact's purpose), stop the merge and bring it to the GTM lead and the owner of the affected customer relationship. Escalation produces either a co-marketing approval that converts the situation to option 2, or a redesign of the deliverable that converts it to option 1 or 3.

Document the chosen option in the PR description. Reviewers should be able to see, for every flagged item, which option was applied and why.

## Validator integration

Wave 1 of the meta-tooling sprint adds a `checkPublicPackagePii()` validator to `build/validate-rules.ts`. The validator runs `npm pack --dry-run`, scans the tarball contents against the denylist, and fails the build on any hit. This workflow is the human discipline that backs the validator: the validator catches the patterns it knows; the human catches the new shapes the validator doesn't yet recognize and feeds them back into the denylist.

Both layers are required. The validator alone fails closed but with a fixed pattern set; the human review alone is fallible under deadline pressure. Combined, they form the layered defense — automated check catches recurrence, human review catches novelty.

Order of execution in CI: lint:external runs first (fast, broad), then validate:rules (which now includes the PII check on the tarball). A failure in either blocks merge.

## Why this exists

PR #43 (sales-collateral cells + voice profile YAMLs). Loop 5O — the render-verification + external-threat-modeling agent — was added to the adversarial review pattern late, after Loops 1-4 had finished and the rules, CSS, and integration looked clean. Loop 5O surfaced four classes of PII that the package, as configured at that point, would have published to anyone who installed `@verdigristech/design-tokens`:

- A cofounder's child-activity scheduling, captured verbatim from a Slack message corpus and embedded in a voice profile's Samples block.
- Customer equipment serial numbers (BBE-class) tied to specific facility sites and vendor relationships, embedded in another profile's diagnostic stories.
- A specific Fortune 50 customer (T-Mobile) named directly in a voice profile's prose ("the core T-Mobile deployment data").
- A customer pilot name (Abcam) referenced 12 times across the cell guides and example HTMLs, with no co-marketing approval on record.

The mitigations applied at the time: voice profile YAMLs were excluded from the npm package entirely; customer names were redacted from any file that did still ship; example HTMLs were renamed to fictional placeholders. Those mitigations are now permanent — but they only worked because Loop 5O happened. Without it, the package's `0.4.x` line would have shipped all four exposures.

The validator added in this sprint catches the same shapes automatically before push. This workflow is the human read that catches the next shape — the one we haven't seen yet.

## See also

- `workflows/adversarial-review.md` — when to run 3 loops vs. 5 loops; Loop 5 is where PII was caught
- `workflows/sales-collateral.md` — production checklist that now references this workflow
- `build/lint-external.ts` — internal-content linter and ALLOWLIST mechanism
- `build/validate-rules.ts` — `checkPublicPackagePii()` validator (added in the meta-tooling sprint)
- `LEARNINGS.md` "Public packages need a PII review" — the learning entry that produced this workflow
- `package.json` — `files` and `exports` fields are the load-bearing public-surface declarations
