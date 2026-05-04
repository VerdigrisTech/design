/**
 * Cohesion audit script.
 *
 * Runs 7 deterministic dimensions against the design-system repo and emits
 * a markdown report + JSON sidecar to audits/cohesion/.
 *
 * v0.1 dimensions:
 *   1. Token namespace cohesion
 *   2. Visual rhythm (typography size + spacing histogram)
 *   3. Color expression (literal hex / oklch / hsl scan)
 *   4. Hierarchy translation (eyebrow / kicker / headline / deck / lede)
 *   5. Class-name namespace cohesion (orphans, ghosts, prefix drift)
 *   6. Genre decision tree (modes resolve to documented genres)
 *   7. System-doc consistency (CLAUDE.md commands, CONSUMERS.md surfaces)
 *
 * CLI:
 *   npx tsx build/audit/cohesion.ts
 *   npx tsx build/audit/cohesion.ts whitepapers
 *   npx tsx build/audit/cohesion.ts --dimension=color
 *   npx tsx build/audit/cohesion.ts whitepapers --dimension=typography
 *
 * Read-only. No file mutations except the report write under audits/cohesion/.
 */

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.VD_ROOT
  ? process.env.VD_ROOT
  : join(__dirname, "..", "..");

const SCHEMA_VERSION = "0.1";
const PER_DIMENSION_CAP = 25;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Dimension =
  | "token-namespace"
  | "visual-rhythm"
  | "color-expression"
  | "hierarchy-translation"
  | "class-name-namespace"
  | "genre-decision-tree"
  | "system-doc-consistency";

type Severity = "critical" | "should-fix" | "note";

type Finding = {
  dimension: Dimension;
  severity: Severity;
  summary: string;
  citation: string;
  expected?: string;
  actual?: string;
  suggestedAction?: string;
  affectedCells?: string[];
};

type DimensionAlias = {
  short: string;
  full: Dimension;
};

const DIMENSION_ALIASES: DimensionAlias[] = [
  { short: "token", full: "token-namespace" },
  { short: "tokens", full: "token-namespace" },
  { short: "namespace", full: "token-namespace" },
  { short: "rhythm", full: "visual-rhythm" },
  { short: "typography", full: "visual-rhythm" },
  { short: "color", full: "color-expression" },
  { short: "colour", full: "color-expression" },
  { short: "hierarchy", full: "hierarchy-translation" },
  { short: "class", full: "class-name-namespace" },
  { short: "classes", full: "class-name-namespace" },
  { short: "genre", full: "genre-decision-tree" },
  { short: "modes", full: "genre-decision-tree" },
  { short: "doc", full: "system-doc-consistency" },
  { short: "docs", full: "system-doc-consistency" },
];

const ALL_DIMENSIONS: Dimension[] = [
  "token-namespace",
  "visual-rhythm",
  "color-expression",
  "hierarchy-translation",
  "class-name-namespace",
  "genre-decision-tree",
  "system-doc-consistency",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rel(p: string): string {
  return relative(ROOT, p).split("\\").join("/");
}

function walkFiles(dir: string, predicate: (p: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === "_site" || entry === "dist") continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walkFiles(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

/** Replace CSS /* ... *\/ and HTML <!-- ... --> comment bodies with whitespace.
 * Preserves byte offsets and line numbers so subsequent regex citations stay
 * accurate. Use before any regex that would otherwise match prose inside
 * comments (hex literals like "#2088" issue refs, class-prefix examples). */
function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " "))
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, " "));
}

