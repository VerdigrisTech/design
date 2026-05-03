---
layout: default
title: For Consumers
description: Integration guide for consuming @verdigristech/design-tokens
---

# Consumer Integration Guide

This guide is for any project that consumes `@verdigristech/design-tokens`: Patina, www, the evaluator pipeline, the Cowork skill, internal tooling, and external partners.

If you read top-to-bottom, you will be running with the package in about 5 minutes. The rest is reference.

## Quick start (5 minutes)

```bash
npm install @verdigristech/design-tokens
```

The package is published to GitHub Packages under the `@verdigristech` scope. Authenticate first with a `~/.npmrc` entry:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
@verdigristech:registry=https://npm.pkg.github.com
```

Pin to an exact version in `package.json`. Floats invite drift across consumers:

```json
{
  "dependencies": {
    "@verdigristech/design-tokens": "0.8.0"
  }
}
```

That is enough to import any of the surfaces below.

## What ships in the package

| Surface | Path | Use when |
|---|---|---|
| JS module | `@verdigristech/design-tokens` | Reading token values from JS / TS |
| Tailwind preset | `@verdigristech/design-tokens/tailwind` | Adding tokens to a Tailwind project |
| CSS variables (OKLch) | `@verdigristech/design-tokens/css/oklch` | Patina-style modern stylesheets |
| CSS variables (HSL) | `@verdigristech/design-tokens/css/hsl` | Legacy stylesheets without OKLch support |
| Hex JSON | `@verdigristech/design-tokens/hex` | Email, print, Figma exports |
| Print stylesheets | `@verdigristech/design-tokens/print/<name>.css` | Whitepaper, slides, one-pagers, case studies |
| Token JSON | `@verdigristech/design-tokens/tokens/<path>` | Raw W3C DTCG token files |
| Visual rules | `@verdigristech/design-tokens/rules/<name>` | Evaluator pipeline rule loading |
| Voice recipes | `@verdigristech/design-tokens/voice/<file>` | Content generation systems |

`voice/team/*` is intentionally not exported. It contains real personal voice profiles and is repo-internal per Loop 5O. The `npm run test:package` check enforces this at build time.

## Tailwind preset

Use the preset to inherit the full token surface (colors, spacing, font sizes, radii) with one import. Extend it with project-specific overrides.

```js
// tailwind.config.js
import designPreset from '@verdigristech/design-tokens/tailwind';

export default {
  presets: [designPreset],
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      // project-specific additions go here, not in the preset
      colors: {
        'patina-feature': 'oklch(0.6 0.18 90)',
      },
    },
  },
};
```

Failure mode prevented: hand-coding `#0fc8c3` across files. When the OKLch reference shifts in v5, your preset picks it up; hand-coded hex stays wrong forever.

## Raw JS token consumption

The default export module exposes flat-key dictionaries. Keys are the full token path; values are resolved primitives. Use this pattern for Canvas, Remotion, evaluator code, or any non-Tailwind consumer.

```js
// ESM
import {
  hexColors,
  typography,
  spacing,
  elevation,
  radius,
  viz,
  durations,
  easings,
} from '@verdigristech/design-tokens';

hexColors['color.brand.verdigris'];      // '#0fc8c3'
typography['fontSize.h1'];               // '4rem'
spacing['spacing.4'];                    // '1rem'
spacing['spacing.print.cover.deck-to-byline-min']; // '1.4in'
elevation['shadow.md'];                  // '0 4px 6px -1px rgb(0 0 0 / 0.1), ...'
elevation['zIndex.overlay'];             // 50
radius['radius.base'];                   // '0.625rem'
viz.trace.primary;                       // '#0fc8c3'
durations.normal;                        // 200
easings.revealCubic(0.5);                // 0.875
```

```js
// CommonJS (Node, older toolchains)
const tokens = require('@verdigristech/design-tokens');
console.log(tokens.hexColors['color.brand.verdigris']);
```

For raw token JSON without the resolved-primitive convenience:

```js
import baseColor from '@verdigristech/design-tokens/tokens/color/base.json' with { type: 'json' };
```

Failure mode prevented: parsing tokens directly from disk in each consumer. Each parser invents its own reference-resolution and dotted-path convention; over a year, three consumers ship three subtly different views of the same token.

## CSS reference stylesheets

```css
/* Modern browsers, Patina pattern */
@import '@verdigristech/design-tokens/css/oklch';

