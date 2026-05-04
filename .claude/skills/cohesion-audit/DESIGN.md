# cohesion-audit -- design proposal

Build phase will implement. Branch: `feat/cohesion-audit-skill`.
Companion to `npm run validate:rules`. Validators check rules are well-formed; cohesion-audit checks the system as a whole still hangs together.

---

## 1. Invocation contract

Slash command: `/cohesion-audit`.

- `/cohesion-audit` -- full run, all v0.1 dimensions, all cells.
- `/cohesion-audit <cell>` -- one cell, e.g. `/cohesion-audit whitepapers`. Matches a directory under `categories/` or the literal `voice` / `tokens` / `foundations`.
- `/cohesion-audit --dimension=<name>` -- one dimension across all cells (e.g. `--dimension=typography`).
- `/cohesion-audit <cell> --dimension=<name>` -- intersection only.
- `/cohesion-audit --since=<git-ref>` -- v0.2 deferred.

Default (bare): full run, all 7 dimensions. Target wall-clock 3-5 min.

Read-only. No file edits, no token regen, no git mutation. No confirmation prompt. Concurrent runs are safe; reports write to `audits/cohesion/{ISO-utc}-{short-sha}.md` with a `-2` suffix on collision.

The skill never runs `npm run build`. Stale `build/dist/` is a finding, not a silent error.

---

## 2. Audit dimensions (v0.1: 7)

Each: name -- one-line -- signals -- automatable? -- in/out.

1. **Token namespace cohesion** -- token paths follow groupings; units consistent within a group.
   Walk `tokens/**/*.json`. Flag drift (`spacing.print.cover.gap` vs. `spacing.print.cover-gap`). Flag mixed units within one group. Regex on `$value`: `/^[\d.]+\s*(px|pt|in|mm|rem|em|%)/`. Deterministic. **IN**.

2. **Visual rhythm** -- typography sizes and spacing tokens form a stepped scale across cells.
   Scan `categories/**/*.{html,css,md}` + `build/print/*.css` for inline `font-size:`, `padding:`, `margin:` literals. Histogram per cell. Cell A uses 11/14/18/24, cell B uses 12/13/16/22 = drift. Reference: `tokens/typography/*.json` + `tokens/spacing/*.json`. Deterministic half **IN**; LLM "does it feel cohesive" half deferred to v0.2.

3. **Color expression** -- brand teal dominant; secondary palette in declared ratios; no ad-hoc hexes.
   Regex `/#[0-9a-f]{3,8}\b/i` + `oklch(`, `hsl(` across `categories/`, `foundations/`, `_layouts/`, `assets/`, `build/print/`. Any literal not in `build/dist/hex/colors.json` is a finding. Per-cell brand-teal frequency vs. secondary accents. Deterministic. **IN**.

4. **Hierarchy translation** -- eyebrow/headline/deck pattern uses the same role-name across cells.
   Scan `categories/**/*.html` for `class="eyebrow"`, `class="kicker"`, `class="headline"`, `class="deck"`, `class="lede"`. Map cell -> vocabulary. Flag synonyms across cells; flag missing roles. Deterministic. **IN**.

5. **Class-name namespace cohesion** -- class names follow prefix convention; no orphans (defined unused) or ghosts (used undefined).
   Collect every `class="..."` token from `categories/**/*.html`; collect every `\.[a-z][a-z0-9-]*\s*\{` selector from `*.css`. Set difference both ways. Flag prefix drift (`vd-*` vs `verdigris-*` vs unprefixed). Deterministic. **IN**.

6. **Genre decision tree** -- a producer can pick cell + genre by reading one page.
   Each `categories/<cell>/index.md` has a "When to use" block; cells with multiple genres have a one-line genre selector. Cross-check every `modes:` and `applies_to_modes:` value in `rules/visual-rules.yml` resolves to a documented genre. Deterministic structure check. **IN**; LLM "is the page actually navigable" deferred to v0.2.

