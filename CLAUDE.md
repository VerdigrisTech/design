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
npm run validate   # Check token JSON for broken references and missing $type
npm run build      # Generate build/dist/ outputs from token source
```

## Pre-Commit Checklist

Before every commit that changes tokens:
1. `npm run validate` — must pass with 0 errors
2. `npm run build` — regenerate outputs
3. Commit build outputs alongside token changes

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
- Every rule needs a severity level (`error` or `warning`)
- Include description explaining why the rule exists

## Content Guidelines

- **Don't hardcode design values in docs** — reference token names (e.g., "use `color.brand.verdigris`" not "use `#0fc8c3`")
- **Asset naming:** lowercase, hyphens, prefix with `good-` or `bad-` for examples
- **Screenshots:** 2x resolution, max 2400px wide, PNG format

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
