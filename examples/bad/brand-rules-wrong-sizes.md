# Bad: Using brand_rules.yml Typography Sizes

## Category
typography

## Classification
bad

## What to Notice
- `brand_rules.yml` specifies H1 as 3.5rem and H2 weight as 600
- The production CSS uses H1 at **4rem** and H2 weight at **700**
- Using the YAML values creates a visual mismatch with the live site
- The YAML file was never updated after the CSS was refined

## Tokens Referenced
- `fontSize.h1` — canonical: 4rem (not 3.5rem)
- `fontWeight.bold` — canonical: 700 (not 600)

## Fix
Always use the design token values from this repo, not `brand_rules.yml`. The design section of `brand_rules.yml` is deprecated and will be removed in Phase 3. Until then, this repo is the source of truth for all visual tokens.
