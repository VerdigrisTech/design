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
