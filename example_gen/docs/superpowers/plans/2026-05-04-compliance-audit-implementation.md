# compliance-audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a per-artifact CI gate that evaluates committed example artifacts (`categories/{slides,one-pagers}/examples/*.html`) against `rules/visual-rules.yml` using deterministic checks, vision-LLM, and prose-LLM evaluators, and wire it into `.github/workflows/build.yml` alongside the existing `validate:rules` and `audit:cohesion` checks.

**Architecture:** Single TS pipeline at `example_gen/compliance/` orchestrated by a top-level runner. Pipeline: classify → deterministic-eval → render → visual-LLM-batch → prose-LLM-batch → cost-gate → synthesize → report → publish. Mirrors the existing `audit:cohesion` script-shape pattern (tsx entry, self-test, fixtures dir, audits/ output) but is LLM-first rather than deterministic-only.

**Tech Stack:**
- TypeScript via `tsx` (matches root `package.json` script convention)
- `openai` SDK — vision + text via `gpt-4o`
- `playwright` — already in repo; full-page HTML rendering
- `cheerio` — HTML parsing for `<body data-genre>` + suppression-comment scanning
- `yaml` — already used by `build/validate-rules.ts`; reuse the loader
- Self-test pattern: tsx runner with fixtures dir + `expected.json`, mirrors `build/audit/test-cohesion.ts`
- LLM cassettes: minimal homegrown recorder/player at `example_gen/compliance/cassette.ts`. `OPENAI_RECORD=1` records to JSON; default plays back.

**Spec:** `example_gen/docs/superpowers/specs/2026-05-04-compliance-audit-design.md`

---

## File structure

### New files (`example_gen/compliance/`)

| File | Responsibility |
|---|---|
| `types.ts` | Core types: `Rule`, `Finding`, `EvalResult`, `Artifact`, `Suppression`, `Severity`, `Maturity` |
| `load-rules.ts` | YAML loader for `rules/visual-rules.yml`; flattens nested namespaces into a flat `Rule[]` |
| `classify.ts` | HTML parser; derives type from path; reads `<body data-genre>`; applicability filter; partition rules into deterministic / visual-LLM / prose-LLM buckets; genre normalization |
| `suppression.ts` | Parse inline `<!-- compliance-audit:ignore ... -->` comments; validate syntax (rule-id, reason ≥10 chars, linear=Z2O-NNN) |
| `evaluator-deterministic.ts` | Regex / value / values / min-max / pattern checks against HTML source |
| `cost-tracker.ts` | Token counting, cost estimation, accumulator; pricing.json sidecar; budget gate |
| `cache.ts` | Filesystem cache at `.cache/compliance-audit/`; sha256 keys |
| `cassette.ts` | OpenAI SDK call recorder/player for tests |
| `openai-client.ts` | Thin wrapper exposing `callVision()` and `callText()` with retry + cost recording + cache + cassette |
| `evaluator-visual.ts` | Playwright render; batched vision calls (≤8 yes/no per call); maps yes/no responses to findings |
| `evaluator-prose.ts` | Prose extraction from HTML; voice-context loader; batched text calls |
| `synthesize.ts` | Group findings by severity + maturity; compute blocking vs. advisory subsets per spec gate |
| `reporter.ts` | Render `audits/compliance/{ts}-{sha}.{md,json}` + the compliance-audit section of the sticky PR comment |
| `runner.ts` | Top-level orchestrator: walk pipeline, return `EvalResult` per file, write outputs |
| `cli.ts` | Argument parsing; entry point for `npm run audit:compliance` |
| `pricing.json` | `{ "input_per_1m_usd": 2.50, "output_per_1m_usd": 10.00 }` (gpt-4o list price; images are billed via input tokens, not a separate per-unit fee) |
| `test-compliance.ts` | Self-test runner: invokes pipeline against fixtures, asserts findings match `expected.json` |
| `README.md` | Operator notes |

### New files (workflow + skill)

| File | Responsibility |
|---|---|
| `.github/workflows/build.yml` (modify) | Add `compliance-audit` job, `cohesion-audit` job, `pr-comment` aggregator job |
| `.github/scripts/render-pr-comment.ts` | Aggregate JSON outputs from all three checks → single sticky comment markdown |
| `.claude/skills/compliance-audit/SKILL.md` | Claude Code skill orchestration contract |
| `.claude/skills/compliance-audit/README.md` | Maintainer guide |
| `.claude/skills/compliance-audit/DESIGN.md` | Rationale + v0.2 backlog |
| `audits/compliance/.gitkeep` | Ensure directory ships |
| `tests/compliance/fixtures/passing/{slides,one-pagers}/example-*.html` | Known-good fixtures (real, copied from `categories/`) |
| `tests/compliance/fixtures/seeded-failures/{slides,one-pagers}/example-*.html` | Seeded-failure fixtures |
| `tests/compliance/fixtures/expected.json` | Per-fixture expected findings |
| `tests/compliance/cassettes/*.json` | Recorded Anthropic responses for deterministic tests |

### Modified files

| File | Change |
|---|---|
| `package.json` | Add `audit:compliance`, `audit:compliance:smoke`, `test:compliance` scripts; add deps `openai`, `cheerio`, `yaml`, `fast-glob` |
| `.gitignore` | Add `.cache/compliance-audit/` |
| `_layouts/default.html` | Sidebar entry for `audits/compliance/` (mirrors cohesion-audit sidebar entry) |
| `CLAUDE.md` | Add `audit:compliance` + `test:compliance` to Development Commands |

---

## Branch + worktree note

Spec lives on branch `feat/compliance-audit-spec`. Implementation continues on the same branch. No worktree needed — the existing branch is clean.

---

## Phase 1 — Foundation

### Task 1: Add dependencies and scaffolding

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `example_gen/compliance/pricing.json`
- Create: `example_gen/compliance/README.md`
- Create: `audits/compliance/.gitkeep`

- [ ] **Step 1: Install runtime deps**

```bash
npm install --save-dev openai cheerio yaml @types/cheerio fast-glob
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `scripts` block, add:

```json
"audit:compliance": "tsx example_gen/compliance/cli.ts",
"audit:compliance:smoke": "tsx example_gen/compliance/cli.ts --smoke",
"test:compliance": "tsx example_gen/compliance/test-compliance.ts"
```

- [ ] **Step 3: Add cache dir to `.gitignore`**

Append:

```
.cache/compliance-audit/
```

- [ ] **Step 4: Create `pricing.json`**

```json
{
  "model": "gpt-4o",
  "input_per_1m_usd": 2.50,
  "output_per_1m_usd": 10.00,
  "_note": "Update when OpenAI price list changes. Images are billed as input tokens (counted in usage.prompt_tokens) so no separate per-image rate is needed."
}
```

- [ ] **Step 5: Create `audits/compliance/.gitkeep`**

Empty file.

- [ ] **Step 6: Create `example_gen/compliance/README.md`**

```markdown
# compliance-audit

Per-artifact compliance evaluator. Runs in CI via `npm run audit:compliance` and locally for fast feedback. See spec at `../docs/superpowers/specs/2026-05-04-compliance-audit-design.md`.

## Quick reference

- `npm run audit:compliance -- categories/slides/examples/foo.html` — local single-file run
- `npm run audit:compliance:smoke` — full live pipeline against one fixture (uses real LLM budget)
- `npm run test:compliance` — fixture self-test using recorded cassettes (no live LLM calls)
- `OPENAI_RECORD=1 npm run test:compliance` — re-record cassettes (requires `OPENAI_API_KEY`)

## Output

- `audits/compliance/{ISO-utc}-{git-sha}.md` — human-readable report
- `audits/compliance/{ISO-utc}-{git-sha}.json` — machine-readable findings
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .gitignore example_gen/compliance/pricing.json example_gen/compliance/README.md audits/compliance/.gitkeep
git commit -m "feat(compliance-audit): scaffold + deps"
```

---

### Task 2: Core types

**Files:**
- Create: `example_gen/compliance/types.ts`

- [ ] **Step 1: Write `types.ts`**

```typescript
// example_gen/compliance/types.ts
export type Severity = "error" | "warning";
export type Maturity = "experimental" | "convention" | "rule" | "invariant";
export type EvaluatorClass = "deterministic" | "visual-llm" | "prose-llm";

export interface RuleTest {
  regex?: string;
  value?: string | number;
  values?: (string | number)[];
  min?: number;
  max?: number;
  pattern?: string;
  llm_eval?: string | { prompt: string; rubric?: unknown; aggregation?: string };
  input_scope?: string[];
}

export interface Rule {
  id: string;                    // dot-path, e.g. "color.contrast.normal-text"
  namespace: string;             // top-level segment of id
  description: string;
  severity: Severity;
  type: "value" | "pattern" | "constraint" | "reference";
  maturity: Maturity;            // resolved (defaults to "rule" if absent)
  modes?: string[];              // normalized to underscore form
  evaluator?: ("visual" | "prose")[]; // forward-compat override
  test: RuleTest;
  evaluatorClass: EvaluatorClass;
}

export interface Artifact {
  path: string;                  // absolute or repo-relative path
  type: "slides" | "one-pagers"; // derived from path
  genre: string;                 // normalized to underscore form
  confidentiality?: string;
  html: string;                  // raw file contents
}

export interface Suppression {
  ruleId: string;
  reason: string;
  linear: string;                // Z2O-NNN
  file: string;
  line: number;
}

