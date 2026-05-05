# compliance-audit — design system CI gate for committed examples

**Status:** draft (v0.1)
**Owner:** Josh
**Date:** 2026-05-04

## Goal

Catch design system violations in committed example artifacts (`categories/*/examples/*.html`) at PR time, before they merge. Surface the same findings on rule-file changes, so rule edits cannot silently break existing examples.

This is a **QA tool**, not adversarial review. It checks that artifacts obey the spec. It does not stress-test whether the spec is right.

## Non-goals (v0.1)

- Generated assets in `example_gen/` (raster output, AI generations) — covered by the existing `example_gen/` evaluator specs.
- Live consumer surfaces (`www`, Patina). Those repos can adopt this tool later as a published action.
- Demo videos, interactive sandboxes, and any artifact without a stable HTML representation.
- Replacing `workflows/pii-review.md` or `workflows/adversarial-review.md`. Compliance-audit runs alongside, not instead of, those.
- A `.ignore.yaml` repo-wide suppression file (deferred to v0.2 — see "Suppression").

## Scope

### In-scope artifacts (v0.1)

`categories/{slides,one-pagers}/examples/*.html` only.

`whitepapers/` and `case-studies/` examples are out of scope until the rule coverage gap is closed (rules currently target slides + one-pagers cleanly; case-study and whitepaper rule subsets are sparse).

### In-scope rules (v0.1)

All rules in `rules/visual-rules.yml` whose applicability filter resolves to the artifact under evaluation. Applicability is determined by:

- Universal rules (no `modes:` field): apply to every artifact.
- Genre-scoped rules (with `modes:` field): apply iff the artifact's `data-genre` matches one of the listed modes (after normalization — see "Genre normalization").
- Type-scoped rules (`composition.slides.*`, `composition.persuade-pitch.*`, etc.): apply iff the artifact's category matches the rule's namespace.

### Rule classes by evaluator path

| Class | How identified | Evaluator |
|---|---|---|
| Deterministic | `test.regex`, `test.value`, `test.values`, `test.min`/`max`, `test.pattern` | Inline TS — no LLM |
| Visual LLM | `test.llm_eval` AND rule namespace ∈ `{brand, color, typography, components, elevation, accessibility, video, visualizations, three_d_composition}` | Vision model on rendered HTML screenshot |
| Prose LLM | `test.llm_eval` AND rule namespace ∈ `{voice, brand_rejections.voice, composition.*.voice}` OR rule prompt references diction/tone/audience-fit | Text model with extracted prose + relevant `voice/team/*.yaml` profiles loaded as context |

The classifier is a deterministic dispatch — not LLM triage. Each rule's class is computed once at startup from its id namespace and prompt text. A rule with both visual and prose elements is run twice and both must pass.

## Trigger

GitHub Actions workflow runs on:

1. PRs whose changed-files set includes any path matching `categories/{slides,one-pagers}/examples/*.html` — evaluates only the changed examples.
2. PRs that touch `rules/visual-rules.yml` — for each rule whose `modes:` field changes (or whose `test:` block changes), evaluates every example whose `data-genre` (normalized) matches that rule's modes. Universal-rule changes evaluate all in-scope examples.
3. Manual dispatch with a file glob argument, for local-equivalent reruns.

A PR that only touches docs / tokens / build is not triggered.

## Inputs

- The HTML file(s) to evaluate.
- `rules/visual-rules.yml` at the PR's HEAD.
- `voice/recipes.yaml` and `voice/team/*.yaml` at HEAD (for prose evaluator).
- Repo metadata (PR number, head SHA, base SHA).

The HTML is parsed for `<body>` attributes — `data-genre`, `data-confidentiality`, optional `data-type` — to determine applicable rules. **No YAML frontmatter is parsed; examples don't use it.**

## Genre normalization

