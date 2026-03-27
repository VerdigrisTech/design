# Figma Tokens Studio Sync

How to keep Figma design variables in sync with the canonical tokens in this repo.

## Overview

[Tokens Studio for Figma](https://tokens.studio/) is a Figma plugin that reads W3C DTCG token JSON files and maps them to Figma variables and styles. This enables a bidirectional workflow:

- **Code → Figma:** Push token changes from this repo into Figma variables
- **Figma → Code:** (Optional) Pull experimental token changes from Figma back into JSON for review via PR

The canonical direction is **code → Figma**. This repo is the source of truth; Figma consumes it.

## Setup (One-Time)

### 1. Install Tokens Studio plugin

In Figma: Plugins → Search "Tokens Studio" → Install

### 2. Connect to GitHub repo

In Tokens Studio settings:
- **Sync provider:** GitHub
- **Repository:** `VerdigrisTech/design`
- **Branch:** `main`
- **Token file path:** `tokens/`
- **Personal access token:** Create a GitHub PAT with `repo` scope

### 3. Map token groups to Figma collections

| Token file | Figma variable collection | Notes |
|-----------|--------------------------|-------|
| `tokens/color/base.json` | `Primitives / Color` | Raw palette values |
| `tokens/color/semantic-light.json` | `Semantic / Light` | Light mode mappings |
| `tokens/color/semantic-dark.json` | `Semantic / Dark` | Dark mode mappings |
| `tokens/typography/font-family.json` | `Typography / Families` | Font stacks |
| `tokens/typography/scale.json` | `Typography / Scale` | Sizes, weights, line-heights |
| `tokens/spacing/base.json` | `Spacing / Base` | 4px grid scale |
| `tokens/spacing/layout.json` | `Spacing / Layout` | Container, section, hero |
| `tokens/radius.json` | `Radius` | Border radius scale |
| `tokens/breakpoints.json` | `Breakpoints` | Responsive widths |
| `tokens/motion/duration.json` | (reference only) | Figma doesn't support motion |
| `tokens/motion/easing.json` | (reference only) | Figma doesn't support motion |
| `tokens/elevation/shadow.json` | `Elevation / Shadow` | Box-shadow effects |
| `tokens/elevation/z-index.json` | (reference only) | z-index is code-only |

### 4. Apply token sets

In Tokens Studio, enable the token sets you want active:
- For light mode designs: enable `base` + `semantic-light`
- For dark mode designs: enable `base` + `semantic-dark`

## Workflow

### When tokens change in code

1. A PR merges token changes to `main`
2. In Figma, open Tokens Studio → Pull from GitHub
3. Review the diff in the plugin
4. Apply changes → Figma variables update automatically
5. Existing components using those variables update in place

### When experimenting in Figma

1. Make experimental changes in Tokens Studio
2. Push to a new branch (never push directly to `main`)
3. Open a PR in GitHub for review
4. If approved, the PR merges and becomes the new canonical value
5. Run `npm run build` to regenerate all output formats

## Token Format Compatibility

This repo uses W3C DTCG format (`$value`, `$type`, `$description`). Tokens Studio supports this natively since v2.0. Ensure your plugin is updated to v2.0+.

Token references (`{path.to.token}`) are resolved by both the build pipeline and Tokens Studio, so semantic tokens that reference primitives work in both directions.

## What Requires Figma Access

The following steps require someone with Figma editor access (Daniela):

- [ ] Install Tokens Studio plugin in the team Figma workspace
- [ ] Create the GitHub PAT and configure the sync connection
- [ ] Set up variable collections and map to token files
- [ ] Verify that semantic tokens resolve correctly in both light/dark modes
- [ ] Create a test component (e.g., a button) to confirm variables bind properly

## Hex Values for Static Design

For contexts where Figma variables aren't available (older Figma files, FigJam, presentation tools):

```
Import hex values from: build/dist/hex/colors.json
```

This file is regenerated on every `npm run build` and contains all color tokens as hex strings.

## Related

- [Color foundations](../foundations/color.md) — palette rationale and OKLch details
- [CONTRIBUTING.md](../CONTRIBUTING.md) — how to submit token changes
- [Tokens Studio docs](https://docs.tokens.studio/) — plugin documentation