export type FindingStatus =
  | "fail"      // rule fired
  | "pass"      // rule evaluated cleanly
  | "skipped"   // not run (budget, render error, llm error)
  | "suppressed"// fail downgraded to suppressed
  | "n/a";      // not applicable (e.g. prose rule but artifact has no text)

export interface Finding {
  ruleId: string;
  artifactPath: string;
  status: FindingStatus;
  severity: Severity;
  maturity: Maturity;
  message?: string;              // populated on fail
  llmAnswer?: string;            // verbatim model response on llm_eval rules
  skipReason?: "budget" | "render" | "llm-error" | "render-failure";
  suppression?: Suppression;
  costUsd?: number;              // share of batch cost attributed to this rule
}

export interface EvalResult {
  artifact: Artifact;
  findings: Finding[];
  totalCostUsd: number;
  startedAt: string;             // ISO
  finishedAt: string;
}

export interface RunSummary {
  blockingCount: number;
  advisoryCount: number;
  skippedCount: number;
  passedCount: number;
  totalCostUsd: number;
  budgetUsd: number;
  blockingMode: "blocking" | "advisory-repo" | "advisory-pr";
  results: EvalResult[];
}
```

- [ ] **Step 2: Commit**

```bash
git add example_gen/compliance/types.ts
git commit -m "feat(compliance-audit): core types"
```

---

## Phase 2 — Rule loading and classification

### Task 3: Rule loader

**Files:**
- Create: `example_gen/compliance/load-rules.ts`
- Create: `example_gen/compliance/load-rules.test.ts` (tsx-runnable assertions)

- [ ] **Step 1: Write the failing test**

```typescript
// example_gen/compliance/load-rules.test.ts
import { loadRules } from "./load-rules.js";
import { strict as assert } from "node:assert";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "load-rules-"));
const file = path.join(dir, "rules.yml");
writeFileSync(file, `
color:
  id: "color"
  type: "reference"
  description: "Color rules"
  rules:
    - id: "color.brand.teal"
      description: "Brand teal must be exact"
      severity: "error"
      type: "value"
      maturity: "rule"
      test:
        value: "#0fc8c3"
    - id: "color.brand.no-stock"
      description: "No generic imagery"
      severity: "error"
      type: "constraint"
      modes: ["pilot_kickoff", "customer_101"]
      test:
        llm_eval: "Does this surface use stock photography? YES if so, NO otherwise."
`);

const rules = loadRules(file);

// Reference container is excluded; only enforceable rules returned
assert.equal(rules.length, 2, "should flatten nested rules and skip reference container");
assert.equal(rules[0].id, "color.brand.teal");
assert.equal(rules[0].namespace, "color");
assert.equal(rules[0].maturity, "rule");
assert.equal(rules[1].modes?.[0], "pilot_kickoff");
assert.equal(rules[1].evaluatorClass, "visual-llm"); // namespace=color, has llm_eval, no prose token
console.log("PASS: load-rules basic");
```

- [ ] **Step 2: Run it to verify it fails**

```bash
tsx example_gen/compliance/load-rules.test.ts
```

Expected: error like `Cannot find module './load-rules.js'`

- [ ] **Step 3: Implement `load-rules.ts`**

```typescript
// example_gen/compliance/load-rules.ts
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { Rule, Maturity, EvaluatorClass, RuleTest } from "./types.js";

const PROSE_ID_TOKENS = [".voice.", ".diction.", ".tone.", ".audience-fit."];
const VISUAL_NAMESPACES = new Set([
  "brand_rejections", "color", "typography", "spacing", "motion",
  "components", "breakpoints", "elevation", "accessibility",
  "device_accessibility", "video", "visualizations", "three_d_composition",
]);

function isDeterministic(test: RuleTest): boolean {
  return (
    test.regex !== undefined ||
    test.value !== undefined ||
    test.values !== undefined ||
    test.min !== undefined ||
    test.max !== undefined ||
    test.pattern !== undefined
  );
}

function classify(id: string, namespace: string, test: RuleTest): EvaluatorClass {
  if (isDeterministic(test)) return "deterministic";
  if (PROSE_ID_TOKENS.some((tok) => id.includes(tok))) return "prose-llm";
  if (namespace === "voice" || id.startsWith("brand_rejections.voice")) return "prose-llm";
  if (VISUAL_NAMESPACES.has(namespace)) return "visual-llm";
  // Unknown namespace: warn and default to visual-llm
  console.warn(`[load-rules] unknown namespace "${namespace}" for rule "${id}"; defaulting to visual-llm`);
  return "visual-llm";
}

function normalizeMode(m: string): string {
  return m.replaceAll("-", "_");
}

function* walk(node: unknown, prefix = ""): Generator<{ id: string; raw: any }> {
  if (node === null || typeof node !== "object") return;
  for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
    if (key === "id" || key === "type" || key === "description" || key === "rules") continue;
    if (val && typeof val === "object" && "rules" in (val as object)) {
      const sub = val as { rules?: unknown[] };
      if (Array.isArray(sub.rules)) {
        for (const r of sub.rules) yield { id: (r as any).id, raw: r };
      }
      yield* walk(val, `${prefix}${key}.`);
    } else if (val && typeof val === "object") {
      yield* walk(val, `${prefix}${key}.`);
    }
  }
}

