// .github/scripts/render-pr-comment.ts
//
// Reads compliance-summary.json and cohesion-summary.json (if present), prints a
// markdown comment body to stdout. The CI workflow pipes this to a sticky-PR-comment
// action.
//
// Usage:
//   npx tsx .github/scripts/render-pr-comment.ts            # uses cwd
//   npx tsx .github/scripts/render-pr-comment.ts --root /repo
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootIdx = args.findIndex((a) => a === "--root");
const root = rootIdx >= 0 && args[rootIdx + 1] ? path.resolve(args[rootIdx + 1]!) : process.cwd();

const sections: string[] = [];

const compliancePath = path.join(root, "compliance-summary.json");
if (existsSync(compliancePath)) {
  try {
    const s = JSON.parse(readFileSync(compliancePath, "utf8"));
    sections.push(`-- compliance-audit ----------------------------------------`);
    // Sanitize skip-reason for safe embedding inside the fenced code block:
    // strip control chars (incl. CR/LF that could break out vertically),
    // replace backticks (which would close the fence), and cap length.
    const sanitize = (raw: string): string =>
      raw
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x7f]/g, " ")
        .replace(/`/g, "'")
        .trim()
        .slice(0, 200);
    const skipReason = sanitize(process.env.COMPLIANCE_AUDIT_SKIPPED_REASON ?? "");
    if (skipReason === "no-api-key") {
      sections.push("skipped: OPENAI_API_KEY not configured (advisory; add the secret to enable)");
    } else if (skipReason === "no-in-scope-changes") {
      sections.push("skipped: no in-scope files changed in this PR (categories/{slides,one-pagers}/examples/, rules/visual-rules.yml)");
    } else if (skipReason === "audit-produced-no-summary") {
      sections.push("skipped: audit step did not produce a summary (likely crashed; check workflow logs)");
    } else if (skipReason !== "") {
      sections.push(`skipped: ${skipReason}`);
    } else {
      sections.push(`evaluated ${s.results?.length ?? 0} examples / ${(s.blockingCount ?? 0) === 0 ? "pass" : "fail"} / $${(s.totalCostUsd ?? 0).toFixed(2)} of $${(s.budgetUsd ?? 0).toFixed(2)}`);
      sections.push(`  Failures (advisory in v0.1)    : ${s.blockingCount ?? 0}`);
      sections.push(`  Advisory findings              : ${s.advisoryCount ?? 0}`);
      sections.push(`  Skipped                        : ${s.skippedCount ?? 0}`);
      sections.push(`  N/A (artifact lacked content)  : ${s.naCount ?? 0}`);
      sections.push(`  Passed                         : ${s.passedCount ?? 0}`);
    }
    sections.push("");
  } catch (e) {
    sections.push(`-- compliance-audit ----------------------------------------`);
    sections.push(`(failed to parse compliance-summary.json: ${(e as Error).message})`);
    sections.push("");
  }
}

const cohesionPath = path.join(root, "cohesion-summary.json");
if (existsSync(cohesionPath)) {
  try {
    const c = JSON.parse(readFileSync(cohesionPath, "utf8"));
    sections.push(`-- audit:cohesion ------------------------------------------`);
    sections.push(`  Critical (block merge)         : ${c.counts?.critical ?? c.critical ?? 0}`);
    sections.push(`  Should-fix                     : ${c.counts?.["should-fix"] ?? c.counts?.shouldFix ?? c.shouldFix ?? c.should_fix ?? 0}`);
    sections.push(`  Note                           : ${c.counts?.note ?? c.note ?? 0}`);
    sections.push("");
  } catch (e) {
    sections.push(`-- audit:cohesion ------------------------------------------`);
    sections.push(`(failed to parse cohesion-summary.json: ${(e as Error).message})`);
    sections.push("");
  }
}

if (sections.length === 0) {
  sections.push("(no check produced summary output)");
}

// Single source of truth for the header label: the JSON's own blockingMode
// field, written by the runner from the same env. Reading the JSON instead of
// re-reading the env keeps renderer and runner in sync without relying on
// env-propagation discipline at the workflow level.
let blockingLabel = "compliance-audit ADVISORY (v0.1) / cohesion BLOCKING";
if (existsSync(compliancePath)) {
  try {
    const s = JSON.parse(readFileSync(compliancePath, "utf8"));
    if (s.blockingMode === "blocking") {
      blockingLabel = "BLOCKING (compliance + cohesion)";
    } else if (s.blockingMode === "advisory-pr") {
      blockingLabel = "compliance-audit ADVISORY (PR-labeled) / cohesion BLOCKING";
    } else if (s.blockingMode === "advisory-repo") {
      blockingLabel = "compliance-audit ADVISORY (repo-wide) / cohesion BLOCKING";
    }
  } catch { /* fall back to default */ }
}

const header = `<!-- design-system-ci:sticky -->
**Design System CI**  ${new Date().toISOString()}  ${blockingLabel}
`;
process.stdout.write(header + "\n```\n" + sections.join("\n") + "\n```\n");
