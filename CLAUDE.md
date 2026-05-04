# Verdigris Design System — Claude Code Guidelines

## Project Overview

This repo (`VerdigrisTech/design`) is the canonical design system for all Verdigris surfaces. It contains machine-readable tokens (JSON), human-readable foundation docs (markdown), and visual rules (YAML).

**Package:** `@verdigristech/design-tokens` on GitHub Packages
**Consumers:** Patina (app UI), www (marketing site), evaluator pipeline, AI agents, Figma
**Integration guide:** [`CONSUMERS.md`](CONSUMERS.md) — canonical guide for any consumer (Tailwind, raw tokens, CSS imports, voice recipes, rules YAML, versioning).

## Key Architecture

- **OKLch** is the canonical color space — all other formats (HSL, hex, RGB) are generated
- **Patina is the reference implementation** — www converges toward Patina, not the other way around
- **W3C DTCG format** for all token JSON (`$value`, `$type`, `$description`)
- Build pipeline: `tokens/*.json` → `build/config.ts` → `build/dist/` (oklch.css, hsl.css, hex/colors.json, tailwind/preset.js)
- **Voice is a foundation.** Lives in `voice/` (top-level, sibling to `foundations/` and `tokens/`). Before writing or generating any Verdigris content, read `voice/USE.md` first — it teaches you to identify subject + form + audience before picking a recipe. Then `voice/recipes.yaml` to pick the mix, and `voice/team/*.yaml` for individual voice profiles.

## Development Commands

```bash
npm run validate            # Check token JSON for broken references and missing $type
npm run validate:rules      # Check visual-rules.yml (YAML syntax, test blocks, emdashes, convention, sidebar)
npm run validate:all        # Run both validators
npm run build               # Generate build/dist/ outputs from token source
npm run test:browser        # Cross-browser smoke tests (Playwright, chromium/webkit/firefox)
npm run test:browser:install # Install Playwright browser binaries (one-time setup)
npm run audit:cohesion      # Cross-cell brand + design cohesion audit
npm run test:audit          # Self-test the auditor against fixtures
```

## Cross-browser testing

Smoke tests live in `tests/browser/` and run against a locally-built Jekyll site.

Local workflow (one-time):
```bash
bundle install                     # Jekyll + GitHub Pages deps
npm run test:browser:install       # Playwright chromium, webkit, firefox
```

Then for each test run:
```bash
bundle exec jekyll build           # Build _site/
npm run test:browser               # Runs on all 3 browsers; python3 -m http.server serves _site
```

CI runs these automatically on every PR. See `.github/workflows/build.yml` `cross-browser-smoke` job and `link-check` job.

## Pre-Commit Checklist

Before every commit that changes tokens:
1. `npm run validate` -- must pass with 0 errors
2. `npm run build` -- regenerate outputs
3. Commit build outputs alongside token changes

Before every commit that changes rules (visual-rules.yml):
1. `npm run validate:rules` -- must pass with 0 errors
2. Every `type: "constraint"` rule must have a `test` block
3. Every `min` must have a `max` (floors need ceilings)
4. Every `llm_eval` prompt must use YES = violation convention
5. No emdashes anywhere in the file

Before every commit that changes content (foundations, specimens, examples):
1. `npm run lint:external` -- no internal content in public files
2. `npm run validate:rules` -- checks sidebar coverage for new pages
3. Check for AI writing artifacts (emdashes, jargon, overexplaining)
4. Verify cross-file consistency (values in rules must match foundations and specimens)

Before adding a NEW CELL or making MAJOR cross-cell changes:
1. `/cohesion-audit` -- check the system still hangs together
2. Address all `critical` findings before merge
3. File `should-fix` findings under the active epic
4. Note `note` findings for next quarterly review

## Release Process

Releases are automatic. When a PR merges to main, the `auto-release.yml` workflow:
1. Determines the version bump (from PR labels or commit prefixes)
2. Bumps package.json, rebuilds, commits, tags, creates a GitHub Release
3. Publishes to GitHub Packages

**You just merge the PR. Everything else is automated.**

### Versioning Rules

| Bump | Trigger | When to use |
|------|---------|------------|
| **Major** | PR label `major` or `BREAKING CHANGE` in commit body | Breaking changes: renamed tokens, removed tokens, changed YAML rule ID paths, schema changes that break evaluator pipelines |
| **Minor** | PR label `minor` or any `feat()` commit prefix | New tokens, new rules, new composition cells, new foundation sections, new assets |
| **Patch** | Default (no label, no feat prefix) | Fixes to values, docs updates, YAML corrections, adversarial review fixes |

To control the bump, either:
- Add a `major`, `minor`, or `patch` label to the PR before merging
- Or rely on commit message prefixes: `feat()` triggers minor, everything else triggers patch

### Pre-Merge Checklist

