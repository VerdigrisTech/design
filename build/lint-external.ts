/**
 * External-facing content linter.
 *
 * Scans all files that Jekyll will render on design.verdigris.co and flags
 * internal-only content that shouldn't be public. Runs in CI alongside
 * validate and build.
 *
 * Exit code 0 = clean, 1 = violations found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");

// --- Configuration ---

/** Files excluded from Jekyll build (from _config.yml) — skip these */
const EXCLUDED_FROM_SITE = new Set([
  "build",
  "node_modules",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "AGENTS.md",
  "CLAUDE.md",
  "Gemfile",
  "Gemfile.lock",
  "docs/brand-alignment-analysis.md",
  "docs/figma-sync.md",
  "categories/_guide-template.md",
  "examples/_template.md",
]);

/** Directories that are never external-facing */
const SKIP_DIRS = new Set([
  ".git",
  ".github",
  ".claude",
  "node_modules",
  "build",
  // Internal working dirs: AI generation pipeline source + audit report outputs.
  // Must mirror the Jekyll `exclude:` list in _config.yml.
  "example_gen",
  "audits",
  "tests",
  "explorations",
  "vendor",
]);

/** Patterns that indicate internal-only content */
const INTERNAL_PATTERNS: Array<{ pattern: RegExp; description: string; severity: "error" | "warning" }> = [
  // Team member names
  { pattern: /\bDaniela\b/i, description: "Team member name (Daniela)", severity: "error" },
  { pattern: /\bJimit\b/i, description: "Team member name (Jimit)", severity: "error" },
  { pattern: /\bJosh\b(?!\s+Tree)/i, description: "Team member name (Josh)", severity: "warning" },

  // Internal migration language
  { pattern: /brand_rules\.yml.*WRONG/i, description: "Internal migration language (WRONG)", severity: "error" },
  { pattern: /should migrate/i, description: "Internal migration language (should migrate)", severity: "warning" },
  { pattern: /doesn't eat its own dog food/i, description: "Internal critique language", severity: "error" },

  // Internal tools and processes
  { pattern: /\bLinear\b.*Z2O-/i, description: "Linear issue reference", severity: "warning" },
  { pattern: /personal access token/i, description: "Internal setup instruction (PAT)", severity: "error" },
  { pattern: /GitHub PAT/i, description: "Internal setup instruction (PAT)", severity: "error" },

  // Stale/draft markers that shouldn't ship
  { pattern: /TODO:|FIXME:|HACK:|XXX:/i, description: "TODO/FIXME marker", severity: "error" },
  { pattern: /\[WIP\]|\[DRAFT\]/i, description: "WIP/DRAFT marker", severity: "error" },
];

/** Files that are allowed to have certain patterns (allowlist) */
const ALLOWLIST: Record<string, string[]> = {
  // CONTRIBUTING.md may reference internal workflow
  "CONTRIBUTING.md": ["Linear issue reference"],
  // evolution.html is internal-first communication with team member callouts
  "evolution.html": ["Team member name (Daniela)", "Team member name (Josh)", "Team member name (Jimit)"],
  // voice-specimen.html intentionally names team members as voice sources
  "voice-specimen.html": ["Team member name (Josh)", "Team member name (Jimit)"],
  // voice/README.md documents the voice foundation's team profile sources
  "voice/README.md": ["Team member name (Josh)", "Team member name (Jimit)"],
  // Slide cell genre specs name voice sources (Mark, Jimit, Mike, Jon, Thomas) per the voice recipe.
  "categories/slides/index.md": ["Team member name (Jimit)"],
  "categories/slides/pilot-kickoff.md": ["Team member name (Jimit)", "Linear issue reference"],
  "categories/slides/customer-101.md": ["Team member name (Jimit)"],
  "categories/slides/partner-enablement.md": ["Team member name (Jimit)"],
  "categories/slides/internal-team.md": ["Team member name (Jimit)"],
  // Sales collateral production guide names voice sources for distribution decisions.
  "workflows/sales-collateral.md": ["Team member name (Jimit)"],
  // Sidebar lists genre voice mixes inline as nav hints.
  "_layouts/default.html": ["Team member name (Jimit)"],
  // LEARNINGS.md documents cross-cell principles, including voice-recipe ones that name the team.
  "LEARNINGS.md": ["Team member name (Jimit)", "Team member name (Josh)"],
  // New voice profile YAMLs (Mark + Jon) reference team members in voice samples.
  "voice/team/mark-chung.yaml": ["Team member name (Jimit)"],
  "voice/team/jon-chu.yaml": ["Team member name (Jimit)", "Team member name (Josh)"],
  // One-pager + case-study cells reference voice sources by name in their voice-recipe sections.
  "categories/one-pagers/guide.md": ["Team member name (Jimit)"],
  "categories/case-studies/guide.md": ["Team member name (Jimit)"],
};

// --- Scanner ---

function getPublicFiles(dir: string, base: string = ""): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const relPath = base ? `${base}/${entry}` : entry;

    if (SKIP_DIRS.has(entry)) continue;
    if (entry.startsWith(".")) continue;
    if (EXCLUDED_FROM_SITE.has(relPath)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!EXCLUDED_FROM_SITE.has(relPath)) {
        files.push(...getPublicFiles(fullPath, relPath));
      }
    } else if (entry.endsWith(".md") || entry.endsWith(".html")) {
      files.push(relPath);
    }
  }
  return files;
}

interface Violation {
  file: string;
  line: number;
  description: string;
  severity: "error" | "warning";
  text: string;
}

function scanFile(relPath: string): Violation[] {
  const violations: Violation[] = [];
  const content = readFileSync(join(ROOT, relPath), "utf-8");
  const lines = content.split("\n");
  const allowedFor = ALLOWLIST[relPath] || [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip front matter
    if (i === 0 && line === "---") {
      const endIdx = content.indexOf("---", 4);
      if (endIdx > 0) {
        const fmLines = content.substring(0, endIdx).split("\n").length;
        if (i < fmLines) continue;
      }
    }

    // Skip HTML comments (these are intentional placeholders)
    if (line.trim().startsWith("<!--")) continue;

    // Skip code blocks
    if (line.trim().startsWith("```")) continue;

    for (const rule of INTERNAL_PATTERNS) {
      if (allowedFor.includes(rule.description)) continue;
      if (rule.pattern.test(line)) {
        violations.push({
          file: relPath,
          line: i + 1,
          description: rule.description,
          severity: rule.severity,
          text: line.trim().substring(0, 100),
        });
      }
    }
  }

  return violations;
}

// --- Main ---

function main() {
  console.log("Linting external-facing content...\n");

  const files = getPublicFiles(ROOT);
  console.log(`  Scanning ${files.length} public files\n`);

  let errors = 0;
  let warnings = 0;
  const allViolations: Violation[] = [];

  for (const file of files) {
    const violations = scanFile(file);
    allViolations.push(...violations);
    for (const v of violations) {
      if (v.severity === "error") errors++;
      else warnings++;
    }
  }

  if (allViolations.length === 0) {
    console.log("  No internal content found in public files.\n");
  } else {
    for (const v of allViolations) {
      const icon = v.severity === "error" ? "ERROR" : "WARN ";
      console.log(`  ${icon} ${v.file}:${v.line} — ${v.description}`);
      console.log(`        ${v.text}\n`);
    }
  }

  console.log(`${errors} errors, ${warnings} warnings`);

  if (errors > 0) {
    process.exit(1);
  }
}

main();
