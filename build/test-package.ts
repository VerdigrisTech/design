/**
 * Z2O-1343: Package contents enforcement.
 *
 * Runs `npm pack --dry-run --json` and asserts:
 *   1. Every must-include path is present (positive list).
 *   2. Every must-exclude path is absent (negative list, includes voice/team/* PII lockdown).
 *   3. Tarball size is within the 5MB sanity ceiling.
 *
 * Exits nonzero with a clear diff on failure. Wired into CI via `npm run test:package`.
 *
 * Background: PR #43 Loop 5 caught voice/team/*.yaml (PII) being shipped publicly.
 * That fix landed but the discipline lived only in human memory. This makes the
 * package boundary structural.
 */

import { execFileSync } from "node:child_process";

interface PackedFile {
  path: string;
  size: number;
  mode: number;
}

interface PackResult {
  id: string;
  name: string;
  version: string;
  size: number; // tarball size (compressed)
  unpackedSize: number;
  filename: string;
  files: PackedFile[];
}

const MAX_TARBALL_BYTES = 5 * 1024 * 1024; // 5 MB

// Positive list: paths or path-prefixes that MUST appear in the tarball.
// A trailing "/" treats the entry as a directory prefix; otherwise the entry must
// match a tarball file path exactly.
const MUST_INCLUDE: string[] = [
  // Print CSS reference stylesheets
  "build/print/cover.css",
  "build/print/slides.css",
  "build/print/one-pager.css",
  "build/print/case-study.css",
  // Generated JS module + types
  "build/dist/index.js",
  "build/dist/index.d.ts",
  "build/dist/tailwind/preset.js",
  "build/dist/hex/colors.json",
  "build/dist/css/oklch.css",
  "build/dist/css/hsl.css",
  // Token JSON
  "tokens/",
  // Rules YAML
  "rules/",
  // Workflows + categories
  "workflows/",
  "categories/",
  // Public voice surface (NOT voice/team/*)
  "voice/recipes.yaml",
  "voice/ingredients.yaml",
  "voice/feelings.yaml",
  "voice/USE.md",
  "voice/README.md",
  // Top-level guide files
  "LEARNINGS.md",
  "AGENTS.md",
];

// Negative list: paths or path-prefixes that MUST NOT appear.
// Trailing "/" = directory prefix; otherwise exact match.
const MUST_EXCLUDE: string[] = [
  // Loop 5O: voice/team/* contains PII (real personal voice profiles); never publish.
  "voice/team/",
  // Tests, fixtures, and reports do not belong in the published tarball.
  "tests/",
  "playwright-report/",
  "test-results/",
  // Repo metadata + build artifacts.
  ".github/",
  "_site/",
  "node_modules/",
  // Common secret-bearing files.
  ".env",
  ".env.local",
  ".env.production",
];

function runPack(): PackResult {
  // Hardcoded command + args; execFileSync avoids shell interpretation entirely.
  const raw = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const parsed = JSON.parse(raw) as PackResult[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("npm pack returned unexpected output");
  }
  return parsed[0];
}

function isPrefixHit(entry: string, candidate: string): boolean {
  if (candidate.endsWith("/")) {
    return entry.startsWith(candidate);
  }
  return entry === candidate;
}

function checkInclusions(files: PackedFile[]): string[] {
  const missing: string[] = [];
  for (const required of MUST_INCLUDE) {
    const hit = files.some((f) => isPrefixHit(f.path, required));
    if (!hit) missing.push(required);
  }
  return missing;
}

function checkExclusions(files: PackedFile[]): string[] {
  const leaked: string[] = [];
  for (const f of files) {
    for (const forbidden of MUST_EXCLUDE) {
      if (isPrefixHit(f.path, forbidden)) {
        leaked.push(`${f.path}  (matched forbidden: ${forbidden})`);
        break;
      }
    }
  }
  return leaked;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

function main() {
  console.log("Running npm pack --dry-run...\n");
  const result = runPack();

  console.log(`Package:      ${result.id}`);
  console.log(`Tarball:      ${result.filename}`);
  console.log(`Files:        ${result.files.length}`);
  console.log(`Tarball size: ${formatBytes(result.size)}`);
  console.log(`Unpacked:     ${formatBytes(result.unpackedSize)}`);
  console.log("");

  const missing = checkInclusions(result.files);
  const leaked = checkExclusions(result.files);
  const oversized = result.size > MAX_TARBALL_BYTES;

  let failed = false;

  if (missing.length > 0) {
    failed = true;
    console.error("FAIL: required paths missing from tarball:");
    for (const m of missing) console.error(`  - ${m}`);
    console.error("");
  }

  if (leaked.length > 0) {
    failed = true;
    console.error("FAIL: forbidden paths present in tarball:");
    for (const l of leaked) console.error(`  - ${l}`);
    console.error("");
    console.error(
      "  This usually means package.json#files added a directory wholesale."
    );
    console.error(
      "  Narrow the entry, add an exclusion to .npmignore, or update test-package.ts MUST_EXCLUDE."
    );
    console.error("");
  }

  if (oversized) {
    failed = true;
    console.error(
      `FAIL: tarball size ${formatBytes(result.size)} exceeds ceiling ${formatBytes(MAX_TARBALL_BYTES)}.`
    );
    console.error(
      "  Investigate large additions; bumping the ceiling should be a deliberate decision."
    );
    console.error("");
  }

  if (failed) {
    console.error("Package content test FAILED.");
    process.exit(1);
  }

  console.log("Package content test PASSED.");
  console.log(`  inclusions: ${MUST_INCLUDE.length}/${MUST_INCLUDE.length}`);
  console.log(`  exclusions: ${MUST_EXCLUDE.length}/${MUST_EXCLUDE.length}`);
  console.log(
    `  size:       ${formatBytes(result.size)} < ${formatBytes(MAX_TARBALL_BYTES)}`
  );
}

main();