The rules file uses underscore form (`pilot_kickoff`); HTML uses hyphen form (`pilot-kickoff`). Compliance-audit normalizes both sides to underscore form at lookup time. A follow-up Linear ticket will be filed to align the file conventions and remove the normalizer.

## Pipeline

```
1. classify       – read HTML, extract data-genre, dispatch rules into deterministic / visual-LLM / prose-LLM buckets
2. det-eval       – run deterministic rules inline; collect findings
3. visual-batch   – render the HTML to a screenshot (Playwright headless, full-page, 2x DPR), batch ≤8 yes/no rules per vision call, collect findings
4. prose-batch    – extract prose from HTML (text content of body, ignoring code/style/script), load voice context, batch ≤8 yes/no rules per text call, collect findings
5. cost-gate      – before each LLM batch, check accumulated cost vs. $40 cap; if remaining < estimated batch cost, stop LLM evaluation, mark remaining rules as "skipped — budget exceeded", continue to synthesize
6. synthesize     – group findings by severity + maturity; compute blocking vs. advisory subsets
7. report         – write audits/compliance/{ts}-{sha}.{md,json}; render markdown for PR comment
8. publish        – post or update sticky PR comment via gh CLI; set GitHub status check to red/green/neutral per blocking-mode
```

Each step is a separate function in a single TS module. No agent fan-out, no per-rule subprocess. The "team of agents" framing is wrong for this workload — the rules are atomic, the LLM calls are batched, the synthesis is straightforward grouping.

## Cost model

- Hard cap: $40/PR (configurable via env var).
- Realistic spend per PR (1–3 examples, ~80 applicable rules): $5–$12.
- Cache key: `sha256(html_content + rule_id + rule_test_block + voice_profile_set)`. Cache hits cost $0. Real-world hit rate likely 15–25% (low; cache is for retry/rerun cases, not a primary cost lever).
- If estimated cost of next batch would exceed remaining budget, the runner skips remaining LLM rules, reports those as "skipped — budget exceeded," and writes a banner in the PR comment. **Skipped rules do not contribute to pass/fail.** A skipped error-severity rule does NOT block.

## Blocking gate

Default posture: any finding with `severity: error` AND `maturity: rule` or `invariant` blocks merge.

Two kill-switches override the default:

- **Repo-level:** `COMPLIANCE_AUDIT_BLOCKING` env var on the workflow (default `true`). When `false`, status check is set to neutral regardless of findings. Comment still posts.
- **Per-PR:** label `compliance-audit:advisory` on the PR. When present, status check is neutral for that PR only. Comment still posts.

Both kill-switches are visible in the PR comment header (`🚫 BLOCKING` vs. `📝 ADVISORY (repo-level kill switch)` vs. `📝 ADVISORY (per-PR override)`).

`severity: warning` and `maturity: experimental | convention` findings always go in the comment as advisory.

## Suppression (v0.1)

Single mechanism: inline HTML comment in the artifact.

```html
<!-- compliance-audit:ignore brand.visual.no-generic-imagery reason="approved by Mark for Apex pilot" linear="Z2O-1402" -->
```

Required fields: `<rule-id>`, `reason="<text>"`, `linear="<ticket>"`. The `linear:` field is **mandatory** — no Linear ticket, no suppression. Each suppression is logged in the audit report (file, rule, reason, ticket, PR that introduced it). v0.2 may add a `.ignore.yaml` for batch-level suppressions if a real need emerges; v0.1 ships only the inline form to keep the suppression set auditable.

## PR comment format

Sticky (one comment per PR, edited on each run, identified by a hidden marker `<!-- compliance-audit:sticky -->`). Sections:

```
{🚫 BLOCKING | 📝 ADVISORY ({reason})}  •  evaluated {N} examples  •  {pass|fail}  •  ${cost} / $40  •  updated {timestamp}

Failures (block merge)         — N
Advisory findings              — N (collapsed)
Skipped (budget / errors)      — N (collapsed)
Passed                         — N (collapsed)

Run locally: npm run audit:compliance -- {file-glob}
Full report: audits/compliance/{ts}-{sha}.md
```

