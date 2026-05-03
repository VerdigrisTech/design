# Slides examples — provenance

Reference deck examples that demonstrate the four sales-collateral genres
(pilot kickoff, customer 101, partner enablement, internal team) against
the six visual rules graduated in PR #43.

Each example has a documented origin so reviewers can judge whether the
demonstrated patterns map to a real engagement shape or are fictional
illustrations only.

| Example file | Origin | Status | GTM review |
|---|---|---|---|
| `abcam-kickoff-redux.html` (filename retains a real customer name from the initial draft; rename pending a separate PR per LEARNINGS.md) | Fictional / illustrative content. The HTML body uses the fictional placeholder "Acme Life Sciences" throughout; only the filename slug carried the original real-customer name forward. | SHIPPED in PR #43 | Not required (content is fictional; allowlisted in `validate-rules.ts` with a tracking note) |
| `verdigris-101-redux.html` | Fictional | SHIPPED in PR #43 | Not required (fictional) |
| `apex-trading-pilot-kickoff-from-lightfield.html` | Lightfield-derived. Source: a new prospect engagement currently in the kickoff window (last 2 weeks; first kickoff meeting upcoming). Customer industry, scope, role assignments, and timeline are real-shape; customer name, contact names, site identifiers, and dollar amounts are fictional substitutes per LEARNINGS.md PII discipline. | DRAFT | Pending — see Linear ticket linked in the Wave 1 PR description |

## Provenance discipline

**Why this matters.** Reference examples teach the cells more effectively
when they sit in the context of real engagements, not invented ones. But
public-package PII discipline (LEARNINGS.md, "Public packages need a PII
review") forbids customer reconnaissance data from shipping. The bridge
is *engagement-shape preservation with full identity substitution*: keep
the industry, scope, anchor pattern, role assignments, and cadence; replace
every identifying string with a fictional placeholder.

**Anonymization checklist for any new Lightfield-derived example:**

1. Customer name → fictional placeholder (industry-coherent but searchably
   unaffiliated with any real company in the same space).
2. Site nicknames / facility codes → generic descriptors ("the West Coast
   site," "the lead factory") never the real nickname.
3. Equipment IDs / serials → omit or replace with generic descriptors
   ("the redundant PDU branch," not the actual serial).
4. Vendor / partner names → generic ("the third-party installer").
5. Specific dollar amounts → bracket with caveats ("[anchor metric pending]")
   unless the figure has been published in a sanctioned case study.
6. Real Verdigris team member names → keep (Mark Chung, Thomas Chung, Mike
   Mahedy, Jon Chu are public per the existing voice-foundation policy).
7. Internal channel names / Slack workspace identifiers → never include.

**DRAFT marker.** Every Lightfield-derived example must carry a top-of-file
HTML comment block with: prepared date, anonymization assertion, GTM-review
status, and a generic source descriptor (never the real customer name).
Use the `<!-- DRAFT: ... -->` HTML comment form. The square-bracket form
of the same word is reserved by `lint-external.ts` as a stale-marker
sentinel; do not use it in shipping files.

**Removal path.** When GTM either grants permission to use the real
customer or confirms permanent fictionalization, this README and the
DRAFT comment block in the corresponding HTML must be updated atomically.
The "from-lightfield" suffix in the filename signals the file's origin
once GTM clears it; rename to drop the suffix once the example is approved
for public exposure.