export function loadRules(rulesPath: string): Rule[] {
  const raw = parseYaml(readFileSync(rulesPath, "utf8"));
  const out: Rule[] = [];
  for (const { id, raw: r } of walk(raw)) {
    if (!id || !r.test) continue;
    if (r.type === "reference") continue;
    const namespace = id.split(".")[0]!;
    const test: RuleTest = r.test;
    out.push({
      id,
      namespace,
      description: r.description ?? "",
      severity: r.severity,
      type: r.type,
      maturity: (r.maturity as Maturity) ?? "rule",
      modes: Array.isArray(r.modes) ? r.modes.map(normalizeMode) : undefined,
      evaluator: r.evaluator,
      test,
      evaluatorClass: classify(id, namespace, test),
    });
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
tsx example_gen/compliance/load-rules.test.ts
```

Expected: `PASS: load-rules basic`

- [ ] **Step 5: Verify against the real rules file**

```bash
tsx -e "import('./example_gen/compliance/load-rules.ts').then(m => { const r = m.loadRules('rules/visual-rules.yml'); console.log('total:', r.length, 'visual:', r.filter(x=>x.evaluatorClass==='visual-llm').length, 'prose:', r.filter(x=>x.evaluatorClass==='prose-llm').length, 'det:', r.filter(x=>x.evaluatorClass==='deterministic').length); })"
```

Expected: total ≈ 196, with non-zero counts for each class. If counts seem wrong, inspect the partition logic.

- [ ] **Step 6: Commit**

```bash
git add example_gen/compliance/load-rules.ts example_gen/compliance/load-rules.test.ts
git commit -m "feat(compliance-audit): rule loader with classifier"
```

---

### Task 4: Artifact classifier

**Files:**
- Create: `example_gen/compliance/classify.ts`
- Create: `example_gen/compliance/classify.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// example_gen/compliance/classify.test.ts
import { classifyArtifact, applicableRules } from "./classify.js";
import type { Rule } from "./types.js";
import { strict as assert } from "node:assert";

const html = `<!doctype html><html><body class="vd-slide-deck" data-genre="pilot-kickoff" data-confidentiality="CUSTOMER-CONFIDENTIAL"><h1>Hi</h1></body></html>`;
const a = classifyArtifact("categories/slides/examples/foo.html", html);
assert.equal(a.type, "slides");
assert.equal(a.genre, "pilot_kickoff", "hyphen→underscore normalized");
assert.equal(a.confidentiality, "CUSTOMER-CONFIDENTIAL");

const rules: Rule[] = [
  { id: "color.brand.teal", namespace: "color", description: "", severity: "error", type: "value", maturity: "rule", test: { value: "#0fc8c3" }, evaluatorClass: "deterministic" },
  { id: "composition.persuade-pitch.required-toc", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["pilot_kickoff"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
  { id: "composition.persuade-whitepaper.cover-author", namespace: "composition", description: "", severity: "error", type: "constraint", maturity: "rule", modes: ["lab_tradition"], test: { llm_eval: "?" }, evaluatorClass: "visual-llm" },
];
const filtered = applicableRules(rules, a);
assert.equal(filtered.length, 2, "universal + matching-genre apply; non-matching genre filtered");
console.log("PASS: classify basic");
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
tsx example_gen/compliance/classify.test.ts
```

- [ ] **Step 3: Implement `classify.ts`**

```typescript
// example_gen/compliance/classify.ts
import { load as loadHtml } from "cheerio";
import path from "node:path";
import type { Artifact, Rule } from "./types.js";

const TYPE_NAMESPACES: Record<Artifact["type"], string[]> = {
  "slides": ["composition.persuade-pitch", "composition.slides"],
  "one-pagers": ["composition.one-pager"],
};

function deriveType(filePath: string): Artifact["type"] {
  const norm = filePath.replaceAll("\\", "/");
  if (norm.includes("/categories/slides/examples/")) return "slides";
  if (norm.includes("/categories/one-pagers/examples/")) return "one-pagers";
  throw new Error(`unsupported path for v0.1: ${filePath}`);
}

export function classifyArtifact(filePath: string, html: string): Artifact {
  const $ = loadHtml(html);
  const body = $("body").first();
  const genreRaw = body.attr("data-genre");
  if (!genreRaw) throw new Error(`${filePath}: <body data-genre="..."> required`);
  const genre = genreRaw.replaceAll("-", "_");
  const confidentiality = body.attr("data-confidentiality");
  return {
    path: filePath,
    type: deriveType(filePath),
    genre,
    confidentiality,
    html,
  };
}

export function applicableRules(rules: Rule[], a: Artifact): Rule[] {
  const typeNamespaces = TYPE_NAMESPACES[a.type];
  return rules.filter((r) => {
    // Type-scoped: rule namespace nested under a known type prefix BUT not for this artifact's type
    const typePrefixed = ["composition.persuade-pitch", "composition.persuade-whitepaper", "composition.slides", "composition.one-pager", "composition.case-study", "composition.whitepaper-body"];
    const matchedTypePrefix = typePrefixed.find((p) => r.id.startsWith(p + "."));
    if (matchedTypePrefix && !typeNamespaces.includes(matchedTypePrefix)) return false;
    // Genre-scoped: modes set, must include this artifact's genre
    if (r.modes && r.modes.length > 0 && !r.modes.includes(a.genre)) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify PASS**

```bash
tsx example_gen/compliance/classify.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add example_gen/compliance/classify.ts example_gen/compliance/classify.test.ts
git commit -m "feat(compliance-audit): artifact classifier + applicability filter"
```

---

### Task 5: Suppression parser

**Files:**
- Create: `example_gen/compliance/suppression.ts`
- Create: `example_gen/compliance/suppression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// example_gen/compliance/suppression.test.ts
import { parseSuppressions } from "./suppression.js";
import { strict as assert } from "node:assert";

const good = `
<!doctype html><html><body data-genre="pilot-kickoff">
<!-- compliance-audit:ignore brand.visual.no-generic-imagery reason="approved by Mark for Apex pilot" linear="Z2O-1402" -->
<h1>Hi</h1>
</body></html>`;
const sup = parseSuppressions("foo.html", good);
assert.equal(sup.length, 1);
assert.equal(sup[0].ruleId, "brand.visual.no-generic-imagery");
assert.equal(sup[0].linear, "Z2O-1402");

const badNoLinear = `<!-- compliance-audit:ignore brand.x reason="long enough" -->`;
assert.throws(() => parseSuppressions("foo.html", badNoLinear), /linear=/);

const badShortReason = `<!-- compliance-audit:ignore brand.x reason="x" linear="Z2O-1" -->`;
assert.throws(() => parseSuppressions("foo.html", badShortReason), /reason/);

const badTicket = `<!-- compliance-audit:ignore brand.x reason="long enough text" linear="JIRA-1" -->`;
assert.throws(() => parseSuppressions("foo.html", badTicket), /Z2O-/);

console.log("PASS: suppression parser");
```

- [ ] **Step 2: Run (expect FAIL)**

```bash
tsx example_gen/compliance/suppression.test.ts
```

- [ ] **Step 3: Implement**

```typescript
// example_gen/compliance/suppression.ts
import type { Suppression } from "./types.js";

const RE = /<!--\s*compliance-audit:ignore\s+(\S+)\s+reason="([^"]*)"\s+linear="([^"]*)"\s*-->/g;

export function parseSuppressions(file: string, html: string): Suppression[] {
  const out: Suppression[] = [];
  for (const m of html.matchAll(RE)) {
    const [, ruleId, reason, linear] = m;
    if (reason.length < 10) {
      throw new Error(`${file}: suppression for ${ruleId} has reason shorter than 10 chars`);
    }
    if (!/^Z2O-\d+$/.test(linear)) {
      throw new Error(`${file}: suppression for ${ruleId} requires linear="Z2O-NNN", got "${linear}"`);
    }
    const line = html.slice(0, m.index ?? 0).split("\n").length;
    out.push({ ruleId, reason, linear, file, line });
  }
  return out;
}
```

- [ ] **Step 4: Run (expect PASS)**

```bash
tsx example_gen/compliance/suppression.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add example_gen/compliance/suppression.ts example_gen/compliance/suppression.test.ts
git commit -m "feat(compliance-audit): suppression parser with required Z2O ticket"
```

---

## Phase 3 — Deterministic evaluator

### Task 6: Deterministic checks

**Files:**
- Create: `example_gen/compliance/evaluator-deterministic.ts`
- Create: `example_gen/compliance/evaluator-deterministic.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// example_gen/compliance/evaluator-deterministic.test.ts
import { runDeterministic } from "./evaluator-deterministic.js";
import type { Rule, Artifact } from "./types.js";
import { strict as assert } from "node:assert";

const a: Artifact = {
  path: "foo.html",
  type: "slides",
  genre: "pilot_kickoff",
  html: `<style>.x{color:#ff0000;}.y{color:#0fc8c3;}</style><div data-grid="3">...</div>`,
};

const rules: Rule[] = [
  { id: "color.brand.no-red", namespace: "color", description: "", severity: "error", type: "pattern", maturity: "rule",
    test: { regex: "#ff0000" }, evaluatorClass: "deterministic" },
  { id: "color.brand.teal-required", namespace: "color", description: "", severity: "warning", type: "pattern", maturity: "experimental",
    test: { regex: "#0fc8c3" }, evaluatorClass: "deterministic" },
  { id: "spacing.grid.cols", namespace: "spacing", description: "", severity: "error", type: "value", maturity: "rule",
    test: { regex: 'data-grid="(\\d+)"', min: 4, max: 12 }, evaluatorClass: "deterministic" },
];

const f = runDeterministic(a, rules);
assert.equal(f.find(x => x.ruleId === "color.brand.no-red")?.status, "fail");
assert.equal(f.find(x => x.ruleId === "color.brand.teal-required")?.status, "pass");
assert.equal(f.find(x => x.ruleId === "spacing.grid.cols")?.status, "fail", "data-grid=3 below min=4");
console.log("PASS: deterministic eval");
```

- [ ] **Step 2: Run (expect FAIL)**

```bash
tsx example_gen/compliance/evaluator-deterministic.test.ts
```

- [ ] **Step 3: Implement**

```typescript
// example_gen/compliance/evaluator-deterministic.ts
import type { Artifact, Finding, Rule } from "./types.js";

export function runDeterministic(a: Artifact, rules: Rule[]): Finding[] {
  return rules
    .filter((r) => r.evaluatorClass === "deterministic")
    .map((r) => evalOne(a, r));
}

function evalOne(a: Artifact, r: Rule): Finding {
  const base: Pick<Finding, "ruleId" | "artifactPath" | "severity" | "maturity"> = {
    ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity,
  };
  const t = r.test;
  // regex with min/max → numeric extraction; regex alone → presence check;
  // pattern → "must NOT match"; value/values → exact match.
  if (t.regex) {
    const re = new RegExp(t.regex, "g");
    if (t.min !== undefined || t.max !== undefined) {
      const matches = [...a.html.matchAll(re)];
      if (matches.length === 0) {
        return { ...base, status: "fail", message: `pattern ${t.regex} not found; numeric bounds [${t.min}..${t.max}] not satisfiable` };
      }
      for (const m of matches) {
        const captured = Number(m[1] ?? m[0]);
        if (Number.isNaN(captured)) {
          return { ...base, status: "fail", message: `regex ${t.regex} captured non-numeric value: ${m[0]}` };
        }
        if (t.min !== undefined && captured < t.min) {
          return { ...base, status: "fail", message: `value ${captured} below min ${t.min}` };
        }
        if (t.max !== undefined && captured > t.max) {
          return { ...base, status: "fail", message: `value ${captured} above max ${t.max}` };
        }
      }
      return { ...base, status: "pass" };
    }
    return re.test(a.html)
      ? { ...base, status: "pass" }
      : { ...base, status: "fail", message: `pattern ${t.regex} not found` };
  }
  if (t.pattern) {
    const re = new RegExp(t.pattern, "g");
    return re.test(a.html)
      ? { ...base, status: "fail", message: `forbidden pattern ${t.pattern} present` }
      : { ...base, status: "pass" };
  }
  if (t.value !== undefined) {
    return a.html.includes(String(t.value))
      ? { ...base, status: "pass" }
      : { ...base, status: "fail", message: `expected value "${t.value}" not found` };
  }
  if (t.values !== undefined) {
    const ok = t.values.some((v) => a.html.includes(String(v)));
    return ok
      ? { ...base, status: "pass" }
      : { ...base, status: "fail", message: `none of allowed values ${JSON.stringify(t.values)} found` };
  }
  return { ...base, status: "skipped", skipReason: "llm-error", message: "deterministic test had no recognized form" };
}
```

- [ ] **Step 4: Run (expect PASS)**

```bash
tsx example_gen/compliance/evaluator-deterministic.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add example_gen/compliance/evaluator-deterministic.ts example_gen/compliance/evaluator-deterministic.test.ts
git commit -m "feat(compliance-audit): deterministic evaluator (regex/value/pattern/min-max)"
```

---

## Phase 4 — Cost, cache, cassette, Anthropic client

### Task 7: Cost tracker

**Files:**
- Create: `example_gen/compliance/cost-tracker.ts`
- Create: `example_gen/compliance/cost-tracker.test.ts`

- [ ] **Step 1: Failing test**

```typescript
// example_gen/compliance/cost-tracker.test.ts
import { CostTracker } from "./cost-tracker.js";
import { strict as assert } from "node:assert";

const t = new CostTracker(40);
const est1 = t.estimate({ inputTokens: 5000, maxOutputTokens: 200 });
assert.ok(est1 > 0 && est1 < 1, `estimate should be small for 1 call: got ${est1}`);
assert.ok(t.canAfford(est1), "budget should accommodate first call");
t.record({ inputTokens: 5000, outputTokens: 150 });
assert.ok(t.spent() > 0);
const huge = t.estimate({ inputTokens: 10_000_000, maxOutputTokens: 1000 });
assert.ok(!t.canAfford(huge), "should reject batch beyond budget");
console.log("PASS: cost tracker");
```

- [ ] **Step 2: Implement**

```typescript
// example_gen/compliance/cost-tracker.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface Pricing {
  input_per_1m_usd: number;
  output_per_1m_usd: number;
}

const PRICING_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "pricing.json");
const PRICING: Pricing = JSON.parse(readFileSync(PRICING_PATH, "utf8"));

interface UsageEstimate { inputTokens: number; maxOutputTokens: number; }
interface UsageActual { inputTokens: number; outputTokens: number; }

export class CostTracker {
  private accumulated = 0;
  constructor(public readonly budgetUsd: number) {}

  estimate(u: UsageEstimate): number {
    return (
      (u.inputTokens / 1_000_000) * PRICING.input_per_1m_usd +
      (u.maxOutputTokens / 1_000_000) * PRICING.output_per_1m_usd
    );
  }
  record(u: UsageActual): number {
    const cost =
      (u.inputTokens / 1_000_000) * PRICING.input_per_1m_usd +
      (u.outputTokens / 1_000_000) * PRICING.output_per_1m_usd;
    this.accumulated += cost;
    return cost;
  }
  spent(): number { return this.accumulated; }
  canAfford(estimateUsd: number): boolean {
    return this.accumulated + estimateUsd <= this.budgetUsd;
  }
}
```

- [ ] **Step 3: Run + commit**

```bash
tsx example_gen/compliance/cost-tracker.test.ts
git add example_gen/compliance/cost-tracker.ts example_gen/compliance/cost-tracker.test.ts
git commit -m "feat(compliance-audit): cost tracker with pricing.json"
```

---

### Task 8: Cassette + cache

**Files:**
- Create: `example_gen/compliance/cassette.ts`
- Create: `example_gen/compliance/cache.ts`
- Create: `example_gen/compliance/cache.test.ts`

- [ ] **Step 1: Cache test (failing)**

```typescript
// example_gen/compliance/cache.test.ts
import { Cache } from "./cache.js";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "cache-"));
const c = new Cache(dir);
assert.equal(c.get("k1"), undefined);
c.set("k1", { foo: "bar" });
assert.deepEqual(c.get("k1"), { foo: "bar" });
rmSync(dir, { recursive: true });
console.log("PASS: cache");
```

- [ ] **Step 2: Implement cache**

```typescript
// example_gen/compliance/cache.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export class Cache {
  constructor(private readonly dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  static keyOf(...parts: (string | object)[]): string {
    const h = createHash("sha256");
    for (const p of parts) h.update(typeof p === "string" ? p : JSON.stringify(p));
    return h.digest("hex");
  }
  private file(key: string): string { return path.join(this.dir, `${key}.json`); }
  get<T>(key: string): T | undefined {
    const f = this.file(key);
    if (!existsSync(f)) return undefined;
    return JSON.parse(readFileSync(f, "utf8")) as T;
  }
  set(key: string, value: unknown): void {
    writeFileSync(this.file(key), JSON.stringify(value));
  }
}
```

- [ ] **Step 3: Implement cassette**

```typescript
// example_gen/compliance/cassette.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Cache } from "./cache.js";

export interface CassetteEntry {
  request: unknown;
  response: unknown;
}

export class Cassette {
  constructor(private readonly dir: string, private readonly recording: boolean) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  key(request: unknown): string { return Cache.keyOf(request); }
  has(key: string): boolean { return existsSync(path.join(this.dir, `${key}.json`)); }
  read(key: string): CassetteEntry {
    return JSON.parse(readFileSync(path.join(this.dir, `${key}.json`), "utf8"));
  }
  write(key: string, entry: CassetteEntry): void {
    writeFileSync(path.join(this.dir, `${key}.json`), JSON.stringify(entry, null, 2));
  }
  isRecording(): boolean { return this.recording; }
}

export function defaultCassette(testCassetteDir: string): Cassette {
  return new Cassette(testCassetteDir, process.env.OPENAI_RECORD === "1");
}
```

- [ ] **Step 4: Run cache test, commit**

```bash
tsx example_gen/compliance/cache.test.ts
git add example_gen/compliance/cache.ts example_gen/compliance/cassette.ts example_gen/compliance/cache.test.ts
git commit -m "feat(compliance-audit): cache and cassette infrastructure"
```

---

### Task 9: OpenAI client wrapper

**Files:**
- Create: `example_gen/compliance/openai-client.ts`

- [ ] **Step 1: Implement (no separate test — exercised through evaluators with cassettes)**

```typescript
// example_gen/compliance/openai-client.ts
import OpenAI from "openai";
import { Cache } from "./cache.js";
import type { Cassette } from "./cassette.js";
import type { CostTracker } from "./cost-tracker.js";

const MODEL = process.env.COMPLIANCE_AUDIT_MODEL ?? "gpt-4o";

export interface VisionRequest {
  imagePngBase64: string;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  estimatedInputTokens: number;
}
export interface TextRequest {
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  estimatedInputTokens: number;
}
export interface CallResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  fromCache: "live" | "cassette" | "cache";
}

export class BudgetExceededError extends Error {}

export class OpenAIClient {
  private client: OpenAI | null = null;
  constructor(
    private readonly cache: Cache,
    private readonly cassette: Cassette,
    private readonly cost: CostTracker,
  ) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY required for live calls");
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async callVision(req: VisionRequest): Promise<CallResult> {
    return this.dispatch(Cache.keyOf(req), req, "vision", req.estimatedInputTokens, req.maxOutputTokens);
  }
  async callText(req: TextRequest): Promise<CallResult> {
    return this.dispatch(Cache.keyOf(req), req, "text", req.estimatedInputTokens, req.maxOutputTokens);
  }

  private async dispatch(
    cacheKey: string,
    req: VisionRequest | TextRequest,
    kind: "vision" | "text",
    estIn: number, maxOut: number,
  ): Promise<CallResult> {
    const cached = this.cache.get<CallResult>(cacheKey);
    if (cached) return { ...cached, fromCache: "cache" };

    const cassetteKey = this.cassette.key(req);
    if (this.cassette.has(cassetteKey) && !this.cassette.isRecording()) {
      const entry = this.cassette.read(cassetteKey);
      const result = entry.response as CallResult;
      this.cache.set(cacheKey, result);
      return { ...result, fromCache: "cassette" };
    }

    const estCost = this.cost.estimate({ inputTokens: estIn, maxOutputTokens: maxOut });
    if (!this.cost.canAfford(estCost)) {
      throw new BudgetExceededError(`would exceed budget: estimated $${estCost.toFixed(3)}, spent $${this.cost.spent().toFixed(3)}`);
    }

    let attempt = 0;
    while (true) {
      try {
        const resp = await this.live(req, kind);
        const inputTokens = resp.usage?.prompt_tokens ?? 0;
        const outputTokens = resp.usage?.completion_tokens ?? 0;
        this.cost.record({ inputTokens, outputTokens });
        const result: CallResult = {
          text: resp.choices[0]?.message?.content ?? "",
          usage: { inputTokens, outputTokens },
          fromCache: "live",
        };
        if (this.cassette.isRecording()) this.cassette.write(cassetteKey, { request: req, response: result });
        this.cache.set(cacheKey, result);
        return result;
      } catch (e: any) {
        attempt++;
        if (attempt >= 2) throw e;
        const status = e?.status ?? 0;
        if (status >= 500 || status === 429) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw e;
      }
    }
  }

  private async live(req: VisionRequest | TextRequest, kind: "vision" | "text") {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: req.systemPrompt },
    ];
    if (kind === "vision") {
      const v = req as VisionRequest;
      messages.push({
        role: "user",
        content: [
          { type: "text", text: v.userPrompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${v.imagePngBase64}`, detail: "high" } },
        ],
      });
    } else {
      messages.push({ role: "user", content: req.userPrompt });
    }
    return this.getClient().chat.completions.create({
      model: MODEL,
      max_tokens: req.maxOutputTokens,
      messages,
    });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit example_gen/compliance/openai-client.ts
```

- [ ] **Step 3: Commit**

```bash
git add example_gen/compliance/openai-client.ts
git commit -m "feat(compliance-audit): openai client with cassette+cache+retry+budget"
```

---

## Phase 5 — Visual evaluator

### Task 10: Render + visual batches

**Files:**
- Create: `example_gen/compliance/evaluator-visual.ts`

- [ ] **Step 1: Implement**

```typescript
// example_gen/compliance/evaluator-visual.ts
import { chromium, type Browser } from "playwright";
import type { Artifact, Finding, Rule } from "./types.js";
import type { OpenAIClient } from "./openai-client.js";
import { BudgetExceededError } from "./openai-client.js";

const BATCH_SIZE = 8;
const MAX_HEIGHT_PX = 8000;

const SYSTEM = `You are a strict design-system auditor. For each numbered yes/no question about the supplied screenshot, answer ONLY with that number followed by YES or NO and a brief justification. Format: "1. YES — <12-word reason>". Convention: YES = violation found (rule fails). NO = condition met (rule passes). Do not hedge.`;

export async function runVisual(a: Artifact, rules: Rule[], client: OpenAIClient): Promise<Finding[]> {
  const visual = rules.filter((r) => r.evaluatorClass === "visual-llm");
  if (visual.length === 0) return [];

  let png: Buffer;
  try {
    png = await render(a.html);
  } catch (e: any) {
    return visual.map((r) => skip(a, r, "render", `render failed: ${e.message}`));
  }

  const findings: Finding[] = [];
  const batches = chunk(visual, BATCH_SIZE);
  for (const batch of batches) {
    try {
      const userPrompt = batch.map((r, i) => `${i + 1}. ${promptOf(r)}`).join("\n");
      const result = await client.callVision({
        imagePngBase64: png.toString("base64"),
        systemPrompt: SYSTEM,
        userPrompt,
        maxOutputTokens: 400,
        estimatedInputTokens: 6000,
      });
      const answers = parseAnswers(result.text, batch.length);
      batch.forEach((r, i) => findings.push(toFinding(a, r, answers[i] ?? null)));
    } catch (e) {
      const reason = e instanceof BudgetExceededError ? "budget" : "llm-error";
      for (const r of batch) findings.push(skip(a, r, reason, (e as Error).message));
      if (reason === "budget") break;
    }
  }
  return findings;
}

async function render(html: string): Promise<Buffer> {
  const browser: Browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 60000 });
    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    if (fullHeight > MAX_HEIGHT_PX) {
      await page.setViewportSize({ width: 1440, height: MAX_HEIGHT_PX });
    }
    return page.screenshot({ fullPage: true, type: "png" });
  } finally {
    await browser.close();
  }
}

function promptOf(r: Rule): string {
  const t = r.test.llm_eval;
  if (typeof t === "string") return t;
  return t?.prompt ?? `Does this artifact violate "${r.id}"? YES/NO`;
}

function parseAnswers(text: string, n: number): ("YES" | "NO" | null)[] {
  const out: ("YES" | "NO" | null)[] = Array(n).fill(null);
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d+)\.\s+(YES|NO)\b/i);
    if (!m) continue;
    const idx = parseInt(m[1]!, 10) - 1;
    if (idx >= 0 && idx < n) out[idx] = m[2]!.toUpperCase() as "YES" | "NO";
  }
  return out;
}

function toFinding(a: Artifact, r: Rule, ans: "YES" | "NO" | null): Finding {
  const base = { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity };
  if (ans === null) return { ...base, status: "skipped", skipReason: "llm-error", message: "no answer parsed" };
  if (ans === "YES") return { ...base, status: "fail", llmAnswer: ans, message: `${r.description}` };
  return { ...base, status: "pass", llmAnswer: ans };
}

function skip(a: Artifact, r: Rule, reason: "budget" | "render" | "llm-error", message: string): Finding {
  return { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity, status: "skipped", skipReason: reason, message };
}

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit example_gen/compliance/evaluator-visual.ts
```

- [ ] **Step 3: Commit**

```bash
git add example_gen/compliance/evaluator-visual.ts
git commit -m "feat(compliance-audit): visual evaluator (Playwright + batched vision)"
```

---

## Phase 6 — Prose evaluator

### Task 11: Prose extraction + voice context + batches

**Files:**
- Create: `example_gen/compliance/evaluator-prose.ts`
- Create: `example_gen/compliance/evaluator-prose.test.ts`

- [ ] **Step 1: Test prose extraction (no LLM)**

```typescript
// example_gen/compliance/evaluator-prose.test.ts
import { extractProse } from "./evaluator-prose.js";
import { strict as assert } from "node:assert";

const html = `<style>.x{color:red}</style><script>var a=1;</script><body><h1>Hi  there</h1><img alt="solar farm"><p>Some&nbsp;text.</p></body>`;
const prose = extractProse(html);
assert.ok(prose.includes("Hi there"));
assert.ok(prose.includes("solar farm"), "alt text preserved");
assert.ok(!prose.includes("var a=1"), "scripts stripped");
assert.ok(!prose.includes("color:red"), "styles stripped");
console.log("PASS: prose extraction");
```

- [ ] **Step 2: Implement**

```typescript
// example_gen/compliance/evaluator-prose.ts
import { load as loadHtml } from "cheerio";
import { readFileSync, readdirSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import path from "node:path";
import type { Artifact, Finding, Rule } from "./types.js";
import type { OpenAIClient } from "./openai-client.js";
import { BudgetExceededError } from "./openai-client.js";

const BATCH_SIZE = 8;
const MIN_PROSE_CHARS = 50;
const MAX_PROSE_CHARS = 32_000;

const SYSTEM = `You are a strict voice/prose auditor. Apply the supplied design-system voice profile when judging. For each numbered yes/no question about the prose excerpt, answer ONLY with that number followed by YES or NO and a brief justification. Format: "1. YES — <12-word reason>". YES = violation. NO = compliant.`;

export function extractProse(html: string): string {
  const $ = loadHtml(html);
  $("script,style,noscript").remove();
  const altText = $("img[alt]").map((_, el) => $(el).attr("alt")).get().join(" ");
  const bodyText = $("body").text();
  const combined = `${bodyText} ${altText}`
    .replaceAll(/ |&nbsp;/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  return combined.slice(0, MAX_PROSE_CHARS);
}

export function loadVoiceContext(repoRoot: string, genre: string): string {
  // Load recipes, find one matching the genre, then concatenate referenced team profile YAMLs.
  const recipes = parseYaml(readFileSync(path.join(repoRoot, "voice/recipes.yaml"), "utf8"));
  const match = (recipes?.recipes ?? []).find((r: any) => r.genre === genre || r.id === genre);
  if (!match) return "";
  const profileNames: string[] = match.voice_sources ?? [];
  const teamDir = path.join(repoRoot, "voice/team");
  const profiles: string[] = [];
  for (const name of profileNames) {
    const file = readdirSync(teamDir).find((f) => f.includes(name));
    if (file) profiles.push(`# ${name}\n${readFileSync(path.join(teamDir, file), "utf8")}`);
  }
  return [
    `# Recipe: ${match.id ?? match.genre}`,
    JSON.stringify(match, null, 2),
    "",
    "# Voice profiles",
    ...profiles,
  ].join("\n");
}

export async function runProse(
  a: Artifact, rules: Rule[], repoRoot: string, client: OpenAIClient,
): Promise<Finding[]> {
  const prose = extractProse(a.html);
  const proseRules = rules.filter((r) => r.evaluatorClass === "prose-llm");
  if (proseRules.length === 0) return [];
  if (prose.length < MIN_PROSE_CHARS) {
    return proseRules.map((r) => ({
      ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity,
      status: "n/a", message: `prose extraction yielded ${prose.length} chars; below ${MIN_PROSE_CHARS} threshold`,
    }));
  }
  const voice = loadVoiceContext(repoRoot, a.genre);
  const findings: Finding[] = [];
  const batches = chunk(proseRules, BATCH_SIZE);
  for (const batch of batches) {
    const questions = batch.map((r, i) => `${i + 1}. ${promptOf(r)}`).join("\n");
    const userPrompt = [
      "## Voice context",
      voice || "(no recipe matched genre)",
      "",
      "## Prose excerpt",
      prose,
      "",
      "## Questions",
      questions,
    ].join("\n");
    try {
      const result = await client.callText({
        systemPrompt: SYSTEM,
        userPrompt,
        maxOutputTokens: 400,
        estimatedInputTokens: Math.ceil((voice.length + prose.length + questions.length) / 4),
      });
      const answers = parseAnswers(result.text, batch.length);
      batch.forEach((r, i) => findings.push(toFinding(a, r, answers[i] ?? null)));
    } catch (e) {
      const reason = e instanceof BudgetExceededError ? "budget" : "llm-error";
      for (const r of batch) findings.push(skip(a, r, reason, (e as Error).message));
      if (reason === "budget") break;
    }
  }
  return findings;
}

function promptOf(r: Rule) { return typeof r.test.llm_eval === "string" ? r.test.llm_eval : (r.test.llm_eval?.prompt ?? r.id); }
function parseAnswers(text: string, n: number): ("YES" | "NO" | null)[] {
  const out: ("YES" | "NO" | null)[] = Array(n).fill(null);
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d+)\.\s+(YES|NO)\b/i);
    if (!m) continue;
    const idx = parseInt(m[1]!, 10) - 1;
    if (idx >= 0 && idx < n) out[idx] = m[2]!.toUpperCase() as "YES" | "NO";
  }
  return out;
}
function toFinding(a: Artifact, r: Rule, ans: "YES" | "NO" | null): Finding {
  const base = { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity };
  if (ans === null) return { ...base, status: "skipped", skipReason: "llm-error", message: "no answer parsed" };
  if (ans === "YES") return { ...base, status: "fail", llmAnswer: ans, message: r.description };
  return { ...base, status: "pass", llmAnswer: ans };
}
function skip(a: Artifact, r: Rule, reason: "budget" | "render" | "llm-error", message: string): Finding {
  return { ruleId: r.id, artifactPath: a.path, severity: r.severity, maturity: r.maturity, status: "skipped", skipReason: reason, message };
}
function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = []; for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n)); return out;
}
```

- [ ] **Step 3: Run prose-extraction test, commit**

```bash
tsx example_gen/compliance/evaluator-prose.test.ts
git add example_gen/compliance/evaluator-prose.ts example_gen/compliance/evaluator-prose.test.ts
git commit -m "feat(compliance-audit): prose evaluator (text + voice profile context)"
```

---

## Phase 7 — Synthesizer + reporter

### Task 12: Synthesizer

**Files:**
- Create: `example_gen/compliance/synthesize.ts`
- Create: `example_gen/compliance/synthesize.test.ts`

- [ ] **Step 1: Failing test**

```typescript
// example_gen/compliance/synthesize.test.ts
import { synthesize } from "./synthesize.js";
import { strict as assert } from "node:assert";
import type { Finding } from "./types.js";

