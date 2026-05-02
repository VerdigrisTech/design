# Voice — A Verdigris Foundation

Voice ingredients are the building blocks of Verdigris's writing. They're not modes to switch between. They're qualities to mix.

A blog post for operators might use 60% technical precision + 30% operator empathy + 10% humor. The same topic rewritten for an executive audience might use 40% strategic narrative + 30% technical precision + 20% mission gravity + 10% warmth.

Content often reaches multiple audiences. A case study goes to the operator who lived it, their VP who needs strategic value, and the board member who wants evidence. Good Verdigris content layers ingredients so each reader finds what they need without the others feeling it's not for them.

Voice is part of the design system because it shapes every Verdigris surface — the same way color, typography, and motion do. A page can be on-brand visually and off-brand in voice (or vice versa). Both have to land.

## Files

- `ingredients.yaml` — the 7 voice ingredients and what each sounds like
- `feelings.yaml` — the emotional outcomes we design for
- `recipes.yaml` — how to mix ingredients for specific content types
- `team/` — team member voice profiles (additional source material that extends what the founders provide)
- **`USE.md` — the missing manual: when to apply, edge cases, failure modes, LLM self-prompt. Read this before writing.**

## Team voice profiles

Profiled from Slack messages (April 2026). Each person is an additional source for existing ingredients, not a new ingredient.

| Person | File | What they add |
|--------|------|---------------|
| Josh Avalos | `team/josh-avalos.yaml` | Builder energy, maker's joy, field troubleshooting |
| Jimit Shah | `team/jimit-shah.yaml` | Market fluency, outside-in framing, structured leadership |
| Seren Coskun | `team/seren-coskun.yaml` | People intelligence, diplomatic precision, cross-cultural range |
| Mike Mahedy | `team/mike-mahedy.yaml` | Field credibility, industry insider voice, manufacturing fluency |
| Thomas Chung | `team/thomas-chung.yaml` | Systems-thinking leadership, transparent operational care, taste editorial |
| Mark Chung | `team/mark-chung.yaml` | Strategic narrative, mission gravity, editorial vision, founder voice |
| Jon Chu | `team/jon-chu.yaml` | Field-credible engineering depth, scope discipline, bench diagnostic |

### Not yet profiled (insufficient Slack data)

**Prashanth Shetty** (U072APQ694Y) — Only 11 messages found in public channels. To profile: pull from private engineering channels, GitHub PR comments, Linear activity.

**Zeeshan Mohammed** (U05M6KLP4BC) — Only 2 messages found. To profile: pull from private channels, Linear/Notion activity, meeting recordings.

## How to use

When writing any Verdigris content, work through these six questions in order. The first two are the ones writers most often skip — and skipping them is where voice goes wrong.

1. **What's the SUBJECT?** Product, company, customer relationship, team, individual, or external category. The same audience reads about a product page and a vision page differently because the subject differs. *If subject = company, the product is warrant — not centerpiece.*
2. **What's the FORM?** Reference doc, narrative essay, argument, playbook, data sheet, share doc, status update. Form mismatch is more expensive than tone mismatch — a reference doc written as a story dates poorly.
3. **Who reads this?** Operator, executive, candidate, investor, peer, cofounder, board, partner.
4. **What should they feel after?** Relief, curiosity, confidence, warmth, belonging, respect. (See `feelings.yaml`.)
5. **What ingredients serve those feelings?** See `recipes.yaml`. If your use case isn't in the recipes list exactly, see `USE.md` for edge cases.
6. **Write, then check.** Does the draft produce those feelings, or does it just convey information? See `USE.md` for failure modes — patterns that show up when something is off.

## What lives where

Voice was previously bundled at `verdigriswww/canonical/voice/`. It now lives in `VerdigrisTech/design/voice/` because voice is a foundation of the design system, not a marketing artifact. Other design foundations (color, typography, motion, accessibility) sit alongside in `design/foundations/` — voice gets its own top-level directory because it's a multi-file sub-system rather than a single doc.