.hero { color: var(--color-brand-verdigris); }
```

```css
/* Legacy fallback. Prefer OKLch when you can. */
@import '@verdigristech/design-tokens/css/hsl';
```

For paged PDF formats, import the matching print stylesheet:

```css
@import '@verdigristech/design-tokens/print/cover.css';        /* whitepaper covers */
@import '@verdigristech/design-tokens/print/slides.css';       /* sales decks */
@import '@verdigristech/design-tokens/print/one-pager.css';    /* leave-behinds */
@import '@verdigristech/design-tokens/print/case-study.css';   /* customer stories */
```

When to choose `oklch.css` vs `hsl.css`: ship OKLch if your audience is on a recent Chromium, Safari, or Firefox release. Use HSL only as a fallback for legacy SSR pipelines or email clients. Ship both with `@supports` if you need to bridge.

Failure mode prevented: redefining brand colors in each downstream stylesheet. The CSS variables are the canonical surface; hand-redefining `--color-brand-verdigris` locally means a brand refresh requires N find-replace passes.

## Voice recipes and ingredients

Content generation systems (Cowork skill, AI agents writing on Verdigris's behalf) consume the public voice surface:

```js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const recipesPath = require.resolve(
  '@verdigristech/design-tokens/voice/recipes.yaml'
);
const recipes = yaml.load(readFileSync(recipesPath, 'utf-8'));

