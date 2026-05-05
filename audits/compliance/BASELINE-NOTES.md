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

## Known classifier issue (v0.2 backlog)

121 rules are skipped with `llm-error: deterministic test had no recognized form`. These are rules whose `test:` block contains `min` or `max` fields but no `regex` for value extraction. The current loader marks them as deterministic (because `min`/`max` are deterministic markers in the schema) but the deterministic evaluator can't extract values without a regex.

Fix path for v0.2: in `load-rules.ts`, only classify as `deterministic` when at least one of `regex`, `pattern`, `value`, `values` is present. Rules with only `min`/`max` should fall through to `visual-llm` (or have a dedicated computed-style evaluator added).

These rules currently fail open (skipped, not blocking), so the misclassification is not a v0.1 launch blocker — it's a coverage gap.
