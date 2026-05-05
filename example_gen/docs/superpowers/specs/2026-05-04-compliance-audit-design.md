# compliance-audit — design system CI gate for committed examples

**Status:** draft (v0.1)
**Owner:** Josh
**Date:** 2026-05-04

## Goal

Catch design system violations in committed example artifacts (`categories/*/examples/*.html`) at PR time, before they merge. Surface the same findings on rule-file changes, so rule edits cannot silently break existing examples.

This is a **QA tool**, not adversarial review. It checks that artifacts obey the spec. It does not stress-test whether the spec is right.

## CI integration: three checks, not one

Compliance-audit is the third leg of a three-check CI gate. The other two already exist; this spec adds the missing leg and wires all three into `.github/workflows/build.yml` so every PR runs all three.

| Check | What it validates | Scope | Day-one gate |
|---|---|---|---|
| `npm run validate:rules` (existing) | The rules file itself is well-formed (YAML shape, `test:` blocks present, conventions, no emdashes) | `rules/visual-rules.yml` only | Blocks on any error (already does) |
| `npm run audit:compliance` (this spec, new) | Per-artifact compliance: a given example artifact obeys applicable rules | `categories/{slides,one-pagers}/examples/*.html` | Blocks on `severity: error` + `maturity: rule | invariant`. Advisory for `experimental | convention | warning` |
| `npm run audit:cohesion` (PR #47, existing) | Cross-cell drift: shared infrastructure stays consistent (token/CSS sync, hardcoded colors across layouts, orphan/ghost classes, genre tree) | Runs wide: `_layouts/`, `tokens/`, `build/print/`, `categories/`, `rules/visual-rules.yml` | Blocks only on `critical` findings. `should-fix` and `note` are advisory in PR comment |

**Per-artifact validator alone misses drift in shared infrastructure** — that's why cohesion-audit runs alongside, not instead. Both surface failures via the same sticky PR comment infrastructure (separate sections), so reviewers get one comment with both gates' results.

Re-run triggers:

- Changes to `rules/visual-rules.yml` → re-run compliance-audit against every example matching applicable `modes:` (per existing trigger logic) AND re-run cohesion-audit (rules file is in cohesion's scope already).
- Changes to `tokens/**/*.json` → re-run cohesion-audit (token-CSS sync is a cohesion dimension).
- Changes to `categories/{slides,one-pagers}/examples/*.html` → re-run compliance-audit on changed files.
- All three checks always run on every PR regardless of changed-files set; the trigger logic above just narrows what each check evaluates.

**Day-one posture for cohesion-audit:** gate only on `critical` findings. PR #47's first live run produced 94 findings of which 0 were critical, so this gate is safe at launch. The 94 findings are surfaced as advisory and triaged in a follow-up wave.

## Non-goals (v0.1)

- Generated assets in `example_gen/` (raster output, AI generations) — covered by the existing `example_gen/` evaluator specs.
- Live consumer surfaces (`www`, Patina). Those repos can adopt this tool later as a published action.
- Replacing or restructuring `audit:cohesion` or `validate:rules`. This spec adds compliance-audit as a third sibling and wires all three into the same workflow; it does not modify the other two.
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

Rules come from a single source: `rules/visual-rules.yml`. The `voice/recipes.yaml` and `voice/team/*.yaml` files are **evaluation context**, not rule sources.

Every top-level namespace in `rules/visual-rules.yml` routes to exactly one default class. The complete partition for v0.1:

| Default class | Top-level namespaces |
|---|---|
| Visual LLM | `brand_rejections` (visual subkeys), `color`, `typography`, `spacing`, `motion`, `components`, `breakpoints`, `elevation`, `accessibility`, `device_accessibility`, `video`, `visualizations`, `three_d_composition` |
| Prose LLM | `composition` (when rule id contains `.voice.`, `.diction.`, `.tone.`, or `.audience-fit.`); `brand_rejections.voice` subtree |
| Deterministic | Any rule whose `test:` block uses `regex`, `value`, `values`, `min`/`max`, or `pattern` (independent of namespace) |

Resolution order at startup: (a) if `test:` is deterministic, classify as Deterministic; (b) else if rule id matches the prose substring set above, classify as Prose LLM; (c) else classify as Visual LLM. The substring set is the only "soft" signal in the classifier and is enumerated explicitly above — no free-form prompt-text inspection.

A rule that should run as both visual and prose (rare) declares `evaluator: ["visual", "prose"]` as a peer of `test:`. The runner runs both and both must pass. v0.1 does not require this field on any existing rule; it's a forward-compat hook.

Unknown namespaces (added after v0.1 ships) emit a warning at startup and default to Visual LLM. The validator (`build/validate-rules.ts`) gains a check that every namespace is in the partition above and fails CI if not.

## Trigger (compliance-audit only)

The compliance-audit job runs on every PR, but its evaluation set is filtered:

1. If the changed-files set includes paths matching `categories/{slides,one-pagers}/examples/*.html`, evaluate those changed examples.
2. If `rules/visual-rules.yml` is in the changed-files set, for each rule whose `modes:` field changes (or whose `test:` block changes), additionally evaluate every example whose `data-genre` (normalized) matches that rule's modes. Universal-rule changes evaluate all in-scope examples.
3. If neither (1) nor (2), the job exits early as a no-op and posts no comment for compliance-audit's section.
4. Manual dispatch with a file-glob argument supports local-equivalent reruns.

`audit:cohesion` and `validate:rules` always run regardless of changed-files (their cost is bounded; cohesion-audit is ~0.32s per PR #47).

## Inputs

- The HTML file(s) to evaluate.
- `rules/visual-rules.yml` at the PR's HEAD.
- `voice/recipes.yaml` and `voice/team/*.yaml` at HEAD (for prose evaluator).
- Repo metadata (PR number, head SHA, base SHA).

The HTML is parsed for `<body>` attributes — `data-genre`, `data-confidentiality` — to determine applicable rules. **No YAML frontmatter is parsed; examples don't use it.** The artifact's *type* is derived from its file path (`categories/<type>/examples/*.html`), not from a DOM attribute. This file-path → type mapping is the single source for type-scoped rule routing:

| Path prefix | Type | Type-scoped rule namespaces |
|---|---|---|
| `categories/slides/examples/` | `slides` | `composition.persuade-pitch`, `composition.slides` |
| `categories/one-pagers/examples/` | `one-pagers` | `composition.one-pager` |

## Genre normalization

The rules file uses underscore form (`pilot_kickoff`); HTML uses hyphen form (`pilot-kickoff`). Compliance-audit normalizes both sides to underscore form at lookup time. A follow-up Linear ticket will be filed to align the file conventions and remove the normalizer.

## Pipeline

```
1. classify       – read HTML, extract data-genre, derive type from path, dispatch rules into deterministic / visual-LLM / prose-LLM buckets
2. det-eval       – run deterministic rules inline; collect findings
3. render         – Playwright headless, viewport 1440×900, deviceScaleFactor 2, full-page screenshot capped at 8000px height. Render timeout 60s. On timeout/error: mark all visual-LLM rules as "skipped — render failed", continue.
4. visual-batch   – batch ≤8 yes/no rules per vision call, collect findings
5. prose-batch    – extract prose (HTML text nodes minus <script>,<style>; entities decoded; whitespace collapsed; alt-text preserved; output capped at 32k chars); if extraction yields <50 chars, mark all prose rules as "not applicable — no text content"; otherwise load voice context, batch ≤8 yes/no rules per text call
6. cost-gate      – evaluated before EACH LLM call (visual or prose). Estimated cost = (input_tokens × input_rate) + (max_output_tokens × output_rate). If accumulated_cost + estimated_next > budget, skip remaining LLM calls, mark rules "skipped — budget exceeded"
7. synthesize     – group findings by severity + maturity; compute blocking vs. advisory subsets
8. report         – write audits/compliance/{ts}-{sha}.{md,json}; render markdown for PR comment
9. publish        – post or update sticky PR comment via gh CLI; set GitHub status check to red/green/neutral per blocking-mode
```

Each step is a separate function in a single TS module. No agent fan-out, no per-rule subprocess.

**Models:** OpenAI `gpt-4o` for vision (visual-LLM batches) and text (prose-LLM batches). Single SDK (`openai`). Model id is configurable via env var `COMPLIANCE_AUDIT_MODEL`. API key from env var `OPENAI_API_KEY`.

**LLM-call retry policy:** on transient error (5xx, rate limit) retry once with exponential backoff. On second failure, mark the batch's rules as "skipped — LLM error" and continue. Do not retry indefinitely — silent budget burn is worse than incomplete coverage.

**Skipped rules and the gate:** skipped rules (any reason — budget, render failure, LLM error) never block. The blocking gate only fires on rules that completed and produced a finding. The PR comment header explicitly counts skipped rules so reviewers can see coverage.

**Maturity default:** rules without an explicit `maturity` field are treated as `rule` (per `CLAUDE.md` Glossary), and therefore are eligible to block.

## Cost model

- Hard cap: $40/PR (env var `COMPLIANCE_AUDIT_BUDGET_USD`, configurable in CI workflow).
- Realistic spend per PR (1–3 examples, ~80 applicable rules): $5–$12.
- Estimated-cost formula per batch: `(input_tokens × input_rate_per_token) + (max_output_tokens × output_rate_per_token)`. Token counts are computed from the actual prompt + screenshot (vision) or prompt + prose (text) before each call. Rates are read from a small `pricing.json` next to the runner; updates are a manual edit when OpenAI prices change.
- Cache key: `sha256(html_file_sha || rule_id || normalized_test_block || voice_recipe_id)`. The `voice_recipe_id` is the recipe name resolved from the artifact's `data-genre` (one recipe per genre via `voice/recipes.yaml`); the recipe's referenced team profile contents are folded into `normalized_test_block`. Cache hits cost $0. Hit rate is admitted to be low (15–25%) — cache exists for retry/rerun cases, not as a primary cost lever. Cache backend: filesystem at `.cache/compliance-audit/`, gitignored.
- **Local `--budget` overrides do not affect CI.** The CI workflow always uses `COMPLIANCE_AUDIT_BUDGET_USD`; the local CLI flag exists for cost-controlled local exploration only and cannot lower the CI gate's effective coverage. CI logs show the budget value used.

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

Required fields: `<rule-id>`, `reason="<text>"` (≥10 chars), `linear="<ticket>"` matching `^Z2O-\d+$`. The runner enforces these as **syntax** only — it does not call the Linear API to verify the ticket exists, is open, or is in the right project. v0.2 may add a Linear-API verifier; v0.1 trades semantic enforcement for zero external dependency at runtime.

Each suppression is logged in the audit JSON report (file, rule, reason, ticket, PR that introduced it). The PR comment lists active suppressions in a dedicated section so reviewers can challenge them in code review. A future cleanup audit can prosecute `linear=` references against actual Linear state.

v0.2 may add a `.ignore.yaml` for batch-level suppressions if a real need emerges; v0.1 ships only the inline form to keep the suppression set auditable.

## PR comment format

A single sticky comment per PR (hidden marker `<!-- design-system-ci:sticky -->`) carries results for all three checks. Each check owns a section; only sections with content are rendered.

```
Design System CI  •  updated {timestamp}  •  {🚫 BLOCKING | 📝 ADVISORY (reason)}

── validate:rules ──────────────────────────────────────────
{pass|fail}  •  N errors

── compliance-audit ────────────────────────────────────────
evaluated {N} examples  •  {pass|fail}  •  ${cost} / $40
  Failures (block merge)         — N
  Advisory findings              — N (collapsed)
  Skipped (budget / errors)      — N (collapsed)
  Passed                         — N (collapsed)
  Active suppressions            — N (collapsed)

── audit:cohesion ──────────────────────────────────────────
{pass|fail}  •  {duration}
  Critical (block merge)         — N
  Should-fix                     — N (collapsed, advisory)
  Note                           — N (collapsed, advisory)

Run locally:
  npm run validate:rules
  npm run audit:compliance -- {file-glob}
  npm run audit:cohesion
Full reports:
  audits/compliance/{ts}-{sha}.md
  audits/cohesion/{ts}-{sha}.md
```

The header timestamp tells reviewers the comment was just updated. Each `Skipped` section is non-empty only when something didn't run, so reviewers know the coverage state.

The composite GitHub status check (`design-system-ci`) goes red iff any check has a blocking finding under its respective gate. Each check also has its own status check (`validate:rules`, `compliance-audit`, `audit:cohesion`) so branch protection can require them individually.

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
  build.yml                     – existing; ADD jobs for compliance-audit and audit:cohesion alongside validate:rules
                                  ADD a final composite job that aggregates outputs into the single sticky PR comment

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

## Day-one bootstrap

Before the workflow is enabled on real PRs, the runner is invoked once over all in-scope examples (`npm run audit:compliance -- "categories/{slides,one-pagers}/examples/*.html" --baseline`). This produces `audits/compliance/baseline-{sha}.json`, an inventory of pre-existing violations. The baseline is committed to the repo in the same PR that enables the workflow.

The baseline is **diagnostic**, not exonerating: it does NOT auto-suppress any rule. Its purpose is to make the day-one violation set visible before the workflow ships, so the team can decide whether to (a) fix the worst offenders in the same PR, (b) launch with `COMPLIANCE_AUDIT_BLOCKING=false` for a defined grace period, or (c) bulk-add suppressions with mandatory linear tickets.

The grace-period decision and how long it lasts is a launch decision recorded in the enabling PR's description, not part of this spec.

## Operational signal for flipping the kill-switch

The repo-wide kill-switch (`COMPLIANCE_AUDIT_BLOCKING=false`) is the operational lever for day-one and false-positive crises. Triggers for flipping it on:

- ≥3 PRs in a 7-day window add the per-PR `compliance-audit:advisory` label to bypass the gate. Signal: per-PR override is being used as a workaround, not an exception.
- Any PR is blocked on a rule whose `llm_eval` finding is later judged false by reviewer in PR comments. Signal: false positive entered the gate.
- The auditor exceeds budget on >25% of runs in a 7-day window. Signal: cost model is wrong.

When any trigger fires, flip to advisory, file a follow-up Linear ticket to triage, and flip back when the trigger condition no longer holds. This is a written rule, not a vibe call.

## Test plan and shipping criterion

`tests/compliance/fixtures/` contains:

- 3 known-good example artifacts (real, taken from `categories/`) with their expected zero-finding result frozen in `expected.json`
- 3 seeded-failure artifacts (fixtures purpose-built to violate specific rules) with their expected non-zero findings frozen
- For each seeded failure, the rule id violated, the expected severity, and the expected finding count

The shipping bar: `npm run test:compliance` is green, **100% recall on seeded failures, 100% precision on known-goods** (matching cohesion-audit's bar). LLM-rule fixtures use a recorded-response cassette (no live model calls in `npm test`) so the suite is deterministic.

`npm run audit:compliance:smoke` runs the full live pipeline (with LLM calls) on one fixture as a final pre-merge sanity check; not run by default in CI to avoid burning budget.

## Failure modes accepted in v0.1

- **Day-one violation count.** Blocking is on by default but can be flipped repo-wide via the operational signal above. The baseline JSON makes the count visible before launch.
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
- Triage of the 94 existing cohesion-audit `should-fix`/`note` findings into a Wave-N cleanup epic (now that cohesion runs on every PR, the advisory list is visible to every reviewer).
