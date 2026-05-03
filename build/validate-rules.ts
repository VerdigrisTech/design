/**
 * Visual rules validation script.
 *
 * Checks rules/visual-rules.yml for:
 *   - Valid YAML syntax
 *   - Constraint rules missing test blocks
 *   - Emdashes (banned by project guidelines)
 *   - llm_eval YES/NO convention (YES must = violation)
 *   - Floor-without-ceiling on min/max test values
 *   - Sidebar coverage (every foundations/*.md and visual layout page in sidebar)
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
// VD_ROOT lets tests/validate-rules.test.sh point the validator at a fixture
// directory instead of the real repo. Production runs leave VD_ROOT unset and
// fall back to the parent of build/ (the actual project root).
const ROOT = process.env.VD_ROOT
  ? process.env.VD_ROOT
  : join(__dirname, "..");
const RULES_FILE = join(ROOT, "rules", "visual-rules.yml");
const SIDEBAR_FILE = join(ROOT, "_layouts", "default.html");

let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  WARN: ${msg}`);
  warnings++;
}

// ---------------------------------------------------------------------------
// 1. YAML syntax
// ---------------------------------------------------------------------------
function checkYamlSyntax() {
  try {
    execFileSync("python3", [
      "-c",
      `import yaml; yaml.safe_load(open("${RULES_FILE}"))`,
    ], { stdio: "pipe" });
    console.log("  OK YAML syntax");
  } catch {
    error("visual-rules.yml is not valid YAML");
  }
}

// ---------------------------------------------------------------------------
// 2. Emdash check
// ---------------------------------------------------------------------------
function checkEmdashes() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("\u2014")) {
      count++;
      if (count <= 3) {
        error(`Emdash found at line ${i + 1}: ${lines[i].trim().slice(0, 80)}`);
      }
    }
  }
  if (count > 3) {
    error(`...and ${count - 3} more emdashes (${count} total)`);
  }
  if (count === 0) {
    console.log("  OK no emdashes");
  }
}

// ---------------------------------------------------------------------------
// 3. Constraint rules without test blocks
// ---------------------------------------------------------------------------
function checkConstraintTests() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");
  let missing = 0;
  let inConstraint = false;
  let currentId = "";
  let hasTest = false;
  let constraintLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const idMatch = trimmed.match(/^id:\s*"([^"]+)"/);
    if (idMatch) {
      currentId = idMatch[1];
    }

    if (trimmed === 'type: "constraint"') {
      inConstraint = true;
      hasTest = false;
      constraintLine = i + 1;
    }

    if (inConstraint && /^\s+(test|test:)/.test(line) && trimmed.startsWith("test")) {
      hasTest = true;
    }

    if (inConstraint && (trimmed.startsWith("- id:") || trimmed.startsWith("# ===") || trimmed.startsWith("# ---"))) {
      if (!hasTest && constraintLine !== i + 1) {
        error(`Constraint "${currentId}" (line ${constraintLine}) has no test block`);
        missing++;
      }
      inConstraint = false;
    }
  }

  if (missing === 0) {
    console.log("  OK all constraints have test blocks");
  }
}

// ---------------------------------------------------------------------------
// 4. llm_eval YES/NO convention
// ---------------------------------------------------------------------------
function checkLlmEvalConvention() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");
  let inverted = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("llm_eval")) continue;

    // Detect "Answer YES if <good outcome>" patterns (should be YES = violation)
    // Only flag when YES clearly means "passing" not "violation found"
    const yesPassPatterns = [
      /Answer YES if (?:everything|all|it) (?:is |are )?(?:correct|good|valid|proper)/i,
      /Answer yes if every (?:accent|color|element) is justified/i,
      /Answer YES if (?:teal is the first|reassurance is present|the logo is prominent)/i,
    ];

    for (const pattern of yesPassPatterns) {
      if (pattern.test(line)) {
        warn(`Possible inverted llm_eval at line ${i + 1} (YES should = violation): ${line.trim().slice(0, 100)}`);
        inverted++;
        break;
      }
    }
  }

  if (inverted === 0) {
    console.log("  OK llm_eval convention (YES = violation)");
  }
}

// ---------------------------------------------------------------------------
// 5. Floor-without-ceiling check
// ---------------------------------------------------------------------------
function checkFloorsAndCeilings() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");
  let missing = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (/\bmin:/.test(line) && !/\bmax:/.test(line)) {
      const nextLines = lines.slice(i + 1, i + 3).join(" ");
      if (!/\bmax:/.test(nextLines)) {
        if (line.includes("section_padding") || line.includes("font_size") || line.includes("margin") || line.includes("gap") || line.includes("padding")) {
          warn(`Floor without ceiling at line ${i + 1}: ${line.slice(0, 80)}`);
          missing++;
        }
      }
    }
  }

  if (missing === 0) {
    console.log("  OK floors have ceilings");
  }
}

// ---------------------------------------------------------------------------
// 6. Sidebar coverage
// ---------------------------------------------------------------------------
function checkSidebarCoverage() {
  if (!existsSync(SIDEBAR_FILE)) {
    warn("Sidebar file not found, skipping coverage check");
    return;
  }

  const sidebar = readFileSync(SIDEBAR_FILE, "utf-8");
  let missing = 0;

  const foundationsDir = join(ROOT, "foundations");
  if (existsSync(foundationsDir)) {
    for (const file of readdirSync(foundationsDir)) {
      if (!file.endsWith(".md")) continue;
      const slug = file.replace(".md", "");
      if (!sidebar.includes(`/foundations/${slug}`)) {
        warn(`foundations/${file} is not in the sidebar navigation`);
        missing++;
      }
    }
  }

  const categoriesDir = join(ROOT, "categories");
  if (existsSync(categoriesDir)) {
    for (const sub of readdirSync(categoriesDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      if (sub.name.startsWith("_") || sub.name.startsWith(".")) continue;
      const subPath = join(categoriesDir, sub.name);
      for (const file of readdirSync(subPath)) {
        if (!file.endsWith(".md")) continue;
        if (file.startsWith("_")) continue;          // template files
        const slug = file.replace(".md", "");
        // Jekyll convention: index.md resolves to the directory's trailing-slash URL,
        // so the sidebar typically links it as "/categories/<sub>/" rather than ".../index".
        const expected =
          slug === "index"
            ? `/categories/${sub.name}/`
            : `/categories/${sub.name}/${slug}`;
        if (!sidebar.includes(expected)) {
          warn(`categories/${sub.name}/${file} is not in the sidebar`);
          missing++;
        }
      }
    }
  }

  if (missing === 0) {
    console.log("  OK sidebar covers all pages");
  }
}

// ---------------------------------------------------------------------------
// Maturity field validation (optional field, values constrained)
// ---------------------------------------------------------------------------
const MATURITY_VALUES = new Set(["experimental", "convention", "rule", "invariant"]);

function checkMaturityField() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");
  const counts: Record<string, number> = { experimental: 0, convention: 0, rule: 0, invariant: 0 };
  let invalid = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(/^maturity:\s*"?([a-z]+)"?/);
    if (!match) continue;
    const value = match[1];
    if (!MATURITY_VALUES.has(value)) {
      error(`Line ${i + 1}: invalid maturity "${value}" (expected experimental | convention | rule | invariant)`);
      invalid++;
    } else {
      counts[value]++;
    }
  }

  if (invalid === 0) {
    const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
    const summary = parts.length ? ` (${parts.join(", ")})` : "";
    console.log(`  OK maturity field values${summary}`);
  }
}

// ---------------------------------------------------------------------------
// Inheritance integrity
// ---------------------------------------------------------------------------
// Cells that inherit rules from another cell (e.g., one-pagers + case-studies
// inheriting sales-collateral universals from the slides cell) declare the
// inheritance via `inherits_from_sales_collateral: [...]` listing rule IDs.
// This check confirms every referenced rule ID actually exists in the file.
// Without this check, the inheritance was documentation-only -- a typo or a
// renamed rule would silently break the inheritance chain.
function checkInheritanceIntegrity() {
  const content = readFileSync(RULES_FILE, "utf-8");
  const lines = content.split("\n");

  // Collect every rule ID declared in the file. Rules appear as both top-level
  // keys (`id: "..."` after a key) and list items (`- id: "..."`); match both.
  const declaredIds = new Set<string>();
  for (const line of lines) {
    const m = line.trim().match(/^-?\s*id:\s*"([^"]+)"/);
    if (m) declaredIds.add(m[1]);
  }

  // Find every "inherits_from_sales_collateral:" block and collect referenced IDs
  let unresolved = 0;
  let inBlock = false;
  let blockStartLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^inherits_from_sales_collateral:/.test(trimmed)) {
      inBlock = true;
      blockStartLine = i + 1;
      continue;
    }
    if (inBlock) {
      const itemMatch = trimmed.match(/^-\s*"([^"]+)"/);
      if (itemMatch) {
        const refId = itemMatch[1];
        if (!declaredIds.has(refId)) {
          error(
            `Unresolved inheritance at line ${i + 1}: "${refId}" referenced from inherits_from_sales_collateral block (line ${blockStartLine}) but not declared anywhere in the file`
          );
          unresolved++;
        }
      } else if (trimmed.length > 0 && /^[a-z_]+:/.test(trimmed)) {
        // End of the inherits list: a new field key at the same indent.
        // Blank lines DO NOT terminate -- YAML allows them between list items
        // (gemini-code-assist review on PR #43, 2026-05-03).
        inBlock = false;
      }
    }
  }

  if (unresolved === 0) {
    console.log("  OK inheritance references resolve");
  }
}

// ---------------------------------------------------------------------------
// Token / CSS sync
// ---------------------------------------------------------------------------
// Loop 4 → Loop 5 regression: build/print/slides.css moved --vd-slide-width
// to 1280px while tokens/spacing/slides.json kept the master width at 1280pt.
// The two values had divergent physical sizes in PDF rendering. The validator
// catches the narrow case (slides master width/height) deterministically and
// emits warnings for any other token whose $value looks like a CSS dimension
// but cannot be obviously matched to a CSS variable, so a maintainer can
// audit the rest by hand.
function checkTokenCssSync() {
  const tokensDir = join(ROOT, "tokens");
  const printDir = join(ROOT, "build", "print");
  if (!existsSync(tokensDir) || !existsSync(printDir)) {
    console.log("  OK token/CSS sync (no tokens or print dir)");
    return;
  }

  // Walk tokens/**/*.json, collect every leaf with a CSS-dimension $value
  type TokenLeaf = { path: string; value: string; file: string };
  const tokens: TokenLeaf[] = [];
  const dimensionRegex = /^[\d.]+\s*(px|pt|in|mm|cm|em|rem|%)(\s+[\d.]+\s*(px|pt|in|mm|cm|em|rem|%))?$/;

  function walkJson(node: unknown, path: string[], file: string) {
    if (node === null || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (typeof obj.$value === "string" && dimensionRegex.test(obj.$value.trim())) {
      tokens.push({ path: path.join("."), value: obj.$value, file });
      return;
    }
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith("$")) continue;
      walkJson(val, [...path, key], file);
    }
  }

  function walkDir(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walkDir(full);
      else if (entry.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(readFileSync(full, "utf-8"));
          walkJson(parsed, [], full);
        } catch {
          // JSON syntax errors are caught by validate.ts; skip here
        }
      }
    }
  }
  walkDir(tokensDir);

  // Collect every --vd-* declaration across build/print/*.css
  const cssVars = new Map<string, { value: string; file: string }>();
  for (const entry of readdirSync(printDir)) {
    if (!entry.endsWith(".css")) continue;
    const full = join(printDir, entry);
    const content = readFileSync(full, "utf-8");
    // Match --vd-* declarations. Trailing semicolon is optional in CSS for
    // the last declaration in a block; exclude `}` and newline from the
    // value so we don't run past the brace.
    // gemini-code-assist review on PR #44, 2026-05-03 (medium finding).
    const re = /(--vd-[a-z0-9-]+)\s*:\s*([^;}\n]+);?/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      cssVars.set(m[1], { value: m[2].trim(), file: full });
    }
  }

  let mismatches = 0;
  let unmatched = 0;

  // Deterministic check: slides master width + height MUST match
  const slidesPairs: Array<[string, string]> = [
    ["spacing.slides.master.width", "--vd-slide-width"],
    ["spacing.slides.master.height", "--vd-slide-height"],
  ];
  for (const [tokenPath, varName] of slidesPairs) {
    const tok = tokens.find(t => t.path === tokenPath);
    const css = cssVars.get(varName);
    if (!tok || !css) continue;
    if (tok.value.trim() !== css.value.trim()) {
      error(
        `Token/CSS divergence: token "${tokenPath}" = ${tok.value} but CSS "${varName}" = ${css.value}`
      );
      mismatches++;
    }
  }

  // Heuristic auto-match: only audit tokens scoped to print/slide cells,
  // since build/print/*.css is the only CSS surface this validator reads.
  // Web/Tailwind tokens (spacing.1, spacing.2, ...) generate Tailwind classes,
  // not --vd-* CSS vars, and are out of scope here.
  const allowlistUnmatched = new Set([
    // page sizes are not exposed as single CSS vars (they use @page rules)
    "spacing.print.page.letter",
    "spacing.print.page.a4",
  ]);
  for (const tok of tokens) {
    if (allowlistUnmatched.has(tok.path)) continue;
    const segs = tok.path.split(".");
    if (segs[0] !== "spacing") continue;
    if (segs[1] !== "print" && segs[1] !== "slides") continue;
    const candidates: string[] = [];
    const tail = segs.slice(1).join("-").replace(/_/g, "-");
    candidates.push(`--vd-${tail}`);
    if (segs[1] === "slides") candidates.push(`--vd-slide-${segs.slice(2).join("-")}`);
    if (segs[1] === "print") candidates.push(`--vd-${segs.slice(2).join("-")}`);
    const matched = candidates.some(c => cssVars.has(c));
    if (!matched) {
      unmatched++;
      if (unmatched <= 5) {
        warn(`Token "${tok.path}" (${tok.value}) has no obvious CSS variable match; audit manually`);
      }
    }
  }
  if (unmatched > 5) {
    warn(`...and ${unmatched - 5} more tokens without obvious CSS matches (${unmatched} total)`);
  }

  if (mismatches === 0) {
    console.log("  OK token/CSS sync (slides master matches)");
  }
}