1. Branch + PR -- never push directly to main
2. `npm run validate:all` on the branch
3. Adversarial review before merge (at least 1 round for rules/composition changes)

## Commit Message Format

```
type(scope): description

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`
Scopes: `tokens`, `foundations`, `categories`, `rules`, `build`, `ci`

Examples:
```
feat(tokens): add elevation shadow tokens from Patina audit
docs(categories): add photography guidelines
fix(rules): correct heading weight constraint from 600 to 700
```

## Linear Integration

- **Team:** Z2O (ID: `9e2ce699-7e73-49fe-a33a-d35c81cdb868`)
- **Project:** Design System: VerdigrisTech/design
- Include issue ID in commit messages: `[Z2O-XXX]`

## Glossary

- **Genre** is the human-facing noun for the artifact-type-within-a-cell distinction (e.g., the slides cell has four genres: pilot kickoff, customer 101, partner enablement, internal team; the whitepaper cell has three: lab_tradition, policy_brief, ceo_brief). Use "genre" in all prose.
- **`modes:`** is the YAML field on rules in `rules/visual-rules.yml` that lists which genres a rule applies to. The two terms refer to the same concept; "modes" is the technical contract on disk, and "genre" is the producer-facing word. Only say "mode" when explicitly referencing the YAML field (e.g., "the `modes:` field accepts a list of genres").
- **cohesion-audit** is a Claude Code skill at `.claude/skills/cohesion-audit/` that prosecutes the design system for cross-cell drift. Read-only. Writes reports to `audits/cohesion/`. Companion to `npm run validate:all`: validators check each file is well-formed; cohesion-audit checks the system as a whole hangs together. See `SKILL.md` for invocation, `README.md` for maintenance, `DESIGN.md` for rationale.

## File Structure Rules

### Tokens (`tokens/`)
- All values in W3C DTCG format: `{ "$value": "...", "$type": "...", "$description": "..." }`
- References use `{path.to.token}` syntax — resolved by the build pipeline
- Group by concern: `color/`, `typography/`, `spacing/`, `motion/`, `elevation/`

### Foundation Docs (`foundations/`)
- Include rationale ("why"), not just specification ("what")
- Keep token values in sync with JSON — if a value changes, update both
- If deviating from Patina, add a "Deviation from Patina" section explaining why

### Category Guides (`categories/`)
- Use `_guide-template.md` as the starting point
- Include at least 2 good and 2 bad examples with screenshots
- Reference tokens by name — never hardcode color/size values
- Assets go in `assets/` subfolder: SVG for icons, PNG for screenshots, WebP/JPG for photos

### Visual Rules (`rules/`)
- YAML format, machine-parseable for evaluator pipeline consumption
- Schema (v4.0.0): every rule must have `id`, `severity`, `type`, `description`
- Optional `maturity` field: `experimental` (warning, collecting signal), `convention` (warning, deviation requires justification), `rule` (default, blocks merge), `invariant` (axiomatic, cannot override)
- `type: "reference"` entries omit severity (informational, not enforced)
- Every guidance rule needs both a floor AND a ceiling — AI agents optimize toward maximums without upper bounds
- Cross-file consistency: if a value appears in rules, foundations, and specimens, all three must match

#### Custom YAML fields

The schema accreted several fields beyond the base set as the rules system grew. Two categories:

**Rules-system canonical** (validator-checked, structural meaning):

- `linear_issue` (string, e.g. `"Z2O-1318"`). The Linear ticket that conceived the rule. Required on all new rules from PR #43 onward. Use `# no linear_issue (pre-tracking)` for older rules that pre-date this convention. Example: `linear_issue: "Z2O-1318"` on `composition.persuade-slide-deck.logomark-consistency`.
- `inherits_from_sales_collateral` (list of rule IDs). Declared on a rules block to inherit slide-deck universals (logomark, confidentiality, roles, dates) into one-pager and case-study cells. The validator's `checkInheritanceIntegrity` confirms every referenced rule ID actually exists. Example: `inherits_from_sales_collateral: ["composition.persuade-slide-deck.logomark-consistency"]`.
- `modes` (list of genre names — see Glossary). Restricts a rule to specific genres within a cell. Used on slide-deck genres (`pilot_kickoff`, `internal_team`, `customer_101`, `partner_enablement`) and on one-pager genres (`solution_overview`, `comparative`). The evaluator skips the rule when the artifact's declared genre is not in this list. Example: `modes: ["pilot_kickoff", "customer_101"]`.
- `genre_metadata_field` (string). Names the HTML/CSS attribute the evaluator should read to determine the artifact's mode. Currently `data-genre on <body>` and `data-confidentiality on <body>`. Example: `genre_metadata_field: "data-genre on <body>"`.
- `applies_to_modes` (list of mode names). Functionally identical to `modes`; used on whitepaper-cover rules. Treat as a synonym; future cleanup should consolidate to `modes`.

**Metadata helpers** (informational, not validator-checked):

