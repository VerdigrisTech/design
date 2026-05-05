---
name: compliance-audit
description: |
  Per-artifact compliance audit. Use when asked to evaluate a committed example
  artifact (categories/{slides,one-pagers}/examples/*.html) against rules/visual-rules.yml,
  or to triage cohesion-audit + compliance-audit findings on a PR.
when_to_use: |
  Invoke when a producer asks "does this slide deck / one-pager comply with the design
  system?" or when reviewing a PR with compliance-audit findings. Run after `npm run
  validate:all` passes. Deterministic-only mode is fast; live LLM runs ~$5 to $12 per
  PR depending on artifact count.
allowed-tools:
  - Bash(npm run audit:compliance*)
  - Bash(npm run test:compliance*)
  - Bash(git log:*)
  - Bash(git rev-parse:*)
  - Bash(git diff*)
  - Read
  - Glob
  - Grep
arguments:
  - name: files
    description: Glob pattern matching artifacts to audit (e.g., categories/slides/examples/*.html)
    required: false
  - name: mode
    description: One of 'live' (LLM-assisted, ~$5 to $12), 'deterministic' (fast, visual+prose skipped), 'test' (cassettes, no live calls)
    required: false
---

# compliance-audit skill

This skill runs the per-artifact compliance evaluator against `rules/visual-rules.yml` and triages findings. It is one of three CI gates: `validate:rules` (rule-file shape), `compliance-audit` (this -- per-artifact), and `audit:cohesion` (cross-cell drift).

## When to invoke

- A producer asks "does this slide deck / one-pager comply with the design system?"
- A reviewer is looking at a PR comment from `design-system-ci` and wants to triage what's blocking
- You have edited `rules/visual-rules.yml` and want to confirm existing examples still comply
- You have authored a new example HTML and want a local check before pushing

## Run

```bash
npm run audit:compliance -- <file-or-glob>          # default: live LLM (~$5-$12 / PR)
npm run audit:compliance -- --no-llm <file-or-glob> # deterministic-only, fast
npm run test:compliance                             # fixture self-test (deterministic-only)
npm run test:compliance:unit                        # module unit tests (no live calls)
npm run audit:compliance:smoke                      # one-fixture live smoke
```

Flags:
- `--no-llm`     Deterministic-only run; skips visual + prose evaluators.
- `--smoke`      One-fixture live canary.
- `--baseline`   Run audit but exit zero regardless of blocking findings.
- `--budget=N`   Override USD budget. NOTE: ignored in CI; CI uses the
                 `COMPLIANCE_AUDIT_BUDGET_USD` env var (default 40). Locally
                 the flag accepts strict positive numbers; empty / non-numeric
                 / zero / negative values fail with exit code 2.

The latest report lives at `audits/compliance/{ts}-{sha}.md` (markdown) and `.json` (machine-readable). The runner exits non-zero on blocking findings unless `COMPLIANCE_AUDIT_BLOCKING=false` (the v0.1 default).

## Triage protocol

For each blocking finding, classify it as:

1. **Real violation.** Fix the artifact. Re-run to confirm.
2. **False positive (LLM misjudgment).** Inspect `findings[].llmAnswer` in the JSON report -- that's the model's verbatim answer. If misjudged, file a Linear ticket. If a single rule generates >2 false positives in a 7-day window, propose downgrading its `maturity` to `experimental` until the prompt is improved.
3. **Approved deviation.** Add an inline suppression to the artifact:
   ```html
   <!-- compliance-audit:ignore <rule-id> reason="<10+ chars>" linear="Z2O-NNNN" -->
   ```
   Both `reason=` and `linear=` are mandatory. The runner enforces syntax (≥10 chars, `^Z2O-\d+$`) but does not call the Linear API.

For advisory findings, surface them in the PR comment but do not block. Triage in a follow-up Linear cleanup epic.

For every PR with findings, either fix in the same PR or file a tracked ticket. Never silently suppress.

## Operational signal for the kill switch

Flip `COMPLIANCE_AUDIT_BLOCKING=false` at repo level when ANY of these fire:

- ≥3 PRs in a 7-day window add the `compliance-audit:advisory` label to bypass the gate
- A PR is blocked on a rule whose `llm_eval` finding is later judged false in PR review
- Audit exceeds budget on >25% of runs in a 7-day window

Document the decision in the flipping PR and file a Linear cleanup ticket. Flip back when the trigger no longer holds.

## What this skill does NOT do

- It does not validate the rules file's shape -- that's `validate:rules`.
- It does not check cross-cell drift -- that's `audit:cohesion`.
- It does not validate generated AI assets in `example_gen/` -- those have separate evaluator specs.
- It does not enforce PII scrubbing -- that's `workflows/pii-review.md`.