const findings: Finding[] = [
  { ruleId: "a", artifactPath: "x.html", status: "fail", severity: "error", maturity: "rule" },
  { ruleId: "b", artifactPath: "x.html", status: "fail", severity: "error", maturity: "experimental" },
  { ruleId: "c", artifactPath: "x.html", status: "fail", severity: "warning", maturity: "rule" },
  { ruleId: "d", artifactPath: "x.html", status: "pass", severity: "error", maturity: "rule" },
  { ruleId: "e", artifactPath: "x.html", status: "skipped", severity: "error", maturity: "rule", skipReason: "budget" },
];
const s = synthesize(findings);
assert.equal(s.blocking.length, 1, "only error+rule|invariant blocks");
assert.equal(s.advisory.length, 2, "experimental + warning are advisory");
assert.equal(s.skipped.length, 1);
assert.equal(s.passed.length, 1);
console.log("PASS: synthesize");
```

- [ ] **Step 2: Implement**

```typescript
// example_gen/compliance/synthesize.ts
import type { Finding } from "./types.js";

export interface Synthesis {
  blocking: Finding[];
  advisory: Finding[];
  skipped: Finding[];
  passed: Finding[];
  na: Finding[];
  suppressed: Finding[];
}

export function synthesize(findings: Finding[]): Synthesis {
  const out: Synthesis = { blocking: [], advisory: [], skipped: [], passed: [], na: [], suppressed: [] };
  for (const f of findings) {
    if (f.status === "skipped") { out.skipped.push(f); continue; }
    if (f.status === "pass") { out.passed.push(f); continue; }
    if (f.status === "n/a") { out.na.push(f); continue; }
    if (f.status === "suppressed") { out.suppressed.push(f); continue; }
    // fail
    if (f.severity === "error" && (f.maturity === "rule" || f.maturity === "invariant")) {
      out.blocking.push(f);
    } else {
      out.advisory.push(f);
    }
  }
  return out;
}