function safeJson(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function lineOf(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

function listCells(): string[] {
  const dir = join(ROOT, "categories");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .filter(e => !e.name.startsWith("_") && !e.name.startsWith("."))
    .map(e => e.name);
}

function cellOfPath(path: string): string | null {
  const r = rel(path);
  const m = r.match(/^categories\/([^/]+)\//);
  if (m) return m[1];
  if (r.startsWith("build/print/")) {
    const fname = basename(r, ".css");
    if (fname === "cover" || fname === "whitepaper-body") return "whitepapers";
    if (fname === "slides") return "slides";
    if (fname === "one-pager") return "one-pagers";
    if (fname === "case-study") return "case-studies";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dimension 1: Token namespace cohesion
// ---------------------------------------------------------------------------

const UNIT_REGEX = /^[\d.]+\s*(px|pt|in|mm|cm|rem|em|%)\b/;

function checkTokenNamespace(): Finding[] {
  const findings: Finding[] = [];
  const tokensDir = join(ROOT, "tokens");
  if (!existsSync(tokensDir)) return findings;

  const tokenFiles = walkFiles(tokensDir, p => p.endsWith(".json"));

  type Leaf = { path: string; value: string; file: string; line: number };
  const leaves: Leaf[] = [];

  function unitOf(value: string): string | null {
    const m = value.trim().match(UNIT_REGEX);
    return m ? m[1] : null;
  }

  for (const file of tokenFiles) {
    const content = safeRead(file);
    const parsed = safeJson(file);
    if (parsed === null) continue;

    const walk = (node: unknown, pathSegs: string[]) => {
      if (node === null || typeof node !== "object") return;
      const obj = node as Record<string, unknown>;
      if (typeof obj.$value === "string") {
        const dottedKey = pathSegs.join(".");
        const idx = pathSegs.length > 0 ? content.indexOf(`"${pathSegs[pathSegs.length - 1]}"`) : -1;
        leaves.push({
          path: dottedKey,
          value: obj.$value,
          file,
          line: idx >= 0 ? lineOf(content, idx) : 1,
        });
        return;
      }
      for (const [key, val] of Object.entries(obj)) {
        if (key.startsWith("$")) continue;
        walk(val, [...pathSegs, key]);
      }
    };
    walk(parsed, []);
  }

  // Drift detection: paths in the same parent group should use a consistent
  // separator style (dot grouping vs hyphen-flat). Flag siblings where one
  // child uses a hyphen-compound name AND another uses an extra dot level
  // for the same prefix.
  const byParent = new Map<string, Leaf[]>();
  for (const leaf of leaves) {
    const segs = leaf.path.split(".");
    const parent = segs.slice(0, -1).join(".");
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent)!.push(leaf);
  }

  for (const [parent, siblings] of byParent) {
    if (siblings.length < 2) continue;
    const childNames = siblings.map(s => s.path.split(".").pop()!);
    const sameRootCounts = new Map<string, number>();
    for (const n of childNames) {
      if (!n.includes("-")) continue;
      const root = n.split("-")[0];
      sameRootCounts.set(root, (sameRootCounts.get(root) || 0) + 1);
    }
    for (const [root] of sameRootCounts) {
      // Check if a parallel dotted nesting under the same parent exists
      // (e.g., parent.frame.side AND parent.frame-side as siblings of parent).
      const dottedNested = byParent.get(`${parent}.${root}`);
      if (dottedNested && dottedNested.length > 0) {
        const example = siblings.find(s => s.path.split(".").pop()!.startsWith(`${root}-`));
        if (example) {
          findings.push({
            dimension: "token-namespace",
            severity: "should-fix",
            summary: `Mixed grouping under "${parent}": both "${root}-*" hyphen-flat and "${root}.*" dotted-nested forms`,
            citation: `${rel(example.file)}:${example.line}`,
            expected: `Pick one grouping style per parent: either "${parent}.${root}.<sub>" nested or "${parent}.${root}-<sub>" flat`,
            actual: `"${example.path}" alongside dotted children at "${parent}.${root}"`,
            suggestedAction: `Consolidate the group to one style; rename one branch and update consumers`,
          });
        }
      }
    }
  }

  // Mixed-units within a group: same parent contains tokens with different
  // physical units when those units are not deliberate.
  for (const [parent, siblings] of byParent) {
    if (siblings.length < 2) continue;
    const units = new Map<string, Leaf[]>();
    for (const leaf of siblings) {
      const u = unitOf(leaf.value);
      if (!u) continue;
      // Skip page-size declarations: "8.5in 11in" is a paired dimension.
      if (/\d.*\s+\d/.test(leaf.value.trim())) continue;
      if (!units.has(u)) units.set(u, []);
      units.get(u)!.push(leaf);
    }
    if (units.size < 2) continue;
    const unitSet = new Set(units.keys());
    const pairKey = [...unitSet].sort().join(",");
    // Allow legitimate {em, rem} or {%, em/rem} mixes.
    if (pairKey === "em,rem" || pairKey === "%,em" || pairKey === "%,rem") continue;

    const sample = siblings[0];
    findings.push({
      dimension: "token-namespace",
      severity: "should-fix",
      summary: `Mixed units in token group "${parent}": ${[...unitSet].join(" + ")}`,
      citation: `${rel(sample.file)}:${sample.line}`,
      expected: `One physical unit per token group (print uses inches; web uses px or rem)`,
      actual: `Group "${parent}" mixes ${[...unitSet].join(" and ")} across ${siblings.length} children`,
      suggestedAction: `Convert outliers to the dominant unit, or split into separate groups`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 2: Visual rhythm
// ---------------------------------------------------------------------------

function checkVisualRhythm(): Finding[] {
  const findings: Finding[] = [];

  // Collect declared scale: typography sizes from tokens.
  const scaleFile = join(ROOT, "tokens", "typography", "scale.json");
  const scale = safeJson(scaleFile) as Record<string, unknown> | null;
  const declaredFontSizes = new Set<string>();
  if (scale) {
    const walk = (node: unknown) => {
      if (node === null || typeof node !== "object") return;
      const obj = node as Record<string, unknown>;
      if (typeof obj.$value === "string" && /^[\d.]+(px|pt|rem|em)/.test(obj.$value)) {
        declaredFontSizes.add(obj.$value.trim());
      }
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith("$")) continue;
        walk(v);
      }
    };
    walk(scale);
  }

  // Per-cell histogram of literal font-size values from CSS + HTML inline styles.
  type Histo = Map<string, { count: number; firstCitation: string }>;
  const perCell = new Map<string, Histo>();

  const sources: string[] = [];
  for (const cell of listCells()) {
    walkFiles(join(ROOT, "categories", cell), p => /\.(html|css|md)$/.test(p), sources);
  }
  walkFiles(join(ROOT, "build", "print"), p => p.endsWith(".css"), sources);

  const fontSizeRe = /font-size\s*:\s*([^;}\n]+?)\s*[;}]/g;

  for (const file of sources) {
    const cell = cellOfPath(file);
    if (!cell) continue;
    const content = safeRead(file);
    if (!perCell.has(cell)) perCell.set(cell, new Map());
    const histo = perCell.get(cell)!;
    let m;
    fontSizeRe.lastIndex = 0;
    while ((m = fontSizeRe.exec(content)) !== null) {
      const raw = m[1].trim();
      if (raw.startsWith("var(") || raw.startsWith("calc(")) continue;
      if (!/^[\d.]+(px|pt|rem|em)$/.test(raw)) continue;
      const line = lineOf(content, m.index);
      const existing = histo.get(raw);
      if (existing) {
        existing.count++;
      } else {
        histo.set(raw, { count: 1, firstCitation: `${rel(file)}:${line}` });
      }
    }
  }

  const declaredCount = declaredFontSizes.size;
  for (const [cell, histo] of perCell) {
    const cellSizes = [...histo.keys()];
    if (cellSizes.length === 0) continue;
    const overlap = cellSizes.filter(s => declaredFontSizes.has(s));
    if (declaredCount > 0 && overlap.length === 0 && cellSizes.length >= 3) {
      const sample = histo.get(cellSizes[0])!;
      findings.push({
        dimension: "visual-rhythm",
        severity: "should-fix",
        summary: `Cell "${cell}" font sizes do not overlap the declared typography scale`,
        citation: sample.firstCitation,
        expected: `At least one literal font-size matches a token in tokens/typography/scale.json`,
        actual: `Cell uses [${cellSizes.slice(0, 6).join(", ")}${cellSizes.length > 6 ? ", ..." : ""}]; none in scale`,
        suggestedAction: `Replace literals with var(--token) references, or add the size to scale.json if intentional`,
      });
    }
    if (declaredCount > 0 && cellSizes.length > Math.max(declaredCount + 2, 7)) {
      const sample = histo.get(cellSizes[0])!;
      findings.push({
        dimension: "visual-rhythm",
        severity: "note",
        summary: `Cell "${cell}" uses ${cellSizes.length} distinct font sizes; declared scale has ${declaredCount}`,
        citation: sample.firstCitation,
        expected: `Distinct sizes per cell should approximate the declared scale density`,
        actual: `${cellSizes.length} distinct literal values across the cell`,
        suggestedAction: `Audit which sizes are intentional; collapse near-duplicates onto scale tokens`,
      });
    }
  }

  // Cross-cell drift: any size used by exactly one cell that is also not in
  // the declared scale is a per-cell-special. If multiple cells have many
  // such specials, that is rhythm drift.
  const sizesByCell = new Map<string, Set<string>>();
  for (const [cell, histo] of perCell) sizesByCell.set(cell, new Set(histo.keys()));
  const cells = [...sizesByCell.keys()];
  if (cells.length >= 2) {
    const driftPairs: { a: string; b: string; aOnly: number; bOnly: number }[] = [];
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i];
        const b = cells[j];
        const aSet = sizesByCell.get(a)!;
        const bSet = sizesByCell.get(b)!;
        let aOnly = 0;
        let bOnly = 0;
        for (const s of aSet) if (!bSet.has(s) && !declaredFontSizes.has(s)) aOnly++;
        for (const s of bSet) if (!aSet.has(s) && !declaredFontSizes.has(s)) bOnly++;
        if (aOnly >= 3 && bOnly >= 3) driftPairs.push({ a, b, aOnly, bOnly });
      }
    }
    for (const pair of driftPairs) {
      findings.push({
        dimension: "visual-rhythm",
        severity: "note",
        summary: `Sibling cells "${pair.a}" and "${pair.b}" each use 3+ font sizes the other does not`,
        citation: `categories/${pair.a}/`,
        expected: `Sibling cells share most font sizes; per-cell variation under 3 distinct values`,
        actual: `${pair.a} unique=${pair.aOnly}, ${pair.b} unique=${pair.bOnly}`,
        suggestedAction: `Reconcile to the typography scale; document deliberate per-cell exceptions`,
        affectedCells: [pair.a, pair.b],
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 3: Color expression
// ---------------------------------------------------------------------------

function checkColorExpression(): Finding[] {
  const findings: Finding[] = [];

  const hexFile = join(ROOT, "build", "dist", "hex", "colors.json");
  const declaredHex = new Set<string>();
  const declared = safeJson(hexFile) as Record<string, string> | null;
  if (declared) {
    for (const v of Object.values(declared)) declaredHex.add(v.toLowerCase());
  }

  // Allow common neutrals and shorthand forms of declared colors.
  const allowlist = new Set<string>([
    "#fff", "#ffffff", "#000", "#000000",
  ]);

  const sources: string[] = [];
  for (const cell of listCells()) {
    walkFiles(join(ROOT, "categories", cell), p => /\.(html|css|svg)$/.test(p), sources);
  }
  walkFiles(join(ROOT, "build", "print"), p => p.endsWith(".css"), sources);
  walkFiles(join(ROOT, "_layouts"), p => p.endsWith(".html"), sources);

  const hexRe = /#[0-9a-f]{3,8}\b/gi;
  const oklchRe = /oklch\(\s*([^)]+)\)/gi;

  let count = 0;

  // Dedupe by (literal, file): repeated use of the same color in one file
  // becomes a single finding with occurrence count, freeing the per-dim cap.
  const hexDedup = new Map<string, { firstLine: number; count: number }>();

  for (const file of sources) {
    if (count >= PER_DIMENSION_CAP * 2) break;
    const raw = safeRead(file);
    if (!raw) continue;
    const content = stripComments(raw); // ignore comment refs (e.g., "#2088" issue numbers)

    let m;
    hexRe.lastIndex = 0;
    while ((m = hexRe.exec(content)) !== null) {
      const literal = m[0].toLowerCase();
      // Reject malformed lengths (must be 3, 4, 6, or 8 hex digits after #)
      const hexLen = literal.length - 1;
      if (hexLen !== 3 && hexLen !== 4 && hexLen !== 6 && hexLen !== 8) continue;
      if (allowlist.has(literal)) continue;
      if (declaredHex.has(literal)) continue;
      // Normalize 3-digit shorthand for token comparison.
      if (literal.length === 4) {
        const expanded = `#${literal[1]}${literal[1]}${literal[2]}${literal[2]}${literal[3]}${literal[3]}`;
        if (declaredHex.has(expanded)) continue;
      }
      // Skip 8-digit hex (alpha channel forms of declared colors).
      if (literal.length === 9) {
        const noAlpha = literal.slice(0, 7);
        if (declaredHex.has(noAlpha)) continue;
      }
      const line = lineOf(content, m.index);
      const dedupKey = `${literal}::${file}`;
      const prior = hexDedup.get(dedupKey);
      if (prior) {
        prior.count++;
        continue;
      }
      hexDedup.set(dedupKey, { firstLine: line, count: 1 });
      findings.push({
        dimension: "color-expression",
        severity: "should-fix",
        summary: `Literal color "${literal}" not in declared palette`,
        citation: `${rel(file)}:${line}`,
        expected: `Color present in build/dist/hex/colors.json or referenced via var(--token)`,
        actual: literal,
        suggestedAction: `Replace with a token reference, or add the color to tokens if intentional`,
      });
      count++;
      if (count >= PER_DIMENSION_CAP * 2) break;
    }

    if (count >= PER_DIMENSION_CAP * 2) break;
    oklchRe.lastIndex = 0;
    while ((m = oklchRe.exec(content)) !== null) {
      const inner = m[1].trim();
      if (/var\(/.test(inner)) continue;
      const line = lineOf(content, m.index);
      // Skip foundations and tokens; they may legitimately quote oklch values.
      if (file.includes("/foundations/") || file.includes("/tokens/")) continue;
      findings.push({
        dimension: "color-expression",
        severity: "note",
        summary: `oklch() literal in ${rel(file)}; prefer var(--token)`,
        citation: `${rel(file)}:${line}`,
        expected: `oklch() values flow through tokens, not inline literals`,
        actual: m[0].slice(0, 60),
        suggestedAction: `Reference a color token rather than inlining oklch()`,
      });
      count++;
      if (count >= PER_DIMENSION_CAP * 2) break;
    }
  }

  // Annotate dedupe counts on hex findings with multiple occurrences in one file.
  for (const f of findings) {
    if (f.dimension !== "color-expression" || !f.actual?.startsWith("#")) continue;
    const file = f.citation.split(":")[0];
    const literal = f.actual;
    const filePath = join(ROOT, file);
    const dedupKey = `${literal}::${filePath}`;
    const entry = hexDedup.get(dedupKey);
    if (entry && entry.count > 1) {
      f.actual = `${literal} (${entry.count} occurrences in this file)`;
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 4: Hierarchy translation
// ---------------------------------------------------------------------------

function checkHierarchyTranslation(): Finding[] {
  const findings: Finding[] = [];

  const ROLES = ["eyebrow", "kicker", "headline", "deck", "lede", "lead", "subhead", "tagline"];
  const SYNONYM_PAIRS: [string, string, string][] = [
    ["eyebrow", "kicker", "label-above-headline"],
    ["lede", "lead", "opening-paragraph"],
    ["headline", "title", "primary-heading"],
    ["deck", "subhead", "secondary-heading"],
  ];

  // cell -> role -> first citation
  const usage = new Map<string, Map<string, string>>();
  const sources: string[] = [];
  for (const cell of listCells()) {
    walkFiles(join(ROOT, "categories", cell), p => /\.(html|css|md)$/.test(p), sources);
  }

  const classRe = /class\s*=\s*"([^"]+)"/g;
  const cssClassRe = /\.([a-z][a-z0-9_-]*)/g;

  for (const file of sources) {
    const cell = cellOfPath(file);
    if (!cell) continue;
    if (!usage.has(cell)) usage.set(cell, new Map());
    const cellUsage = usage.get(cell)!;
    const content = safeRead(file);

    if (file.endsWith(".css")) {
      let m;
      cssClassRe.lastIndex = 0;
      while ((m = cssClassRe.exec(content)) !== null) {
        const cls = m[1];
        if (!ROLES.includes(cls)) continue;
        if (!cellUsage.has(cls)) {
          cellUsage.set(cls, `${rel(file)}:${lineOf(content, m.index)}`);
        }
      }
    } else {
      let m;
      classRe.lastIndex = 0;
      while ((m = classRe.exec(content)) !== null) {
        const tokens = m[1].split(/\s+/);
        for (const t of tokens) {
          if (!ROLES.includes(t)) continue;
          if (!cellUsage.has(t)) {
            cellUsage.set(t, `${rel(file)}:${lineOf(content, m.index)}`);
          }
        }
      }
    }
  }

  // Flag synonym drift across cells.
  for (const [a, b, role] of SYNONYM_PAIRS) {
    const usingA: { cell: string; cite: string }[] = [];
    const usingB: { cell: string; cite: string }[] = [];
    for (const [cell, roles] of usage) {
      if (roles.has(a)) usingA.push({ cell, cite: roles.get(a)! });
      if (roles.has(b)) usingB.push({ cell, cite: roles.get(b)! });
    }
    if (usingA.length > 0 && usingB.length > 0) {
      const cite = usingA[0].cite;
      findings.push({
        dimension: "hierarchy-translation",
        severity: "should-fix",
        summary: `Role "${role}" expressed as both "${a}" and "${b}" across cells`,
        citation: cite,
        expected: `One canonical class per hierarchy role across all cells`,
        actual: `"${a}" used by [${usingA.map(u => u.cell).join(", ")}]; "${b}" used by [${usingB.map(u => u.cell).join(", ")}]`,
        suggestedAction: `Pick one class name; migrate the other via CSS alias or rewrite`,
        affectedCells: [...new Set([...usingA.map(u => u.cell), ...usingB.map(u => u.cell)])],
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 5: Class-name namespace cohesion
// ---------------------------------------------------------------------------

function checkClassNameNamespace(): Finding[] {
  const findings: Finding[] = [];

  type ClassRef = { name: string; file: string; line: number };
  const usedInHtml: ClassRef[] = [];
  const definedInCss: ClassRef[] = [];

  const htmlFiles: string[] = [];
  for (const cell of listCells()) {
    walkFiles(join(ROOT, "categories", cell), p => /\.html$/.test(p), htmlFiles);
  }

  const cssFiles: string[] = [];
  walkFiles(join(ROOT, "build", "print"), p => p.endsWith(".css"), cssFiles);
  for (const cell of listCells()) {
    walkFiles(join(ROOT, "categories", cell), p => p.endsWith(".css"), cssFiles);
  }

  const classAttrRe = /class\s*=\s*"([^"]+)"/g;
  for (const file of htmlFiles) {
    const content = safeRead(file);
    let m;
    classAttrRe.lastIndex = 0;
    while ((m = classAttrRe.exec(content)) !== null) {
      const line = lineOf(content, m.index);
      for (const tok of m[1].split(/\s+/)) {
        if (!tok || !/^[a-z][a-z0-9_-]*$/i.test(tok)) continue;
        usedInHtml.push({ name: tok, file, line });
      }
    }
  }

  // Selector must end with a CSS-class-terminating char (whitespace, `,`, `{`, etc.)
  // so prose inside comments like ".vd-cs-*" doesn't match as a class name even
  // after comment-stripping. Combined with stripComments() below this is robust.
  const selectorRe = /(?:^|[\s,>+~{}])\.([a-z][a-z0-9_-]*[a-z0-9])(?=[\s,>+~{:.[#])/g;
  for (const file of cssFiles) {
    const raw = safeRead(file);
    const content = stripComments(raw); // CSS comments quote class examples
    let m;
    selectorRe.lastIndex = 0;
    while ((m = selectorRe.exec(content)) !== null) {
      const line = lineOf(content, m.index);
      definedInCss.push({ name: m[1], file, line });
    }
  }

  const definedSet = new Set(definedInCss.map(d => d.name));
  const usedSet = new Set(usedInHtml.map(u => u.name));

  // Prefix drift: classes mixing prefixes for similar concepts.
  const prefixes = new Map<string, Set<string>>();
  for (const d of definedInCss) {
    const m = d.name.match(/^([a-z]+)-/);
    if (!m) continue;
    if (!prefixes.has(m[1])) prefixes.set(m[1], new Set());
    prefixes.get(m[1])!.add(d.name);
  }

  if (prefixes.has("vd") && prefixes.has("verdigris")) {
    const vdSample = definedInCss.find(d => d.name.startsWith("vd-"))!;
    findings.push({
      dimension: "class-name-namespace",
      severity: "should-fix",
      summary: `Two prefix conventions in use: "vd-*" and "verdigris-*"`,
      citation: `${rel(vdSample.file)}:${vdSample.line}`,
      expected: `One canonical prefix for the namespace`,
      actual: `Found both "vd-*" (${prefixes.get("vd")!.size} classes) and "verdigris-*" (${prefixes.get("verdigris")!.size} classes)`,
      suggestedAction: `Consolidate on "vd-*"; rename "verdigris-*" classes`,
    });
  }

  // Orphans: defined in CSS, never used in HTML.
  const orphanIgnore = /^(html|body|root|page|cover|paper|frame|chapter|section|hero|footer|header|nav|button|input|table|figure|caption|note)$/i;
  const orphanCitations: ClassRef[] = [];
  const orphanSeen = new Set<string>();
  for (const def of definedInCss) {
    if (usedSet.has(def.name)) continue;
    if (orphanIgnore.test(def.name)) continue;
    if (!/^[a-z]+-/.test(def.name)) continue;
    if (orphanSeen.has(def.name)) continue;
    orphanSeen.add(def.name);
    orphanCitations.push(def);
  }
  const orphanLimit = Math.min(orphanCitations.length, 5);
  for (let i = 0; i < orphanLimit; i++) {
    const o = orphanCitations[i];
    findings.push({
      dimension: "class-name-namespace",
      severity: "note",
      summary: `Class ".${o.name}" defined in CSS but not used in any HTML under categories/`,
      citation: `${rel(o.file)}:${o.line}`,
      expected: `Every defined class is referenced from at least one example or specimen`,
      actual: `".${o.name}" has no referencing class= attribute`,
      suggestedAction: `Remove the orphan, or add an example HTML that exercises it`,
    });
  }

  // Ghosts: used in HTML, never defined in any tracked CSS.
  const tailwindLike = /^(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|w|h|min|max|flex|grid|gap|items|justify|self|content|order|col|row|space|divide|text|font|leading|tracking|whitespace|bg|from|to|via|opacity|border|rounded|shadow|ring|outline|cursor|select|resize|appearance|object|overflow|hidden|block|inline|table|sr|not|focus|hover|active|disabled|sm|md|lg|xl|first|last|odd|even|group|peer|dark|aspect|placeholder|fill|stroke|z|top|bottom|left|right|inset|absolute|relative|fixed|static|sticky)(?:-|$)/;
  const ghostIgnore = /^(active|disabled|open|closed|selected|expanded|collapsed|focus|hover|loading)$/;
  const ghostCounts = new Map<string, ClassRef>();
  for (const u of usedInHtml) {
    if (definedSet.has(u.name)) continue;
    if (tailwindLike.test(u.name)) continue;
    if (ghostIgnore.test(u.name)) continue;
    if (!/^[a-z]+-/.test(u.name)) continue;
    if (!ghostCounts.has(u.name)) ghostCounts.set(u.name, u);
  }
  const ghostList = [...ghostCounts.values()].slice(0, 5);
  for (const g of ghostList) {
    findings.push({
      dimension: "class-name-namespace",
      severity: "note",
      summary: `Class "${g.name}" used in HTML but not defined in any tracked CSS`,
      citation: `${rel(g.file)}:${g.line}`,
      expected: `Every class referenced in categories/**/*.html is defined in tracked CSS`,
      actual: `".${g.name}" has no .${g.name} { ... } selector in build/print/ or categories/`,
      suggestedAction: `Add the selector, remove the class, or document the external stylesheet that defines it`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 6: Genre decision tree
// ---------------------------------------------------------------------------

function checkGenreDecisionTree(): Finding[] {
  const findings: Finding[] = [];

  const rulesFile = join(ROOT, "rules", "visual-rules.yml");
  if (!existsSync(rulesFile)) return findings;
  const content = safeRead(rulesFile);

  const declared = new Map<string, Set<string>>();
  for (const cell of listCells()) {
    const cellDir = join(ROOT, "categories", cell);
    const set = new Set<string>();
    for (const entry of readdirSync(cellDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".md")) continue;
      if (entry.name.startsWith("_")) continue;
      const slug = entry.name.replace(/\.md$/, "");
      if (slug === "index" || slug === "README") continue;
      set.add(slug.replace(/-/g, "_"));
      set.add(slug);
    }
    const indexMd = join(cellDir, "index.md");
    if (existsSync(indexMd)) {
      const ic = safeRead(indexMd);
      const tableRe = /^\|\s*\*\*([A-Za-z][A-Za-z _/-]*)\*\*/gm;
      let mm;
      while ((mm = tableRe.exec(ic)) !== null) {
        const norm = mm[1].trim().toLowerCase().replace(/[\s-]+/g, "_");
        set.add(norm);
      }
    }
    declared.set(cell, set);
  }

  // Cross-cell: collect every modes:/applies_to_modes: reference.
  const refRe = /(modes|applies_to_modes):\s*\[([^\]]*)\]/g;
  const referenced = new Map<string, { line: number }>();
  let m;
  while ((m = refRe.exec(content)) !== null) {
    const list = m[2].split(",").map(s => s.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean);
    const line = lineOf(content, m.index);
    for (const g of list) {
      if (!referenced.has(g)) referenced.set(g, { line });
    }
  }

  const allDeclared = new Set<string>();
  for (const set of declared.values()) for (const g of set) allDeclared.add(g);

  for (const [genre, info] of referenced) {
    if (allDeclared.has(genre)) continue;
    findings.push({
      dimension: "genre-decision-tree",
      severity: "should-fix",
      summary: `modes references genre "${genre}" but no categories/<cell>/<genre>.md or table entry documents it`,
      citation: `rules/visual-rules.yml:${info.line}`,
      expected: `Every genre named in modes:/applies_to_modes: is documented in a cell's md files or index table`,
      actual: `"${genre}" referenced from rules; not found in any cell's documented genres`,
      suggestedAction: `Add categories/<cell>/${genre.replace(/_/g, "-")}.md or a row in the cell's index.md genre table`,
    });
  }

  for (const [cell, genres] of declared) {
    const cellGenres = [...genres].filter(g => g !== cell);
    if (cellGenres.length < 2) continue;
    const indexMd = join(ROOT, "categories", cell, "index.md");
    if (!existsSync(indexMd)) {
      findings.push({
        dimension: "genre-decision-tree",
        severity: "should-fix",
        summary: `Cell "${cell}" has multiple genres but no index.md selector`,
        citation: `categories/${cell}/`,
        expected: `Multi-genre cells have an index.md with a "When to use" / "Pick the genre" selector`,
        actual: `Cell has ${cellGenres.length} genres and no index.md`,
        suggestedAction: `Create categories/${cell}/index.md with a one-line genre selector per genre`,
      });
      continue;
    }
    const ic = safeRead(indexMd);
    if (!/when to use|pick the genre|pick the/i.test(ic)) {
      findings.push({
        dimension: "genre-decision-tree",
        severity: "note",
        summary: `Cell "${cell}" index.md has no explicit "When to use" or "Pick the genre" section`,
        citation: `categories/${cell}/index.md:1`,
        expected: `Multi-genre cell index.md surfaces a one-line genre selector`,
        actual: `No header or table heading containing "When to use" / "Pick the genre"`,
        suggestedAction: `Add a "Pick the genre first" section listing each genre with a one-line trigger`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Dimension 7: System-doc consistency
// ---------------------------------------------------------------------------

function checkSystemDocConsistency(): Finding[] {
  const findings: Finding[] = [];

  const claudeFile = join(ROOT, "CLAUDE.md");
  const pkg = safeJson(join(ROOT, "package.json")) as { scripts?: Record<string, string>; exports?: Record<string, unknown> } | null;
  const scripts = pkg?.scripts ? new Set(Object.keys(pkg.scripts)) : new Set<string>();

  if (existsSync(claudeFile)) {
    const claude = safeRead(claudeFile);
    const cmdRe = /npm run\s+([a-z][a-z0-9:_-]*)/g;
    const seen = new Set<string>();
    let m;
    while ((m = cmdRe.exec(claude)) !== null) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      if (!scripts.has(m[1])) {
        const line = lineOf(claude, m.index);
        findings.push({
          dimension: "system-doc-consistency",
          severity: "critical",
          summary: `CLAUDE.md references "npm run ${m[1]}" but the script is not in package.json`,
          citation: `CLAUDE.md:${line}`,
          expected: `Every "npm run X" in CLAUDE.md resolves to a package.json script`,
          actual: `"${m[1]}" missing from package.json scripts`,
          suggestedAction: `Add the script, or remove the reference from CLAUDE.md`,
        });
      }
    }

    const fileStructIdx = claude.indexOf("File Structure Rules");
    if (fileStructIdx >= 0) {
      const tail = claude.slice(fileStructIdx, fileStructIdx + 4000);
      const dirRe = /`([a-z][a-z0-9_/-]*\/)`/g;
      let mm;
      const dirsSeen = new Set<string>();
      while ((mm = dirRe.exec(tail)) !== null) {
        const d = mm[1].replace(/\/$/, "");
        if (dirsSeen.has(d)) continue;
        dirsSeen.add(d);
        if (d.includes("*")) continue;
        // Resolve full path including subdirs (e.g., tokens/color/, build/dist/).
        // Earlier guard skipped subdirs which produced false positives.
        if (!existsSync(join(ROOT, d))) {
          // Compute actual line in CLAUDE.md so the citation is navigable.
          const absIdx = fileStructIdx + mm.index;
          const lineNum = claude.slice(0, absIdx).split("\n").length;
          findings.push({
            dimension: "system-doc-consistency",
            severity: "should-fix",
            summary: `CLAUDE.md "File Structure Rules" names "${d}/" but the directory does not exist`,
            citation: `CLAUDE.md:${lineNum}`,
            expected: `Every directory named in CLAUDE.md exists at the repo root or as a subdir`,
            actual: `"${d}/" missing from filesystem`,
            suggestedAction: `Create the directory or update the reference in CLAUDE.md`,
          });
        }
      }
    }
  }

  // CONSUMERS.md exports must resolve.
  const consumersFile = join(ROOT, "CONSUMERS.md");
  const exportsMap = (pkg?.exports || {}) as Record<string, unknown>;

  if (existsSync(consumersFile)) {
    const consumers = safeRead(consumersFile);
    const importRe = /@verdigristech\/design-tokens(\/[^\s`'"]+)?/g;
    const seen = new Set<string>();
    let m;
    while ((m = importRe.exec(consumers)) !== null) {
      const sub = m[1] || "";
      const key = sub || ".";
      if (seen.has(key)) continue;
      seen.add(key);

      const exportKey = sub ? `.${sub}` : ".";
      const declaredKeys = Object.keys(exportsMap);
      const matches = declaredKeys.some(k => {
        if (k === exportKey) return true;
        if (k.endsWith("/*") && exportKey.startsWith(k.slice(0, -1))) return true;
        return false;
      });
      if (!matches) {
        const line = lineOf(consumers, m.index);
        findings.push({
          dimension: "system-doc-consistency",
          severity: "should-fix",
          summary: `CONSUMERS.md references "@verdigristech/design-tokens${sub}" but no matching exports entry exists`,
          citation: `CONSUMERS.md:${line}`,
          expected: `Every consumer-visible import path in CONSUMERS.md has a matching exports key in package.json`,
          actual: `"${exportKey}" not in exports map`,
          suggestedAction: `Add the export to package.json, or correct the path in CONSUMERS.md`,
        });
      }
    }
  }

  // build/dist staleness.
  const distHex = join(ROOT, "build", "dist", "hex", "colors.json");
  if (existsSync(distHex)) {
    const distMtime = statSync(distHex).mtimeMs;
    const tokenFiles = walkFiles(join(ROOT, "tokens"), p => p.endsWith(".json"));
    let stale = 0;
    let newest = "";
    let newestM = 0;
    for (const f of tokenFiles) {
      const m = statSync(f).mtimeMs;
      if (m > distMtime && m > newestM) {
        newestM = m;
        newest = f;
        stale++;
      }
    }
    if (stale > 0) {
      findings.push({
        dimension: "system-doc-consistency",
        severity: "should-fix",
        summary: `build/dist/ is older than ${stale} token file(s); rebuild needed`,
        citation: rel(newest),
        expected: `build/dist artifacts have mtime >= every token file`,
        actual: `${stale} token file(s) newer than build/dist/hex/colors.json`,
        suggestedAction: `Run "npm run build" and commit the rebuilt outputs`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Composition: ranking, blast radius, output
// ---------------------------------------------------------------------------

function severityRank(s: Severity): number {
  return s === "critical" ? 0 : s === "should-fix" ? 1 : 2;
}

function dimensionRank(d: Dimension): number {
  return ALL_DIMENSIONS.indexOf(d);
}

function blastRadius(f: Finding): number {
  return f.affectedCells ? f.affectedCells.length : 1;
}

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const sa = severityRank(a.severity) - severityRank(b.severity);
    if (sa !== 0) return sa;
    const da = dimensionRank(a.dimension) - dimensionRank(b.dimension);
    if (da !== 0) return da;
    return a.citation.localeCompare(b.citation);
  });
}

function topTen(findings: Finding[]): Finding[] {
  // Top-10 priority: severity first, then promote multi-cell drift findings
  // (blast >= 2) above single-cell findings of the same tier so cross-cell
  // signal does not get crowded out by per-file color-literal lists.
  const ranked = [...findings].sort((a, b) => {
    const sa = severityRank(a.severity) - severityRank(b.severity);
    if (sa !== 0) return sa;
    const ma = blastRadius(a) >= 2 ? 0 : 1;
    const mb = blastRadius(b) >= 2 ? 0 : 1;
    if (ma !== mb) return ma - mb;
    const ba = blastRadius(b) - blastRadius(a);
    if (ba !== 0) return ba;
    return a.citation.localeCompare(b.citation);
  });
  return ranked.slice(0, 10);
}

function gitInfo(): { sha: string; branch: string } {
  try {
    const sha = execFileSync("git", ["rev-parse", "--short=8", "HEAD"], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return { sha, branch };
  } catch {
    return { sha: "nogit", branch: "unknown" };
  }
}

function isoTimestamp(): string {
  // YYYY-MM-DDTHHMMSSZ -- collapse seconds/colons but preserve date hyphens.
  const now = new Date();
  const iso = now.toISOString();
  const datePart = iso.slice(0, 10);
  const timePart = iso.slice(11, 19).replace(/:/g, "");
  return `${datePart}T${timePart}Z`;
}

function readPriorRun(): { findings: Finding[]; reportPath: string } | null {
  const dir = join(ROOT, "audits", "cohesion");
  if (!existsSync(dir)) return null;
  // Sort by ISO timestamp prefix (YYYY-MM-DDTHHMMSSZ) so collision suffixes
  // (-2, -3) and same-second runs do not corrupt baseline selection.
  const entries = readdirSync(dir)
    .filter(e => e.endsWith(".json"))
    .map(e => ({ name: e, ts: e.slice(0, 17) }))
    .sort((a, b) => a.ts.localeCompare(b.ts) || a.name.localeCompare(b.name));
  if (entries.length === 0) return null;
  const last = join(dir, entries[entries.length - 1].name);
  const parsed = safeJson(last) as { findings?: Finding[] } | null;
  if (!parsed || !parsed.findings) return null;
  return { findings: parsed.findings, reportPath: last };
}

function findingKey(f: Finding): string {
  return `${f.dimension}::${f.citation}::${f.summary}`;
}

function diffFindings(prior: Finding[], current: Finding[]): { resolved: Finding[]; introduced: Finding[]; persisting: Finding[] } {
  const priorMap = new Map(prior.map(f => [findingKey(f), f]));
  const currMap = new Map(current.map(f => [findingKey(f), f]));
  const resolved: Finding[] = [];
  const introduced: Finding[] = [];
  const persisting: Finding[] = [];
  for (const [k, f] of priorMap) if (!currMap.has(k)) resolved.push(f);
  for (const [k, f] of currMap) if (!priorMap.has(k)) introduced.push(f);
  for (const [k, f] of currMap) if (priorMap.has(k)) persisting.push(f);
  return { resolved, introduced, persisting };
}

function nextActions(findings: Finding[]): string[] {
  const byDim = new Map<Dimension, number>();
  for (const f of findings) byDim.set(f.dimension, (byDim.get(f.dimension) || 0) + 1);
  const ranked = [...byDim.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const actions: string[] = [];
  for (const [dim, count] of ranked) {
    if (count === 0) continue;
    if (dim === "color-expression") {
      actions.push(`Replace ${count} hardcoded color literal(s) with token references; pin novel colors in tokens/color/ first`);
    } else if (dim === "class-name-namespace") {
      actions.push(`Resolve ${count} class-name finding(s): consolidate prefix, or remove orphan/ghost classes`);
    } else if (dim === "hierarchy-translation") {
      actions.push(`Pick one canonical class per hierarchy role (eyebrow vs kicker, lede vs lead) and migrate ${count} cell(s)`);
    } else if (dim === "visual-rhythm") {
      actions.push(`Reconcile ${count} font-size or spacing finding(s) against tokens/typography/scale.json`);
    } else if (dim === "token-namespace") {
      actions.push(`Fix ${count} token-grouping finding(s); pick one separator style per parent and one unit per group`);
    } else if (dim === "genre-decision-tree") {
      actions.push(`Document ${count} genre reference(s) in cell md files or remove unreferenced modes from rules`);
    } else if (dim === "system-doc-consistency") {
      actions.push(`Reconcile ${count} system-doc finding(s) across CLAUDE.md, CONSUMERS.md, and package.json`);
    }
  }
  if (actions.length === 0) actions.push("No findings; baseline established");
  return actions.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function renderMarkdown(args: {
  timestamp: string;
  sha: string;
  branch: string;
  scope: string;
  durationMs: number;
  findings: Finding[];
  trend: { resolved: Finding[]; introduced: Finding[]; persisting: Finding[]; priorPath?: string } | null;
}): string {
  const { timestamp, sha, branch, scope, durationMs, findings, trend } = args;
  const counts = { critical: 0, "should-fix": 0, note: 0 };
  for (const f of findings) counts[f.severity]++;

  const lines: string[] = [];
  lines.push(`# Cohesion audit ${timestamp}`);
  lines.push("");
  lines.push(`- timestamp: ${timestamp}`);
  lines.push(`- sha: ${sha}`);
  lines.push(`- branch: ${branch}`);
  lines.push(`- scope: ${scope}`);
  lines.push(`- duration: ${(durationMs / 1000).toFixed(2)}s`);
  lines.push(`- findings: ${counts.critical} critical, ${counts["should-fix"]} should-fix, ${counts.note} note (${findings.length} total)`);
  lines.push(`- schema: cohesion-audit-schema ${SCHEMA_VERSION}`);
  lines.push("");

  lines.push("## Top 10");
  lines.push("");
  const top = topTen(findings);
  if (top.length === 0) {
    lines.push("No findings.");
  } else {
    for (let i = 0; i < top.length; i++) {
      const f = top[i];
      const radius = f.affectedCells ? ` (cells: ${f.affectedCells.join(", ")})` : "";
      lines.push(`${i + 1}. **[${f.severity}]** ${f.summary}${radius}`);
      lines.push(`   - dimension: ${f.dimension}`);
      lines.push(`   - citation: \`${f.citation}\``);
      if (f.suggestedAction) lines.push(`   - suggested: ${f.suggestedAction}`);
    }
  }
  lines.push("");

  lines.push("## Findings by dimension");
  lines.push("");
  for (const dim of ALL_DIMENSIONS) {
    const dimFindings = findings.filter(f => f.dimension === dim);
    lines.push(`### ${dim} (${dimFindings.length})`);
    lines.push("");
    if (dimFindings.length === 0) {
      lines.push("_no findings_");
      lines.push("");
      continue;
    }
    const visible = dimFindings.slice(0, PER_DIMENSION_CAP);
    for (const f of visible) {
      lines.push(`- **[${f.severity}]** ${f.summary}`);
      lines.push(`  - citation: \`${f.citation}\``);
      if (f.expected) lines.push(`  - expected: ${f.expected}`);
      if (f.actual) lines.push(`  - actual: ${f.actual}`);
      if (f.suggestedAction) lines.push(`  - suggested: ${f.suggestedAction}`);
    }
    if (dimFindings.length > PER_DIMENSION_CAP) {
      lines.push(`- ...and ${dimFindings.length - PER_DIMENSION_CAP} more, see JSON sidecar`);
    }
    lines.push("");
  }

  lines.push("## Cross-cell drift");
  lines.push("");
  const cross = findings.filter(f => f.affectedCells && f.affectedCells.length >= 2);
  if (cross.length === 0) {
    lines.push("_no cross-cell drift detected_");
  } else {
    for (const f of cross) {
      lines.push(`- **[${f.severity}]** ${f.summary} (${f.affectedCells!.join(", ")})`);
      lines.push(`  - \`${f.citation}\``);
    }
  }
  lines.push("");

  lines.push("## Trend");
  lines.push("");
  if (!trend) {
    lines.push("_no prior run; this is the baseline_");
  } else {
    lines.push(`Compared to prior run \`${trend.priorPath ? rel(trend.priorPath) : "(prior)"}\`:`);
    lines.push(`- resolved: ${trend.resolved.length}`);
    lines.push(`- introduced: ${trend.introduced.length}`);
    lines.push(`- persisting: ${trend.persisting.length}`);
  }
  lines.push("");

  lines.push("## Next actions");
  lines.push("");
  for (const action of nextActions(findings)) {
    lines.push(`- ${action}`);
  }
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { cell: string | null; dimension: Dimension | null } {
  let cell: string | null = null;
  let dimension: Dimension | null = null;
  for (const arg of argv) {
    if (arg.startsWith("--dimension=")) {
      const raw = arg.split("=")[1].trim().toLowerCase();
      const alias = DIMENSION_ALIASES.find(a => a.short === raw);
      if (alias) {
        dimension = alias.full;
      } else if ((ALL_DIMENSIONS as string[]).includes(raw)) {
        dimension = raw as Dimension;
      } else {
        console.error(`  ERROR: unknown dimension "${raw}". Valid: ${ALL_DIMENSIONS.join(", ")}`);
        process.exit(2);
      }
    } else if (!arg.startsWith("--")) {
      cell = arg;
    }
  }
  return { cell, dimension };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const start = Date.now();
  console.log("Running cohesion audit...");
  console.log(`  ROOT: ${ROOT}`);

  const dimsToRun: Dimension[] = args.dimension ? [args.dimension] : ALL_DIMENSIONS;
  const runners: Record<Dimension, () => Finding[]> = {
    "token-namespace": checkTokenNamespace,
    "visual-rhythm": checkVisualRhythm,
    "color-expression": checkColorExpression,
    "hierarchy-translation": checkHierarchyTranslation,
    "class-name-namespace": checkClassNameNamespace,
    "genre-decision-tree": checkGenreDecisionTree,
    "system-doc-consistency": checkSystemDocConsistency,
  };

  let all: Finding[] = [];
  for (const dim of dimsToRun) {
    const dimStart = Date.now();
    const out = runners[dim]();
    const ms = Date.now() - dimStart;
    console.log(`  OK ${dim} (${out.length} findings, ${ms}ms)`);
    all.push(...out);
  }

  if (args.cell) {
    const cellPrefix = `categories/${args.cell}/`;
    all = all.filter(f => {
      if (f.citation.startsWith(cellPrefix)) return true;
      if (f.affectedCells && f.affectedCells.includes(args.cell!)) return true;
      if (f.dimension === "system-doc-consistency" || f.dimension === "token-namespace") return true;
      return false;
    });
  }

  all = sortFindings(all);

  const { sha, branch } = gitInfo();
  const timestamp = isoTimestamp();
  const auditDir = join(ROOT, "audits", "cohesion");
  mkdirSync(auditDir, { recursive: true });
  let baseName = `${timestamp}-${sha}`;
  let mdPath = join(auditDir, `${baseName}.md`);
  let jsonPath = join(auditDir, `${baseName}.json`);
  let counter = 2;
  while (existsSync(mdPath)) {
    baseName = `${timestamp}-${sha}-${counter}`;
    mdPath = join(auditDir, `${baseName}.md`);
    jsonPath = join(auditDir, `${baseName}.json`);
    counter++;
  }

  const prior = readPriorRun();
  const trend = prior ? { ...diffFindings(prior.findings, all), priorPath: prior.reportPath } : null;
  const duration = Date.now() - start;
  const scope = `${args.cell ?? "all-cells"} / ${args.dimension ?? "all-dimensions"}`;

  const md = renderMarkdown({ timestamp, sha, branch, scope, durationMs: duration, findings: all, trend });
  writeFileSync(mdPath, md, "utf-8");

  const json = {
    "cohesion-audit-schema": SCHEMA_VERSION,
    timestamp,
    sha,
    branch,
    scope,
    durationMs: duration,
    counts: {
      critical: all.filter(f => f.severity === "critical").length,
      "should-fix": all.filter(f => f.severity === "should-fix").length,
      note: all.filter(f => f.severity === "note").length,
      total: all.length,
    },
    findings: all,
    trend: trend ? {
      priorPath: trend.priorPath ? rel(trend.priorPath) : null,
      resolved: trend.resolved.length,
      introduced: trend.introduced.length,
      persisting: trend.persisting.length,
    } : null,
  };
  writeFileSync(jsonPath, JSON.stringify(json, null, 2), "utf-8");

  console.log("");
  console.log("Top findings:");
  const top = topTen(all);
  if (top.length === 0) {
    console.log("  (no findings)");
  } else {
    for (let i = 0; i < top.length; i++) {
      const f = top[i];
      console.log(`  ${i + 1}. [${f.severity}] ${f.summary}  (${f.citation})`);
    }
  }
  console.log("");
  console.log(`Report: ${rel(mdPath)}`);
  console.log(`JSON:   ${rel(jsonPath)}`);
  console.log(`Total: ${all.length} findings in ${(duration / 1000).toFixed(2)}s`);

  process.exit(0);
}

main();
