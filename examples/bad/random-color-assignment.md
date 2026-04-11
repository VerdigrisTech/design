---
layout: visual
title: "Bad: Random Color Assignment"
category: color
classification: bad
---

<div class="v-demo">
  <span class="v-badge v-badge-fail">FAIL</span>
  <div style="display:grid;gap:0;border-radius:0.625rem;overflow:hidden;">
    <div style="background:oklch(0.141 0.005 285.823);position:relative;padding:2rem;">
      <div style="position:absolute;inset:0;background:oklch(0.87 0.1786 92.23 / 8%)"></div>
      <div style="position:relative;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.87 0.1786 92.23);">Technology</span>
        <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">Platform features</h3>
        <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Yellow/results palette on a technology section &mdash; wrong semantic match</p>
      </div>
    </div>
    <div style="background:oklch(0.141 0.005 285.823);position:relative;padding:2rem;border-top:1px solid oklch(1 0 0 / 10%);">
      <div style="position:absolute;inset:0;background:oklch(0.75 0.1286 191.57 / 15%)"></div>
      <div style="position:relative;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:0.625rem;text-transform:uppercase;letter-spacing:0.1em;color:oklch(0.75 0.1286 191.57);">Capacity Recovery</span>
        <h3 style="color:oklch(0.985 0 0);font-family:Lato,sans-serif;font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem;">Stranded capacity</h3>
        <p style="color:oklch(0.705 0.015 286.067);font-size:0.875rem;margin:0;">Trust/teal palette on a recovery section &mdash; should use growth (green)</p>
      </div>
    </div>
  </div>
</div>

<details class="v-details" markdown="1"><summary>Documentation</summary>

# Bad: Random Color Assignment

## Category
color

## Classification
bad

## What to Notice
- Colors are assigned arbitrarily — yellow for technology, teal for capacity recovery
- No semantic relationship between content and palette region
- Violates `color.palette-semantics.no-random-color`: section accents must match content category
- This is worse than monotone — it actively misleads by creating false associations

## Tokens Referenced
- `color.palette-semantics.trust` — should be used for technology, not recovery
- `color.palette-semantics.results` — yellow region used incorrectly for technology
- `color.palette-semantics.growth` — should be used for capacity recovery

## Fix
Match content to the correct palette region:
- **Technology** → trust region (teal): `oklch(0.75 0.1286 191.57 / 15%)`
- **Capacity Recovery** → growth region (green): `oklch(0.7698 0.1588 137.1 / 10%)`

</details>
