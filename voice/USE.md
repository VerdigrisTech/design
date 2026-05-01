# Voice — Use Manual

The recipes are a destination. This file is the path to the destination.

If you're an LLM about to write Verdigris content, read this once, then ground yourself with the self-reflection prompt at the bottom before writing.

If you're a human, this is the place to look when:
- The recipe lookup didn't quite match your use case.
- The first draft feels off but you can't name why.
- You're reviewing someone else's Verdigris writing and want a checklist.

---

## 1. Edge-case recipe map

The recipes in `recipes.yaml` cover the common content types directly. Most real writing is somewhere between two of them. When in doubt:

| Use case | Closest recipes | How to mix |
|---|---|---|
| **Internal vision share to cofounders + board + future hires** | `investor_update` (primary) + `careers_page` (for the future-hire reach) | Mark's voice dominates per `investor_update`. Tilt toward belonging — but reach for it through earned mission gravity, not warmth tactics. *Do not* anecdote-and-name-people; that's a `careers_page` move that fails when the doc is reference-shaped. |
| **All-hands or town hall content** | `investor_update` (analytical) + `careers_page` (belonging) | Different mix from the above: lead with belonging since the audience is mostly internal. Mark's strategic narrative; Thomas's transparent operational register. |
| **Product launch announcement** | `homepage` (positioning) + `product_page` (specifics) + `linkedin_post` (human) | Lead with the operator problem (`product_page`), close with named-author personal post (`linkedin_post`). Avoid generic hero-launch language. |
| **Internal RFC / design doc** | `technical_blog` (depth) + `investor_update` (clarity-of-thought) | Jon's technical_precision dominates. Self_honesty about what you don't know yet beats tidy conclusions. |
| **Customer-facing email response** | `case_study` voice (their problem first) + `partner_materials` (collaborative tone) | The customer's voice is the primary voice; let them say the thing, you confirm. |
| **Team retrospective summary** | `investor_update` (self_honesty foreground) | Honest about what didn't work, specific about what did. No aphoristic self-criticism. |
| **One-pager / data sheet** | `product_page` (operator empathy) + `case_study` (numbers) | Specifics wherever a vague phrase would have lived. |

If your use case isn't in the recipes list and isn't here either: **pick the recipe whose `target_feelings` field most matches yours**, then adapt the mix using the failure modes below as guardrails.

---

## 2. Failure-mode catalog

Patterns that show up when voice is going wrong, with detection signals you can use mid-draft or in review.

### 2.1 Inlining product evidence in a company-subject doc

**What it looks like:** A vision or strategy doc whose body is mostly customer quotes, case study numbers, and product positioning phrases.

**Detection signals:**
- The second draft's specifics are all about *what we sell* rather than *what the company does internally*.
- Customer names appear in the load-bearing argument, not as warrant.
- The doc reads as a sales deck even though the audience is internal.

**Fix:** Distinguish *internalizing* canonical from *inlining* it. Internalize voice, framing, and perspective; inline evidence only when the SUBJECT of the doc is the product. For company-subject docs, the product is warrant — one or two references that ground claims, not the centerpiece.

### 2.2 Anecdote in a reference doc

**What it looks like:** A vision or principles doc that opens with "Last Thursday..." or names specific people whose roles might change.

**Detection signals:**
- The lede is dated by an incident, season, or recent news.
- The reader, six months later, would have to translate the anecdote rather than reach for the rule.
- Named individuals carry argument-weight rather than supplying warmth.

**Fix:** Reference docs need timeless framing. Replace anecdotes with definitions. Replace named people with role archetypes (Operator-with-agents, Canonical author, etc.). The test: would this paragraph read as well in 18 months? If not, it's anecdote.

### 2.3 McKinsey triplets

**What it looks like:** Rule-of-three sentences with all-abstract verbs. *"Catalogs every capability, governs every action, accumulates organizational memory."*

**Detection signals:**
- Three abstract verbs in parallel structure.
- No specifics, no nouns the reader can ground.
- Could be lifted verbatim into any B2B SaaS deck.

