# Verdigris Design System — Claude Code Guidelines

## Project Overview

This repo (`VerdigrisTech/design`) is the canonical design system for all Verdigris surfaces. It contains machine-readable tokens (JSON), human-readable foundation docs (markdown), and visual rules (YAML).

**Package:** `@verdigristech/design-tokens` on GitHub Packages
**Consumers:** Patina (app UI), www (marketing site), evaluator pipeline, AI agents, Figma

## Key Architecture

- **OKLch** is the canonical color space — all other formats (HSL, hex, RGB) are generated
- **Patina is the reference implementation** — www converges toward Patina, not the other way around
- **W3C DTCG format** for all token JSON (`$value`, `$type`, `$description`)
- Build pipeline: `tokens/*.json` → `build/config.ts` → `build/dist/` (oklch.css, hsl.css, hex/colors.json, tailwind/preset.js)

## Development Commands

```bash
npm run validate            # Check token JSON for broken references and missing $type
npm run validate:rules      # Check visual-rules.yml (YAML syntax, test blocks, emdashes, convention, sidebar)
npm run validate:all        # Run both validators
npm run build               # Generate build/dist/ outputs from token source
npm run test:browser        # Cross-browser smoke tests (Playwright, chromium/webkit/firefox)
npm run test:browser:install # Install Playwright browser binaries (one-time setup)
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
- Schema (v2.1.0): every rule must have `id`, `severity`, `type`, `description`
- `type: "reference"` entries omit severity (informational, not enforced)
- Every guidance rule needs both a floor AND a ceiling — AI agents optimize toward maximums without upper bounds
- Cross-file consistency: if a value appears in rules, foundations, and specimens, all three must match

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
