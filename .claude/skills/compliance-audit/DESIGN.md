# compliance-audit -- design notes

## Why this isn't cohesion-audit

cohesion-audit (PR #47) validates the design system itself for cross-cell drift; it is fully deterministic. compliance-audit validates a *committed example artifact* against rules and is LLM-first by necessity (the majority of rules use `llm_eval`). Different problem, different abstraction. compliance-audit reuses cohesion-audit's reporting+skill conventions but forks the runner.

## Why gpt-4o (single model)

A single multimodal model handles both visual and prose evaluation paths, keeping the auth surface and cost model simple. If costs balloon or a cheaper model handles a subset cleanly, route by `evaluatorClass` to a smaller model in v0.2.

## Pipeline ordering rationale

1. **classify** — fail fast on missing `data-genre` or unsupported path.
2. **deterministic** — runs first because it's free, fast, and catches the highest-precision failures (regex-detectable patterns and bounds).
3. **render** — Playwright is the slowest single step; doing it before LLM calls means a single render serves all visual batches.
4. **visual-batch then prose-batch** — order doesn't matter logically; visual goes first because the screenshot is in memory.
5. **cost-gate** — interleaved before each LLM batch; skipped rules don't block.
6. **synthesize** — pure function; no IO.
7. **report + publish** — IO, deferred to last.

The ordering ensures: (a) the cheapest and most-precise checks run first; (b) a single Playwright render is amortized; (c) budget exhaustion stops gracefully without losing prior results.

## Why suppression is inline-only in v0.1

A repo-wide `.ignore.yaml` becomes a graveyard. Inline suppression with mandatory `linear=` ticket forces every suppression to be (a) attached to the artifact it affects, so removing the artifact removes the suppression, and (b) tracked against a Linear ticket so the cleanup work can be scheduled.

v0.2 may add `.ignore.yaml` only if real demand surfaces (e.g., a single rule fails on 50+ artifacts and the inline approach becomes verbose).

## Day-one strategy

The plan is C-with-toggle: ship blocking by default, but provide repo-level (`COMPLIANCE_AUDIT_BLOCKING=false`) and per-PR (`compliance-audit:advisory` label) kill switches. Day-one will likely surface 10+ blocking findings on existing artifacts (the deterministic-only smoke run found 10 on `abcam-kickoff-redux.html`); operators can flip to advisory for ~1 week while a cleanup epic addresses them, then flip back.

The baseline JSON committed in Task 19 documents the day-one inventory so the cleanup epic has a fixed target.

## Why LLM findings need cassettes

LLM calls are non-deterministic and expensive. The test suite uses HTTP cassettes (recorded request/response pairs) to replay prior OpenAI calls without hitting the live API. This keeps `npm run test:compliance` fast and free, while `npm run audit:compliance:smoke` (live mode) validates the LLM path end-to-end on a single small fixture.

Cassette format: HAR (HTTP Archive). Recorded once with `OPENAI_RECORD=1 npm run test:compliance`, then committed. When rule prompts change, cassettes become stale and tests fail; re-record to update.

## v0.2 backlog

- Whitepaper + case-study coverage (TYPE_NAMESPACES + rule subsets)
- `.ignore.yaml` for batch suppressions (only if real demand emerges)
- Linear API verification of `linear=` ticket existence/status
- Per-rule false-positive precision tracking → automated demotion to `experimental`
- `www` / Patina integration as a published GitHub Action
- Smaller-model routing for cheap rules (e.g., gpt-4o-mini for short prompts)
- Cassette-based LLM testing in `test:compliance` (currently deterministic-only)
- `data-genre` ↔ file-path consistency check (gaming defense)
- Artifact-level SLA ("this example is binding until Q3 2026")

## Cost accounting

v0.1 targets ~$12 per PR for a typical run (5 artifacts, mix of visual+prose). Cost is driven by:
- **vision**: $0.01/1k tokens, typical 1–2k tokens per artifact
- **prose**: $0.003/1k input, $0.015/1k output, typical 2–3k tokens per artifact
- **rendering**: N/A, no cost (Playwright is local)
- **deterministic**: N/A, no cost (regex + bounds)

The `COMPLIANCE_AUDIT_BUDGET_USD=40` default allows 3–4 typical PRs. If a PR exceeds budget mid-run, the audit stops and the report is marked incomplete. Operators can increase the budget for that PR or re-run in deterministic-only mode.

Cost-tracker logs per-rule spending in the JSON sidecar (`findings[].tokensCost`, `findings[].tokensDelta` vs. estimate). Over time, this informs cheaper prompts or smaller-model routing in v0.2.