**Fix:** Replace with one concrete sentence containing nouns. *"One place every agent gets called from. One audit log. One canonical/ that everyone reads from and writes back to."* Same shape (three beats) but each beat names a real artifact.

### 2.4 Performative self-honesty

**What it looks like:** Aphoristic self-criticism that doesn't admit anything specific. *"We don't pretend to be unbreakable; we plan for what could break us."*

**Detection signals:**
- The self-honesty is general, not particular.
- Replacing it with the opposite ("we are unbreakable") would be the only version a marketing deck could write.
- No actual admission of stage, miss, or limit.

**Fix:** Genuine self-honesty is specific. *"Twenty people, lean by design."* *"That thesis turned out to be only half right."* *"The Notion query silently errored, so the all-clear post was wrong."* Self-honesty admits something a competitor would not say about themselves.

### 2.5 Voice-shape overshoot

**What it looks like:** A correction in response to "this feels cold" that goes all the way to anecdote-and-warmth, when the actual problem was a few specific cold passages.

**Detection signals:**
- The rewrite changed the document's *form*, not its *passages*.
- The reviewer's critique was tonal but the response was structural.
- The rewrite introduces new failure modes (anecdote in reference doc, named people in durable artifact).

**Fix:** Before going wide on a rewrite in response to tonal pushback, identify which specific passages are off and which are fine. Rewrite the passages, keep the structure. Form changes are expensive; tonal fixes are cheap.

### 2.6 Lookup-table thinking

**What it looks like:** Treating the recipes as a destination — opening `recipes.yaml`, picking one, writing. Skipping the SUBJECT and FORM questions because the recipe seemed to apply.

**Detection signals:**
- The first draft used a recipe but produces wrong feelings.
- Reading back, the subject of the doc is different from the recipe's primary_audience target.
- The recipe was the closest match but not actually *right*.

**Fix:** The recipes are the destination, not the path. Walk through the six questions in `README.md`'s "How to use" first, especially SUBJECT and FORM. Only then open `recipes.yaml`. If no recipe matches exactly, see Section 1 of this file.

---

## 3. LLM self-reflection prompt

Before writing in Verdigris voice, an LLM should produce this paragraph (out loud, in scratchpad, or in its own preamble) — or the human invoking it should pose the questions and wait for answers:

> *Before I write, I'm grounding:*
>
> *Subject: ___________ (product / company / customer relationship / team / individual / external category)*
>
> *Form: ___________ (reference doc / narrative essay / argument / playbook / data sheet / share doc / status update)*
>
> *Audience: ___________ (operator / executive / candidate / investor / peer / cofounder / board / partner)*
>
> *Feelings I'm aiming for: ___________ (from `feelings.yaml`)*
>
> *Closest recipe: ___________ (from `recipes.yaml`; if no exact match, the closest one + the adaptation note from `USE.md` Section 1)*
>
> *Failure mode I'll watch for in this specific use case: ___________ (from `USE.md` Section 2 — pick the one most likely to bite this content type)*
>
> *Now I'll write.*

This is not bureaucracy. It's the difference between writing well-on-the-first-try and writing-then-rewriting-after-correction. The 30 seconds it takes to fill in the blanks pays for itself within the first paragraph.

---

## 4. After you write

Re-read the draft holding two questions:

1. **Does it produce the feelings I targeted?** If not, the mix is off — go back to ingredients, not to recipes.
2. **Does any passage trip a failure mode in Section 2?** If yes, fix that passage. Don't restructure the doc.

If a reviewer's critique is tonal, fix passages. If a reviewer's critique is structural ("this should be a reference, not a story"), fix the form — but only after asking *which* passages prompted the critique. Form changes that aren't load-bearing are how good docs get rewritten into worse ones.

---

## 5. Sources

- `ingredients.yaml` — the 7 ingredients in detail
- `recipes.yaml` — content type → mix
- `feelings.yaml` — emotional outcomes
- `team/*.yaml` — voice profiles, including specific verbal fingerprints

This file is the meta-layer. Everything else is the substance.
