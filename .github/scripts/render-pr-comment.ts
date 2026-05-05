// .github/scripts/render-pr-comment.ts
//
// Reads compliance-summary.json and cohesion-summary.json (if present), prints a
// markdown comment body to stdout. The CI workflow pipes this to a sticky-PR-comment
// action.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sections: string[] = [];

const compliancePath = path.join(root, "compliance-summary.json");
if (existsSync(compliancePath)) {
  try {
    const s = JSON.parse(readFileSync(compliancePath, "utf8"));
    sections.push(`── compliance-audit ────────────────────────────────────────`);
    if (process.env.COMPLIANCE_AUDIT_SKIPPED_REASON === "no-api-key") {
      sections.push("skipped — OPENAI_API_KEY not configured (advisory; add the secret to enable)");
    } else {
      sections.push(`evaluated ${s.results?.length ?? 0} examples • ${(s.blockingCount ?? 0) === 0 ? "pass" : "fail"} • $${(s.totalCostUsd ?? 0).toFixed(2)} / $${(s.budgetUsd ?? 0).toFixed(2)}`);
      sections.push(`  Failures (advisory in v0.1)    — ${s.blockingCount ?? 0}`);
      sections.push(`  Advisory findings              — ${s.advisoryCount ?? 0}`);
      sections.push(`  Skipped                        — ${s.skippedCount ?? 0}`);
      sections.push(`  Passed                         — ${s.passedCount ?? 0}`);
    }
    sections.push("");
  } catch (e) {
    sections.push(`── compliance-audit ────────────────────────────────────────`);
    sections.push(`(failed to parse compliance-summary.json: ${(e as Error).message})`);
    sections.push("");
  }
}

const cohesionPath = path.join(root, "cohesion-summary.json");
if (existsSync(cohesionPath)) {
  try {
    const c = JSON.parse(readFileSync(cohesionPath, "utf8"));
    sections.push(`── audit:cohesion ──────────────────────────────────────────`);
    sections.push(`  Critical (block merge)         — ${c.critical ?? 0}`);
    sections.push(`  Should-fix                     — ${c.shouldFix ?? c.should_fix ?? 0}`);
    sections.push(`  Note                           — ${c.note ?? 0}`);
    sections.push("");
  } catch (e) {
    sections.push(`── audit:cohesion ──────────────────────────────────────────`);
    sections.push(`(failed to parse cohesion-summary.json: ${(e as Error).message})`);
    sections.push("");
  }
}

if (sections.length === 0) {
  sections.push("(no check produced summary output)");
}

const blocking = process.env.COMPLIANCE_AUDIT_BLOCKING === "false"
  ? "compliance-audit ADVISORY (v0.1) • cohesion BLOCKING"
  : "BLOCKING (compliance + cohesion)";

const header = `<!-- design-system-ci:sticky -->
**Design System CI**  •  updated ${new Date().toISOString()}  •  ${blocking}
`;
process.stdout.write(header + "\n```\n" + sections.join("\n") + "\n```\n");