7. **System-doc consistency** -- `CLAUDE.md`, `CONSUMERS.md`, `README.md` describe the system that exists.
   Every command in CLAUDE.md "Development Commands" runs cleanly (`npm run validate`, `validate:rules`, `validate:all`, `build`, `test:browser`). Every directory in "File Structure Rules" exists. Every consumer named in CONSUMERS.md resolves to an emitted file or import path. Deterministic. **IN**.

**Cuts (deferred):** *voice <-> visual register* (no validation set; v0.3), *real-surface validation* (overlaps with manual `existing_verdigris_examples` audit; v0.2), *accessibility* (`npm run test:browser` owns rendered contrast; v0.2). v0.1's bar is "catch the cohesion debt that already exists, deterministically, fast." LLM-judgment dimensions add cost and false-positive risk before the deterministic baseline is trusted.

---

## 3. Severity model

Three tiers: **critical**, **should-fix**, **note**. No composite score in v0.1.

- **critical** -- internal inconsistency that breaks a producer mental model or breaks a consumer build. Example: `build/print/slides.css` references `var(--vd-slide-width)` with no backing token in `tokens/**/*.json`. Or CLAUDE.md claims `npm run validate:all` and the script is missing from `package.json`.
- **should-fix** -- drift that hasn't broken anything yet but will. Example: cell A uses `class="eyebrow"`, cell B uses `class="kicker"` for the same role.
- **note** -- observation worth tracking. Example: cell uses 7 distinct font sizes where the rhythm scale defines 5; might be intentional, might be drift.

Graduation: a `note` becomes `should-fix` when the same finding appears in two consecutive runs (history under `audits/cohesion/` makes this checkable). A `should-fix` becomes `critical` when a sibling cell or a consumer surface starts depending on the inconsistent value.

No 0-10 scoring. The repo's validator culture is "0 errors, N warnings"; cohesion-audit fits that culture by counting findings per dimension. Scores invite optimization-against-the-score. Reconsider after 5 runs of historical data.

---

## 4. Output format

**Write target:** `audits/cohesion/{YYYY-MM-DDTHHMMSSZ}-{git-short-sha}.md` (checked in, git-tracked trends) plus `~/Downloads/cohesion-audit-{timestamp}.md` (easy open). Stdout: Top-10 + report path.

**Format:** markdown primary; JSON sidecar `*.json` next to the `.md` for tooling. JSON is the source of truth for trend computation; markdown is the human surface.

**Sections:** (1) header (timestamp, sha, branch, scope, duration, finding count by tier); (2) Top-10 (highest-severity, ranked by tier then cross-cell blast radius); (3) per-dimension findings (one section per dimension; each finding: tier, summary, citation, expected vs. actual, suggested action); (4) cross-cell drift (always present; empty section is itself a signal); (5) trend (diff vs. prior run: resolved, new, persisting with "since" date); (6) next actions (3-5 concrete recommendations sorted by impact/effort).