// Pick the recipe for the surface you are writing for
const homepage = recipes.recipes.homepage;
// homepage.mix is { strategic_narrative: 35, technical_precision: 25, ... }
```

Three companion files round out the public voice surface:

| File | Purpose |
|---|---|
| `voice/recipes.yaml` | Ratio mixes per surface (homepage, case study, slide deck, etc.) |
| `voice/ingredients.yaml` | The ingredient definitions referenced by every recipe |
| `voice/feelings.yaml` | Target emotional outcomes per audience |
| `voice/USE.md` | Read this once before generating any content |
| `voice/README.md` | Overview of the voice system |

`voice/team/*.yaml` is **not** part of the public surface. Those files contain individual voice profiles and stay inside this repo only. Do not vendor them into a downstream codebase even if you have a copy locally.

Failure mode prevented: Cowork or any other skill picking a recipe by guessing. Ground every generation in a recipe lookup; if no recipe fits, file a Linear issue against this repo to add one.

## Visual rules YAML

The evaluator pipeline (and any future linter) consumes `rules/visual-rules.yml` to enforce design constraints across surfaces.

```js
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import yaml from 'js-yaml';

const require = createRequire(import.meta.url);
const rulesPath = require.resolve(
  '@verdigristech/design-tokens/rules/visual-rules.yml'
);
const rules = yaml.load(readFileSync(rulesPath, 'utf-8'));
// rules.rules is an array of { id, severity, type, description, test, maturity? }
```

Schema notes for evaluator authors:

- Every rule has `id`, `severity`, `type`, `description`.
- `type: "constraint"` rules carry a `test` block (regex, min/max, value, values, or llm_eval).
- `type: "reference"` entries are informational and have no severity.
- `maturity` controls enforcement: `experimental` (warning), `convention` (warning + justify), `rule` (default, blocks merge), `invariant` (axiomatic).
- All `llm_eval` prompts use the YES = violation convention. Invert if your evaluator expects the opposite.

Failure mode prevented: an evaluator silently passing rules it does not understand. Validate the schema version before loading; the file declares it in the header (`Version: 4.x.x`).

## Worked example: Cowork skill

Cowork generates content on Verdigris's behalf. It needs three things from this package: a voice recipe, the brand colors that will appear in any rendered preview, and the rules YAML for an evaluator pre-flight check.

```js
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import yaml from 'js-yaml';
import { hexColors } from '@verdigristech/design-tokens';

const require = createRequire(import.meta.url);

function loadYaml(spec) {
  return yaml.load(readFileSync(require.resolve(spec), 'utf-8'));
}

const recipes = loadYaml('@verdigristech/design-tokens/voice/recipes.yaml');
const ingredients = loadYaml(
  '@verdigristech/design-tokens/voice/ingredients.yaml'
);
const rules = loadYaml(
  '@verdigristech/design-tokens/rules/visual-rules.yml'
);

export function buildContext(surface) {
  const recipe = recipes.recipes[surface];
  if (!recipe) {
    throw new Error(`No recipe for surface "${surface}". File a Linear issue.`);
  }
  return {
    recipe,
    ingredients: ingredients.ingredients,
    rules: rules.rules,
    palette: {
      primary: hexColors['color.brand.verdigris'],
      ink: hexColors['color.neutral.950'],
      paper: hexColors['color.neutral.50'],
    },
  };
}
```

This pattern keeps Cowork pinned to a known recipe matrix. When this repo adds a new recipe (say, `partner-enablement-deck`), Cowork picks it up after a `npm install` of the new version. No Cowork code change required.

## Versioning and breaking-change policy

This package follows semver. Releases are automated by the `auto-release.yml` workflow on merge to `main`.

| Bump | Triggers | Examples |
|---|---|---|
| **Major** | PR labeled `major`, or `BREAKING CHANGE` in commit body | Renamed token paths, removed tokens, schema changes that break evaluator pipelines |
| **Minor** | PR labeled `minor`, or any `feat()` commit prefix | New tokens, new rules, new recipes, new compositions |
| **Patch** | Default | Value tweaks, doc updates, YAML corrections |

What is part of the contract:

- Every exported member of the JS module (`hexColors`, `typography`, `spacing`, `elevation`, `radius`, `viz`, `durations`, `easings`).
- The Tailwind preset's color, spacing, fontSize, and borderRadius keys.
- Every CSS variable name in `oklch.css` and `hsl.css`.
- The shape of every published JSON token file.
- The IDs of every rule in `visual-rules.yml`.
- The `voice/recipes.yaml`, `voice/ingredients.yaml`, `voice/feelings.yaml` schemas.
- The `print/*.css` class names.

Renaming or removing any of the above requires a major bump.

What is **not** part of the contract:

- Internal token values may shift within a minor bump if the canonical source moves (for example, Patina ships a calibrated brand teal). Consumers reading via tokens or CSS variables get the new value automatically.
- Rule values (min/max, threshold) may tighten within a minor bump if no surface currently violates the new bound.
- Voice recipe mixes may shift within a minor bump.

The `npm run test:package` script enforces the package surface boundary. Adding a directory to `package.json#files` requires updating the test's positive list.

## Pinning strategy

| Consumer type | Recommended pin |
|---|---|
| Patina (reference implementation) | Track `main` via git dependency for fast iteration |
| www site | Pin to the latest minor; bump on release |
| Evaluator pipeline | Pin to an exact version; coordinate bumps with rule authors |
| External partners | Pin to a specific minor; review changelog before bumping |
| AI skills (Cowork, internal tools) | Pin to an exact version; CI bumps via dependabot |

Floating ranges (`^0.8.0`, `~0.8`) work but make change attribution harder. Pin exactly when you can.

## Filing integration issues

If anything in this guide is wrong, missing, or unclear, file an issue against `VerdigrisTech/design` with the label `consumer-integration` and a one-line description of what you tried to do.

For Linear users: file under team Z2O, project "Design System: VerdigrisTech/design". Include:

- The consumer (Patina, www, evaluator, Cowork, partner name).
- The version pinned (`@verdigristech/design-tokens@x.y.z`).
- The pattern that did not work (paste the import or the runtime error).
- What you expected.

Most consumer issues are documentation gaps. Filing the issue closes that gap for the next consumer.

## Related reading

- [`README.md`](README.md): repo overview and quick links.
- [`CLAUDE.md`](CLAUDE.md): project conventions, build pipeline, release process.
- [`AGENTS.md`](AGENTS.md): how AI agents should consume this repo.
- [`LEARNINGS.md`](LEARNINGS.md): production-process patterns the design repo absorbs from real consumer integrations.
- [`workflows/pii-review.md`](workflows/pii-review.md): why `voice/team/*` is repo-internal.