// ---------------------------------------------------------------------------
// Voice profiles exist for every recipe source
// ---------------------------------------------------------------------------
// LEARNINGS principle: a voice recipe that names "Mark" or "Jon" as a voice
// source asserts that a concrete profile exists in voice/team/ to back the
// claim. Without backing, the recipe is a promise the system can't keep.
// PR #43 Loop 3 added Mark + Jon profiles after the gap was identified;
// this check ensures future recipes don't reintroduce the gap.
function checkVoiceProfilesExist() {
  const recipesFile = join(ROOT, "voice", "recipes.yaml");
  const teamDir = join(ROOT, "voice", "team");
  if (!existsSync(recipesFile)) {
    console.log("  OK voice profiles (no recipes.yaml)");
    return;
  }

  let parsed: unknown;
  try {
    const out = execFileSync("python3", [
      "-c",
      "import yaml, json, sys; print(json.dumps(yaml.safe_load(sys.stdin.read())))",
    ], { input: readFileSync(recipesFile, "utf-8"), stdio: ["pipe", "pipe", "pipe"] });
    parsed = JSON.parse(out.toString());
  } catch {
    error("voice/recipes.yaml could not be parsed for profile-existence check");
    return;
  }

  // Ingredient-style names that don't need a person profile
  const ingredientAllowlist = new Set([
    "any", "team", "verdigris", "the verdigris team", "any team member",
    "operator", "founder", "engineer", "customer",
    "technical_precision", "operator_empathy", "strategic_narrative",
    "self_honesty", "warmth_and_humor", "personal_connection",
    "mission_gravity", "market_fluency",
  ]);

  const referenced = new Set<string>();
  const recipes = (parsed as { recipes?: Record<string, unknown> }).recipes || {};
  for (const recipe of Object.values(recipes)) {
    if (!recipe || typeof recipe !== "object") continue;
    const sources = (recipe as { voice_sources?: Record<string, unknown> }).voice_sources;
    if (!sources) continue;
    for (const v of Object.values(sources)) {
      if (typeof v !== "string") continue;
      // Strip parenthetical content first ("Mark (storytelling, X)" → "Mark").
      // Then split on " or " + "," + "/" to handle "Jon or Thomas" / "Jon/Thomas".
      // Take the first whitespace-separated token of each chunk.
      const stripped = v.replace(/\([^)]*\)/g, "");
      for (const chunk of stripped.split(/\s+or\s+|,|\//i)) {
        const m = chunk.trim().match(/^([A-Za-z][A-Za-z_-]*)/);
        if (!m) continue;
        const name = m[1].toLowerCase();
        if (ingredientAllowlist.has(name)) continue;
        if (name.length < 2) continue;
        referenced.add(name);
      }
    }
  }

  const profileNames = new Set<string>();
  if (existsSync(teamDir)) {
    for (const entry of readdirSync(teamDir)) {
      if (!entry.endsWith(".yaml")) continue;
      const first = entry.split("-")[0].toLowerCase();
      profileNames.add(first);
    }
  }

  let missing = 0;
  for (const name of referenced) {
    if (!profileNames.has(name)) {
      error(`Voice recipe references "${name}" but no voice/team/${name}-*.yaml profile exists`);
      missing++;
    }
  }

  if (missing === 0) {
    console.log(`  OK voice profiles exist (${referenced.size} names referenced, all backed)`);
  }
}