**Citation:** `path/relative/to/repo/root:line`, e.g. `categories/whitepapers/cover.md:42`. No absolute paths in the report (it's checked in; absolute paths are user-specific).

**Length cap:** per-dimension findings cap 25. Overflow rolls into "...and N more, see JSON sidecar."

---

## 5. Implementation strategy

Hybrid: a markdown SKILL.md instruction file that drives a Node/TS script at `build/audit/cohesion.ts`, called via `npx tsx build/audit/cohesion.ts [args]`. Reuses helpers from `build/validate-rules.ts` (token walking, YAML parsing, file enumeration). Same idiom, same place, same maintainer mental model.

v0.1 is 100% deterministic. No LLM calls. Skill's value-add over running the script directly: reads `audits/cohesion/` history, computes trend, ranks findings by blast radius, writes the next-actions section.

No caching in v0.1. Full run is fast enough; cache invalidation costs more than it saves.

LLM-judgment branch shape (v0.2 visual-rhythm + genre-tree halves): script emits a `cohesion-audit.candidates.json` with rendered-snippet pairs. Skill loads candidates, presents 3-5 side-by-side, asks a YES = violation prompt (matching the `rules/visual-rules.yml` `llm_eval` convention).

---

## 6. Adversarial review for the skill itself

Five-loop, mapping onto `workflows/adversarial-review.md`:

- **Loop 1 (build).** Implement script + skill markdown. Validate on a synthetic fixture under `tests/audit/fixtures/` with seeded findings.
- **Loop 2 (run).** Run against the live repo. Capture findings.
- **Loop 3 (validate).** Compare to the cohesion-debt list from the sibling research agent. Compute recall + precision.
- **Loop 4 (tighten).** Each false positive becomes a rule fix or an explicit allowlist entry with rationale (model: `checkPublicPackagePii`'s ALLOWLIST in `build/validate-rules.ts`).
- **Loop 5 (extend).** Each false negative becomes a new rule. Rules needing LLM judgment route to v0.2 backlog rather than forced into v0.1.

**Validation set:** sibling agent's cohesion-debt list, treated as ground-truth fixture.

**Pass bar v0.1:** recall >= 80%, precision >= 80%. Below either, hold and iterate.

Five-loop (not three-loop) is correct here: the skill is precedent-setting, expands public surface (`audits/` + JSON schema become a contract), and touches a script-rendering surface. All three triggers from `workflows/adversarial-review.md` apply.

---

## 7. Future-proofing

**Per-cell manifest.** `categories/<cell>/.audit-manifest.yaml` declares cell name, role vocabulary, token groups consumed, class prefix, genres declared. Skill prosecutes the cell against its own declarations. Missing manifest = `note` finding with copy-paste template. Shifts "what should this cell look like" from a global rule into a cell-owned contract.

**Self-extending.** When a finding fires for a brand-new cell (absent from prior runs in `audits/cohesion/`), the skill emits a "rule suggestion" block: "Cell X uses {kicker, lede}; sibling cells use {eyebrow, deck}. Add to manifest or reconcile vocabulary." Maintainer copy-pastes into the manifest or rules.

**Trend tracking.** JSON sidecars under `audits/cohesion/*.json` form the time series. `build/audit/trend.ts` (v0.2) reads the last 10 runs and reports findings-per-dimension over time. Direction only (improving / plateauing / regressing); no score.

**Schema versioning.** JSON sidecar carries `cohesion-audit-schema: 0.1`. Schema bumps don't break old reports; trend tooling refuses to mix incompatible schemas.

---

## 8. Out of scope (v0.1)

1. No file edits, including no `--fix` mode.
2. No PDF rendering or PDF auditing. Source-only.
3. No real-rendered contrast (pixel-level). `npm run test:browser` owns that.
4. No comparison to external design systems. Verdigris audited against itself.
5. No merge-blocking. Output is findings, not gates. CI may surface; v0.2 may add a `--ci` flag once precision is trusted.

---

## 9. Open questions for build phase

1. **Manifest inheritance.** Should `.audit-manifest.yaml` inherit from a cell-family default, mirroring `inherits_from_sales_collateral`? Lean yes; defer schema decision to first cell that needs it.
2. **`build/audit/` location.** Sibling to `build/validate-rules.ts`. `npm run audit:cohesion` becomes a peer of `npm run validate`.
3. **Retention.** Keep all runs forever, or rotate? Recommend keep-forever for v0.1; revisit at 100 runs.
4. **JSON schema location.** Inline in script for v0.1; extract to `build/audit/schema/cohesion-0.1.json` at v0.2.
5. **Auto-filing Linear tickets.** Tempting via the Verdigris MCP gateway; risks ticket spam. Recommend manual copy-paste in v0.1, MCP integration in v0.2 once finding precision is trusted.
6. **Project-skill discovery.** Confirm Claude Code discovers `.claude/skills/cohesion-audit/` without an entry in `.claude/settings.local.json`.
