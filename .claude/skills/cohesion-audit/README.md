# cohesion-audit

Maintainer-facing guide for the `/cohesion-audit` skill. Skill instructions live in `SKILL.md`; design rationale lives in `DESIGN.md`.

## What it does

`/cohesion-audit` walks the design system across 7 deterministic dimensions and reports drift between cells, between rules and reality, and between docs and code. It is read-only. It writes a markdown report and a JSON sidecar to `audits/cohesion/`. The JSON is the source of truth for trend computation; the markdown is the human surface.

The 7 v0.1 dimensions:

1. Token namespace cohesion -- token paths and units stay consistent within a group
2. Visual rhythm -- typography sizes and spacing tokens form a stepped scale across cells
3. Color expression -- brand teal dominant, no ad-hoc hexes
4. Hierarchy translation -- eyebrow / headline / deck role names hold across cells
5. Class-name namespace cohesion -- class prefixes consistent, no orphans or ghosts
6. Genre decision tree -- a producer can pick cell + genre by reading one page
7. System-doc consistency -- CLAUDE.md, CONSUMERS.md, README.md describe the system that exists

See DESIGN.md §2 for what each dimension scans and what it flags.

## When to run it

Decision rule:

- **At every new cell.** Before merging a new `categories/<cell>/` directory, run `/cohesion-audit <cell>` to confirm it does not import vocabulary or class prefixes that conflict with neighbors.
- **At every major surface change.** Adding a new token group, restructuring `_layouts/`, changing the print stylesheet folder, or any change touching three or more cells. Run the full audit before and after.
- **Quarterly.** Once per quarter, run a full audit on `main` and file the report. Trend lines surface debt that no single PR would catch.
- **On demand.** When something feels off. The skill is fast (target 3-5 min wall-clock) so the cost of running it speculatively is low.

Do not run as a merge gate in v0.1. The output is findings, not blocking errors. Once precision is trusted across 5+ runs, a `--ci` mode lands in v0.2.

## How to interpret findings

Three severity tiers (DESIGN.md §3):

- **critical** -- breaks a producer mental model or a consumer build. Example: a print stylesheet references a CSS variable with no backing token. Fix before merge.
- **should-fix** -- drift that has not broken anything yet but will. Example: cell A uses `class="eyebrow"`, cell B uses `class="kicker"` for the same role. File under the active epic.
- **note** -- observation worth tracking. Example: a cell uses 7 distinct font sizes where the rhythm scale defines 5. Could be intentional, could be drift. Watch across runs.

Graduation rule: a `note` becomes `should-fix` when the same finding appears in two consecutive runs. A `should-fix` becomes `critical` when a sibling cell or external consumer surface starts depending on the inconsistent value. Trend tracking under `audits/cohesion/` makes this checkable.

Blast radius (the `affectedCells` field on a finding) is the second sort key in the Top-10. A token-namespace drift that touches 5 cells outranks a critical that touches 1.

There is no composite score. Counting findings per dimension matches the validator culture (`0 errors, N warnings`) and avoids optimization-against-the-score.

## How to add a new dimension

1. Read DESIGN.md §2 for the v0.1 dimension shape: name, one-line, signals, automatable, in/out.
2. Add a new dimension function to `build/audit/cohesion.ts`. It takes the repo root and returns `Finding[]`. Mirror the pattern of an existing dimension.
3. Add fixtures to `tests/audit/fixtures/` covering at least one finding of each tier (critical, should-fix, note) plus one negative case (no finding).
4. Add the dimension to the runner switch and to the `--dimension` enum in this skill's `arguments`.
5. Document the dimension here in README §"What it does" and in DESIGN.md §2.
6. If the dimension needs LLM judgment, route to v0.2. Do not force LLM logic into the v0.1 deterministic baseline.

## How to add a per-cell `.audit-manifest.yaml`

Per-cell manifests are designed (DESIGN.md §7) but not enforced in v0.1. Drop a file at `categories/<cell>/.audit-manifest.yaml` declaring:

```yaml
cell: whitepapers
role_vocabulary:
  - eyebrow
  - headline
  - deck
token_groups:
  - tokens.spacing.print
  - tokens.color.brand
class_prefix: vd-wp-
genres:
  - lab_tradition
  - policy_brief
  - ceo_brief
```

The skill will start prosecuting cells against their own declarations once enforcement lands. Until then, manifests are documentation: they tell future cells what vocabulary this cell owns, which is itself useful.

## How it composes with `npm run validate:all`

Two layers:

- `npm run validate:all` -- confirms each rule, token, and YAML file is well-formed in isolation. Catches schema bugs.
- `/cohesion-audit` -- confirms the system hangs together across files. Catches integration bugs.

Run validators first. They are fast and they catch the kind of structural error that would mask a cohesion finding (a missing `$type` on a token would make the namespace check unreliable).

A clean validator run is a precondition for trusting cohesion-audit output. A clean cohesion-audit is not a precondition for anything; it is signal.

## Versioning

The JSON sidecar carries `cohesion-audit-schema: 0.1`. Bump the schema when finding shape, severity tiers, or dimension naming changes. Trend tooling (DESIGN.md §7) refuses to mix incompatible schemas, so old reports stay readable but stop contributing to trend lines.

Bump the script version (`build/audit/cohesion.ts`) on every contract change. Bump the skill version (this directory) when terminal output format changes.

## See also

- `SKILL.md` -- the orchestration file Claude reads on `/cohesion-audit`
- `DESIGN.md` -- canonical design proposal, all 9 sections
- `workflows/adversarial-review.md` -- 5-loop review pattern; cohesion-audit was built under it
- `build/audit/cohesion.ts` -- the script that produces findings
- `tests/audit/fixtures/` -- synthetic fixtures the self-test runs against
- `audits/cohesion/` -- historical reports and JSON sidecars
