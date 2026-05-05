# compliance-audit

Maintainer-facing guide for the `/compliance-audit` skill. Skill instructions live in `SKILL.md`; design rationale lives in `DESIGN.md`.

## What it does

`/compliance-audit` evaluates one or more committed example artifacts (`categories/{slides,one-pagers}/examples/*.html`) against the rules defined in `rules/visual-rules.yml`. It is the per-artifact enforcement layer; cohesion-audit checks the system as a whole, compliance-audit checks one artifact at a time.

The evaluator is hybrid:
1. **Deterministic** -- regex-detectable patterns (missing `data-genre`, invalid class prefix, bounds violations)
2. **Visual** -- LLM-assisted screenshot comparison (`gpt-4o` vision) against rule visual examples and constraints
3. **Prose** -- LLM-assisted text evaluation of heading hierarchy, copywriting tone, PII leakage, etc.

Findings are classified as **blocking** (must fix before merge) or **advisory** (track in cleanup epic). The runner writes a markdown report and a JSON sidecar to `audits/compliance/`. The JSON is the source of truth for triage; the markdown is the human surface.

## When to run it

Decision rule:

- **Every PR touching `categories/*/examples/`:** Before merge, run the compliance audit on that file or glob.
- **Every rule change:** After editing `rules/visual-rules.yml`, run audit on a representative sample of existing artifacts to confirm no new false positives.
- **Before shipping a new example:** A producer creates `categories/<cell>/examples/new-example.html`, then asks `/compliance-audit categories/<cell>/examples/new-example.html` before pushing.
- **Triage PR findings:** The CI job posts a comment with blocking findings; run `/compliance-audit` to inspect the JSON report and classify findings (real, false positive, approved deviation).

Do not run as a strict merge gate in v0.1; the LLM judgment path is still settling. Use `COMPLIANCE_AUDIT_BLOCKING=true` (default) to gate CI, but maintain per-PR override via `compliance-audit:advisory` label. Once false-positive rate stabilizes <5% across dimensions, promote to hard gate.

## How to interpret findings

Two tiers:

- **blocking** -- the artifact violates a rule constraint and must be fixed before merge. Example: a slide marked `data-genre="lab_tradition"` but uses a color from the `advisory` palette (restricted to `policy_brief`). Or the heading fails the hierarchy check (rules say "max 3 levels per deck" but artifact has 4).
- **advisory** -- the artifact may violate a rule or show potential risk, but is not automatically blocking. Example: a one-pager exceeds the recommended line-length by 8 characters, or includes a photo where the rule suggests "photo or illustration" (valid). File under cleanup epic; decide per-finding whether to fix or suppress.

Suppression contract:

```html
<!-- compliance-audit:ignore <rule-id> reason="<10+ chars>" linear="Z2O-NNNN" -->
```

The `reason=` must be ≥10 characters (rationale auditable in diff view). The `linear=` ticket must exist and be referenced in the suppression (no tickets = finding becomes a blocker on next audit). The runner validates syntax but does not call the Linear API; maintainers verify offline.

## How to handle a false positive

1. Open the JSON report (`audits/compliance/{ts}-{sha}.json`)
2. Find the finding by `rule_id` + artifact path
3. Inspect `findings[].llmAnswer` (the model's verbatim response) and `findings[].prompt` (what was asked)
4. If misjudged:
   - File a Linear ticket with the category `compliance-audit:false-positive`, title "FP in rule X", and details from step 3
   - If a single rule fires >2 false positives in a 7-day window, propose downgrading its `maturity` to `experimental` in `rules/visual-rules.yml` until the prompt is improved
5. For that PR, add the `compliance-audit:advisory` label to bypass the gate while the false positive is triaged

## Configuration

| Env var / setting | Where | Default | Purpose |
|---|---|---|---|
| `OPENAI_API_KEY` | repo secret | unset | Required for live LLM calls. Self-test (`test:compliance`) does not need it. |
| `COMPLIANCE_AUDIT_MODEL` | env | `gpt-4o` | OpenAI model ID used for both vision and prose evaluators. |
| `COMPLIANCE_AUDIT_BUDGET_USD` | env | `40` | Hard per-PR cost cap. Local CLI `--budget=N` cannot raise this in CI. |
| `COMPLIANCE_AUDIT_BLOCKING` | repo variable | `true` | Set to `false` (string) to make compliance-audit advisory-only repo-wide. The PR comment still posts. |
| `compliance-audit:advisory` | PR label | n/a | Per-PR override; that PR runs in advisory mode regardless of repo setting. |

## When something looks wrong

1. **False positive on a visual rule.** Inspect the JSON report — `findings[].llmAnswer` shows the model's verbatim answer. If misjudged, file a Linear ticket; if persistent across runs, propose downgrading the rule's `maturity` to `experimental` until the prompt is improved.
2. **Skipped rules ("budget" or "render").** Re-run locally with `npm run audit:compliance -- <file>` and inspect. Render failures usually mean the HTML references missing assets — fix the artifact or the asset path.
3. **Cassette drift.** If `npm run test:compliance` fails after a rule prompt change, re-record: `OPENAI_RECORD=1 npm run test:compliance` (requires `OPENAI_API_KEY`).
4. **Out of budget.** If the audit stops mid-run due to budget exhaustion, the report is incomplete. Cost-tracker saves partial findings up to the limit. Increase `COMPLIANCE_AUDIT_BUDGET_USD` and re-run, or run deterministic-only with `npm run audit:compliance -- --no-llm <files>`.

## Updating model pricing

Edit `example_gen/compliance/pricing.json`. Cost-tracker reads it at startup.

## Adding a new artifact type (whitepapers, case-studies)

1. Add the type → namespace mapping in `example_gen/compliance/classify.ts` `TYPE_NAMESPACES`.
2. Confirm `rules/visual-rules.yml` has rules with the new namespace (`composition.whitepaper-body.*`, `composition.case-study.*`).
3. Add fixtures under `tests/compliance/fixtures/{passing,seeded-failures}/<new-type>/`.
4. Update `tests/compliance/fixtures/expected.json`.
5. Update `example_gen/compliance/cli.ts` default glob.
6. Test locally: `npm run audit:compliance -- tests/compliance/fixtures/passing/<new-type>/*.html`

## Files

| Path | Purpose |
|---|---|
| `example_gen/compliance/runner.ts` | Pipeline orchestrator |
| `example_gen/compliance/classify.ts` | HTML → Artifact + applicability filter |
| `example_gen/compliance/load-rules.ts` | YAML loader + classifier |
| `example_gen/compliance/evaluator-{deterministic,visual,prose}.ts` | The three evaluator paths |
| `example_gen/compliance/openai-client.ts` | LLM wrapper with retry, cache, cassette, budget |
| `example_gen/compliance/synthesize.ts` | Group findings into blocking/advisory/skipped buckets |
| `example_gen/compliance/reporter.ts` | Write `audits/compliance/{ts}-{sha}.{md,json}` |
| `example_gen/compliance/cli.ts` | `npm run audit:compliance` entry point |
| `example_gen/compliance/test-compliance.ts` | Fixture self-test runner |
| `example_gen/compliance/pricing.json` | Per-token rates for cost tracking |
| `tests/compliance/fixtures/` | Passing + seeded-failure HTML, `expected.json` |
| `.github/scripts/render-pr-comment.ts` | Renders the sticky PR comment from `compliance-summary.json` + `cohesion-summary.json` |
| `.github/workflows/build.yml` | Wires the 3-check gate |