export function applySuppressions(findings: Finding[], suppressions: import("./types.js").Suppression[]): Finding[] {
  const supByRule = new Map(suppressions.map((s) => [s.ruleId, s] as const));
  return findings.map((f) => {
    if (f.status !== "fail") return f;
    const sup = supByRule.get(f.ruleId);
    if (!sup) return f;
    return { ...f, status: "suppressed" as const, suppression: sup };
  });
}
```

- [ ] **Step 3: Run, commit**

```bash
tsx example_gen/compliance/synthesize.test.ts
git add example_gen/compliance/synthesize.ts example_gen/compliance/synthesize.test.ts
git commit -m "feat(compliance-audit): synthesizer + suppression application"
```

---

### Task 13: Reporter

**Files:**
- Create: `example_gen/compliance/reporter.ts`

- [ ] **Step 1: Implement**

```typescript
// example_gen/compliance/reporter.ts
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import type { RunSummary } from "./types.js";
import { synthesize } from "./synthesize.js";

export function writeReports(repoRoot: string, summary: RunSummary, sha: string): { md: string; json: string } {
  const dir = path.join(repoRoot, "audits/compliance");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15) + "Z";
  const base = `${ts}-${sha.slice(0, 8)}`;
  const md = path.join(dir, `${base}.md`);
  const json = path.join(dir, `${base}.json`);
  writeFileSync(md, renderMarkdown(summary));
  writeFileSync(json, JSON.stringify(summary, null, 2));
  return { md, json };
}

