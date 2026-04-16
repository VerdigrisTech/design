# Explorations

This is where ideas start. Nothing here is authoritative.

Explorations are prototypes, portfolios, and working-through-something essays. They document what we've tried, what we think, and what we're considering. They are not design system rules, they are not foundations, and other repos should not treat them as canonical.

Pieces of an exploration can graduate when evidence accumulates:
- **→ `categories/`** when a pattern has been used on 2+ real surfaces with positive review
- **→ `foundations/`** when a pattern's rationale is stable and one adversarial review has passed
- **→ `rules/visual-rules.yml`** (as `maturity: experimental`) when ready for enforcement; promotes to `maturity: rule` after 30 days without objections

Graduation is a PR that moves files and updates metadata. Demotion -- moving something back down -- is also valid if evidence shifts. That is not failure.

## What lives here

- **`visual-signature/`** -- the comprehensive portfolio of the visual identity exploration (phase portraits, spectrograms, Pretext text effects, texture studies, recorder tile iterations). Some pieces have graduated: the design model, the Canvas visualization library, the diagnostic color palette, the generic brand rejections, and the `narrate.technical` composition cell all live in their proper homes. The remaining pieces are still exploratory.
- **`visual-signature-demo/`** -- an earlier single-page visualization demo. Superseded by the full portfolio.
- **`taste-essay/`** -- the "Can a Design System Describe Taste?" essay documenting how the palette semantics and composition rules evolved.

## Rules of this directory

- Anything here can change or be deleted at any time.
- Do not import code or copy patterns from explorations without reviewing whether they've graduated.
- Adding new exploration is encouraged. Prototype first, codify later.
- If an artifact has no identified ideal use, it stays here or gets deleted -- we do not build systems around artifacts that lack brand-aligned purpose.