The header timestamp + cost line tells reviewers the comment was just updated. The `Skipped` section is non-empty only when the budget gate fired or LLM calls errored; it explicitly enumerates which rules did NOT run, so reviewers know the state.

## Local parity

```
npm run audit:compliance -- categories/slides/examples/foo.html [--no-llm] [--budget=10]
```

Same code path as CI. `--no-llm` skips all LLM rules (deterministic only) for fast local feedback. `--budget=N` overrides the cap for cost-controlled local exploration.

## File layout

```
example_gen/compliance/
  runner.ts                     – classify, dispatch, synthesize, write report
  classify.ts                   – HTML parsing, rule classification, applicability filter
  evaluator-deterministic.ts    – regex/value/values/min-max/pattern checks
  evaluator-visual.ts           – Playwright render + vision model batch caller
  evaluator-prose.ts            – text extraction + text model batch caller w/ voice context
  cost-tracker.ts               – budget accounting + cache
  reporter.ts                   – md/json output, sticky-comment markdown
  cli.ts                        – npm-script entry point

.github/workflows/
  compliance-audit.yml          – PR trigger, env wiring, gh comment + status check

.claude/skills/compliance-audit/
  SKILL.md, README.md, DESIGN.md   – Claude Code skill for human-driven runs

audits/compliance/
  .gitkeep
  {ISO-utc}-{git-sha}.{md,json}    – outputs

tests/compliance/fixtures/         – seeded passing + failing examples for self-test
```

`example_gen/compliance/` lives as a sibling to the existing narrative-eval / visual-eval / per-image-eval specs. It does NOT live under `build/audit/` because that namespace is for system-internal validation (cohesion, rule-file shape) and this auditor is artifact-focused and LLM-first.

## Reuse vs. fork (vs. cohesion-audit, build/validate-rules.ts)

- **Steal from cohesion-audit:** the skill structure, the `audits/<name>/{ts}-{sha}.{md,json}` output convention, the fixture-based self-test pattern, the npm-script entry naming.
- **Steal from `build/validate-rules.ts`:** rule-file loader and YAML parser. Do not reimplement YAML parsing.
- **Fork the runner.** cohesion-audit's `cohesion.ts` is a deterministic walker. Compliance-audit's runner is an LLM-batching pipeline with cost accounting. Different abstraction; reusing the cohesion shape would compromise both.

## Failure modes accepted in v0.1

- **Day-one violation count.** Blocking is on by default but can be flipped repo-wide if it chokes the team. Realistic expectation: first PR after merge will fire several rules; expect to flip to advisory for ~1 week while the team triages, then flip back.
- **LLM false positives.** Each finding includes the rule's `llm_eval` prompt text and the model's verbatim answer in the JSON report so reviewers can spot bad calls. Persistent false-positive rules graduate to a Linear cleanup ticket and (if rule is wrong) get downgraded to `experimental` until fixed.
- **Gaming via `data-genre` lies.** A producer can change `data-genre` to dodge rules. v0.1 does not prevent this. v0.2 adds a cross-check that `data-genre` matches the file's location (slides/examples/*.html ⇒ genre ∈ slides genres).

## Out of scope, deferred to v0.2 or later

- `.ignore.yaml` for batch suppressions
- Genre↔location consistency check
- Whitepaper + case-study coverage
- `www` / Patina integration as a reusable GitHub Action
- Per-rule false-positive precision tracking → automated demotion of unreliable rules
- Generated-asset coverage (existing `example_gen/` specs handle that)

## Open questions

None blocking implementation. Linear tickets to file as part of v0.1 ship:

- Genre string convention alignment (rule modes vs. HTML data-genre — pick one).
- First-week triage of pre-existing violations surfaced on initial run.
- Whitepaper + case-study rule coverage gap.
