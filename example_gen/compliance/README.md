# compliance-audit

Per-artifact compliance evaluator. Runs in CI via `npm run audit:compliance` and locally for fast feedback. See spec at `../docs/superpowers/specs/2026-05-04-compliance-audit-design.md`.

## Quick reference

- `npm run audit:compliance -- categories/slides/examples/foo.html` — local single-file run
- `npm run audit:compliance:smoke` — full live pipeline against one fixture (uses real LLM budget)
- `npm run test:compliance` — fixture self-test using recorded cassettes (no live LLM calls)
- `OPENAI_RECORD=1 npm run test:compliance` — re-record cassettes (requires `OPENAI_API_KEY`)

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
