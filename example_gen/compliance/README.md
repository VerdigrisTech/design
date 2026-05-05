# compliance-audit

Per-artifact compliance evaluator. Runs in CI via `npm run audit:compliance` and locally for fast feedback. See spec at `../docs/superpowers/specs/2026-05-04-compliance-audit-design.md`.

## Quick reference

- `npm run audit:compliance -- categories/slides/examples/foo.html` -- local single-file run
- `npm run audit:compliance -- --no-llm <path>` -- deterministic-only, fast (no API key required)
- `npm run audit:compliance:smoke` -- full live pipeline against one fixture (uses real LLM budget)
- `npm run test:compliance` -- fixture self-test, deterministic-only (no live LLM calls)
- `npm run test:compliance:unit` -- module unit tests
- `OPENAI_RECORD=1 npm run test:compliance` -- re-record cassettes (requires `OPENAI_API_KEY`)

## Cassettes

Live LLM responses are persisted under `tests/compliance/cassettes/` so the
self-test can replay them without paying for a live call. Cassette behavior:

- `OPENAI_RECORD` unset (default): cassette hits are replayed; cassette misses
  hit the live API only if `OPENAI_API_KEY` is set, otherwise the call fails.
- `OPENAI_RECORD=1`: every live call is written back to the cassette dir,
  overwriting prior entries with the same key. Use this to refresh cassettes
  after a model change or rule edit. Requires `OPENAI_API_KEY`.

Cassette keys are derived from a stable hash of the request payload (sorted
keys, namespaced by `CACHE_NAMESPACE_VERSION` in `cache.ts`); refactors that
re-order request fields do NOT invalidate the cassette, but bumping the
namespace version does.

## CLI flags

- `--no-llm`            Deterministic-only run; skips visual + prose evaluators.
- `--smoke`             Run the live pipeline against one fixture (canary).
- `--baseline`          Run audit but exit zero regardless of blocking findings (used to capture day-one inventory).
- `--budget=N`          Override budget in USD. Ignored in CI; CI uses `COMPLIANCE_AUDIT_BUDGET_USD` (default 40). Strict positive number; `--budget=0`, `--budget=` and non-numeric values fail with exit code 2.
- positional path/glob   File(s) to audit. Defaults to `categories/{slides,one-pagers}/examples/*.html`. Glob characters in PowerShell may need quoting.

## Output

- `audits/compliance/{ISO-utc}-{git-sha}.md` — human-readable report
- `audits/compliance/{ISO-utc}-{git-sha}.json` — machine-readable findings

## How to enable as a merge gate

v0.1 ships as **advisory only** ([Z2O-1359](https://linear.app/verdigris/issue/Z2O-1359)). The workflow runs and posts a sticky PR comment, but compliance findings do not fail the build. To promote it to a hard gate:

1. **Add the API key.** In the repo settings → Secrets and variables → Actions, add `OPENAI_API_KEY`. Without it, the compliance step skips cleanly and the PR comment notes "skipped — OPENAI_API_KEY not configured".
2. **Capture a full LLM baseline.** With the key set locally, run `npm run audit:compliance -- --baseline` and commit the resulting `audits/compliance/baseline-full-{sha}.json`. This documents the day-one inventory before the gate goes live.
3. **Triage the baseline.** File a Linear cleanup epic and resolve blocking findings until the count is something the team is comfortable gating on (recommended: ≤5).
4. **Flip the toggle.** In `.github/workflows/build.yml`, change `COMPLIANCE_AUDIT_BLOCKING: "false"` to `"true"` (single line, in the `Audit compliance` step's `env` block).
5. **Add to branch protection.** In repo settings → Branches → branch protection rule for `main`, require the `build` status check (which now incorporates `compliance-audit`).

Local-only enable for development:
```bash
export OPENAI_API_KEY=sk-...
npm run audit:compliance -- categories/slides/examples/abcam-kickoff-redux.html
```
