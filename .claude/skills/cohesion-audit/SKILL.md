---
name: cohesion-audit
description: |
  Audit the Verdigris design system for cross-cell brand and design cohesion.
  Catches token-namespace drift, hardcoded colors, hierarchy synonyms across
  cells, class-name collisions, genre-decision-tree gaps, and CLAUDE.md vs
  reality drift. Read-only. Writes report to audits/cohesion/.
when_to_use: |
  Invoke when adding a new cell, before/after a major surface change, or
  on demand for periodic system review. Run after `npm run validate:all`
  passes. Default scope is the whole system; pass a cell name to narrow.
allowed-tools:
  - Bash(npm run audit:cohesion*)
  - Bash(npm run test:audit*)
  - Bash(git log:*)
  - Bash(git rev-parse:*)
  - Bash(ls audits/cohesion/*)
  - Read
  - Glob
  - Grep
arguments:
  - name: scope
    description: Cell name (e.g., whitepapers) or 'all' (default)
    required: false
  - name: dimension
    description: One of token-namespace, visual-rhythm, color-expression, hierarchy-translation, class-name-namespace, genre-decision-tree, system-doc-consistency
    required: false
---

# /cohesion-audit

You are running a read-only audit of the Verdigris design system. The audit walks 7 deterministic dimensions (see DESIGN.md §2) across `tokens/`, `categories/`, `foundations/`, `_layouts/`, `build/print/`, `assets/`, and `rules/visual-rules.yml`. It writes a markdown report and a JSON sidecar to `audits/cohesion/`. You read the sidecar back, compute trend against prior runs, rank by blast radius, and surface a Top-10 plus 3-5 next actions.

This skill never edits files. Never runs `npm run build`. Never mutates git.

## 1. Parse arguments

The user invokes one of:

- `/cohesion-audit` -- full run, all dimensions, all cells
- `/cohesion-audit <cell>` -- one cell (e.g. `whitepapers`, `voice`, `tokens`, `foundations`)
- `/cohesion-audit --dimension=<name>` -- one dimension across all cells
- `/cohesion-audit <cell> --dimension=<name>` -- intersection

Extract `scope` (default `all`) and `dimension` (default empty). Pass through to the script unchanged. If a positional argument starts with `--`, treat it as a flag, not a cell name.

## 2. Pre-flight

Run these checks before invoking the script. Each is a single Bash call.

1. Confirm repo root: check `tokens/` and `rules/visual-rules.yml` both exist with `Read` on `rules/visual-rules.yml` (just verify it loads). If not, abort with: "Not in the design repo. cd to VerdigrisTech/design and retry."
2. Capture git state: `git rev-parse --short HEAD` and `git status --porcelain | wc -l`. If uncommitted-file count > 0, surface a one-line warning ("N uncommitted files; report sha will not match working tree") but proceed.
3. List prior runs: `ls -1t audits/cohesion/*.json 2>/dev/null | head -1` to find the most recent prior JSON sidecar. If none exists, note "first run, no trend baseline" and skip trend computation later.

## 3. Run the audit

Invoke the script through Bash:

```
npm run audit:cohesion -- <scope> [--dimension=<name>]
```

Capture stdout. The last line of stdout is the absolute report path printed by the script. The script writes both `audits/cohesion/{ISO-utc}-{short-sha}.md` and `audits/cohesion/{ISO-utc}-{short-sha}.json`.

Failure handling:
- Non-zero exit: surface stderr verbatim under a "Script error" header. Do not retry. Do not synthesize a fake report.
- Zero findings: still write the report; report it as a clean run.

## 4. Read the JSON sidecar

The sidecar is the source of truth. Schema tag: `"cohesion-audit-schema": "0.1"`. If the tag is missing or a different version, surface a one-line schema-mismatch warning and proceed using best-effort field reads.

Finding shape:
```
{
  dimension: string,
  severity: "critical" | "should-fix" | "note",
  summary: string,
  citation: string,            // e.g. "categories/whitepapers/cover.md:42"
  expected?: string,
  actual?: string,
  suggestedAction?: string,
  affectedCells?: string[]
}
```

Read the full sidecar. Build a flat list of findings.

## 5. Compute trend

If a prior JSON sidecar exists:
- `resolved`: findings present in prior run, absent in current
- `new`: findings absent in prior run, present in current
- `persisting`: findings present in both (match on `dimension + summary + citation`)

For persisting findings, look back further (oldest available run that contains the same finding) to compute a `since` date. Limit lookback to the 10 most recent JSON sidecars to keep wall-clock under 1 second.

If no prior run exists, set trend section to "first run, no baseline."

## 6. Rank Top-10

Sort findings by:
1. Severity tier: `critical` > `should-fix` > `note`
2. Blast radius: `affectedCells.length` desc (cells touched), then count of distinct citations
3. Dimension stability: persisting findings rank above new findings of equal severity (older debt is a more reliable signal than fresh noise)

Take the top 10. If a `--dimension` flag was passed, restrict the Top-10 to that dimension only and label the section accordingly.

## 7. Generate next actions

Pick 3-5 concrete recommendations sorted by impact / effort. Each one is one sentence, names a file or token group, and points at a specific finding ID or citation. Bias toward:
- Fixing critical findings first
- Collapsing the largest cluster of `should-fix` findings (one fix resolves N citations)
- Surfacing new dimensions or cells that produced findings the audit has not seen before

Do not invent actions outside the finding set. If there are no critical or should-fix findings, propose tracking notes for next quarterly review and stop at 3 actions.

## 8. Compose the terminal output

Keep the visible response under ~80 lines. Use this structure:

```
Cohesion audit -- <scope> [<dimension>]
Run: <ISO timestamp>  sha: <short>  duration: <s>
Findings: <C> critical, <S> should-fix, <N> note  (total <T>)
Trend: <resolved>R / <new>N / <persisting>P  (vs <prior date>)

Top 10
  1. [critical]  <summary>
     -> <citation>   cells: <a, b, c>
  ...

Next actions
  1. <action>  -> <citation>
  ...

Report: <absolute path to .md>
JSON:   <absolute path to .json>
```

Per-line rules:
- Use `--` not emdashes
- Citations are repo-relative (`categories/whitepapers/cover.md:42`); the report path is absolute
- If a finding has `affectedCells`, list up to 3; suffix `+N more` if longer

## 9. Dimension-scoped runs

If `--dimension=<name>` was passed:
- Header reads `Cohesion audit -- <scope> -- dimension: <name>`
- Top-10 becomes Top-N within that dimension only (cap at 10)
- Trend filters to that dimension
- Next actions all touch that dimension

## 10. Failure modes

- Script error -> surface stderr, exit. Do not summarize.
- Empty findings, no prior runs -> output "Clean run, first baseline. Report: <path>" and stop.
- Empty findings, prior runs existed -> output "Clean run. Resolved since prior: <count>. Report: <path>" and stop.
- JSON sidecar missing -> read the markdown report's "Findings" section as a fallback. Note the degradation in the terminal output.
- Schema mismatch -> proceed best-effort, prefix the terminal output with `! schema X.Y, expected 0.1`.

## What this skill does not do

- It does not run `npm run build`. Stale `build/dist/` is a finding the script emits, not a side effect of the audit.
- It does not call any LLM dimensions. v0.1 is fully deterministic. Visual-rhythm and genre-tree have LLM halves deferred to v0.2 (see DESIGN.md §2).
- It does not apply fixes. There is no `--fix` mode in v0.1.
- It does not block CI. Output is findings, not gates.
- It does not file Linear tickets. Manual copy-paste in v0.1.

## Composition with other tooling

Run order, when both apply:
1. `npm run validate:all` -- confirms tokens parse and rules are well-formed
2. `/cohesion-audit` -- confirms the system as a whole hangs together

Validators are necessary; cohesion-audit is the layer above. A clean validator run can still hide a vocabulary split between two cells, and that is exactly what this skill is for.

## See also

- `.claude/skills/cohesion-audit/DESIGN.md` -- canonical design rationale, dimension definitions, severity model
- `.claude/skills/cohesion-audit/README.md` -- human-facing maintainer guide
- `workflows/adversarial-review.md` -- the 5-loop pattern this skill is built under
- `audits/cohesion/` -- historical reports and JSON sidecars
