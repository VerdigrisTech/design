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

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
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
  checkSidebarCoverage();

  console.log(
    `\n${errors} errors, ${warnings} warnings`
  );
  process.exit(errors > 0 ? 1 : 0);
}

main();