export function renderMarkdown(s: RunSummary): string {
  const lines: string[] = [];
  lines.push(`# compliance-audit report`);
  lines.push("");
  lines.push(`- mode: **${s.blockingMode}**`);
  lines.push(`- artifacts evaluated: ${s.results.length}`);
  lines.push(`- findings: ${s.blockingCount} blocking, ${s.advisoryCount} advisory, ${s.skippedCount} skipped, ${s.passedCount} passed`);
  lines.push(`- spend: $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}`);
  lines.push("");
  for (const r of s.results) {
    const syn = synthesize(r.findings);
    lines.push(`## ${r.artifact.path}`);
    lines.push(`- type: ${r.artifact.type}, genre: ${r.artifact.genre}`);
    if (syn.blocking.length) {
      lines.push(`### Blocking (${syn.blocking.length})`);
      for (const f of syn.blocking) lines.push(`- **${f.ruleId}** — ${f.message ?? ""}`);
    }
    if (syn.advisory.length) {
      lines.push(`### Advisory (${syn.advisory.length})`);
      for (const f of syn.advisory) lines.push(`- ${f.ruleId} (${f.severity}/${f.maturity}) — ${f.message ?? ""}`);
    }
    if (syn.skipped.length) {
      lines.push(`### Skipped (${syn.skipped.length})`);
      for (const f of syn.skipped) lines.push(`- ${f.ruleId} — ${f.skipReason}: ${f.message ?? ""}`);
    }
    if (syn.suppressed.length) {
      lines.push(`### Suppressed (${syn.suppressed.length})`);
      for (const f of syn.suppressed) lines.push(`- ${f.ruleId} — ${f.suppression?.linear} (${f.suppression?.reason})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderPrCommentSection(s: RunSummary): string {
  const lines: string[] = [];
  lines.push("── compliance-audit ────────────────────────────────────────");
  lines.push(`evaluated ${s.results.length} examples • ${s.blockingCount === 0 ? "pass" : "fail"} • $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}`);
  lines.push("");
  lines.push(`  Failures (block merge)         — ${s.blockingCount}`);
  lines.push(`  Advisory findings              — ${s.advisoryCount}`);
  lines.push(`  Skipped (budget / errors)      — ${s.skippedCount}`);
  lines.push(`  Passed                         — ${s.passedCount}`);
  return lines.join("\n");
}
```

- [ ] **Step 2: Type-check, commit**

```bash
npx tsc --noEmit example_gen/compliance/reporter.ts
git add example_gen/compliance/reporter.ts
git commit -m "feat(compliance-audit): reporter (md + json + PR comment section)"
```

---

## Phase 8 — Runner + CLI

### Task 14: Runner

**Files:**
- Create: `example_gen/compliance/runner.ts`

- [ ] **Step 1: Implement**

```typescript
// example_gen/compliance/runner.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { loadRules } from "./load-rules.js";
import { classifyArtifact, applicableRules } from "./classify.js";
import { parseSuppressions } from "./suppression.js";
import { runDeterministic } from "./evaluator-deterministic.js";
import { runVisual } from "./evaluator-visual.js";
import { runProse } from "./evaluator-prose.js";
import { applySuppressions, synthesize } from "./synthesize.js";
import { CostTracker } from "./cost-tracker.js";
import { Cache } from "./cache.js";
import { Cassette } from "./cassette.js";
import { OpenAIClient } from "./openai-client.js";
import type { EvalResult, RunSummary, Finding } from "./types.js";

export interface RunOptions {
  repoRoot: string;
  files: string[];
  budgetUsd: number;
  noLlm: boolean;
  cassetteDir?: string;
}

export async function run(opts: RunOptions): Promise<RunSummary> {
  const rulesPath = path.join(opts.repoRoot, "rules/visual-rules.yml");
  const rules = loadRules(rulesPath);
  const cache = new Cache(path.join(opts.repoRoot, ".cache/compliance-audit"));
  const cassette = new Cassette(opts.cassetteDir ?? path.join(opts.repoRoot, "tests/compliance/cassettes"), process.env.OPENAI_RECORD === "1");
  const cost = new CostTracker(opts.budgetUsd);
  const client = new OpenAIClient(cache, cassette, cost);

  const results: EvalResult[] = [];
  for (const file of opts.files) {
    const startedAt = new Date().toISOString();
    const html = readFileSync(file, "utf8");
    const artifact = classifyArtifact(file, html);
    const suppressions = parseSuppressions(file, html);
    const applicable = applicableRules(rules, artifact);

    let findings: Finding[] = [];
    findings.push(...runDeterministic(artifact, applicable));
    if (!opts.noLlm) {
      findings.push(...await runVisual(artifact, applicable, client));
      findings.push(...await runProse(artifact, applicable, opts.repoRoot, client));
    }
    findings = applySuppressions(findings, suppressions);
    results.push({ artifact, findings, totalCostUsd: 0, startedAt, finishedAt: new Date().toISOString() });
  }

  const all = results.flatMap((r) => r.findings);
  const syn = synthesize(all);
  const blockingMode: RunSummary["blockingMode"] =
    process.env.COMPLIANCE_AUDIT_BLOCKING === "false" ? "advisory-repo" :
    process.env.COMPLIANCE_AUDIT_PR_LABEL === "advisory" ? "advisory-pr" : "blocking";
  return {
    blockingCount: syn.blocking.length,
    advisoryCount: syn.advisory.length,
    skippedCount: syn.skipped.length,
    passedCount: syn.passed.length,
    totalCostUsd: cost.spent(),
    budgetUsd: opts.budgetUsd,
    blockingMode,
    results,
  };
}
```

- [ ] **Step 2: Type-check, commit**

```bash
npx tsc --noEmit example_gen/compliance/runner.ts
git add example_gen/compliance/runner.ts
git commit -m "feat(compliance-audit): runner orchestrator"
```

---

### Task 15: CLI

**Files:**
- Create: `example_gen/compliance/cli.ts`

- [ ] **Step 1: Implement**

```typescript
// example_gen/compliance/cli.ts
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import path from "node:path";
import fg from "fast-glob"; // add to deps if not present
import { run } from "./runner.js";
import { writeReports, renderMarkdown } from "./reporter.js";

async function main() {
  const args = process.argv.slice(2);
  const noLlm = args.includes("--no-llm");
  const smoke = args.includes("--smoke");
  const baseline = args.includes("--baseline");
  const budgetFlag = args.find((a) => a.startsWith("--budget="));
  const budgetCli = budgetFlag ? Number(budgetFlag.split("=")[1]) : NaN;
  const ciBudget = Number(process.env.COMPLIANCE_AUDIT_BUDGET_USD ?? "40");
  const isCI = process.env.CI === "true";
  const budgetUsd = isCI ? ciBudget : (Number.isFinite(budgetCli) ? Math.min(budgetCli, ciBudget) : ciBudget);

  const positional = args.filter((a) => !a.startsWith("--"));
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  let files: string[];
  if (smoke) {
    files = await fg("tests/compliance/fixtures/passing/slides/*.html", { cwd: repoRoot, absolute: true });
    if (files.length === 0) throw new Error("smoke fixture missing");
    files = files.slice(0, 1);
  } else if (positional.length > 0) {
    files = (await fg(positional, { cwd: repoRoot, absolute: true })).filter((f) => f.endsWith(".html"));
  } else {
    files = await fg(["categories/{slides,one-pagers}/examples/*.html"], { cwd: repoRoot, absolute: true });
  }
  if (files.length === 0) {
    console.log("compliance-audit: no in-scope files; exiting.");
    return;
  }

  const summary = await run({ repoRoot, files, budgetUsd, noLlm });
  const sha = (() => {
    try { return execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim(); } catch { return "0000000"; }
  })();
  const { md, json } = writeReports(repoRoot, summary, sha);
  console.log(renderMarkdown(summary));
  console.log(`\nReport: ${md}\n        ${json}`);

  if (baseline) {
    // baseline mode: don't fail; commit the JSON as inventory
    console.log("(baseline mode: not exiting non-zero)");
    return;
  }
  if (summary.blockingMode === "blocking" && summary.blockingCount > 0) {
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
```

- [ ] **Step 2: Smoke local run with `--no-llm`**

```bash
npm run audit:compliance -- --no-llm categories/slides/examples/abcam-kickoff-redux.html
```

Expected: exits with deterministic findings only, JSON+MD written under `audits/compliance/`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json example_gen/compliance/cli.ts
git commit -m "feat(compliance-audit): cli entry point with --no-llm/--budget/--smoke/--baseline"
```

---

## Phase 9 — Self-test with cassettes

### Task 16: Fixtures + self-test

**Files:**
- Create: `tests/compliance/fixtures/passing/slides/*.html` (copy 1 real example)
- Create: `tests/compliance/fixtures/seeded-failures/slides/seed-1.html`
- Create: `tests/compliance/fixtures/expected.json`
- Create: `tests/compliance/cassettes/.gitkeep`
- Create: `example_gen/compliance/test-compliance.ts`

- [ ] **Step 1: Create passing fixture**

```bash
mkdir -p tests/compliance/fixtures/passing/slides tests/compliance/fixtures/seeded-failures/slides tests/compliance/cassettes
cp categories/slides/examples/abcam-kickoff-redux.html tests/compliance/fixtures/passing/slides/abcam-kickoff.html
```

- [ ] **Step 2: Create seeded-failure fixture**

Author a minimal HTML that violates one deterministic rule (e.g., contains `#ff0000` if any rule forbids it, OR uses a known-out-of-scale font-size). Concretely, write:

```html
<!doctype html><html><body class="vd-slide-deck" data-genre="pilot-kickoff">
<style>.bad{color:#ff0000;font-size:42.7px;}</style>
<h1 class="bad">Generic Stock Hero</h1>
</body></html>
```

Save to `tests/compliance/fixtures/seeded-failures/slides/seed-1.html`.

- [ ] **Step 3: Create `expected.json`**

```json
{
  "tests/compliance/fixtures/passing/slides/abcam-kickoff.html": {
    "deterministic_blocking": 0
  },
  "tests/compliance/fixtures/seeded-failures/slides/seed-1.html": {
    "deterministic_blocking_min": 1
  }
}
```

(Initially we assert lower bounds on deterministic findings. LLM findings get added once cassettes are recorded.)

- [ ] **Step 4: Implement `test-compliance.ts`**

```typescript
// example_gen/compliance/test-compliance.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./runner.js";
import { synthesize } from "./synthesize.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const expected = JSON.parse(readFileSync(path.join(repoRoot, "tests/compliance/fixtures/expected.json"), "utf8")) as Record<string, any>;

async function main() {
  let failed = 0;
  for (const [relPath, exp] of Object.entries(expected)) {
    const summary = await run({
      repoRoot,
      files: [path.join(repoRoot, relPath)],
      budgetUsd: 1, // tiny budget; cassettes serve all LLM calls anyway
      noLlm: false,
      cassetteDir: path.join(repoRoot, "tests/compliance/cassettes"),
    });
    const detBlocking = summary.results
      .flatMap((r) => synthesize(r.findings).blocking)
      .filter((f) => !f.llmAnswer).length;

    if ("deterministic_blocking" in exp) {
      if (detBlocking !== exp.deterministic_blocking) {
        console.error(`FAIL ${relPath}: expected exactly ${exp.deterministic_blocking} det blocking, got ${detBlocking}`);
        failed++;
      }
    } else if ("deterministic_blocking_min" in exp) {
      if (detBlocking < exp.deterministic_blocking_min) {
        console.error(`FAIL ${relPath}: expected ≥${exp.deterministic_blocking_min} det blocking, got ${detBlocking}`);
        failed++;
      }
    }
    console.log(`OK   ${relPath}: det blocking=${detBlocking}`);
  }
  if (failed > 0) {
    console.error(`\n${failed} fixture(s) failed`);
    process.exit(1);
  }
  console.log("\nAll fixtures passed.");
}
main().catch((e) => { console.error(e); process.exit(2); });
```

- [ ] **Step 5: Run self-test**

```bash
npm run test:compliance
```

Expected: deterministic checks pass on the passing fixture; the seeded fixture fires at least one deterministic blocking rule. (LLM rules are skipped because no cassette exists yet — that's fine; expected.json only asserts deterministic counts in v0.1.)

- [ ] **Step 6: Commit**

```bash
git add tests/compliance example_gen/compliance/test-compliance.ts
git commit -m "feat(compliance-audit): fixtures + self-test runner"
```

---

## Phase 10 — CI workflow integration

### Task 17: Wire into build.yml

**Files:**
- Modify: `.github/workflows/build.yml`
- Create: `.github/scripts/render-pr-comment.ts`

- [ ] **Step 1: Add `render-pr-comment.ts`**

```typescript
// .github/scripts/render-pr-comment.ts
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sections: string[] = [];

const compliancePath = path.join(root, "compliance-summary.json");
if (existsSync(compliancePath)) {
  const s = JSON.parse(readFileSync(compliancePath, "utf8"));
  sections.push(`── compliance-audit ────────────────────────────────────────`);
  sections.push(`evaluated ${s.results.length} examples • ${s.blockingCount === 0 ? "pass" : "fail"} • $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}`);
  sections.push(`  Failures (block merge)         — ${s.blockingCount}`);
  sections.push(`  Advisory findings              — ${s.advisoryCount}`);
  sections.push(`  Skipped                        — ${s.skippedCount}`);
  sections.push(`  Passed                         — ${s.passedCount}`);
  sections.push("");
}

const cohesionPath = path.join(root, "cohesion-summary.json");
if (existsSync(cohesionPath)) {
  const c = JSON.parse(readFileSync(cohesionPath, "utf8"));
  sections.push(`── audit:cohesion ──────────────────────────────────────────`);
  sections.push(`  Critical (block merge)         — ${c.critical ?? 0}`);
  sections.push(`  Should-fix                     — ${c.shouldFix ?? 0}`);
  sections.push(`  Note                           — ${c.note ?? 0}`);
  sections.push("");
}

const blocking = process.env.COMPLIANCE_AUDIT_BLOCKING === "false" ? "📝 ADVISORY (repo kill switch)" : "🚫 BLOCKING";
const header = `<!-- design-system-ci:sticky -->\nDesign System CI  •  updated ${new Date().toISOString()}  •  ${blocking}\n`;
console.log(header + "\n```\n" + sections.join("\n") + "\n```\n");
```

- [ ] **Step 2: Modify `.github/workflows/build.yml`**

In the `build` job, after `npm run validate:rules`, add:

```yaml
      - name: Audit cohesion
        id: cohesion
        run: |
          npm run audit:cohesion -- --json > cohesion-summary.json || true
          echo "cohesion-status=$(cat cohesion-summary.json | jq '.critical // 0')" >> "$GITHUB_OUTPUT"

      - name: Install Playwright (chromium only)
        run: npx playwright install --with-deps chromium

      - name: Audit compliance
        id: compliance
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          COMPLIANCE_AUDIT_BUDGET_USD: "40"
          COMPLIANCE_AUDIT_BLOCKING: "true"
        run: |
          # Determine changed files; if only docs/tokens changed, run no-op.
          CHANGED=$(git diff --name-only origin/main...HEAD || true)
          if echo "$CHANGED" | grep -qE '^(categories/(slides|one-pagers)/examples/|rules/visual-rules.yml$)'; then
            npm run audit:compliance -- > /dev/null
            cp audits/compliance/$(ls -t audits/compliance/ | head -n1 | sed 's/\.md$//').json compliance-summary.json
          else
            echo '{"results":[],"blockingCount":0,"advisoryCount":0,"skippedCount":0,"passedCount":0,"totalCostUsd":0,"budgetUsd":40}' > compliance-summary.json
          fi

      - name: Render PR comment
        if: github.event_name == 'pull_request'
        run: tsx .github/scripts/render-pr-comment.ts > pr-comment.md

      - name: Post sticky PR comment
        if: github.event_name == 'pull_request'
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          header: design-system-ci
          path: pr-comment.md

      - name: Fail if blocking
        if: ${{ steps.compliance.outputs.blocking == 'fail' || steps.cohesion.outputs.cohesion-status > 0 }}
        run: exit 1
```

(Note: the existing `validate:rules` step already fails the job on rule-shape errors. The above additions cover the new two checks plus the comment.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build.yml .github/scripts/render-pr-comment.ts
git commit -m "ci(compliance-audit): wire 3-check gate into build.yml with sticky PR comment"
```

---

## Phase 11 — Skill + day-one bootstrap

### Task 18: Claude Code skill files

**Files:**
- Create: `.claude/skills/compliance-audit/SKILL.md`
- Create: `.claude/skills/compliance-audit/README.md`
- Create: `.claude/skills/compliance-audit/DESIGN.md`

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: compliance-audit
description: Per-artifact compliance audit. Use when asked to evaluate a committed example artifact (categories/{slides,one-pagers}/examples/*.html) against rules/visual-rules.yml, or to triage cohesion-audit + compliance-audit findings on a PR.
---

# compliance-audit skill

Run `npm run audit:compliance -- <file-glob>` to evaluate. Read the most recent report at `audits/compliance/{ts}-{sha}.md`. For each blocking finding, classify as:

1. Real violation → fix the artifact
2. False positive → file Linear ticket; if persistent, propose downgrading the rule to `experimental`
3. Approved deviation → add inline `<!-- compliance-audit:ignore <rule-id> reason="..." linear="Z2O-NNN" -->` with mandatory ticket

For advisory findings, surface them in the PR comment but do not block.

For every PR with findings, either fix in the same PR or file a tracked ticket. Do not silently suppress.
```

- [ ] **Step 2: Write `README.md`**

```markdown
# compliance-audit (maintainer guide)

## When to run

- Automatically on every PR via `.github/workflows/build.yml`
- Manually: `npm run audit:compliance` (full repo) or `npm run audit:compliance -- <glob>` (single file)
- Self-test (no live calls, uses cassettes): `npm run test:compliance`

## When something looks wrong

1. **False positive on a visual rule.** Inspect the JSON report — `findings[].llmAnswer` shows the model's verbatim answer. If misjudged, file a Linear ticket; if persistent across runs, propose downgrading the rule's `maturity` to `experimental` until the prompt is improved.
2. **Skipped rules ("budget" or "render").** Re-run locally with `npm run audit:compliance -- <file>` and inspect. Render failures usually mean the HTML references missing assets — fix the artifact.
3. **Cassette drift.** If `npm run test:compliance` fails after a rule prompt change, re-record: `OPENAI_RECORD=1 npm run test:compliance`.

## Updating model pricing

Edit `example_gen/compliance/pricing.json`. Cost-tracker reads it at startup.

## Adding a new artifact type (whitepapers, case-studies)

1. Add the type → namespace mapping in `classify.ts` `TYPE_NAMESPACES`.
2. Confirm `rules/visual-rules.yml` has rules with the new namespace (`composition.whitepaper-body.*`, `composition.case-study.*`).
3. Add fixtures under `tests/compliance/fixtures/{passing,seeded-failures}/<new-type>/`.
4. Update `expected.json`.
5. Update `cli.ts` default glob.
```

- [ ] **Step 3: Write `DESIGN.md`**

```markdown
# compliance-audit design notes

## Why this isn't cohesion-audit

cohesion-audit (PR #47) validates the design system itself for cross-cell drift; it is fully deterministic. compliance-audit validates a *committed example artifact* against rules and is LLM-first by necessity (115 of 196 rules use `llm_eval`). Different problem, different abstraction. compliance-audit reuses cohesion-audit's reporting+skill conventions but forks the runner.

## Why gpt-4o (single model)

A single multimodal model handles both visual and prose evaluation paths, keeping the auth surface and cost model simple. If costs balloon or a cheaper model handles a subset cleanly, route by `evaluatorClass` to a smaller model in v0.2.

## v0.2 backlog

- Whitepaper + case-study coverage
- `.ignore.yaml` for batch suppressions (only if real demand emerges)
- Linear API verification of `linear=` ticket existence/status
- Per-rule false-positive precision tracking → automated demotion
- `www` / Patina integration as a published GitHub Action
- Smaller-model routing for cheap rules
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/compliance-audit
git commit -m "feat(compliance-audit): claude code skill files"
```

---

### Task 19: Day-one baseline bootstrap

**Files:**
- Create: `audits/compliance/baseline-{sha}.json` (generated)

- [ ] **Step 1: Run baseline**

```bash
OPENAI_API_KEY=$OPENAI_API_KEY npm run audit:compliance -- --baseline
```

Expected: produces a JSON+MD pair under `audits/compliance/`. Rename the JSON output:

```bash
SHA=$(git rev-parse --short HEAD)
LATEST=$(ls -t audits/compliance/*.json | head -n1)
cp "$LATEST" "audits/compliance/baseline-$SHA.json"
```

- [ ] **Step 2: Inspect baseline counts**

Open the markdown report. Confirm overall counts and the per-artifact breakdown look sane. If counts are >50 blocking, flip `COMPLIANCE_AUDIT_BLOCKING=false` in `build.yml` for grace-period launch (per spec); document the decision in the PR description.

- [ ] **Step 3: Commit baseline + grace-period decision**

```bash
git add audits/compliance/baseline-*.json
git commit -m "docs(compliance-audit): day-one baseline inventory"
```

---

## Phase 12 — Final integration

### Task 20: CLAUDE.md + sidebar + final smoke

**Files:**
- Modify: `CLAUDE.md`
- Modify: `_layouts/default.html`

- [ ] **Step 1: Add scripts to CLAUDE.md Development Commands**

```markdown
npm run audit:compliance         # Per-artifact compliance audit (live LLM)
npm run audit:compliance:smoke   # Full live pipeline against one fixture
npm run test:compliance          # Fixture self-test (cassettes; no live calls)
```

- [ ] **Step 2: Add audits/compliance/ entry to sidebar**

Mirror the existing `audits/cohesion/` sidebar entry in `_layouts/default.html`.

- [ ] **Step 3: Live smoke**

```bash
npm run audit:compliance:smoke
```

Expected: one fixture renders, vision call succeeds, JSON+MD reports written, exit 0 (no blocking findings on the passing fixture).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md _layouts/default.html
git commit -m "docs(compliance-audit): CLAUDE.md + sidebar entry"
```

- [ ] **Step 5: Open PR**

```bash
git push -u origin feat/compliance-audit-spec
gh pr create --title "feat(ci): compliance-audit + 3-check CI gate [Z2O-<ticket>]" --body-file example_gen/docs/superpowers/specs/2026-05-04-compliance-audit-design.md
```

Replace `Z2O-<ticket>` with the actual Linear ticket. If no ticket exists yet, file one in the Z2O project ("Design System: VerdigrisTech/design") titled "compliance-audit CI gate" before pushing.

---

## Acceptance criteria

The PR is mergeable when:

1. `npm run validate:rules` — green
2. `npm run audit:cohesion` — 0 critical
3. `npm run audit:compliance` (with `OPENAI_API_KEY`) — runs to completion under $40 budget; blocking count 0 on the in-scope examples (or the team has explicitly decided to launch advisory-mode and `COMPLIANCE_AUDIT_BLOCKING=false`)
4. `npm run test:compliance` — fixtures pass
5. `npm run audit:compliance:smoke` — one fixture passes live
6. Branch protection on `main` requires `compliance-audit`, `audit:cohesion`, and `validate:rules` status checks (configure in repo settings after first green run on PR)

---

## Out of scope (do not do in this PR)

- Whitepaper + case-study coverage
- `.ignore.yaml` for batch-level suppressions
- Linear API verification of `linear=` fields
- Per-rule false-positive precision tracking
- `www` / Patina integration
- Generated-asset coverage (existing `example_gen/` evaluator specs handle that)

These are tracked as v0.2 follow-ups in the spec's "Out of scope" section.
