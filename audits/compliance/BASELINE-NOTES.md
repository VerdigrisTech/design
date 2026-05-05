# compliance-audit baseline notes

## Day-one inventory

| Artifact set | Files | Det blocking | Det advisory | LLM-skipped (need API key) | Passed |
|---|---|---|---|---|---|
| `categories/{slides,one-pagers}/examples/*.html` | 4 | 40 | 28 | 121 | 36 |

**Baseline JSON:** `baseline-deterministic-<sha>.json` (this directory)

Generated: 2026-05-05 deterministic-only run via `npm run audit:compliance -- --no-llm --baseline`. Full LLM-augmented baseline pending — re-run with `OPENAI_API_KEY` set:

```bash
npm run audit:compliance -- --baseline
SHA=$(git rev-parse --short HEAD)
cp $(ls -t audits/compliance/*.json | head -n1) audits/compliance/baseline-full-$SHA.json
git add audits/compliance/baseline-full-*.json
git commit -m "chore(compliance-audit): full-LLM baseline"
```

## Day-one launch decision

40 deterministic blocking findings exist on existing artifacts. Branch protection requiring `compliance-audit` to pass would block every PR that touches an in-scope artifact until those are cleaned up.

**Recommendation per spec ("C with toggle"):**
1. Land this branch with `COMPLIANCE_AUDIT_BLOCKING` repo variable set to `false` (advisory mode).
2. File a Linear cleanup epic to triage the 40 baseline findings.
3. Once baseline is ≤5 findings, flip `COMPLIANCE_AUDIT_BLOCKING=true` and protect `main` with the `compliance-audit` status check.

## Classifier coverage (resolved)

Earlier baseline runs surfaced 121 rules skipped with `llm-error: deterministic test had no recognized form`. Root cause: the loader treated bare `min`/`max` (no `regex`/`value`/`values`/`pattern`) as deterministic, but the deterministic evaluator has no extractor for unanchored numeric bounds against raw HTML. Fixed in `example_gen/compliance/load-rules.ts`: rules with `llm_eval` OR without an extractor now fall through to `visual-llm`. Post-fix counts: 198 total / 168 visual / 4 prose / 26 deterministic. Re-run the baseline once `OPENAI_API_KEY` is available to capture the LLM-classified rules' actual findings.