// ---------------------------------------------------------------------------
// Public-package PII scan
// ---------------------------------------------------------------------------
// Loop 5O surfaced: voice/team/mark-chung.yaml carried Mark's volleyball
// quote, jon-chu.yaml had BBE customer equipment serials, jimit-shah.yaml
// named T-Mobile. Those files don't ship publicly today (package.json
// `files` excludes voice/team/), but the same patterns can leak into files
// that DO ship — categories/, foundations/, voice/recipes.yaml. This check
// walks every file enumerated by package.json `files` + `exports` and flags
// PII patterns. Hard PII (family scheduling, equipment serials) is ERROR;
// customer-name patterns are WARNING for human review.
function checkPublicPackagePii() {
  const pkgFile = join(ROOT, "package.json");
  if (!existsSync(pkgFile)) {
    console.log("  OK PII scan (no package.json)");
    return;
  }
  const pkg = JSON.parse(readFileSync(pkgFile, "utf-8"));

  // Use `npm pack --dry-run --json` to get the authoritative list of files
  // that would ship in the published tarball. This handles `.npmignore`,
  // default exclusions, nested conditional exports, and globs the same way
  // npm itself does — sidestepping manual-parse fragility.
  // gemini-code-assist review on PR #44, 2026-05-03 (high + medium findings).
  const publicPaths = new Set<string>();
  try {
    const out = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    }).toString();
    const parsed = JSON.parse(out);
    const filesArray = Array.isArray(parsed) && parsed[0]?.files ? parsed[0].files : [];
    for (const entry of filesArray) {
      if (entry?.path) publicPaths.add(entry.path);
    }
  } catch (e) {
    // Fall back to manual parse if npm pack is unavailable (offline, network
    // sandbox, etc). Keep the recursive walk per Gemini's HIGH finding so
    // nested conditional exports aren't silently missed.
    function addPath(p: string) {
      publicPaths.add(p.replace(/^\.\//, ""));
    }
    function walkExports(node: unknown) {
      if (typeof node === "string") {
        addPath(node);
      } else if (node && typeof node === "object") {
        for (const val of Object.values(node)) walkExports(val);
      }
    }
    for (const entry of pkg.files || []) addPath(entry);
    if (pkg.exports) walkExports(pkg.exports);
  }

  const files: string[] = [];
  function walk(p: string) {
    const full = join(ROOT, p);
    if (!existsSync(full)) return;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(full)) {
        if (entry.startsWith(".")) continue;
        walk(join(p, entry));
      }
    } else if (/\.(md|yaml|yml|json|css|js|ts|html|txt)$/.test(p)) {
      files.push(p);
    }
  }
  for (const p of publicPaths) {
    walk(p.replace(/\/$/, ""));
  }

  const FAMILY_WORDS = /\b(volleyball|school pickup|son's|daughter's|kid's birthday|vacation|appointment)\b/i;
  const SERIAL_PATTERN = /\b[A-Z]{3}\d{6,10}\b/;
  // Case-insensitive for consistency with CUSTOMER_DENYLIST.
  // gemini-code-assist review on PR #44, 2026-05-03 (medium finding).
  const SITE_DENYLIST = /\b(Aurora|Cambridge UK|Burlingame|Waltham)\b/i;
  const CUSTOMER_DENYLIST = /\b(Abcam|T-Mobile|T Mobile|tmobile|Verizon|One Power|Bentaus|EnergyHub360)\b/i;

  // Allowlist for files known to legitimately use these terms.
  // Mirror the spirit of build/lint-external.ts ALLOWLIST.
  const ALLOWLIST: Record<string, RegExp[]> = {
    // recipes.yaml's Mike voice-source quote names "Aurora" as a customer-site
    // replacement context. Field-context, not identifying. If this becomes a
    // problem, tighten the recipe wording rather than weakening the validator.
    "voice/recipes.yaml": [SITE_DENYLIST],
    // workflows/pii-review.md is the human-PII-review SOP. It documents the
    // patterns by quoting them. Allowlisting the SOP is not a backdoor; the
    // SOP's job is to name the patterns the validator looks for.
    "workflows/pii-review.md": [FAMILY_WORDS, SERIAL_PATTERN, SITE_DENYLIST, CUSTOMER_DENYLIST],
    // workflows/sales-collateral.md uses fictional customer names ("abcam",
    // "verizon", "t-mobile-redacted") as filename-naming-convention examples.
    "workflows/sales-collateral.md": [CUSTOMER_DENYLIST],
    // LEARNINGS.md captures the original Loop 5O incident as a permanent
    // teaching example. The file is append-only by convention; quoting the
    // patterns is the point of the learning.
    "LEARNINGS.md": [FAMILY_WORDS, SERIAL_PATTERN, SITE_DENYLIST, CUSTOMER_DENYLIST],
    // pilot-kickoff.md discusses pronoun rules and quotes "Customer" as a
    // diction example, not a customer reference.
    "categories/slides/pilot-kickoff.md": [CUSTOMER_DENYLIST],
    // The Abcam example HTML is a known live customer reference that has
    // been through human review (see LEARNINGS.md). Tracked as a known
    // reference, not a leak; rename pending in a separate PR.
    "categories/slides/examples/abcam-kickoff-redux.html": [CUSTOMER_DENYLIST, SITE_DENYLIST],
    // The slides/examples README must reference its sibling filenames in
    // the provenance table (including the legacy abcam-kickoff-redux.html
    // slug). Allowlist the customer-name denylist on this README only;
    // body content uses fictional placeholders. Re-tighten when the
    // legacy slug is renamed.
    "categories/slides/examples/README.md": [CUSTOMER_DENYLIST],
  };

  let errs = 0;
  let warns = 0;
  const seen = new Set<string>();

  for (const f of files) {
    let content: string;
    try {
      content = readFileSync(join(ROOT, f), "utf-8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    const allowed = ALLOWLIST[f] || [];
    // Hoisted out of the line-loop — same value every iteration.
    // gemini-code-assist review on PR #44, 2026-05-03 (medium finding).
    const checks: Array<{ re: RegExp; severity: "error" | "warn"; label: string }> = [
      { re: FAMILY_WORDS, severity: "error", label: "family/personal scheduling" },
      { re: SERIAL_PATTERN, severity: "error", label: "equipment serial" },
      { re: SITE_DENYLIST, severity: "warn", label: "customer site nickname" },
      { re: CUSTOMER_DENYLIST, severity: "warn", label: "customer name" },
    ];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const c of checks) {
        if (allowed.some(a => a.source === c.re.source)) continue;
        if (!c.re.test(line)) continue;
        const key = `${f}:${i}:${c.label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const snippet = line.trim().slice(0, 100);
        if (c.severity === "error") {
          error(`PII (${c.label}) in public file ${f}:${i + 1} — ${snippet}`);
          errs++;
        } else {
          warn(`Possible PII (${c.label}) in public file ${f}:${i + 1} — ${snippet}`);
          warns++;
        }
      }
    }
  }

  if (errs === 0 && warns === 0) {
    console.log(`  OK PII scan (${files.length} public files clean)`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log("Validating visual rules...\n");

  checkYamlSyntax();
  checkEmdashes();
  checkConstraintTests();
  checkLlmEvalConvention();
  checkFloorsAndCeilings();
  checkMaturityField();
  checkInheritanceIntegrity();
  checkTokenCssSync();
  checkVoiceProfilesExist();
  checkPublicPackagePii();
  checkSidebarCoverage();

  console.log(
    `\n${errors} errors, ${warnings} warnings`
  );
  process.exit(errors > 0 ? 1 : 0);
}

main();
