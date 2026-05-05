import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { RunSummary } from "./types.js";
import { synthesize } from "./synthesize.js";

// Retain the most recent N report pairs (.json + .md) per cell. CI runs
// produce a fresh pair on every push; without retention the audits/ tree
// grows unbounded. Override via env for local debugging.
const RETAIN_REPORTS = parseInt(process.env.COMPLIANCE_AUDIT_RETAIN ?? "20", 10);

export function writeReports(repoRoot: string, summary: RunSummary, sha: string): { md: string; json: string } {
  const dir = join(repoRoot, "audits/compliance");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15) + "Z";
  const base = `${ts}-${sha.slice(0, 8)}`;
  const md = join(dir, `${base}.md`);
  const json = join(dir, `${base}.json`);
  writeFileSync(md, renderMarkdown(summary));
  writeFileSync(json, JSON.stringify(summary, null, 2));
  pruneOldReports(dir, RETAIN_REPORTS);
  return { md, json };
}

function pruneOldReports(dir: string, keep: number): void {
  if (!Number.isFinite(keep) || keep <= 0) return;
  const entries = readdirSync(dir)
    .filter((f) => f.endsWith(".json") || f.endsWith(".md"))
    .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  // keep N most recent of each extension separately so we never delete the
  // .json without its .md or vice versa.
  const seen: Record<string, number> = { json: 0, md: 0 };
  for (const e of entries) {
    const ext = e.f.endsWith(".json") ? "json" : "md";
    seen[ext]!++;
    if (seen[ext]! > keep) {
      try { unlinkSync(join(dir, e.f)); } catch { /* ignore */ }
    }
  }
}

// Per CLAUDE.md "Content Guidelines": strip emdashes from any user-visible
// surface. PR comments and the audits/*.md report are user-visible content,
// so we stay on plain ASCII separators (": " and "--") instead of " — ".
export function renderMarkdown(s: RunSummary): string {
  const lines: string[] = [];
  lines.push(`# compliance-audit report`);
  lines.push("");
  lines.push(`- mode: **${s.blockingMode}**`);
  lines.push(`- artifacts evaluated: ${s.results.length}`);
  lines.push(`- findings: ${s.blockingCount} blocking, ${s.advisoryCount} advisory, ${s.skippedCount} skipped, ${s.naCount} n/a, ${s.passedCount} passed`);
  lines.push(`- spend: $${s.totalCostUsd.toFixed(2)} / $${s.budgetUsd.toFixed(2)}${s.budgetExhausted ? " (BUDGET EXHAUSTED -- audit incomplete)" : ""}`);
  if (s.suppressions.length > 0) {
    const applied = s.suppressions.filter((r) => r.status === "applied").length;
    const refused = s.suppressions.filter((r) => r.status === "refused-invariant").length;
    const noMatch = s.suppressions.filter((r) => r.status === "no-match").length;
    lines.push(`- suppressions: ${applied} applied, ${refused} refused-invariant, ${noMatch} no-match`);
  }
  lines.push("");
  if (s.suppressions.length > 0) {
    lines.push(`## Suppressions (${s.suppressions.length})`);
    for (const r of s.suppressions) {
      lines.push(`- [${r.status}] ${r.ruleId} in ${r.artifactPath}:${r.line} (${r.linear}) -- ${r.reason}`);
    }
    lines.push("");
  }
  for (const r of s.results) {
    const syn = synthesize(r.findings);
    lines.push(`## ${r.artifact.path}`);
    lines.push(`- type: ${r.artifact.type}, genre: ${r.artifact.genre}`);
    if (syn.blocking.length) {
      lines.push(`### Blocking (${syn.blocking.length})`);
      for (const f of syn.blocking) lines.push(`- **${f.ruleId}**: ${f.message ?? ""}`);
    }
    if (syn.advisory.length) {
      lines.push(`### Advisory (${syn.advisory.length})`);
      for (const f of syn.advisory) lines.push(`- ${f.ruleId} (${f.severity}/${f.maturity}): ${f.message ?? ""}`);
    }
    if (syn.skipped.length) {
      lines.push(`### Skipped (${syn.skipped.length})`);
      for (const f of syn.skipped) lines.push(`- ${f.ruleId}: ${f.skipReason}: ${f.message ?? ""}`);
    }
    if (syn.na.length) {
      lines.push(`### N/A (${syn.na.length})`);
      for (const f of syn.na) lines.push(`- ${f.ruleId}: ${f.message ?? ""}`);
    }
    if (syn.suppressed.length) {
      lines.push(`### Suppressed (${syn.suppressed.length})`);
      for (const f of syn.suppressed) lines.push(`- ${f.ruleId}: ${f.suppression?.linear} (${f.suppression?.reason})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderPrCommentSection(s: RunSummary): string {
  const lines: string[] = [];
  lines.push("-- compliance-audit ----------------------------------------");
  const headline = s.budgetExhausted
    ? "BUDGET EXHAUSTED -- audit incomplete"
    : (s.blockingCount === 0 ? "pass" : "fail");
  lines.push(`evaluated ${s.results.length} examples / ${headline} / $${s.totalCostUsd.toFixed(2)} of $${s.budgetUsd.toFixed(2)}`);
  lines.push("");
  lines.push(`  Failures (block merge)         : ${s.blockingCount}`);
  lines.push(`  Advisory findings              : ${s.advisoryCount}`);
  lines.push(`  Skipped (budget / errors)      : ${s.skippedCount}`);
  lines.push(`  N/A (artifact lacked content)  : ${s.naCount}`);
  lines.push(`  Passed                         : ${s.passedCount}`);
  if (s.suppressions.length > 0) {
    lines.push(`  Suppressions applied           : ${s.suppressedCount}`);
    if (s.refusedSuppressionCount > 0) {
      lines.push(`  Suppressions REFUSED (invariant): ${s.refusedSuppressionCount}`);
    }
    lines.push("");
    lines.push("Suppressions in this PR:");
    for (const r of s.suppressions) {
      const tag = r.status === "applied" ? "applied"
        : r.status === "refused-invariant" ? "REFUSED"
        : "no-match";
      lines.push(`  [${tag}] ${r.ruleId} (${r.linear}) ${r.artifactPath}:${r.line} -- ${r.reason}`);
    }
  }
  return lines.join("\n");
}