- `applies_to` (string). Free-form prose narrowing where the rule applies, when `modes` is too coarse. Example: `applies_to: "TEMPLATE artifacts only (not produced/filled-in decks)"`.
- `applies_to_examples` (list of file paths). Names example artifacts that demonstrate the rule. Used on cell-level reference blocks; mirrors what `existing_verdigris_examples` does for genres.
- `existing_verdigris_examples` (list of strings). Real-world Verdigris artifacts that approximate the genre. Each entry should explain how the artifact maps to the genre and what's missing. Example: `existing_verdigris_examples: ["Verdigris 'Signals Overview' (Notion) — pre-cell; needs refresh"]`.
- `exemplar_archetypes` (list of strings). Industry archetypes for the genre when no Verdigris artifact yet exists. Each entry is a one-line pattern description plus public references where available. Example: `exemplar_archetypes: ["Product fact-sheet pattern: title + 3 callouts (Stripe product pages, Linear feature pages)"]`.
- `note_on_confidentiality` (string). Explains the cell's confidentiality default and exceptions. Example on case-study cell: `note_on_confidentiality: "Case studies default to PUBLIC tier..."`.
- `related_issues` (list of Linear IDs). Companion tickets that informed the rule but are not the originating ticket. Distinct from `linear_issue` (singular originator). Example: `related_issues: ["Z2O-1310"]` on `single-anchor-metric` (per-instance qualifier discipline came from a different ticket).
- `anti_examples` (list of strings). Concrete failure shapes the rule catches; complements `examples`. Each entry is one or two lines describing a specific failure mode an LLM evaluator can pattern-match. Generic placeholders ("doesn't follow the rule") are not acceptable.

When adding a new field, document it here in the same PR. Validator drift starts as undocumented fields and ends as silent inheritance breaks.

### Explorations (`explorations/`)
- Prototypes, portfolios, working-through-something essays. Not authoritative.
- Nothing here is a rule. Other repos should not treat exploration content as canonical.
- Ideas start here. Graduation happens when evidence accumulates (see below).

## Graduation

The directory structure IS the maturity model. Promoting an artifact = moving it between directories and updating metadata.

- **Exploration → Pattern**: move from `explorations/` to `categories/` once used on 2+ real surfaces with positive review
- **Pattern → Convention**: promote to `foundations/` when rationale is stable and one adversarial review has passed
- **Convention → Rule**: add to `rules/visual-rules.yml` with `maturity: experimental`. Graduate to `maturity: rule` after 30 days with no surfaced violations or stakeholder objections
- **Demotion**: anything can move back down if evidence shifts. This is not failure; it is honest response to learning

Guiding principle: if an artifact has no identified ideal brand-aligned use, do NOT build a system around it. Keep it as an exploration until a real use emerges. Bias toward applying existing work to real surfaces over building elaborate exploration scaffolding.

## Content Guidelines

- **Don't hardcode design values in docs** — reference token names (e.g., "use `color.brand.verdigris`" not "use `#0fc8c3`")
- **Asset naming:** lowercase, hyphens, prefix with `good-` or `bad-` for examples
- **Screenshots:** 2x resolution, max 2400px wide, PNG format
- **No AI writing artifacts** — strip emdashes, "This means", "In other words", "grounded in", "leverage", "comprehensive". Write short, plain sentences. If it sounds like an AI explaining, rewrite it.
- **Alt text** — short factual labels ("Verdigris logo — teal"), not internal documentation ("Recovered canonical SVG lockup for light surfaces")

## Information Architecture

- **`index.md`** — summarizes with compact visual specimens, links to details
- **`foundations/*.md`** — defines rules with rationale and research citations
- **`specimen.html`** — shows applied examples (rendered page scrolls, live demos). Never lecture — show.
- **`rules/visual-rules.yml`** — machine-consumable rules for evaluator/agents
- **`examples/good|bad/`** — isolated pattern examples with live HTML demos

## Workflow

- **Always branch + PR** — never push directly to main, even for docs-only changes
- **QA before merge** — run content, rules-consistency, and HTML validation review before any PR merge

## Deviation Protocol

Any design decision that differs from Patina must be:
1. Explicitly documented with a "Deviation from Patina" section
2. Justified (marketing-specific need, medium constraint, etc.)
3. Rare — Patina has 60+ battle-tested components

**Justified:** display font (Lato), marketing hero patterns, ad templates, physical goods
**Unjustified:** changing brand teal, different component library, different dark mode strategy

## GitHub Actions

- **Build & Validate** — runs on push to main and PRs
- **Publish** — publishes to GitHub Packages on release tags (e.g., `v0.2.0`)
- **Pages** — deploys docs site on push to main

## Related Repos

- `VerdigrisTech/verdigris` — www site + evaluator pipeline (consumes this package)
- Patina source at `/tmp/patina/` — reference implementation for all design decisions
